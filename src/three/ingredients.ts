import * as THREE from 'three';
import type { BunVariant, CheeseVariant, LayerSpec, PattyVariant, SauceVariant } from '@/types';
import { angularNoise, fbm2, rng } from './noise';
import { baconTex, bumpNoise, cheeseTex, crustDetail, pattyTex, pickleTex, tomatoCapTex } from './textures';

/**
 * Construtores procedurais de cada ingrediente.
 * Cada função devolve um Object3D com origem na base da camada e a espessura usada no empilhamento.
 */
export interface Built {
  obj: THREE.Object3D;
  h: number;
}

/* ------------------------------------------------------------------ helpers */

const matCache = new Map<string, THREE.Material>();
export function mat<T extends THREE.Material>(key: string, make: () => T): T {
  if (!matCache.has(key)) matCache.set(key, make());
  return matCache.get(key) as T;
}

function lathe(profile: [number, number][], segs = 72, samples = 64) {
  const curve = new THREE.SplineCurve(profile.map(([x, y]) => new THREE.Vector2(x, y)));
  const pts = curve.getSpacedPoints(samples).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  pts[0].x = 0;
  pts[pts.length - 1].x = 0;
  return new THREE.LatheGeometry(pts, segs);
}

function planarUV(geo: THREE.BufferGeometry, scale = 0.5) {
  const p = geo.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = p.getX(i) * scale + 0.5;
    uv[i * 2 + 1] = p.getZ(i) * scale + 0.5;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function vertexColors(geo: THREE.BufferGeometry, fn: (x: number, y: number, z: number, c: THREE.Color) => void) {
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    fn(p.getX(i), p.getY(i), p.getZ(i), c);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

/** Desloca radialmente os vértices para criar bordas orgânicas. */
function wobble(geo: THREE.BufferGeometry, seed: number, amp: number, minR = 0.3, yAmp = 0) {
  const n = angularNoise(seed);
  const f = fbm2(seed + 1, 3);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-4) continue;
    const th = Math.atan2(z, x);
    const k = Math.min(1, Math.max(0, (r - minR) / (1 - minR)));
    const s = 1 + n(th) * amp * k;
    p.setX(i, x * s);
    p.setZ(i, z * s);
    if (yAmp) p.setY(i, p.getY(i) + f(x * 3 + 5, z * 3 + 5) * yAmp);
  }
  geo.computeVertexNormals();
}

const shadowed = <T extends THREE.Object3D>(o: T) => {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return o;
};

/* ---------------------------------------------------------------------- pão */

const bunColors: Record<BunVariant, { crumb: string; low: string; mid: string; top: string }> = {
  brioche: { crumb: '#f2d6a0', low: '#d9902f', mid: '#b5601a', top: '#8a3f0e' },
  australiano: { crumb: '#8d5b3c', low: '#5a3320', mid: '#3e2114', top: '#2a150c' },
  batata: { crumb: '#f7e1a6', low: '#e8b14c', mid: '#d48d2a', top: '#b66d18' },
};

function bunMaterial(variant: BunVariant, top: boolean) {
  return mat(`bun-${variant}-${top}`, () =>
    new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      map: crustDetail(),
      bumpMap: bumpNoise(21, 24),
      bumpScale: 0.6,
      roughness: top ? 0.42 : 0.6,
      clearcoat: top ? 0.35 : 0.1,
      clearcoatRoughness: 0.5,
      sheen: 0.4,
      sheenColor: new THREE.Color('#ffcf9a'),
    }),
  );
}

export function bunTop(variant: BunVariant = 'brioche', seed = 1): Built {
  const H = variant === 'australiano' ? 0.62 : 0.7;
  const geo = lathe([
    [0, 0], [0.5, 0], [0.92, 0.005], [1.0, 0.04], [1.04, 0.13], [1.03, 0.24], [0.97, 0.36], [0.86, 0.47], [0.7, 0.56], [0.48, 0.63 * (H / 0.7) + 0.01], [0.22, H - 0.01], [0, H],
  ]);
  wobble(geo, seed * 7 + 3, 0.025, 0.2);
  const C = bunColors[variant];
  const crumb = new THREE.Color(C.crumb), low = new THREE.Color(C.low), mid = new THREE.Color(C.mid), top = new THREE.Color(C.top);
  vertexColors(geo, (x, y, z, c) => {
    const r = Math.hypot(x, z);
    if (y < 0.012 && r < 0.95) c.copy(crumb).lerp(low, Math.max(0, (r - 0.8) / 0.2) * 0.6);
    else {
      const t = Math.min(1, y / H);
      if (t < 0.35) c.copy(low).lerp(mid, t / 0.35);
      else c.copy(mid).lerp(top, (t - 0.35) / 0.65);
    }
  });
  const mesh = new THREE.Mesh(geo, bunMaterial(variant, true));
  const g = new THREE.Group();
  g.add(mesh);

  // Gergelim (exceto no australiano)
  if (variant !== 'australiano') {
    const seedGeo = new THREE.SphereGeometry(0.03, 8, 6);
    seedGeo.scale(1, 0.38, 0.62);
    const seedMat = mat('sesame', () => new THREE.MeshStandardMaterial({ color: '#f7ecd2', roughness: 0.5 }));
    const count = variant === 'batata' ? 0 : 90;
    if (count) {
      const inst = new THREE.InstancedMesh(seedGeo, seedMat, count);
      const r = rng(seed * 31 + 5);
      const d = new THREE.Object3D();
      const pos = geo.attributes.position;
      const norm = geo.attributes.normal;
      let placed = 0;
      let guard = 0;
      while (placed < count && guard++ < 6000) {
        const i = Math.floor(r() * pos.count);
        const y = pos.getY(i);
        if (y < H * 0.45) continue;
        const n = new THREE.Vector3(norm.getX(i), norm.getY(i), norm.getZ(i)).normalize();
        d.position.set(pos.getX(i), y, pos.getZ(i)).addScaledVector(n, 0.004);
        d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
        d.rotateY(r() * Math.PI);
        d.updateMatrix();
        inst.setMatrixAt(placed++, d.matrix);
      }
      inst.count = placed;
      g.add(inst);
    }
  }
  return { obj: shadowed(g), h: H };
}

export function bunBottom(variant: BunVariant = 'brioche', seed = 2): Built {
  const H = 0.3;
  const geo = lathe([
    [0, 0], [0.6, 0], [0.93, 0.005], [1.0, 0.03], [1.03, 0.1], [1.03, 0.19], [1.0, 0.26], [0.94, 0.295], [0.6, 0.3], [0, 0.302],
  ]);
  wobble(geo, seed * 5 + 1, 0.022, 0.2);
  const C = bunColors[variant];
  const crumb = new THREE.Color(C.crumb), low = new THREE.Color(C.low), mid = new THREE.Color(C.mid);
  const toast = new THREE.Color(C.low).lerp(new THREE.Color(C.crumb), 0.45);
  vertexColors(geo, (x, y, z, c) => {
    const r = Math.hypot(x, z);
    if (y > H - 0.012 && r < 0.96) c.copy(toast).lerp(crumb, Math.max(0, (r - 0.55) / 0.4));
    else c.copy(mid).lerp(low, Math.min(1, y / H));
  });
  const mesh = new THREE.Mesh(geo, bunMaterial(variant, false));
  return { obj: shadowed(mesh), h: H };
}

/* -------------------------------------------------------------------- carne */

export function patty(variant: PattyVariant = 'angus', seed = 3): Built {
  const smash = variant === 'smash';
  const R = smash ? 1.1 : variant === 'frango' ? 1.06 : 1.02;
  const H = smash ? 0.13 : 0.3;
  const geo = lathe([
    [0, 0], [R * 0.86, 0], [R * 0.96, H * 0.1], [R, H * 0.4], [R * 0.995, H * 0.7], [R * 0.95, H * 0.94], [R * 0.85, H], [0, H * 1.02],
  ], 96, 40);
  wobble(geo, seed * 11 + (smash ? 2 : 9), smash ? 0.09 : variant === 'frango' ? 0.07 : 0.035, 0.6, smash ? 0.03 : 0.04);
  planarUV(geo, 0.45);
  const m = mat(`patty-${variant}`, () =>
    new THREE.MeshPhysicalMaterial({
      map: pattyTex(variant),
      bumpMap: bumpNoise(variant === 'frango' ? 61 : 41, variant === 'frango' ? 70 : 46),
      bumpScale: variant === 'frango' ? 3 : 2.2,
      roughness: variant === 'frango' ? 0.65 : 0.5,
      clearcoat: variant === 'frango' ? 0.05 : 0.35,
      clearcoatRoughness: 0.45,
    }),
  );
  return { obj: shadowed(new THREE.Mesh(geo, m)), h: H };
}

/* ------------------------------------------------------------------- queijo */

export function cheese(variant: CheeseVariant = 'cheddar', seed = 4): Built {
  const size = 1.8;
  const geo = new THREE.PlaneGeometry(size, size, 40, 40);
  geo.rotateX(-Math.PI / 2);
  const r = rng(seed * 17 + 3);
  geo.rotateY(Math.PI / 4 + (r() - 0.5) * 0.6);
  const n = fbm2(seed * 3 + 1, 3);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const d0 = Math.hypot(x, z);
    // cantos arredondados: o queijo derretido perde a forma quadrada
    const d = d0 > 1.0 ? 1.0 + (d0 - 1.0) * 0.45 : d0;
    const k = d0 > 1e-4 ? d / d0 : 1;
    const over = Math.max(0, d - 0.86);
    const sag = over * 1.1 + over * over * 4 + Math.max(0, n(x * 2.2, z * 2.2)) * over * 1.2;
    p.setXYZ(i, x * k * (1 - over * 0.1), 0.03 - sag, z * k * (1 - over * 0.1));
  }
  geo.computeVertexNormals();
  const m = mat(`cheese-${variant}`, () =>
    new THREE.MeshPhysicalMaterial({
      map: cheeseTex(variant),
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      side: THREE.DoubleSide,
      sheen: 0.3,
    }),
  );
  // espessura: duas folhas levemente afastadas
  const g = new THREE.Group();
  const a = new THREE.Mesh(geo, m);
  const b = new THREE.Mesh(geo, m);
  b.position.y = -0.018;
  g.add(a, b);
  return { obj: shadowed(g), h: 0.045 };
}

/* -------------------------------------------------------------------- molho */

const sauceColors: Record<SauceVariant, string> = {
  district: '#e47b49',
  barbecue: '#4e1a0b',
  ervas: '#dfe2b4',
  chipotle: '#c4512a',
  cheddar: '#f2a024',
};

export function sauce(variant: SauceVariant = 'district', seed = 5): Built {
  const g = new THREE.Group();
  const m = mat(`sauce-${variant}`, () =>
    new THREE.MeshPhysicalMaterial({ color: sauceColors[variant], roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 }),
  );
  const disc = lathe([[0, 0], [0.9, 0], [0.98, 0.012], [0.97, 0.03], [0.8, 0.04], [0, 0.042]], 64, 20);
  wobble(disc, seed * 13 + 7, 0.09, 0.4);
  g.add(new THREE.Mesh(disc, m));
  const r = rng(seed * 7 + 2);
  const drips = 5 + Math.floor(r() * 3);
  for (let i = 0; i < drips; i++) {
    const a = r() * Math.PI * 2;
    const len = 0.03 + r() * 0.09;
    const cap = new THREE.CapsuleGeometry(0.045 + r() * 0.03, len, 4, 10);
    const mesh = new THREE.Mesh(cap, m);
    const rr = 0.93 + r() * 0.05;
    mesh.position.set(Math.cos(a) * rr, -len / 2 + 0.03, Math.sin(a) * rr);
    g.add(mesh);
  }
  return { obj: shadowed(g), h: 0.04 };
}

/* ------------------------------------------------------------ hortifrúti */

export function lettuce(seed = 6): Built {
  const g = new THREE.Group();
  const m = mat('lettuce', () =>
    new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.45, side: THREE.DoubleSide, sheen: 0.6, sheenColor: new THREE.Color('#e8ffb0'), clearcoat: 0.3 }),
  );
  const pale = new THREE.Color('#c4df72');
  const deep = new THREE.Color('#2f7a17');
  for (let leaf = 0; leaf < 2; leaf++) {
    const geo = new THREE.RingGeometry(0.02, 1.2, 140, 12);
    geo.rotateX(-Math.PI / 2);
    const n = angularNoise(seed * 19 + leaf * 3, [5, 9, 13, 21]);
    const n2 = angularNoise(seed * 23 + leaf * 7 + 1, [2, 3, 4]);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const r = Math.hypot(x, z);
      const th = Math.atan2(z, x);
      const t = r / 1.2;
      const rr = r * (1 + n2(th) * 0.09 * t);
      const y = Math.sin(th * 17 + n(th) * 4) * 0.055 * t * t + n(th * 1.3) * 0.04 * t - Math.max(0, t - 0.75) * 0.18;
      p.setXYZ(i, Math.cos(th) * rr, y + leaf * 0.02, Math.sin(th) * rr);
    }
    geo.computeVertexNormals();
    vertexColors(geo, (x, _y, z, c) => {
      const t = Math.min(1, Math.hypot(x, z) / 1.25);
      c.copy(pale).lerp(deep, Math.pow(t, 1.6));
    });
    const mesh = new THREE.Mesh(geo, m);
    mesh.rotation.y = leaf * 1.7;
    g.add(mesh);
  }
  return { obj: shadowed(g), h: 0.08 };
}

export function tomato(seed = 7): Built {
  const g = new THREE.Group();
  const side = mat('tomato-side', () => new THREE.MeshPhysicalMaterial({ color: '#b5180c', roughness: 0.3, clearcoat: 0.8 }));
  const cap = mat('tomato-cap', () => new THREE.MeshPhysicalMaterial({ map: tomatoCapTex(), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }));
  const r = rng(seed);
  const offs = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  offs.forEach((a, i) => {
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.075, 48);
    const mesh = new THREE.Mesh(geo, [side, cap, cap]);
    const rad = 0.42;
    mesh.position.set(Math.cos(a + r()) * rad, 0.04 + i * 0.012, Math.sin(a + r()) * rad);
    mesh.rotation.set((r() - 0.5) * 0.08, r() * 3, (r() - 0.5) * 0.08);
    g.add(mesh);
  });
  return { obj: shadowed(g), h: 0.1 };
}

export function onion(seed = 8): Built {
  const g = new THREE.Group();
  const m = mat('onion', () => new THREE.MeshPhysicalMaterial({ color: '#b5578a', roughness: 0.3, clearcoat: 0.6, sheen: 0.5, sheenColor: new THREE.Color('#fff') }));
  const inner = mat('onion-in', () => new THREE.MeshPhysicalMaterial({ color: '#f1dde8', roughness: 0.35, clearcoat: 0.5 }));
  const r = rng(seed * 3);
  for (let i = 0; i < 7; i++) {
    const rad = 0.22 + r() * 0.26;
    const t = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.026, 8, 48), i % 2 ? m : inner);
    t.rotation.x = Math.PI / 2;
    t.scale.z = 0.6;
    const a = r() * Math.PI * 2;
    const d = r() * 0.5;
    t.position.set(Math.cos(a) * d, 0.02 + r() * 0.02, Math.sin(a) * d);
    g.add(t);
  }
  return { obj: shadowed(g), h: 0.05 };
}

export function caramelized(seed = 9): Built {
  const geo = new THREE.TorusGeometry(0.16, 0.032, 6, 14, Math.PI * 0.9);
  const m = mat('caramel', () => new THREE.MeshPhysicalMaterial({ color: '#8b4514', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.2 }));
  const count = 46;
  const inst = new THREE.InstancedMesh(geo, m, count);
  const r = rng(seed * 5 + 2);
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 0.9;
    d.position.set(Math.cos(a) * rad, 0.03 + r() * 0.04, Math.sin(a) * rad);
    d.rotation.set(Math.PI / 2 + (r() - 0.5) * 0.6, (r() - 0.5) * 0.6, r() * Math.PI * 2);
    d.scale.setScalar(0.7 + r() * 0.7);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
    inst.setColorAt(i, c.set('#8b4514').offsetHSL(0, 0, (r() - 0.5) * 0.12));
  }
  return { obj: shadowed(inst), h: 0.08 };
}

export function pickles(seed = 10): Built {
  const g = new THREE.Group();
  const top = mat('pickle-top', () => new THREE.MeshPhysicalMaterial({ map: pickleTex(), roughness: 0.25, clearcoat: 0.9 }));
  const side = mat('pickle-side', () => new THREE.MeshStandardMaterial({ color: '#3f5a19', roughness: 0.4 }));
  const r = rng(seed);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const rad = i === 0 ? 0 : 0.45 + r() * 0.15;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 28), [side, top, top]);
    mesh.position.set(Math.cos(a) * rad, 0.02 + r() * 0.01, Math.sin(a) * rad);
    mesh.rotation.set((r() - 0.5) * 0.15, 0, (r() - 0.5) * 0.15);
    g.add(mesh);
  }
  return { obj: shadowed(g), h: 0.04 };
}

export function egg(seed = 12): Built {
  const g = new THREE.Group();
  const white = new THREE.RingGeometry(0.0, 1.0, 96, 8);
  white.rotateX(-Math.PI / 2);
  const n = angularNoise(seed * 3, [2, 3, 5, 7]);
  const p = white.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const r = Math.hypot(x, z);
    const th = Math.atan2(z, x);
    const rr = r * (1 + n(th) * 0.12);
    p.setXYZ(i, Math.cos(th) * rr, 0.05 * (1 - r * r) + 0.01, Math.sin(th) * rr);
  }
  white.computeVertexNormals();
  const wm = mat('egg-white', () => new THREE.MeshPhysicalMaterial({ color: '#fbf6ea', roughness: 0.3, clearcoat: 0.6, side: THREE.DoubleSide }));
  const ym = mat('egg-yolk', () => new THREE.MeshPhysicalMaterial({ color: '#f5a00f', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }));
  const yolk = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), ym);
  yolk.scale.y = 0.6;
  yolk.position.set(0.12, 0.05, -0.08);
  g.add(new THREE.Mesh(white, wm), yolk);
  return { obj: shadowed(g), h: 0.12 };
}

export function jalapeno(seed = 13): Built {
  const g = new THREE.Group();
  const m = mat('jalapeno', () => new THREE.MeshPhysicalMaterial({ color: '#3e8526', roughness: 0.25, clearcoat: 0.9 }));
  const inner = mat('jalapeno-in', () => new THREE.MeshStandardMaterial({ color: '#d8e7a8', roughness: 0.5 }));
  const r = rng(seed);
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * 0.75;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 24), m);
    ring.rotation.x = Math.PI / 2 + (r() - 0.5) * 0.3;
    ring.scale.z = 0.7;
    ring.position.set(Math.cos(a) * rad, 0.025, Math.sin(a) * rad);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), inner);
    core.position.copy(ring.position);
    g.add(ring, core);
  }
  return { obj: shadowed(g), h: 0.05 };
}

export function bacon(seed = 14): Built {
  const g = new THREE.Group();
  const m = mat('bacon', () => new THREE.MeshPhysicalMaterial({ map: baconTex(), roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3, bumpMap: bumpNoise(81, 30), bumpScale: 1.2 }));
  const r = rng(seed * 9 + 1);
  for (let s = 0; s < 2; s++) {
    const geo = new THREE.BoxGeometry(2.05, 0.035, 0.3, 80, 1, 4);
    const ph = r() * 6;
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setY(i, p.getY(i) + Math.sin(x * 5.5 + ph) * 0.05 + Math.sin(x * 13 + ph) * 0.01);
      p.setZ(i, p.getZ(i) + Math.sin(x * 2.6 + ph) * 0.06);
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m);
    mesh.rotation.y = s === 0 ? 0.45 + r() * 0.2 : -0.6 - r() * 0.3;
    mesh.position.set((r() - 0.5) * 0.15, 0.05 + s * 0.04, (s ? 1 : -1) * 0.15);
    g.add(mesh);
  }
  return { obj: shadowed(g), h: 0.1 };
}

/* ----------------------------------------------------------------- despacho */

export function buildLayer(spec: LayerSpec, seed: number): Built {
  switch (spec.type) {
    case 'bun-bottom':
      return bunBottom(spec.variant, seed);
    case 'bun-top':
      return bunTop(spec.variant, seed);
    case 'patty':
      return patty(spec.variant, seed);
    case 'cheese':
      return cheese(spec.variant, seed);
    case 'sauce':
      return sauce(spec.variant, seed);
    case 'bacon':
      return bacon(seed);
    case 'lettuce':
      return lettuce(seed);
    case 'tomato':
      return tomato(seed);
    case 'onion':
      return onion(seed);
    case 'caramelized':
      return caramelized(seed);
    case 'pickles':
      return pickles(seed);
    case 'egg':
      return egg(seed);
    case 'jalapeno':
      return jalapeno(seed);
  }
}
