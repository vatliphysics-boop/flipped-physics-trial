import {
  Color, DirectionalLight, DynamicDrawUsage, Group, HemisphereLight, InstancedMesh, Matrix4,
  MeshPhysicalMaterial, OrthographicCamera, Raycaster, Scene, Sphere, SphereGeometry, SRGBColorSpace,
  Vector2, Vector3, WebGLRenderer,
} from "three";
import { NUCLEON_COLORS, type Nucleon, type NucleusLayout } from "@/lib/nucleus-layout";

export type NucleusView = { azimuth: number; elevation: number; zoom: number };

export function createNucleusScene(
  host: HTMLElement,
  layout: NucleusLayout,
  initialView: NucleusView,
  onContextChange: (available: boolean) => void,
) {
  const mobile = window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;
  const renderer = new WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new Scene();
  const nucleus = new Group();
  scene.add(nucleus);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.01, layout.radius * 12);
  const sphere = new SphereGeometry(layout.particleRadius, mobile ? 16 : 28, mobile ? 12 : 20);
  const material = new MeshPhysicalMaterial({ roughness: 0.32, metalness: 0.05, clearcoat: 0.65, clearcoatRoughness: 0.28 });
  const mesh = new InstancedMesh(sphere, material, layout.particles.length);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  // Raycasting and culling use the full model bounds even when some instances are hidden.
  mesh.boundingSphere = new Sphere(new Vector3(), layout.radius);
  nucleus.add(mesh);

  scene.add(new HemisphereLight(0xc7fff7, 0x394d68, 1.75));
  const key = new DirectionalLight(0xfff2e4, 2.1);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new DirectionalLight(0x68f8e4, 1.3);
  rim.position.set(-4, 2, -4);
  scene.add(rim);

  const matrix = new Matrix4();
  const direction = new Vector3();
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const selectionColor = new Color(0xfdf6be);
  const colors = { proton: new Color(NUCLEON_COLORS.proton), neutron: new Color(NUCLEON_COLORS.neutron) };
  let visibleParticles: readonly Nucleon[] = layout.particles;
  let contextLost = false;
  let frameId: number | null = null;
  let lastTime = 0;
  let visible = true;
  let spin = false;
  let cut = false;
  let selected: string | undefined;
  let instanceDataDirty = true;
  let view = { ...initialView };
  let width = 0;
  let height = 0;

  function canDraw() {
    return !contextLost && visible && !document.hidden;
  }

  function draw() {
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    if (nextWidth <= 0 || nextHeight <= 0) return;
    if (width !== nextWidth || height !== nextHeight) {
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
    }
    const aspect = width / height;
    const halfHeight = layout.radius * 1.19 * Math.max(1, 1/aspect) / view.zoom;
    camera.left = -halfHeight * aspect;
    camera.right = -camera.left;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.setFromSphericalCoords(layout.radius * 4, Math.PI/2 - view.elevation, view.azimuth);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    direction.copy(camera.position).normalize();

    if (cut || instanceDataDirty) {
      visibleParticles = cut
        ? layout.particles.filter(p => p.x * direction.x + p.y * direction.y + p.z * direction.z <= 0.12)
        : layout.particles;
      mesh.count = visibleParticles.length;
      visibleParticles.forEach((p, i) => {
        mesh.setMatrixAt(i, matrix.makeTranslation(p.x, p.y, p.z));
        mesh.setColorAt(i, p.id === selected ? selectionColor : colors[p.kind]);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      instanceDataDirty = false;
    }
    renderer.render(scene, camera);
  }

  function tick(time: number) {
    frameId = null;
    if (!canDraw()) return;
    if (spin && lastTime) view.azimuth += Math.min(time - lastTime, 60) * 0.00015;
    lastTime = spin ? time : 0;
    draw();
    if (spin) requestFrame();
  }

  function requestFrame() {
    if (frameId === null && canDraw()) frameId = requestAnimationFrame(tick);
  }

  function pause() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    lastTime = 0;
  }

  function syncPageVisibility() {
    if (document.hidden) pause();
    else requestFrame();
  }

  function loseContext(event: Event) {
    event.preventDefault();
    contextLost = true;
    pause();
    onContextChange(false);
  }

  function restoreContext() {
    contextLost = false;
    onContextChange(true);
    requestFrame();
  }

  renderer.domElement.addEventListener("webglcontextlost", loseContext);
  renderer.domElement.addEventListener("webglcontextrestored", restoreContext);
  document.addEventListener("visibilitychange", syncPageVisibility);
  const sizeObserver = new ResizeObserver(requestFrame);
  sizeObserver.observe(host);
  host.appendChild(renderer.domElement);
  requestFrame();

  return {
    getView: () => ({ ...view }),
    setView(next: NucleusView) {
      view = next;
      requestFrame();
    },
    setDisplay(next: { selected: string | undefined; cut: boolean; spin: boolean }) {
      if (selected !== next.selected || cut !== next.cut) instanceDataDirty = true;
      selected = next.selected;
      cut = next.cut;
      spin = next.spin;
      if (!spin) lastTime = 0;
      requestFrame();
    },
    setVisible(next: boolean) {
      visible = next;
      if (visible) requestFrame();
      else pause();
    },
    pick(clientX: number, clientY: number) {
      if (!canDraw()) return undefined;
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((clientX - bounds.left) / bounds.width) * 2 - 1, 1 - ((clientY - bounds.top) / bounds.height) * 2);
      raycaster.setFromCamera(pointer, camera);
      const intersection = raycaster.intersectObject(mesh)[0];
      return intersection?.instanceId === undefined ? undefined : visibleParticles[intersection.instanceId]?.id;
    },
    dispose() {
      pause();
      sizeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncPageVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", loseContext);
      renderer.domElement.removeEventListener("webglcontextrestored", restoreContext);
      mesh.dispose();
      sphere.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

export type NucleusScene = ReturnType<typeof createNucleusScene>;
