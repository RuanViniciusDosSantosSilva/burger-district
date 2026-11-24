import gsap from 'gsap';
import { useRef } from 'react';
import * as THREE from 'three';
import { ProductImage } from '@/components/ui/ProductImage';
import { INTRO_DELAY } from '@/config/site';
import { BurgerModel } from '@/three/burger';
import { signatureLayers } from '@/three/signature';
import { isMobile, useStage } from './useStage';

export interface HeroControl {
  /** 0..1 conforme o hero sai da tela */
  progress: number;
}

/**
 * Hambúrguer 3D do hero: as camadas caem e se encaixam na entrada,
 * acompanham o mouse (parallax) e se abrem levemente ao rolar.
 */
export function HeroBurger3D({ control, reduced, onReady }: { control: React.MutableRefObject<HeroControl>; reduced: boolean; onReady?: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { failed } = useStage(canvas, { maxPixelRatio: isMobile() ? 1.5 : 1.8, fov: 26 }, (stage) => {
    const burger = new BurgerModel(signatureLayers, 3);
    const pivot = new THREE.Group();
    pivot.add(burger.group);
    stage.root.add(pivot);
    // distância da câmera adaptada à proporção do canvas (celular x desktop)
    const frame = () => {
      const tan = Math.tan(THREE.MathUtils.degToRad(stage.camera.fov / 2));
      const d = Math.max(3.1 / (2 * tan * 0.78), 2.7 / (2 * tan * stage.camera.aspect * 0.8));
      stage.camera.position.set(0, d * 0.22, d);
      stage.camera.lookAt(0, -0.05, 0);
    };
    frame();
    const groundY = -burger.height / 2 - 0.02;
    stage.setGround(groundY, 3.4);

    // entrada: camadas caem de cima, da base para o topo
    const tweens: gsap.core.Tween[] = [];
    if (!reduced) {
      burger.layers.forEach((l, i) => {
        l.drop = 7 + i * 0.9;
        tweens.push(gsap.to(l, { drop: 0, duration: 1.05, delay: INTRO_DELAY + 0.3 + i * 0.085, ease: 'back.out(1.25)' }));
      });
      pivot.rotation.y = -0.9;
      tweens.push(gsap.to(pivot.rotation, { y: 0.35, duration: 2.4, delay: INTRO_DELAY + 0.25, ease: 'power3.out' }));
    } else pivot.rotation.y = 0.35;
    burger.update();
    onReady?.();

    const mouse = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let spin = 0;
    stage.onFrame = (dt, t) => {
      frame();
      const p = control.current.progress;
      if (!reduced) spin += dt * 0.22;
      burger.explode = p * 0.55;
      burger.update();
      burger.group.rotation.y = spin;
      pivot.rotation.x += (mouse.y * 0.16 + 0.04 - pivot.rotation.x) * 0.06;
      pivot.rotation.z += (-mouse.x * 0.06 - pivot.rotation.z) * 0.06;
      pivot.position.x += (mouse.x * 0.25 - pivot.position.x) * 0.05;
      pivot.position.y = (reduced ? 0 : Math.sin(t * 1.3) * 0.06) + p * 0.6;
    };

    return () => {
      tweens.forEach((t) => t.kill());
      window.removeEventListener('pointermove', onMove);
      burger.dispose();
    };
  });

  return (
    <div className="absolute inset-0">
      {failed ? (
        <ProductImage src="renders/hero.webp" alt="Hambúrguer Burger District com duas carnes smash, cheddar, bacon e cebola caramelizada" eager className="h-full w-full" />
      ) : (
        <canvas ref={canvas} className="h-full w-full" role="img" aria-label="Hambúrguer 3D com camadas de pão brioche, carne smash, cheddar, bacon, alface e tomate" />
      )}
    </div>
  );
}
