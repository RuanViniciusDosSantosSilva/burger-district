import { useEffect, useRef, useState, type RefObject } from 'react';
import { hasWebGL, Stage, type StageOptions } from '@/three/Stage';

/**
 * Cria um Stage 3D para o canvas informado e executa `setup`.
 * Se o WebGL não estiver disponível (ou falhar), `failed` vira true e o componente mostra um fallback.
 */
export function useStage(
  canvasRef: RefObject<HTMLCanvasElement>,
  opts: Omit<StageOptions, 'canvas'>,
  setup: (stage: Stage) => (() => void) | void,
) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasWebGL()) {
      setFailed(true);
      return;
    }
    let stage: Stage | null = null;
    let cleanup: (() => void) | void;
    try {
      stage = new Stage({ canvas, ...opts });
      cleanup = setupRef.current(stage);
      stage.start();
      setReady(true);
    } catch (e) {
      console.warn('[Burger District] 3D indisponível, usando imagem estática.', e);
      setFailed(true);
    }
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      cleanup?.();
      stage?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { failed, ready };
}

export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
