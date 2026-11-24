import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { contactShadowTex } from './textures';

export interface StageOptions {
  canvas: HTMLCanvasElement;
  alpha?: boolean;
  shadows?: boolean;
  maxPixelRatio?: number;
  fov?: number;
  exposure?: number;
  preserveDrawingBuffer?: boolean;
}

/** Testa suporte a WebGL antes de criar o renderer. */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/**
 * Palco 3D reutilizável: renderer, câmera, iluminação cinematográfica (key quente + rim laranja),
 * ambiente PBR e sombra de contato. O loop pausa automaticamente quando o canvas sai da tela.
 */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly root = new THREE.Group();
  readonly key: THREE.DirectionalLight;
  readonly rim: THREE.DirectionalLight;
  readonly floor: THREE.Mesh;
  readonly contact: THREE.Mesh;
  private raf = 0;
  private running = false;
  private visible = true;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;
  private last = performance.now();
  onFrame?: (dt: number, t: number) => void;

  constructor(private opts: StageOptions) {
    const { canvas, alpha = true, shadows = true, maxPixelRatio = 1.75, fov = 30, exposure = 1.05 } = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = exposure;
    this.renderer.shadowMap.enabled = shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (alpha) this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    this.camera.position.set(0, 1.6, 9);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight('#ffe2c2', '#2a1208', 0.7));

    this.key = new THREE.DirectionalLight('#ffd6a8', 2.8);
    this.key.position.set(-4, 7, 5);
    this.key.castShadow = shadows;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = 25;
    const s = 4.5;
    Object.assign(this.key.shadow.camera, { left: -s, right: s, top: s, bottom: -s });
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.02;
    this.key.shadow.radius = 6;
    this.scene.add(this.key);

    this.rim = new THREE.DirectionalLight('#ff6a1f', 3.2);
    this.rim.position.set(5, 3, -5);
    this.scene.add(this.rim);

    const fill = new THREE.DirectionalLight('#9fb6ff', 0.55);
    fill.position.set(-6, 1, -2);
    this.scene.add(fill);

    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.35 }));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    // o piso de sombra gerava artefatos fora do frustum; a sombra de contato cuida do aterramento
    this.floor.visible = false;
    this.scene.add(this.floor);

    this.contact = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: contactShadowTex(), transparent: true, depthWrite: false, opacity: 0.8, color: '#000' }),
    );
    this.contact.rotation.x = -Math.PI / 2;
    this.scene.add(this.contact);
    this.scene.add(this.root);

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(canvas);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      this.io = new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.visible && this.running) this.loop();
      });
      this.io.observe(canvas);
    }
    this.resize();
  }

  /** Posiciona piso e sombra de contato logo abaixo do objeto. */
  setGround(y: number, contactSize = 3) {
    this.floor.position.y = y;
    this.floor.scale.setScalar(contactSize * 1.5);
    this.contact.position.y = y + 0.002;
    this.contact.scale.set(contactSize, contactSize * 0.75, 1);
  }

  resize(w?: number, h?: number) {
    const c = this.opts.canvas;
    const W = w ?? c.clientWidth;
    const H = h ?? c.clientHeight;
    if (!W || !H) return;
    this.renderer.setSize(W, H, false);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    if (!this.running || !this.visible) return;
    this.raf = requestAnimationFrame((t) => {
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.onFrame?.(dt, t / 1000);
      this.render();
      this.loop();
    });
  };

  /** Projeta um ponto do mundo para pixels do canvas. */
  project(v: THREE.Vector3) {
    const p = v.clone().project(this.camera);
    const c = this.opts.canvas;
    return { x: (p.x * 0.5 + 0.5) * c.clientWidth, y: (-p.y * 0.5 + 0.5) * c.clientHeight };
  }

  dispose() {
    this.stop();
    this.io?.disconnect();
    this.ro?.disconnect();
    this.root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.geometry.dispose();
    });
    this.renderer.dispose();
  }
}
