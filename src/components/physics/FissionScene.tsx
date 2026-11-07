"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FISSION_CHANNEL, fissionMotion, fissionNucleons } from "@/lib/fission-model";

const positions: Record<string, [number, number, number]> = {
  perspective: [0, 3.8, 12.5], front: [0, 0, 13], top: [0, 13, 0.01], side: [12, 2, 4],
};
const trajectoryRadius = 5;
function fitDistance(camera: THREE.PerspectiveCamera) {
  const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
  const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
  return trajectoryRadius * 1.06 / Math.sin(Math.min(vertical, horizontal));
}

export default function FissionScene({ time, incidentNeutron, view, onError, onReady }: { time: number; incidentNeutron: boolean; view: string; onError: (message: string) => void; onReady: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const playback = useRef({ time, incidentNeutron });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  useEffect(() => { playback.current = { time, incidentNeutron }; }, [time, incidentNeutron]);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { onError("Thiết bị chưa mở được WebGL. Em vẫn có thể xem từng bước và đọc infographic bên dưới."); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute("aria-label", "Mô hình phân hạch U-235: đỏ là proton, xanh là neutron. Kéo để xoay, chụm hoặc cuộn để phóng to.");
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b192b);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 3.8, 12.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    renderer.domElement.style.touchAction = "pan-y";
    controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 6;
    controls.target.set(0, 0, 0); controls.update();
    cameraRef.current = camera; controlsRef.current = controls;
    scene.add(new THREE.HemisphereLight(0xf1f7ff, 0x345571, 2.5));
    const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(-3, 6, 7); scene.add(light);
    const grid = new THREE.GridHelper(18, 24, 0x325272, 0x172d43); grid.position.y = -1.65; scene.add(grid);
    const geometry = new THREE.SphereGeometry(0.15, 12, 10);
    const proton = new THREE.MeshStandardMaterial({ color: 0xfb706b, roughness: 0.28 });
    const neutron = new THREE.MeshStandardMaterial({ color: 0x52b6e8, roughness: 0.3 });
    // Exact nucleon counts; each mesh is one nucleon. No artificial neutron creation.
    const nucleons = fissionNucleons();
    const particles = nucleons.map(nucleon => {
      const mesh = new THREE.Mesh(geometry, nucleon.proton ? proton : neutron); scene.add(mesh); return mesh;
    });
    function position(index: number, total: number, radius: number) {
      index = (index * 37) % total; // Mix p/n across the cluster instead of separating charges spatially.
      const y = 1 - 2 * (index + 0.5) / total;
      const r = Math.sqrt(1 - y * y), angle = index * 2.399963;
      const depth = Math.cbrt(0.15 + 0.85 * ((index * 37) % total) / total);
      return new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)).multiplyScalar(radius * depth);
    }
    const initial = particles.map((_, i) => position(i, particles.length, 1.16));
    const targets = nucleons.map(n => ({ fragment: n.fragment, point: n.fragment < 2 ? position(n.local, FISSION_CHANNEL.fragments[n.fragment].a, n.fragment === 0 ? 0.88 : 1) : new THREE.Vector3() }));
    const productPoint = new THREE.Vector3();
    function resize() {
      const w = container!.clientWidth, h = container!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const distance = fitDistance(camera);
      controls.maxDistance = Math.max(30, distance * 1.6);
      camera.position.setLength(distance);
      camera.updateProjectionMatrix();
      controls.update();
    }
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    let frame = 0, lost = false, visible = false;
    function draw() {
      if (lost || !visible || document.hidden) return;
      frame = requestAnimationFrame(draw);
      const state = fissionMotion(playback.current.time, playback.current.incidentNeutron);
      particles.forEach((mesh, i) => {
        const incoming = i === particles.length - 1 && state.stage === 0;
        mesh.visible = !incoming || state.incidentNeutron;
        mesh.position.copy(initial[i]);
        if (incoming) mesh.position.set(state.incomingX, 0, 0);
        if (state.stage >= 2) { mesh.position.x *= state.stretchX; mesh.position.y *= state.stretchY; }
        if (state.stage === 3) {
          const target = targets[i];
          if (target.fragment < 2) productPoint.copy(target.point).x += state.fragmentOffsets[target.fragment];
          else productPoint.set(...state.neutronPositions[target.fragment - 2]);
          mesh.position.lerp(productPoint, state.separationBlend);
        }
      });
      controls.update(); renderer.render(scene, camera);
    }
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; onError("Không gian 3D bị gián đoạn. Tải lại trang để mở lại; infographic vẫn sử dụng được."); };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (!lost && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    visibility.observe(container);
    document.addEventListener("visibilitychange", sync);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    onReady();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect(); document.removeEventListener("visibilitychange", sync); controls.dispose(); geometry.dispose(); proton.dispose(); neutron.dispose(); grid.geometry.dispose(); const material = grid.material; (Array.isArray(material) ? material : [material]).forEach(m => m.dispose()); renderer.domElement.removeEventListener("webglcontextlost", contextLost); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); cameraRef.current = null; controlsRef.current = null; };
  }, [onError, onReady]);
  useEffect(() => {
    const camera = cameraRef.current, controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(...(positions[view] ?? positions.perspective)).setLength(fitDistance(camera)); controls.target.set(0, 0, 0); controls.update();
  }, [view]);
  return <div className="fission-canvas" style={{ touchAction: "pan-y" }} ref={host} />;
}
