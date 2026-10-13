import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Omo Ibadan — Brown Roof Hustle",
  description:
    "Je Omoluabi. Ko Ola, Ko Iwa. A free browser life-sim set in Ibadan: hustle micra, trade Bodija market, survive NEPA, rep your hood. No download.",
  applicationName: "Omo Ibadan",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Omo Ibadan",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Omo Ibadan — Brown Roof Hustle",
    description: "Live your Ibadan life: micra hustle, Bodija market, owambe nights. Free in your browser.",
    siteName: "Omo Ibadan",
    locale: "en_NG",
  },
};

export const viewport: Viewport = {
  themeColor: "#7A4A2B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="yo">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-charcoal antialiased">
        <PwaRegister />
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
