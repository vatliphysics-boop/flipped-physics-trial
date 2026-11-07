/** Teaching model. The rod scale and elapsed time are schematic, not plant settings. */
export const REACTOR_LAST_GENERATION = 4;
export const REACTOR_FLOW_STAGES = [
  { id: "core", label: "Lõi lò", detail: "Phân hạch làm nóng nhiên liệu. Nước có áp suất cao ở vòng sơ cấp nhận nhiệt." },
  { id: "steam-generator", label: "Bộ sinh hơi", detail: "Vòng sơ cấp truyền nhiệt qua thành ống, làm nước vòng thứ cấp hóa hơi. Hai dòng nước không trộn lẫn." },
  { id: "turbine", label: "Tua-bin", detail: "Dòng hơi vòng thứ cấp làm quay tua-bin. Năng lượng của dòng hơi chuyển thành cơ năng quay." },
  { id: "generator", label: "Máy phát điện", detail: "Trục quay của tua-bin kéo máy phát, chuyển cơ năng thành điện năng." },
  { id: "condenser", label: "Bình ngưng", detail: "Hơi sau tua-bin được làm nguội, ngưng tụ rồi được bơm trở lại bộ sinh hơi." },
] as const;

export const REACTOR_FLOW_LAST_STEP = REACTOR_FLOW_STAGES.length - 1;
export const REACTOR_SOURCE = "https://www.nrc.gov/reactors/power/pwrs";

function limit(value: number, max: number, fallback = 0) {
  return Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : fallback;
}

/** Expected relative number of chain-sustaining reactions, with generation zero set to 1. */
export function reactorState(position: number, rodInsertion: number) {
  const time = limit(position, REACTOR_LAST_GENERATION);
  const generation = Math.floor(time);
  const rodPercent = limit(rodInsertion, 100, 50);
  const k = 1 + (50 - rodPercent) * 0.008;
  const trend = rodPercent < 50 ? "rising" : rodPercent > 50 ? "falling" : "steady";
  return {
    time, generation, progress: time - generation, rodPercent, k, trend,
    expected: k ** generation,
    finished: generation === REACTOR_LAST_GENERATION,
  } as const;
}

/** A separate didactic sequence for energy transfer and coolant circulation. */
export function reactorFlowState(position: number) {
  const time = limit(position, REACTOR_FLOW_LAST_STEP);
  const step = Math.floor(time);
  return { time, step, progress: time - step, stage: REACTOR_FLOW_STAGES[step], finished: step === REACTOR_FLOW_LAST_STEP };
}
