import * as THREE from 'three';
import type { LayerSpec } from '@/types';
import { buildLayer } from './ingredients';

export interface Layer {
  spec: LayerSpec;
  key: string;
  obj: THREE.Object3D;
  base: number;
  h: number;
  spin: number;
  /** deslocamento vertical extra usado nas animações de "queda" */
  drop: number;
}

const layerKey = (s: LayerSpec, count: Map<string, number>) => {
  const id = `${s.type}:${'variant' in s ? s.variant ?? '' : ''}`;
  const n = (count.get(id) ?? 0) + 1;
  count.set(id, n);
  return `${id}#${n}`;
};

/**
 * Hambúrguer 3D montado em camadas independentes.
 * `explode` (0..1+) separa as camadas verticalmente — usado na vista explodida guiada pelo scroll.
 */
export class BurgerModel {
  readonly group = new THREE.Group();
  readonly stack = new THREE.Group();
  layers: Layer[] = [];
  height = 0;
  explode = 0;
  gap = 0.62;
  twist = 0.16;

  constructor(specs: LayerSpec[], seed = 1) {
    this.group.add(this.stack);
    const counts = new Map<string, number>();
    let y = 0;
    specs.forEach((spec, i) => {
      const { obj, h } = buildLayer(spec, seed * 100 + i * 7 + 1);
      const compress = spec.type === 'bun-bottom' || spec.type === 'bun-top' ? 1 : 0.86;
      const layer: Layer = { spec, key: layerKey(spec, counts), obj, base: y, h, spin: (i * 1.37) % (Math.PI * 2), drop: 0 };
      obj.rotation.y = layer.spin;
      this.stack.add(obj);
      this.layers.push(layer);
      y += h * compress;
    });
    this.height = y + 0.05;
    this.update();
  }

  /** Aplica explosão + quedas a todas as camadas. */
  update() {
    const n = this.layers.length;
    const mid = (n - 1) / 2;
    const e = this.explode;
    this.layers.forEach((l, i) => {
      const k = i - mid;
      l.obj.position.y = l.base + k * this.gap * e + l.drop;
      l.obj.rotation.y = l.spin + k * this.twist * e;
      l.obj.rotation.z = Math.sin(i * 1.7) * 0.07 * e;
      l.obj.rotation.x = Math.cos(i * 1.3) * 0.05 * e;
    });
    this.stack.position.y = -this.height / 2;
  }

  /** Posição (em coordenadas do mundo) do centro de cada camada — usada para rótulos HTML. */
  layerWorldCenter(i: number, target = new THREE.Vector3()) {
    const l = this.layers[i];
    target.set(0, l.h / 2, 0);
    return l.obj.localToWorld(target);
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.geometry.dispose();
    });
    this.group.removeFromParent();
  }
}
