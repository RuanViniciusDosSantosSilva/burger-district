import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ProductImage } from '@/components/ui/ProductImage';
import { BurgerModel } from '@/three/burger';
import type { Stage } from '@/three/Stage';
import type { LayerSpec } from '@/types';
import { isMobile, useStage } from './useStage';

/** Visualização 3D do "Monte seu burger": cada ingrediente novo cai na pilha. Arraste para girar. */
export function BuilderViewer({ layers, reduced }: { layers: LayerSpec[]; reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ stage: Stage; pivot: THREE.Group; model: BurgerModel | null; prevKeys: Set<string> } | null>(null);
  const drag = useRef({ active: false, x: 0, vel: 0, rot: 0.6 });

  const { failed } = useStage(canvas, { maxPixelRatio: isMobile() ? 1.4 : 1.7, fov: 28 }, (stage) => {
    const pivot = new THREE.Group();
    stage.root.add(pivot);
    api.current = { stage, pivot, model: null, prevKeys: new Set() };
    let cam = { d: 9 };
    stage.onFrame = (dt) => {
      const d = drag.current;
      if (!d.active) {
        d.rot += d.vel;
        d.vel *= 0.94;
        if (!reduced) d.rot += dt * 0.3;
      }
      pivot.rotation.y = d.rot;
      const m = api.current?.model;
      if (m) {
        m.update();
        const target = Math.max(7.5, m.height * 2.9 + 3);
        cam.d += (target - cam.d) * 0.08;
        stage.camera.position.set(0, cam.d * 0.2, cam.d);
        stage.camera.lookAt(0, 0, 0);
      }
    };
    return () => {
      api.current?.model?.dispose();
      api.current = null;
      cam = { d: 9 };
    };
  });

  // reconstrói o modelo quando as camadas mudam, animando apenas as novas
  useEffect(() => {
    const a = api.current;
    if (!a) return;
    const old = a.model;
    const model = new BurgerModel(layers, 5);
    const keys = new Set(model.layers.map((l) => l.key));
    model.layers.forEach((l, i) => {
      if (!a.prevKeys.has(l.key) && a.prevKeys.size > 0 && !reduced) {
        l.drop = 3.5;
        gsap.to(l, { drop: 0, duration: 0.7, delay: i * 0.015, ease: 'bounce.out' });
      }
    });
    old?.dispose();
    a.pivot.add(model.group);
    a.model = model;
    a.prevKeys = keys;
    a.stage.setGround(-model.height / 2 - 0.02, 3.2);
    model.update();
  }, [layers, reduced]);

  const onDown = (e: React.PointerEvent) => {
    drag.current.active = true;
    drag.current.x = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = (e.clientX - d.x) * 0.01;
    d.x = e.clientX;
    d.rot += dx;
    d.vel = dx;
  };
  const onUp = () => (drag.current.active = false);

  if (failed) return <ProductImage src="renders/classic-smash.webp" alt="Prévia do burger" className="h-full w-full" />;
  return (
    <canvas
      ref={canvas}
      className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label="Prévia 3D do seu burger. Arraste para girar."
    />
  );
}
