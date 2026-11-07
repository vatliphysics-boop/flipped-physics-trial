"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { buildNucleusLayout, NUCLEON_COLORS, type Nucleon, type NucleusLayout } from "@/lib/nucleus-layout";
import { NUCLIDES, NUCLEUS_CUTAWAY_NOTE, NUCLEUS_MODEL_NOTE, type Nuclide } from "@/lib/nuclear-science";
import type { NucleusScene, NucleusView } from "./nucleus-scene";
import styles from "./NucleusExplorer.module.css";

const VIEWS = [
  { label: "Trước", azimuth: 0, elevation: 0 },
  { label: "Sau", azimuth: Math.PI, elevation: 0 },
  { label: "Bên", azimuth: Math.PI / 2, elevation: 0 },
  { label: "Trên", azimuth: 0, elevation: Math.PI / 2 - 0.001 },
] as const;

const NO_SELECTION = "Chọn một hạt trên mô hình hoặc trong danh sách để xem thông tin.";
const DEFAULT_VIEW = { azimuth: 0.68, elevation: 0.36, zoom: 1 };
const MAX_ELEVATION = Math.PI / 2 - 0.001;

function particleLabel(p: Nucleon) {
  return `${p.kind === "proton" ? "Proton" : "Neutron"} ${p.id.split("-")[1]}`;
}

function StaticNucleus({ layout, name }: { layout: NucleusLayout; name: string }) {
  const { azimuth, elevation } = DEFAULT_VIEW;
  const dots = layout.particles.map((p) => {
    const x = p.x * Math.cos(azimuth) - p.z * Math.sin(azimuth);
    const depth = p.x * Math.sin(azimuth) + p.z * Math.cos(azimuth);
    const y = p.y * Math.cos(elevation) - depth * Math.sin(elevation);
    return { ...p, x, y, depth: p.y * Math.sin(elevation) + depth * Math.cos(elevation) };
  }).sort((a, b) => a.depth - b.depth);
  const bounds = layout.radius * 1.2;
  return (
    <svg className={styles.poster} viewBox={`${-bounds} ${-bounds} ${bounds * 2} ${bounds * 2}`} role="img" aria-label={`Sơ đồ tĩnh của ${name}`}>
      {dots.map(p => <circle key={p.id} cx={p.x} cy={-p.y} r={layout.particleRadius} fill={NUCLEON_COLORS[p.kind]} stroke="#0f2b3a" strokeWidth=".045" />)}
    </svg>
  );
}

function Explorer({ nuclide, compact }: { nuclide: Nuclide; compact: boolean }) {
  const root = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<NucleusScene | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; started: boolean } | null>(null);
  const layout = useMemo(() => buildNucleusLayout(nuclide), [nuclide]);
  const id = useId();
  const [status, setStatus] = useState<"waiting" | "ready" | "fallback">("waiting");
  const [selected, setSelected] = useState<string>();
  const [cut, setCut] = useState(false);
  const [spin, setSpin] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [preset, setPreset] = useState("");
  const [zoom, setZoom] = useState(1);
  const available = status === "ready";

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let visible = false;
    let loading = false;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      scene.current?.setVisible(visible);
      if (!visible || loading) return;
      loading = true;
      import("./nucleus-scene").then(({ createNucleusScene }) => {
        if (disposed) return;
        scene.current = createNucleusScene(element, layout, DEFAULT_VIEW, ok => setStatus(ok ? "ready" : "fallback"));
        scene.current.setVisible(visible);
        setStatus("ready");
      }).catch(() => {
        if (!disposed) setStatus("fallback");
      });
    });
    observer.observe(element);

    return () => {
      disposed = true;
      observer.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [layout]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setReduced(media.matches);
      if (media.matches) setSpin(false);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    function syncFullscreen() {
      setNativeFullscreen(document.fullscreenElement === root.current);
    }
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    function close(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setExpanded(false);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [expanded]);

  useEffect(() => {
    if (available) scene.current?.setDisplay({ selected, cut, spin: spin && !reduced });
  }, [available, selected, cut, spin, reduced]);

  function updateView(changes: Partial<NucleusView>) {
    const current = scene.current;
    if (!current) return;
    const next = { ...current.getView(), ...changes };
    next.zoom = Math.max(0.65, Math.min(1.18, next.zoom));
    next.elevation = Math.max(-MAX_ELEVATION, Math.min(MAX_ELEVATION, next.elevation));
    current.setView(next);
    if (changes.zoom !== undefined) setZoom(next.zoom);
  }

  function zoomBy(delta: number) {
    setSpin(false);
    updateView({ zoom: (scene.current?.getView().zoom ?? 1) + delta });
  }

  function orbit(dx: number, dy: number) {
    const current = scene.current?.getView();
    if (!current) return;
    setSpin(false);
    setPreset("");
    updateView({ azimuth: current.azimuth + dx, elevation: current.elevation + dy });
  }

  function reset() {
    setSpin(false);
    setPreset("");
    updateView(DEFAULT_VIEW);
  }

  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (!available || event.altKey || event.metaKey || event.ctrlKey) return;
    switch (event.key) {
      case "ArrowLeft": orbit(-0.18, 0); break;
      case "ArrowRight": orbit(0.18, 0); break;
      case "ArrowUp": orbit(0, 0.18); break;
      case "ArrowDown": orbit(0, -0.18); break;
      case "+": case "=": zoomBy(0.1); break;
      case "-": zoomBy(-0.1); break;
      case "Home": reset(); break;
      default: return;
    }
    event.preventDefault();
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!available || !event.isPrimary || event.button !== 0) return;
    setSpin(false);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, started: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (!active.started && Math.hypot(dx, dy) < 6) return;
    // Vertical touch movement remains a native page scroll (touch-action: pan-y).
    if (event.pointerType === "touch" && !active.started && Math.abs(dx) <= Math.abs(dy)) return;
    drag.current = { id: active.id, x: event.clientX, y: event.clientY, started: true };
    orbit(-dx * 0.012, event.pointerType === "touch" ? 0 : dy * 0.012);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.id !== event.pointerId) return;
    drag.current = null;
    if (!active.started && Math.hypot(event.clientX - active.x, event.clientY - active.y) < 6) {
      setSelected(scene.current?.pick(event.clientX, event.clientY));
    }
  }

  async function toggleFullscreen() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (nativeFullscreen) {
      await document.exitFullscreen();
      return;
    }
    try {
      if (!root.current?.requestFullscreen) throw new Error("Fullscreen không khả dụng.");
      await root.current.requestFullscreen();
    } catch {
      setExpanded(true);
    }
  }

  const particle = layout.particles.find(p => p.id === selected);
  return (
    <section
      ref={root}
      className={`${styles.explorer} ${compact ? styles.compact : ""} ${expanded ? styles.expanded : ""}`}
      aria-label={`Mô hình hạt nhân ${nuclide.name}`}
      data-nucleus-explorer={nuclide.A + nuclide.symbol}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>MÔ HÌNH HẠT NHÂN</p>
          <h2 className={styles.heading}>
            <span className={styles.nuclide} aria-hidden="true"><span><sup>{nuclide.A}</sup><sub>{nuclide.Z}</sub></span>{nuclide.symbol}</span>
            <span>{nuclide.name}</span>
          </h2>
        </div>
        <span className={styles.badge}>{nuclide.stability === "stable" ? "Đồng vị bền" : "Đồng vị phóng xạ"}</span>
      </header>

      <div className={styles.stage}>
        <div
          ref={host}
          className={styles.viewport}
          data-model-status={status}
          role="group"
          aria-label="Khung quan sát hạt nhân"
          aria-describedby={id + "-instructions"}
          tabIndex={available ? 0 : -1}
          onKeyDown={keyboard}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={() => { drag.current = null; }}
          onLostPointerCapture={() => { drag.current = null; }}
        />
        {!available && <StaticNucleus layout={layout} name={nuclide.name} />}
        <p className={styles.mode}>{cut && available ? "ĐANG ẨN HẠT PHÍA TRƯỚC" : available ? "WEBGL · MÔ HÌNH 3D" : status === "waiting" ? "ĐANG TẢI MÔ HÌNH 3D" : "SƠ ĐỒ TĨNH"}</p>
        <button type="button" className={styles.fullscreen} onClick={toggleFullscreen} aria-label={expanded || nativeFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} title={expanded || nativeFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
          <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
            {expanded || nativeFullscreen ? <path d="M4 9h5V4m11 5h-5V4M4 15h5v5m11-5h-5v5" /> : <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" />}
          </svg>
        </button>
      </div>

      <dl className={styles.counts}>
        <div><dt><span className={styles.proton} /> Proton <span>Z</span></dt><dd>{nuclide.Z}</dd></div>
        <div><dt><span className={styles.neutron} /> Neutron <span>N</span></dt><dd>{nuclide.N}</dd></div>
        <div><dt>Tổng nucleon <span>A</span></dt><dd>{nuclide.A}</dd></div>
      </dl>

      <div className={styles.controls}>
        <div className={styles.controlGroup} role="group" aria-label="Chọn góc nhìn">
          {VIEWS.map(view => <button type="button" disabled={!available} key={view.label} aria-pressed={preset === view.label} onClick={() => {
            setSpin(false);
            setPreset(view.label);
            updateView({ azimuth: view.azimuth, elevation: view.elevation });
          }}>{view.label}</button>)}
        </div>
        <div className={styles.controlGroup} role="group" aria-label="Điều khiển mô hình">
          <button type="button" disabled={!available || zoom <= 0.65} onClick={() => zoomBy(-0.1)} aria-label="Thu nhỏ">−</button>
          <button type="button" disabled={!available || zoom >= 1.18} onClick={() => zoomBy(0.1)} aria-label="Phóng to">+</button>
          <button type="button" disabled={!available} onClick={reset}>Đặt lại góc nhìn</button>
          <button type="button" disabled={!available || reduced} aria-pressed={spin} onClick={() => { setPreset(""); setSpin(v => !v); }} title={reduced ? "Thiết bị đang ưu tiên giảm chuyển động" : undefined}>Tự xoay</button>
          <button type="button" disabled={!available} aria-pressed={cut} onClick={() => { setSpin(false); setCut(v => !v); }}>Cắt lớp</button>
        </div>
      </div>

      <div className={styles.detail}>
        <label htmlFor={id + "-nucleon"}>Quan sát hạt</label>
        <select id={id + "-nucleon"} value={selected ?? ""} onChange={event => { setSpin(false); setSelected(event.target.value || undefined); }}>
          <option value="">Chọn proton hoặc neutron</option>
          {layout.particles.map(p => <option key={p.id} value={p.id}>{particleLabel(p)}</option>)}
        </select>
        <p aria-live="polite">{particle ? `${particleLabel(particle)} · ${particle.kind === "proton" ? "điện tích +e" : "điện tích 0"}` : NO_SELECTION}</p>
      </div>

      <p className={styles.instructions} id={id + "-instructions"}>
        {status === "fallback" ? "WebGL không khả dụng. Sơ đồ tĩnh và danh sách hạt vẫn sử dụng được." : "Kéo để xoay hoặc vuốt ngang trên điện thoại. Dùng các phím mũi tên, +, − và Home khi khung có tiêu điểm."}
      </p>
      <p className={styles.disclaimer}>{NUCLEUS_MODEL_NOTE} {NUCLEUS_CUTAWAY_NOTE}</p>
    </section>
  );
}

export function NucleusExplorer({ isotopeId = "C12", compact = false }: { isotopeId?: string; compact?: boolean }) {
  const isotope = Object.hasOwn(NUCLIDES, isotopeId) ? isotopeId as keyof typeof NUCLIDES : "C12";
  return <Explorer key={isotope} nuclide={NUCLIDES[isotope]} compact={compact} />;
}
