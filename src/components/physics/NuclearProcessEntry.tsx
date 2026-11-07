"use client";

import dynamic from "next/dynamic";
import type { NuclearPhysicsLessonCode } from "@/lib/curriculum";
const RutherfordActivity = dynamic(() => import("./RutherfordActivity").then(m => m.RutherfordActivity), { loading: () => <p>Đang tải mô phỏng tán xạ…</p> });
const Fission = dynamic(() => import("./GuidedFissionLab").then(m => m.GuidedFissionLab), { loading: () => <p>Đang tải quá trình phân hạch…</p> });
const Decay = dynamic(() => import("./DecayProcessLab").then(m => m.DecayProcessLab), { loading: () => <p>Đang tải mô phỏng phân rã…</p> });
const Reactor = dynamic(() => import("./B24Activities").then(m => m.ReactorControlConcept), { loading: () => <p>Đang tải sơ đồ quá trình…</p> });
const Data = dynamic(() => import("./B25DataProcessLab").then(m => m.B25DataProcessLab), { loading: () => <p>Đang tải dữ liệu và đồ thị…</p> });

export function NuclearProcessEntry({ code }: { code: NuclearPhysicsLessonCode }) {
  const activity = { B21: RutherfordActivity, B22: Fission, B23: Decay, B24: Reactor, B25: Data }[code];
  const Activity = activity;
  return <Activity key={code} />;
}
