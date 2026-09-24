"use client";

import {
  CANONICAL_PHASE2_ACTIVITY_KEYS,
  getCanonicalPhysicsActivities,
  getCanonicalPhysicsActivity,
  normalizeActivityKey,
  type CanonicalActivityKey,
  type NuclearPhysicsLessonCode,
} from "@/lib/curriculum";
import { IsotopeActivity, NuclearBuilderActivity, RutherfordActivity } from "./B21Activities";

export type ActivityKey = CanonicalActivityKey;
export type PhysicsActivityProps = { activityKey: ActivityKey };

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

export function FixedPhysicsActivityRenderer({ activityKey }: PhysicsActivityProps) {
  switch (normalizeActivityKey(activityKey)) {
    case "rutherford_alpha_scattering":
      return <RutherfordActivity />;
    case "nuclear_structure_builder":
      return <NuclearBuilderActivity />;
    case "isotope_and_nuclear_size":
      return <IsotopeActivity />;
    case null:
    default:
      return <UnavailableActivity activityKey={activityKey} />;
  }
}

export function PhysicsActivityList({ lessonCode }: { lessonCode: NuclearPhysicsLessonCode }) {
  const activities = getCanonicalPhysicsActivities(lessonCode);
  return (
    <div className="physics-activity-list">
      {activities.map((activity) => (
        <article className="student-paper" key={activity.activityCode} style={{ marginBottom: "40px" }}>
          <header style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-light)", paddingBottom: "24px" }}>
            <div>
              <p className="student-kicker">{activity.activityCode} · {activity.activityType}</p>
              <h3 className="student-heading">{activity.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: 1.6 }}>{activity.shortDescription}</p>
            </div>
          </header>
          <FixedPhysicsActivityRenderer activityKey={activity.key} />
        </article>
      ))}
    </div>
  );
}

export { CANONICAL_PHASE2_ACTIVITY_KEYS };
