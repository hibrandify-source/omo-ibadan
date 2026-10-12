/* Omo Ibadan service worker: app-shell cache + runtime same-origin cache.
   Version the shell to bust cleanly. Game saves live in localStorage/Supabase,
   never in the SW — safe to wipe. */
const SHELL = "omo-shell-v1";
const RUNTIME = "omo-runtime-v1";
const SHELL_URLS = ["/", "/play", "/how-to-play", "/leaderboard", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL && k !== RUNTIME && k.startsWith("omo-"))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // API + realtime sockets always go to network.
  if (url.pathname.startsWith("/api")) return;
  if (url.origin !== self.location.origin) return;

  // Navigations: network first, shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/play")))
    );
    return;
  }

  // Static assets: cache first, then network.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.match(/\.(png|svg|ico|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
      )
    );
  }
});
