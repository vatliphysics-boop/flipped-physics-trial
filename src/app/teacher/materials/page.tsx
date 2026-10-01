import { TeacherShell } from "../TeacherShell";
import { getTeacherContext } from "../data";
import { getCombinedMaterialBank } from "@/lib/material-bank";
import { MaterialBankViewer } from "@/components/learning/MaterialBankViewer";

import type { MaterialType } from "@/lib/material-bank";

export default async function TeacherMaterialsPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string; q?: string }>;
}) {
  const { supabase, user } = await getTeacherContext();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const currentType = (resolvedSearchParams.type || "all") as MaterialType | "all";
  const currentQuery = resolvedSearchParams.q || "";

  const materials = await getCombinedMaterialBank(
    supabase,
    user.id,
    currentType,
    currentQuery
  );

  return (
    <TeacherShell
      active="materials"
      title="Kho học liệu"
      description="Quản lí, xem trước và tái sử dụng học liệu số cho các bài học đảo ngược."
    >
      <section className="section" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <MaterialBankViewer
          initialMaterials={materials}
          initialType={currentType}
          teacherId={user.id}
        />
      </section>
    </TeacherShell>
  );
}
