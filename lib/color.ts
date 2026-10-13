/** Turn a hex color into rgba with the given alpha (0..1). */
export function hexA(hex: string, a: number): string {
  const h = String(hex).replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  if (Number.isNaN(n)) return hex;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Two average colors (top-left / bottom-right) sampled from an image. */
export function dominantColors(src: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 16;
      const x = c.getContext("2d");
      if (!x) return resolve(["#222", "#444"]);
      x.drawImage(img, 0, 0, 16, 16);
      const avg = (x0: number, y0: number) => {
        const d = x.getImageData(x0, y0, 8, 8).data;
        let r = 0,
          g = 0,
          b = 0;
        for (let i = 0; i < d.length; i += 4) {
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
        }
        const n = d.length / 4;
        return `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
      };
      resolve([avg(0, 0), avg(8, 8)]);
    };
    img.onerror = () => resolve(["#222", "#444"]);
    img.src = src;
  });
}