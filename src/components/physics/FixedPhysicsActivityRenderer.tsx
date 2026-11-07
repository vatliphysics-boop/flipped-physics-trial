"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
const Simulation3D = dynamic(() => import("./Simulation3D"), { ssr: false, loading: () => <p role="status">Đang tải không gian 3D…</p> });
import {
  CANONICAL_PHASE2_ACTIVITY_KEYS,
  getCanonicalPhysicsActivities,
  getCanonicalPhysicsActivity,
  normalizeActivityKey,
  type CanonicalActivityKey,
  type NuclearPhysicsLessonCode,
} from "@/lib/curriculum";
import { IsotopeActivity, NuclearBuilderActivity, RutherfordActivity } from "./B21Activities";
import { BindingEnergyLab, NuclearFission, NuclearFusion, NuclearReactionBalancer } from "./B22Activities";
import { Carbon14Dating, GeigerRandomDecay, RadioactiveDecayHalfLife, RadiationProperties, RadiationSafety } from "./B23Activities";
import { NuclearPowerEnergyFlow, ReactorControlConcept, NuclearMedicine, RadiationApplications } from "./B24Activities";
import { NuclearPhysicsPracticeLab } from "./B25Activities";
import { GuidedFissionLab } from "./GuidedFissionLab";

export type ActivityKey = CanonicalActivityKey;
export type PhysicsActivityProps = {
  activityKey: ActivityKey;
  customPrompt?: string;
  onProgress?: (done: boolean) => void;
};

export const ACTIVITY_KEYS = {
  B21: getCanonicalPhysicsActivities("B21").map((activity) => activity.key),
  B22: getCanonicalPhysicsActivities("B22").map((activity) => activity.key),
  B23: getCanonicalPhysicsActivities("B23").map((activity) => activity.key),
  B24: getCanonicalPhysicsActivities("B24").map((activity) => activity.key),
  B25: getCanonicalPhysicsActivities("B25").map((activity) => activity.key),
} satisfies Record<NuclearPhysicsLessonCode, readonly ActivityKey[]>;

function UnavailableActivity({ activityKey }: PhysicsActivityProps) {
  const activity = getCanonicalPhysicsActivity(activityKey);
  return (
    <div className="physics-lab" role="status">
      <p className="physics-intro">{activity?.title ?? "Hoạt động vật lí"}</p>
      <p className="physics-note">
        Hoạt động này đã có trong catalog chương IV nhưng renderer tương tác chưa được triển khai. Không thể ghi nhận hoàn thành cho đến khi có mô phỏng thật.
      </p>
    </div>
  );
}

function ActivityDataPanel({ activityKey, onProgress }: PhysicsActivityProps) {
  switch (normalizeActivityKey(activityKey)) {
    // B21
    case "rutherford_alpha_scattering":
      return <RutherfordActivity onProgress={onProgress} />;
    case "nuclear_structure_builder":
      return <NuclearBuilderActivity onProgress={onProgress} />;
    case "isotope_and_nuclear_size":
      return <IsotopeActivity onProgress={onProgress} />;
    
    // B22
    case "nuclear_reaction_balancer":
      return <NuclearReactionBalancer onProgress={onProgress} />;
    case "binding_energy_lab":
      return <BindingEnergyLab onProgress={onProgress} />;
    case "nuclear_fission":
      return <NuclearFission onProgress={onProgress} />;
    case "nuclear_fusion":
      return <NuclearFusion onProgress={onProgress} />;
      
    // B23
    case "geiger_random_decay":
      return <GeigerRandomDecay onProgress={onProgress} />;
    case "radiation_properties":
      return <RadiationProperties onProgress={onProgress} />;
    case "radioactive_decay_half_life":
      return <RadioactiveDecayHalfLife onProgress={onProgress} />;
    case "carbon14_dating":
      return <Carbon14Dating onProgress={onProgress} />;
    case "radiation_safety":
      return <RadiationSafety onProgress={onProgress} />;

    // B24
    case "nuclear_power_energy_flow":
      return <NuclearPowerEnergyFlow onProgress={onProgress} />;
    case "reactor_control_concept":
      return <ReactorControlConcept onProgress={onProgress} />;
    case "nuclear_medicine":
      return <NuclearMedicine onProgress={onProgress} />;
    case "radiation_applications":
      return <RadiationApplications onProgress={onProgress} />;

    // B25
    case "nuclear_physics_practice_lab":
      return <NuclearPhysicsPracticeLab onProgress={onProgress} />;

    case null:
    default:
      return <UnavailableActivity activityKey={activityKey} />;
  }
}

export function FixedPhysicsActivityRenderer({ activityKey, customPrompt, onProgress }: PhysicsActivityProps) {
  const observed = useRef(false), answered = useRef(false);
  const report = useCallback((part: "observed" | "answered", done: boolean) => {
    if (part === "observed") observed.current = done; else answered.current = done;
    onProgress?.(observed.current && answered.current);
  }, [onProgress]);
  const reportObserved = useCallback((done: boolean) => report("observed", done), [report]);
  const reportAnswered = useCallback((done: boolean) => report("answered", done), [report]);
  const normalized = normalizeActivityKey(activityKey);
  if (!normalized) return <UnavailableActivity activityKey={activityKey} />;

  // Core processes own both their visual and numerical state. A second generic
  // viewer would display a different run and report unrelated completion.
  if (normalized === "rutherford_alpha_scattering") return <RutherfordActivity onProgress={onProgress} />;
  if (normalized === "radioactive_decay_half_life") return <RadioactiveDecayHalfLife onProgress={onProgress} />;
  if (normalized === "nuclear_fission") return <GuidedFissionLab onProgress={onProgress} />;
  if (normalized === "reactor_control_concept" || normalized === "nuclear_power_energy_flow") return <ReactorControlConcept onProgress={onProgress} />;
  if (normalized === "nuclear_physics_practice_lab") return <NuclearPhysicsPracticeLab onProgress={onProgress} />;

  return (
    <div className="interactive-experiment">
      <Simulation3D activityKey={normalized} customPrompt={customPrompt} onObserved={reportObserved} />
      <details style={{ marginTop: "14px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 18px" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, color: "#0f172a" }}>Mở phiếu bài tập và câu hỏi kiểm tra</summary>
        <div style={{ marginTop: "12px" }}>
          <p className="physics-note">Khung quan sát bổ trợ và bài tập bên dưới là hai hoạt động riêng. Đọc giả thiết của từng phần trước khi đối chiếu.</p>
          <ActivityDataPanel activityKey={normalized} onProgress={reportAnswered} />
        </div>
      </details>
    </div>
  );
}

export function PhysicsActivityList({ lessonCode, onCompleteAll, requiredActivity, omitActivity }: {
  lessonCode: NuclearPhysicsLessonCode;
  onCompleteAll?: () => void;
  requiredActivity?: CanonicalActivityKey;
  omitActivity?: CanonicalActivityKey;
}) {
  const activities = (getCanonicalPhysicsActivities(lessonCode) || []).filter(activity => activity.key !== omitActivity);
  const required = requiredActivity ? activities.filter(activity => activity.key === requiredActivity) : activities;
  const [expanded, setExpanded] = useState<string | null>(requiredActivity ?? activities[0]?.key ?? null);
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});

  const handleActivityProgress = useCallback((key: string, done: boolean) => {
    setCompletionMap((prev) => {
      if (prev[key] === done) return prev;
      return { ...prev, [key]: done };
    });
  }, []);

  const allActivitiesDone = required.every((a) => completionMap[a.key]);

  return (
    <div className="physics-activity-list">
      {activities.map((activity, index) => (
        <article className="student-paper" key={activity.activityCode} style={{ marginBottom: "40px" }}>
          <header style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
            <div>
              <p className="student-kicker">{activity.activityCode}{requiredActivity && (activity.key === requiredActivity ? " · Hoạt động chính" : " · Tự chọn")}</p>
              <h3 className="student-heading"><button type="button" className="activity-expand" aria-expanded={expanded === activity.key} aria-controls={`activity-${activity.key}`} onClick={() => setExpanded(expanded === activity.key ? null : activity.key)}>{activity.title} <span aria-hidden="true">{expanded === activity.key ? "−" : "+"}</span></button></h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6 }}>{activity.shortDescription}</p>
              {completionMap[activity.key] && (
                <p style={{ color: "var(--semantic-success)", fontSize: "14px", marginTop: "8px", fontWeight: 500 }}>
                  ✓ Đã hoàn thành tiêu chí hoạt động {index + 1}
                </p>
              )}
            </div>
          </header>
          {expanded === activity.key && <div id={`activity-${activity.key}`}><FixedPhysicsActivityRenderer
            activityKey={activity.key}
            onProgress={(done) => handleActivityProgress(activity.key, done)}
          /></div>}
        </article>
      ))}
      {onCompleteAll && (
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            className="btn primary"
            onClick={onCompleteAll}
            disabled={!allActivitiesDone}
            title={allActivitiesDone ? "Xác nhận đã hoàn thành" : "Hoàn thành hoạt động chính để mở khóa"}
          >
            {allActivitiesDone
              ? "Đánh dấu đã hoàn thành các mô phỏng"
              : `Hoàn thành ${required.filter(activity => completionMap[activity.key]).length}/${required.length} hoạt động chính`}
          </button>
          {!allActivitiesDone && (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
              Em cần hoàn thành tiêu chí của hoạt động chính trước khi xác nhận.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { CANONICAL_PHASE2_ACTIVITY_KEYS };
