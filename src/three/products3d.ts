import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { DessertVariant, DrinkVariant, ModelSpec, SideVariant } from '@/types';
import { BurgerModel } from './burger';
import { caramelized, cheese, mat, patty } from './ingredients';
import { fbm2, rng } from './noise';
import { brandWrapTex, bumpNoise, slateTex, steelTex, woodTex } from './textures';

/** Modelos 3D dos demais itens do cardápio (batatas, bebidas, sobremesas, combos). */

const shadowed = <T extends THREE.Object3D>(o: T) => {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return o;
};

function lathe(profile: [number, number][], segs = 64) {
  return new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), segs);
}

const glassMat = () =>
  mat('glass', () =>
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transmission: 1, thickness: 0.15, ior: 1.45, transparent: true, opacity: 1, clearcoat: 1, side: THREE.DoubleSide }),
  );

function straw(height: number, tilt = 0.18) {
  const m = mat('straw', () => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 ? '#e2561b' : '#0b0907';
      ctx.fillRect(0, i * 16, 64, 16);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 });
  });
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, height, 16), m);
  s.rotation.z = tilt;
  return s;
}

/* ------------------------------------------------------------------ batatas */

function friesInstances(count: number, seed: number, area: number, yMin: number, yMax: number, upright: boolean) {
  const geo = new THREE.BoxGeometry(0.09, 1, 0.09);
  const m = mat('fry', () => new THREE.MeshPhysicalMaterial({ color: '#f1b94a', roughness: 0.5, bumpMap: bumpNoise(51, 60), bumpScale: 1.5, sheen: 0.4, sheenColor: new THREE.Color('#ffe2a0') }));
  const inst = new THREE.InstancedMesh(geo, m, count);
  const r = rng(seed);
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    d.position.set((r() - 0.5) * area, yMin + r() * (yMax - yMin), (r() - 0.5) * area);
    if (upright) d.rotation.set((r() - 0.5) * 0.5, r() * 3, (r() - 0.5) * 0.5);
    else d.rotation.set(Math.PI / 2 + (r() - 0.5) * 0.8, r() * 3, (r() - 0.5) * 0.8);
    d.scale.set(1, 0.55 + r() * 0.5, 1);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
    inst.setColorAt(i, c.set('#f1b94a').offsetHSL((r() - 0.5) * 0.02, 0, (r() - 0.5) * 0.1));
  }
  return inst;
}

function friesBox(seed = 1) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.62, 0.46, 1.0, 4, 1, true);
  geo.rotateY(Math.PI / 4);
  const m = mat('fries-box', () =>
    new THREE.MeshStandardMaterial({ map: brandWrapTex('fries', '#e2561b', '#0b0907', 'BATATA DA CASA'), roughness: 0.6, side: THREE.DoubleSide }),
  );
  const box = new THREE.Mesh(geo, m);
  box.position.y = 0.5;
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65).rotateX(-Math.PI / 2), m);
  bottom.position.y = 0.01;
  g.add(box, bottom, friesInstances(56, seed, 0.62, 0.75, 1.15, true));
  return g;
}

function bowl(color = '#16110e') {
  const g = new THREE.Group();
  const m = mat(`bowl-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide }));
  const geo = lathe([[0, 0], [0.75, 0], [0.98, 0.06], [1.15, 0.42], [1.18, 0.46], [1.12, 0.46], [0.96, 0.14], [0.7, 0.09], [0, 0.09]]);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.025, 8, 80), mat('rim', () => new THREE.MeshStandardMaterial({ color: '#e2561b', roughness: 0.4 })));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.46;
  g.add(new THREE.Mesh(geo, m), rim);
  return g;
}

function dipPot(color: string) {
  const g = new THREE.Group();
  const cup = new THREE.Mesh(
    lathe([[0, 0], [0.2, 0], [0.24, 0.24], [0.22, 0.24], [0.18, 0.02], [0, 0.02]], 40),
    mat('pot', () => new THREE.MeshPhysicalMaterial({ color: '#f5efe6', roughness: 0.3, clearcoat: 0.5, side: THREE.DoubleSide })),
  );
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.215, 32).rotateX(-Math.PI / 2), mat(`dip-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.15, clearcoat: 1 })));
  top.position.y = 0.2;
  g.add(cup, top);
  return g;
}

function cheeseSauceBlob(seed = 3) {
  const geo = new THREE.IcosahedronGeometry(0.75, 5);
  const n = fbm2(seed, 3);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    let y = p.getY(i);
    const z = p.getZ(i);
    const k = 1 + n(x * 2.5 + 3, z * 2.5) * 0.35;
    y = y > 0 ? y * 0.28 * k : y * 0.05;
    p.setXYZ(i, x * k, y, z * k);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat('cheese-sauce', () => new THREE.MeshPhysicalMaterial({ color: '#f39a12', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 })));
}

function bits(count: number, color: string, size: number, seed: number, radius: number, y: number) {
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size * 0.6, size * 0.8), mat(`bit-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.6 })), count);
  const r = rng(seed);
  const d = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const rad = Math.sqrt(r()) * radius;
    d.position.set(Math.cos(a) * rad, y + r() * 0.08 - rad * 0.1, Math.sin(a) * rad);
    d.rotation.set(r() * 3, r() * 3, r() * 3);
    d.scale.setScalar(0.6 + r() * 0.8);
    d.updateMatrix();
    inst.setMatrixAt(i, d.matrix);
  }
  return inst;
}

export function buildSide(variant: SideVariant): THREE.Object3D {
  const g = new THREE.Group();
  if (variant === 'classica') {
    g.add(friesBox(4));
    const pot = dipPot('#e47b49');
    pot.position.set(0.95, 0, 0.35);
    g.add(pot);
  } else if (variant === 'cheddar-bacon') {
    g.add(bowl());
    const fries = friesInstances(70, 9, 1.4, 0.2, 0.55, false);
    g.add(fries);
    const blob = cheeseSauceBlob();
    blob.position.y = 0.55;
    g.add(blob, bits(70, '#8f2a17', 0.07, 2, 0.75, 0.72), bits(40, '#3f8a2a', 0.04, 5, 0.8, 0.72));
  } else if (variant === 'rustica') {
    g.add(bowl('#201813'));
    const wedge = new THREE.CylinderGeometry(0.19, 0.19, 0.75, 3);
    const m = mat('wedge', () => new THREE.MeshPhysicalMaterial({ color: '#d99a3c', roughness: 0.5, bumpMap: bumpNoise(52, 40), bumpScale: 2, clearcoat: 0.3 }));
    const inst = new THREE.InstancedMesh(wedge, m, 26);
    const r = rng(8);
    const d = new THREE.Object3D();
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2;
      const rad = Math.sqrt(r()) * 0.7;
      d.position.set(Math.cos(a) * rad, 0.3 + r() * 0.3, Math.sin(a) * rad);
      d.rotation.set(Math.PI / 2 + (r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.6);
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
    }
    g.add(inst, bits(30, '#2f5a1d', 0.05, 3, 0.7, 0.62));
    const pot = dipPot('#f1ead2');
    pot.position.set(1.25, 0, 0.5);
    g.add(pot);
  } else {
    const ringM = mat('onion-ring', () => new THREE.MeshPhysicalMaterial({ color: '#d99a3c', roughness: 0.55, bumpMap: bumpNoise(53, 80), bumpScale: 4, sheen: 0.4 }));
    const geo = new THREE.TorusGeometry(0.4, 0.14, 18, 56);
    const board = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.12, 1.7, 3, 0.05), mat('wood', () => new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.7 })));
    board.position.y = 0.06;
    g.add(board);
    const r = rng(2);
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(geo, ringM);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-0.45 + (r() - 0.5) * 0.1, 0.26 + i * 0.24, (r() - 0.5) * 0.1);
      g.add(ring);
    }
    for (let i = 0; i < 2; i++) {
      const ring = new THREE.Mesh(geo, ringM);
      ring.rotation.set(0.25, i * 0.6, 0.5);
      ring.position.set(0.45 + i * 0.25, 0.55, -0.2 + i * 0.45);
      g.add(ring);
    }
    const pot = dipPot('#e47b49');
    pot.position.set(0.85, 0.12, 0.45);
    g.add(pot);
  }
  return shadowed(g);
}

/* ------------------------------------------------------------------ bebidas */

function can() {
  const g = new THREE.Group();
  const label = mat('can-label', () => new THREE.MeshStandardMaterial({ map: brandWrapTex('can', '#e2561b', '#f3e9d8', 'DISTRICT SODA'), metalness: 0.45, roughness: 0.3 }));
  const metal = mat('metal', () => new THREE.MeshStandardMaterial({ color: '#cfcac4', metalness: 1, roughness: 0.25 }));
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 64, 1, true), label);
  body.position.y = 0.68;
  const top = new THREE.Mesh(lathe([[0.4, 0], [0.33, 0.1], [0.34, 0.13], [0.32, 0.12], [0, 0.1]], 48), metal);
  top.position.y = 1.28;
  const bottom = new THREE.Mesh(lathe([[0, 0.04], [0.3, 0], [0.4, 0.08]], 48), metal);
  g.add(body, top, bottom);
  return g;
}

function glass(height: number, rb: number, rt: number) {
  return new THREE.Mesh(lathe([[0, 0], [rb, 0], [rt, height], [rt - 0.03, height], [rb - 0.03, 0.08], [0, 0.08]], 64), glassMat());
}

function liquid(height: number, rb: number, rt: number, bottom: string, top: string, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  const geo = lathe([[0, 0.09], [rb - 0.04, 0.09], [rb - 0.04 + (rt - rb) * (height / 1), height], [0, height]], 64);
  const cb = new THREE.Color(bottom);
  const ct = new THREE.Color(top);
  const p = geo.attributes.position;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    c.copy(cb).lerp(ct, p.getY(i) / height);
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.2, clearcoat: 0.5, ...opts }));
}

function citrusSlice(color: string, flesh: string) {
  const g = new THREE.Group();
  const rind = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32, 1, false, 0, Math.PI), [
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.4, clearcoat: 0.6 }),
    new THREE.MeshPhysicalMaterial({ color: flesh, roughness: 0.25, clearcoat: 1 }),
    new THREE.MeshPhysicalMaterial({ color: flesh, roughness: 0.25, clearcoat: 1 }),
  ]);
  rind.rotation.x = Math.PI / 2;
  g.add(rind);
  return g;
}

export function buildDrink(variant: DrinkVariant): THREE.Object3D {
  const g = new THREE.Group();
  if (variant === 'lata') {
    g.add(can());
  } else if (variant === 'limonada' || variant === 'soda') {
    const H = 1.6;
    g.add(glass(H, 0.45, 0.56));
    const lim = variant === 'limonada';
    g.add(liquid(H * 0.86, 0.45, 0.56, lim ? '#d9e6a2' : '#7a0a22', lim ? '#f4f6dd' : '#ff5a7a', lim ? { roughness: 0.55 } : { roughness: 0.08, transmission: 0.35, thickness: 1 }));
    const s = straw(2.1, 0.2);
    s.position.set(0.12, 1.25, 0);
    g.add(s);
    if (lim) {
      const slice = citrusSlice('#3f8a1f', '#d6ec8a');
      slice.position.set(-0.5, 1.55, 0.1);
      slice.rotation.y = 0.6;
      g.add(slice);
    } else {
      const r = rng(4);
      const ice = mat('ice', () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.1, transmission: 1, thickness: 0.4, ior: 1.31 }));
      for (let i = 0; i < 4; i++) {
        const cube = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.3, 0.3, 2, 0.05), ice);
        cube.position.set((r() - 0.5) * 0.45, 1.25 + r() * 0.12, (r() - 0.5) * 0.45);
        cube.rotation.set(r() * 3, r() * 3, r() * 3);
        g.add(cube);
      }
      const berryM = mat('berry', () => new THREE.MeshPhysicalMaterial({ color: '#5a0f2a', roughness: 0.3, clearcoat: 1 }));
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), berryM);
        b.position.set(-0.2 + i * 0.16, 1.42, 0.12 - i * 0.05);
        g.add(b);
      }
    }
  } else {
    // garrafa de mate
    const bottleGeo = lathe([[0, 0], [0.36, 0], [0.4, 0.05], [0.4, 1.05], [0.34, 1.3], [0.15, 1.55], [0.14, 1.85], [0.16, 1.9], [0, 1.9]]);
    const bottle = new THREE.Mesh(bottleGeo, mat('amber', () => new THREE.MeshPhysicalMaterial({ color: '#8a4a14', roughness: 0.08, transmission: 0.55, thickness: 0.6, clearcoat: 1 })));
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.405, 0.405, 0.55, 64, 1, true), mat('mate-label', () => new THREE.MeshStandardMaterial({ map: brandWrapTex('mate', '#f3e9d8', '#0b0907', 'MATE DA CASA'), roughness: 0.5 })));
    label.position.y = 0.55;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 24), mat('cap', () => new THREE.MeshStandardMaterial({ color: '#e2561b', metalness: 0.6, roughness: 0.3 })));
    cap.position.y = 1.92;
    const lemon = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), [new THREE.MeshPhysicalMaterial({ color: '#a8c43a', roughness: 0.4 })]);
    lemon.position.set(0.75, 0, 0.3);
    const lemonFace = new THREE.Mesh(new THREE.CircleGeometry(0.31, 32).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#e7f0a0', roughness: 0.2, clearcoat: 1 }));
    lemonFace.position.set(0.75, 0.002, 0.3);
    g.add(bottle, label, cap, lemon, lemonFace);
  }
  return shadowed(g);
}

/* --------------------------------------------------------------- sobremesas */

function plate() {
  const m = mat('slate', () => new THREE.MeshStandardMaterial({ map: slateTex(), roughness: 0.85 }));
  const p = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.2, 0.08, 72), m);
  p.position.y = 0.04;
  return p;
}

function scoop(seed: number, color: string) {
  const geo = new THREE.IcosahedronGeometry(0.45, 5);
  const n = fbm2(seed, 4);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
    const k = 1 + n(v.x * 3 + 2, v.z * 3 + v.y * 2) * 0.18;
    v.multiplyScalar(k);
    if (v.y < -0.18) v.y = -0.18 - (v.y + 0.18) * 0.1;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat(`scoop-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.75, sheen: 0.5, sheenColor: new THREE.Color('#fff') })));
}

function drizzle(points: THREE.Vector3[], color: string, radius = 0.035) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 120, radius, 8), mat(`drizzle-${color}`, () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.1, clearcoat: 1 })));
}

export function buildDessert(variant: DessertVariant): THREE.Object3D {
  const g = new THREE.Group();
  if (variant === 'brownie') {
    g.add(plate());
    const b = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.5, 1.25, 4, 0.07), mat('brownie', () => new THREE.MeshPhysicalMaterial({ color: '#3a1b0d', roughness: 0.6, bumpMap: bumpNoise(91, 20), bumpScale: 4, clearcoat: 0.2 })));
    b.position.y = 0.33;
    b.rotation.y = 0.4;
    const s = scoop(5, '#f5e7c8');
    s.position.set(0.05, 0.85, 0);
    const r = rng(3);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) pts.push(new THREE.Vector3(-0.7 + i * 0.17, 0.62 + (i > 2 && i < 7 ? 0.45 : 0) + r() * 0.05, (i % 2 ? 0.35 : -0.35) + (r() - 0.5) * 0.1));
    g.add(b, s, drizzle(pts, '#2a1208'));
  } else if (variant === 'shake') {
    const H = 1.6;
    g.add(glass(H, 0.38, 0.58));
    g.add(liquid(H * 0.94, 0.38, 0.58, '#b9773e', '#e5bb86', { roughness: 0.6 }));
    const cream = mat('cream', () => new THREE.MeshPhysicalMaterial({ color: '#fbf6ee', roughness: 0.7, sheen: 0.6 }));
    for (let k = 0; k < 5; k++) {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.42 * (1 - k * 0.19), 0.16 * (1 - k * 0.12), 16, 48), cream);
      t.rotation.x = Math.PI / 2;
      t.position.y = H + 0.05 + k * 0.17;
      g.add(t);
    }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 20), cream);
    tip.position.y = H + 0.95;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 40; i++) {
      const a = i * 0.55;
      const rad = 0.5 - i * 0.01;
      pts.push(new THREE.Vector3(Math.cos(a) * rad, H + 0.1 + i * 0.022, Math.sin(a) * rad));
    }
    const s = straw(2.2, -0.2);
    s.position.set(-0.2, H + 0.3, 0);
    g.add(tip, drizzle(pts, '#a8561c', 0.03), s);
  } else {
    const cup = new THREE.Mesh(lathe([[0, 0], [0.42, 0], [0.56, 0.85], [0.53, 0.85], [0.4, 0.03], [0, 0.03]]), mat('churros-cup', () => new THREE.MeshStandardMaterial({ map: brandWrapTex('churros', '#0b0907', '#e2561b', 'CHURROS'), roughness: 0.6, side: THREE.DoubleSide })));
    g.add(cup);
    const star = new THREE.Shape();
    const P = 8;
    for (let i = 0; i <= P * 2; i++) {
      const a = (i / (P * 2)) * Math.PI * 2;
      const rr = i % 2 ? 0.075 : 0.1;
      if (i === 0) star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    const geo = new THREE.ExtrudeGeometry(star, { depth: 1.15, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.015, bevelSegments: 2 });
    geo.rotateX(-Math.PI / 2);
    const m = mat('churro', () => new THREE.MeshPhysicalMaterial({ color: '#c9802f', roughness: 0.6, bumpMap: bumpNoise(55, 120), bumpScale: 3, sheen: 0.8, sheenColor: new THREE.Color('#fff2d8') }));
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Mesh(geo, m);
      const a = (i / 6) * Math.PI * 2;
      c.position.set(Math.cos(a) * 0.18, 0.15, Math.sin(a) * 0.18);
      c.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25);
      g.add(c);
    }
    const pot = dipPot('#9b4a14');
    pot.scale.setScalar(1.6);
    pot.position.set(0.95, 0, 0.3);
    g.add(pot);
  }
  return shadowed(g);
}

/* --------------------------------------------------------- combos e chapa */

export function buildCombo(spec: Extract<ModelSpec, { kind: 'combo' }>): THREE.Object3D {
  const g = new THREE.Group();
  const n = spec.burgers.length;
  const W = n >= 3 ? 5.4 : n === 2 ? 4.4 : 3.6;
  const board = new THREE.Mesh(new RoundedBoxGeometry(W, 0.16, 2.6, 3, 0.06), mat('wood', () => new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.7 })));
  board.position.y = 0.08;
  g.add(board);
  const slots: [number, number][] = n >= 3 ? [[-1.7, -0.35], [-0.35, -0.45], [-1.0, 0.75]] : n === 2 ? [[-1.25, -0.3], [-0.05, 0.25]] : [[-0.7, 0]];
  spec.burgers.forEach((layers, i) => {
    const b = new BurgerModel(layers, i + 2);
    b.group.scale.setScalar(0.62);
    const [x, z] = slots[i] ?? [0, 0];
    b.group.position.set(x, 0.16 + (b.height / 2) * 0.62, z);
    b.group.rotation.y = 0.4 + i;
    g.add(b.group);
  });
  spec.sides.forEach((s, i) => {
    const side = buildSide(s);
    side.scale.setScalar(s === 'onion-rings' ? 0.5 : 0.7);
    side.position.set(W / 2 - 1.15 - i * 0.2, 0.16, -0.55 + i * 1.15);
    if (s === 'onion-rings') side.position.set(0.5, 0.16, 0.85);
    g.add(side);
  });
  for (let i = 0; i < spec.drinks; i++) {
    const c = buildDrink('lata');
    c.scale.setScalar(0.75);
    c.position.set(W / 2 - 0.5 - i * 0.6, 0.16, 0.7 + i * 0.15);
    g.add(c);
  }
  return shadowed(g);
}

export function buildGriddle(): THREE.Object3D {
  const g = new THREE.Group();
  const steel = new THREE.Mesh(new RoundedBoxGeometry(6, 0.25, 3.6, 3, 0.05), mat('steel', () => new THREE.MeshStandardMaterial({ map: steelTex(), metalness: 0.75, roughness: 0.42 })));
  steel.position.y = -0.125;
  g.add(steel);
  const spots: [number, number][] = [[-1.6, -0.3], [0.1, 0.4], [1.7, -0.4]];
  spots.forEach(([x, z], i) => {
    const p = patty('smash', 40 + i).obj;
    p.position.set(x, 0, z);
    g.add(p);
    if (i !== 1) {
      const c = cheese('americano', 60 + i).obj;
      c.position.set(x, 0.13, z);
      g.add(c);
    }
  });
  const onions = caramelized(77).obj;
  onions.position.set(0.3, 0, -1.1);
  onions.scale.set(1.4, 1, 0.8);
  g.add(onions);
  const blade = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.03, 0.9, 2, 0.01), mat('metal', () => new THREE.MeshStandardMaterial({ color: '#cfcac4', metalness: 1, roughness: 0.25 })));
  blade.position.set(2.3, 0.2, 1.1);
  blade.rotation.set(0, -0.5, 0.18);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.2, 16), mat('handle', () => new THREE.MeshStandardMaterial({ color: '#1c1410', roughness: 0.5 })));
  handle.position.set(3.1, 0.45, 1.6);
  handle.rotation.set(0.6, 0, 1.1);
  g.add(blade, handle);
  return shadowed(g);
}

export function buildProductModel(spec: ModelSpec): THREE.Object3D {
  switch (spec.kind) {
    case 'burger': {
      const b = new BurgerModel(spec.layers, spec.layers.length);
      b.group.position.y = b.height / 2;
      const g = new THREE.Group();
      g.add(b.group);
      return g;
    }
    case 'side':
      return buildSide(spec.variant);
    case 'drink':
      return buildDrink(spec.variant);
    case 'dessert':
      return buildDessert(spec.variant);
    case 'combo':
      return buildCombo(spec);
    case 'griddle':
      return buildGriddle();
  }
}
