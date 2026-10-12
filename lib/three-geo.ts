// Shared grid→world mapping + road ribbon builder for the Three.js drive scene.
// (Extracted from the retired World3D renderer.)
import * as THREE from "three";

export const T = 2;
export const gx = (x: number) => (x - 19) * T;
export const gz = (y: number) => (y - 14) * T;

export function roadRibbon(pts: [number, number][], halfW: number): THREE.BufferGeometry {
  const verts: number[] = [];
  const idx: number[] = [];
  pts.forEach(([px, py], i) => {
    const [qx, qy] = pts[Math.min(i + 1, pts.length - 1)];
    const [rx, ry] = pts[Math.max(i - 1, 0)];
    let dx = qx - rx;
    let dy = qy - ry;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const nx = -dy * halfW * T;
    const nz = dx * halfW * T;
    const cx = gx(px);
    const cz = gz(py);
    verts.push(cx + nx, 0, cz + nz, cx - nx, 0, cz - nz);
    if (i > 0) {
      const b = i * 2;
      idx.push(b - 2, b - 1, b, b - 1, b + 1, b);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
