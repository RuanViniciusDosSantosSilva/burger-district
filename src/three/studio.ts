import '@fontsource/anton/latin-400.css';
import '@fontsource/archivo/latin-700.css';
/**
 * Estúdio de renders: gera as imagens de produto a partir dos mesmos modelos 3D do site.
 * Executado por scripts/render-products.mjs em um Chrome headless.
 */
import * as THREE from 'three';
import { products } from '@/data/products';
import type { ModelSpec } from '@/types';
import { buildProductModel } from './products3d';
import { Stage } from './Stage';
import { anatomyLayers, signatureLayers } from './signature';

declare global {
  interface Window {
    __RENDERS__?: Record<string, string>;
    __DONE__?: boolean;
    __ERROR__?: string;
  }
}

const SIZE = 880;

async function main() {
  await document.fonts.load('400 60px Anton');
  await document.fonts.load('700 30px Archivo');
  const canvas = document.getElementById('c') as HTMLCanvasElement;
  canvas.style.width = canvas.style.height = `${SIZE}px`;
  const stage = new Stage({ canvas, alpha: true, maxPixelRatio: 1, preserveDrawingBuffer: true });
  stage.key.shadow.mapSize.set(2048, 2048);
  stage.resize(SIZE, SIZE);

  const jobs: { id: string; spec: ModelSpec; elev?: number; az?: number; pad?: number; w?: number; h?: number }[] = [
    ...products.map((p) => ({ id: p.id, spec: p.model })),
    { id: 'hero', spec: { kind: 'burger', layers: signatureLayers } as ModelSpec },
    { id: 'anatomy', spec: { kind: 'burger', layers: anatomyLayers } as ModelSpec },
    { id: 'griddle', spec: { kind: 'griddle' } as ModelSpec, elev: 30, az: 6, pad: 0.62, w: 1600, h: 800 },
  ];

  const qs = new URLSearchParams(location.search);
  const only = qs.get('only');
  if (qs.has('nofloor')) stage.floor.visible = false;
  const out: Record<string, string> = {};
  for (const job of jobs) {
    if (only && job.id !== only) continue;
    const W = job.w ?? SIZE;
    const H = job.h ?? SIZE;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    stage.resize(W, H);
    const model = buildProductModel(job.spec);
    stage.root.clear();
    stage.root.add(model);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const isCombo = job.spec.kind === 'combo';
    const elev = THREE.MathUtils.degToRad(job.elev ?? (isCombo ? 30 : 16));
    const az = THREE.MathUtils.degToRad(job.az ?? (isCombo ? 8 : 28));
    const fov = THREE.MathUtils.degToRad(stage.camera.fov);
    const size = box.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.z);
    const tan = Math.tan(fov / 2);
    const vert = size.y * Math.cos(elev) + span * Math.sin(elev);
    const dist = (Math.max(vert, span) / 2 / tan) * (job.pad ?? (job.spec.kind === 'burger' ? 0.7 : job.spec.kind === 'combo' ? 0.8 : 0.88)) + span / 2;
    const c = box.getCenter(new THREE.Vector3());
    const sc = stage.key.shadow.camera;
    const R = sphere.radius * 1.4;
    Object.assign(sc, { left: -R, right: R, top: R, bottom: -R });
    sc.updateProjectionMatrix();
    stage.key.position.copy(c).add(new THREE.Vector3(-4, 7, 5));
    stage.key.target.position.copy(c);
    stage.key.target.updateMatrixWorld();
    stage.camera.position.set(c.x + Math.sin(az) * Math.cos(elev) * dist, c.y + Math.sin(elev) * dist, c.z + Math.cos(az) * Math.cos(elev) * dist);
    stage.camera.lookAt(c);
    stage.setGround(box.min.y, Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * 1.25);
    stage.contact.visible = job.spec.kind !== 'griddle' && !qs.has('nocontact');
    stage.render();
    out[job.id] = canvas.toDataURL('image/webp', 0.86);
  }
  window.__RENDERS__ = out;
  window.__DONE__ = true;
}

main().catch((e) => {
  window.__ERROR__ = String(e?.stack ?? e);
  window.__DONE__ = true;
});
