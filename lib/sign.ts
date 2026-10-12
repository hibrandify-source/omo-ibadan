import * as THREE from "three";

// Canvas-texture road signs (client-side only — call inside components).
// Green gantry boards + amber stop signs, in our font stack.
export function makeSignTexture(
  lines: string[],
  opts?: { bg?: string; fg?: string; w?: number; h?: number; font?: number }
): THREE.CanvasTexture {
  const w = opts?.w ?? 512;
  const h = opts?.h ?? 160;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = opts?.bg ?? "#14532d";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#F2EDE4";
  g.lineWidth = 8;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = opts?.fg ?? "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const fs = opts?.font ?? 56;
  if (lines.length === 1) {
    g.font = `800 ${fs}px Sora, sans-serif`;
    g.fillText(lines[0].slice(0, 18), w / 2, h / 2);
  } else {
    g.font = `800 ${Math.round(fs * 0.72)}px Sora, sans-serif`;
    lines.slice(0, 2).forEach((ln, i) => {
      g.fillText(ln.slice(0, 20), w / 2, h / 2 + (i === 0 ? -fs * 0.42 : fs * 0.42));
    });
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
