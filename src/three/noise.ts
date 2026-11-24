/** Utilitários de aleatoriedade determinística e ruído para geometria procedural. */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ruído periódico em ângulo (0..2π) — ideal para bordas irregulares de discos. */
export function angularNoise(seed: number, octaves = [3, 5, 7, 11, 17], amps?: number[]) {
  const r = rng(seed);
  const phases = octaves.map(() => r() * Math.PI * 2);
  const a = amps ?? octaves.map((k) => 1 / k);
  const norm = a.reduce((s, v) => s + v, 0);
  return (theta: number) => octaves.reduce((s, k, i) => s + Math.sin(k * theta + phases[i]) * a[i], 0) / norm;
}

/** Ruído de valor 2D suave. */
export function valueNoise2(seed: number) {
  const r = rng(seed);
  const perm = new Float32Array(256 * 256);
  for (let i = 0; i < perm.length; i++) perm[i] = r() * 2 - 1;
  const at = (x: number, y: number) => perm[((y & 255) << 8) | (x & 255)];
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * xf;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * xf;
    return a + (b - a) * yf;
  };
}

export function fbm2(seed: number, octaves = 4) {
  const n = valueNoise2(seed);
  return (x: number, y: number) => {
    let s = 0;
    let amp = 0.5;
    let f = 1;
    for (let i = 0; i < octaves; i++) {
      s += n(x * f, y * f) * amp;
      f *= 2;
      amp *= 0.5;
    }
    return s;
  };
}
