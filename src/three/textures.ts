import * as THREE from 'three';
import { fbm2, rng } from './noise';

/** Texturas procedurais desenhadas em canvas (sem downloads externos). */

const cache = new Map<string, THREE.Texture>();

function canvasTex(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  cache.set(key, t);
  return t;
}

function noiseField(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, scale: number, fn: (n: number, x: number, y: number) => [number, number, number]) {
  const img = ctx.createImageData(w, h);
  const n = fbm2(seed, 5);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = n((x / w) * scale, (y / h) * scale);
      const [r, g, b] = fn(v, x, y);
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Multiplicador de detalhe (tons de cinza claros) para crostas de pão. */
export const crustDetail = () =>
  canvasTex('crust', 512, 512, (ctx, w, h) => {
    noiseField(ctx, w, h, 7, 18, (v) => {
      const g = 225 + v * 60;
      return [g, g * 0.97, g * 0.93];
    });
    const r = rng(3);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(80,35,10,${0.05 + r() * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

/** Mapa de relevo genérico (crosta, empanado, migalhas). */
export const bumpNoise = (seed = 11, scale = 40) =>
  canvasTex(`bump-${seed}-${scale}`, 512, 512, (ctx, w, h) => {
    noiseField(ctx, w, h, seed, scale, (v) => {
      const g = 128 + v * 200;
      return [g, g, g];
    });
  }, false);

export const pattyTex = (variant: string) =>
  canvasTex(`patty-${variant}`, 512, 512, (ctx, w, h) => {
    const pal: Record<string, [number, number, number][]> = {
      smash: [[38, 17, 8], [92, 46, 20], [150, 84, 40]],
      angus: [[34, 16, 9], [78, 38, 20], [122, 66, 38]],
      frango: [[150, 86, 30], [205, 142, 62], [232, 184, 104]],
      vegetal: [[50, 24, 16], [96, 48, 32], [140, 82, 54]],
    };
    const [d, m, l] = pal[variant] ?? pal.angus;
    const n2 = fbm2(91, 4);
    noiseField(ctx, w, h, variant.length * 13, 22, (v, x, y) => {
      const t = Math.min(1, Math.max(0, v * 1.4 + 0.5));
      const s = n2((x / w) * 90, (y / h) * 90);
      const mix = (a: number, b: number, k: number) => a + (b - a) * k;
      const base = t < 0.5 ? [0, 1, 2].map((i) => mix(d[i], m[i], t * 2)) : [0, 1, 2].map((i) => mix(m[i], l[i], (t - 0.5) * 2));
      const k = 1 + s * 0.5;
      return [base[0] * k, base[1] * k, base[2] * k];
    });
    if (variant === 'vegetal') {
      const r = rng(5);
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(160,40,60,.6)' : 'rgba(210,170,90,.5)';
        ctx.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3);
      }
    }
  });

export const baconTex = () =>
  canvasTex('bacon', 512, 128, (ctx, w, h) => {
    const stripes: [number, string][] = [
      [0, '#6a1d10'], [0.12, '#a8382a'], [0.28, '#f0c9a4'], [0.38, '#b94232'], [0.55, '#8a2a1b'], [0.66, '#ecc19b'], [0.78, '#a3352a'], [1, '#5e190e'],
    ];
    const g = ctx.createLinearGradient(0, 0, 0, h);
    stripes.forEach(([s, c]) => g.addColorStop(s, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const n = fbm2(33, 4);
    const img = ctx.getImageData(0, 0, w, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const v = n((x / w) * 30, (y / h) * 6);
        const k = 0.72 + v * 0.6;
        img.data[i] *= k;
        img.data[i + 1] *= k * 0.92;
        img.data[i + 2] *= k * 0.85;
      }
    ctx.putImageData(img, 0, 0);
  });

export const tomatoCapTex = () =>
  canvasTex('tomato', 256, 256, (ctx, w) => {
    const c = w / 2;
    ctx.fillStyle = '#b81f14';
    ctx.fillRect(0, 0, w, w);
    const g = ctx.createRadialGradient(c, c, 4, c, c, c);
    g.addColorStop(0, '#f6d0b6');
    g.addColorStop(0.25, '#e2563f');
    g.addColorStop(0.85, '#d8331f');
    g.addColorStop(0.93, '#a8180c');
    g.addColorStop(1, '#8c1208');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
    const r = rng(9);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const x = c + Math.cos(a) * c * 0.52;
      const y = c + Math.sin(a) * c * 0.52;
      ctx.fillStyle = 'rgba(245,120,90,.85)';
      ctx.beginPath();
      ctx.ellipse(x, y, c * 0.26, c * 0.17, a, 0, Math.PI * 2);
      ctx.fill();
      for (let s = 0; s < 7; s++) {
        ctx.fillStyle = 'rgba(250,225,150,.95)';
        ctx.beginPath();
        ctx.ellipse(x + (r() - 0.5) * c * 0.3, y + (r() - 0.5) * c * 0.2, 4, 2.5, r() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

export const pickleTex = () =>
  canvasTex('pickle', 128, 128, (ctx, w) => {
    const c = w / 2;
    const g = ctx.createRadialGradient(c, c, 2, c, c, c);
    g.addColorStop(0, '#d9e39a');
    g.addColorStop(0.6, '#a9bb5a');
    g.addColorStop(0.86, '#6f8a2c');
    g.addColorStop(1, '#3b5216');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
    const r = rng(4);
    for (let i = 0; i < 10; i++) {
      const a = r() * Math.PI * 2;
      ctx.fillStyle = 'rgba(240,240,200,.9)';
      ctx.beginPath();
      ctx.ellipse(c + Math.cos(a) * c * 0.35, c + Math.sin(a) * c * 0.35, 5, 3, a, 0, Math.PI * 2);
      ctx.fill();
    }
  });

export const cheeseTex = (variant: string) =>
  canvasTex(`cheese-${variant}`, 256, 256, (ctx, w, h) => {
    const base: Record<string, string> = {
      cheddar: '#ec8506',
      americano: '#f4a51f',
      prato: '#f1cf72',
      gorgonzola: '#efe6cc',
      pepperjack: '#f3e2ad',
    };
    ctx.fillStyle = base[variant] ?? base.cheddar;
    ctx.fillRect(0, 0, w, h);
    const r = rng(variant.length);
    if (variant === 'gorgonzola') {
      for (let i = 0; i < 40; i++) {
        ctx.strokeStyle = `rgba(60,90,90,${0.3 + r() * 0.4})`;
        ctx.lineWidth = 1 + r() * 3;
        ctx.beginPath();
        let x = r() * w;
        let y = r() * h;
        ctx.moveTo(x, y);
        for (let k = 0; k < 4; k++) {
          x += (r() - 0.5) * 40;
          y += (r() - 0.5) * 40;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    if (variant === 'pepperjack') {
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = r() > 0.5 ? '#c4321c' : '#4f8a2a';
        ctx.fillRect(r() * w, r() * h, 2, 2);
      }
    }
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,.12)');
    g.addColorStop(1, 'rgba(0,0,0,.08)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

/** Etiqueta/embalagem com a marca. */
export const brandWrapTex = (key: string, bg: string, fg: string, text: string, stripe = true) =>
  canvasTex(`wrap-${key}`, 1024, 512, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    if (stripe) {
      ctx.fillStyle = fg;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(0, h * 0.1, w, h * 0.04);
      ctx.fillRect(0, h * 0.86, w, h * 0.04);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 2; i++) {
      const cx = (w / 2) * i + w / 4;
      ctx.font = `400 ${h * 0.22}px Anton, Impact, sans-serif`;
      ctx.fillText('BD', cx, h * 0.42);
      ctx.font = `700 ${h * 0.07}px Archivo, Arial, sans-serif`;
      ctx.fillText(text, cx, h * 0.64);
    }
  });

export const slateTex = () =>
  canvasTex('slate', 512, 512, (ctx, w, h) => {
    noiseField(ctx, w, h, 71, 10, (v) => {
      const g = 28 + v * 30;
      return [g, g * 0.95, g * 0.9];
    });
  });

export const woodTex = () =>
  canvasTex('wood', 1024, 256, (ctx, w, h) => {
    const n = fbm2(44, 4);
    const img = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const v = n((x / w) * 3, (y / h) * 18);
        const ring = Math.sin((y / h) * 60 + v * 8) * 0.5 + 0.5;
        const k = 0.75 + ring * 0.25 + v * 0.2;
        const i = (y * w + x) * 4;
        img.data[i] = 120 * k;
        img.data[i + 1] = 74 * k;
        img.data[i + 2] = 42 * k;
        img.data[i + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
  });

export const steelTex = () =>
  canvasTex('steel', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#2a2724';
    ctx.fillRect(0, 0, w, h);
    const r = rng(12);
    for (let i = 0; i < 3000; i++) {
      ctx.strokeStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${0.02 + r() * 0.05})`;
      ctx.lineWidth = 1;
      const y = r() * h;
      ctx.beginPath();
      ctx.moveTo(r() * w, y);
      ctx.lineTo(r() * w, y + (r() - 0.5) * 4);
      ctx.stroke();
    }
    for (let i = 0; i < 40; i++) {
      const g = ctx.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 40 + r() * 140);
      g.addColorStop(0, 'rgba(10,6,3,.35)');
      g.addColorStop(1, 'rgba(10,6,3,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  });

/** Sombra de contato suave (gradiente radial). */
export const contactShadowTex = () =>
  canvasTex('contact', 256, 256, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,.85)');
    g.addColorStop(0.45, 'rgba(0,0,0,.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  }, false);
