"use client";

import { useState, useCallback } from "react";
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

export type ActivityKey = CanonicalActivityKey;
export type PhysicsActivityProps = { activityKey: ActivityKey; onProgress?: (done: boolean) => void };

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

export function FixedPhysicsActivityRenderer({ activityKey, onProgress }: PhysicsActivityProps) {
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

export function PhysicsActivityList({ lessonCode, onCompleteAll }: { lessonCode: NuclearPhysicsLessonCode, onCompleteAll?: () => void }) {
  const activities = getCanonicalPhysicsActivities(lessonCode) || [];
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({});

  const handleActivityProgress = useCallback((key: string, done: boolean) => {
    setCompletionMap((prev) => {
      if (prev[key] === done) return prev;
      return { ...prev, [key]: done };
    });
  }, []);

  const allActivitiesDone = activities.every((a) => completionMap[a.key]);

  return (
    <div className="physics-activity-list">
      {activities.map((activity, index) => (
        <article className="student-paper" key={activity.activityCode} style={{ marginBottom: "40px" }}>
          <header style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
            <div>
              <p className="student-kicker">{activity.activityCode} · {activity.activityType}</p>
              <h3 className="student-heading">{activity.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6 }}>{activity.shortDescription}</p>
              {completionMap[activity.key] && (
                <p style={{ color: "var(--semantic-success)", fontSize: "14px", marginTop: "8px", fontWeight: 500 }}>
                  ✓ Đã hoàn thành tiêu chí hoạt động {index + 1}
                </p>
              )}
            </div>
          </header>
          <FixedPhysicsActivityRenderer
            activityKey={activity.key}
            onProgress={(done) => handleActivityProgress(activity.key, done)}
          />
        </article>
      ))}
      {onCompleteAll && (
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <button
            className="btn primary"
            onClick={onCompleteAll}
            disabled={!allActivitiesDone}
            title={allActivitiesDone ? "Đánh dấu đã hoàn thành" : "Hoàn thành tất cả hoạt động để mở khoá"}
          >
            {allActivitiesDone
              ? "Đánh dấu đã hoàn thành các mô phỏng"
              : `Hoàn thành ${Object.values(completionMap).filter(Boolean).length}/${activities.length} hoạt động`}
          </button>
          {!allActivitiesDone && (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
              Em cần hoàn thành tiêu chí của từng hoạt động trước khi xác nhận.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { CANONICAL_PHASE2_ACTIVITY_KEYS };
