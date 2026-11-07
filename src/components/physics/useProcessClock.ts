"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

/** Visual playback only; deterministic physics is evaluated at this time. */
export function useProcessClock(duration: number, unitsPerSecond = 1, container?: RefObject<HTMLDivElement | null>) {
  const [clock, setClock] = useState({ time: 0, running: false });
  const { time, running } = clock;
  const [speed, setSpeed] = useState(1);
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  useEffect(() => {
    const element = container?.current;
    const stop = () => setClock(value => value.running ? { ...value, running: false } : value);
    const pause = () => { if (document.hidden) stop(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    if (element) observer.observe(element);
    document.addEventListener("visibilitychange", pause);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", pause); };
  }, [container]);
  useEffect(() => {
    if (!running) return;
    let frame = 0, previous = performance.now();
    const tick = (now: number) => {
      const delta = now - previous;
      if (delta >= 32) {
        previous = now;
        const elapsed = Math.min(delta / 1000, 0.1);
        setClock(value => {
          if (!value.running) return value;
          const next = Math.min(duration, value.time + elapsed * unitsPerSecond * speed);
          return { time: next, running: next < duration };
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, duration, unitsPerSecond, speed]);
  const reset = useCallback(() => { setClock({ time: 0, running: false }); }, []);
  const toggle = useCallback(() => setClock(value => ({ time: value.time >= duration ? 0 : value.time, running: !value.running })), [duration]);
  const step = useCallback((delta: number) => setClock(value => ({ time: Math.min(duration, value.time + delta), running: false })), [duration]);
  const seek = useCallback((value: number) => setClock({ time: Math.max(0, Math.min(duration, value)), running: false }), [duration]);
  return { ready, time, running, speed, setSpeed, reset, toggle, step, seek };
}
