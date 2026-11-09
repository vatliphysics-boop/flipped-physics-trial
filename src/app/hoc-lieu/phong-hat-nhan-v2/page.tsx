import { PublicShell } from "@/app/PublicShell";
import { B21Lesson } from "@/components/physics/B21Lesson";
import { B22Lesson } from "@/components/physics/B22Lesson";
import { B23Lesson } from "@/components/physics/B23Lesson";
import { B25Lesson } from "@/components/physics/B25Lesson";

const LESSONS: Record<string, { Component: () => React.JSX.Element; title: string }> = {
  B21: { Component: B21Lesson, title: "Bài 21 – Cấu trúc hạt nhân" },
  B22: { Component: B22Lesson, title: "Bài 22 – Phản ứng hạt nhân và năng lượng liên kết" },
  B23: { Component: B23Lesson, title: "Bài 23 – Hiện tượng phóng xạ" },
  B25: { Component: B25Lesson, title: "Bài 25 – Bài tập về vật lí hạt nhân" },
};

export default async function NuclearLabV2Page({ searchParams }: { searchParams: Promise<{ bai?: string }> }) {
  const { bai } = await searchParams;
  const lesson = bai ? LESSONS[bai] : undefined;

  if (!lesson) {
    const available = Object.values(LESSONS).map((l) => l.title).join(" · ");
    return (
      <PublicShell>
        <div style={{ maxWidth: "var(--content-width)", margin: "0 auto", padding: "64px 32px", textAlign: "center" }}>
          <h1>Bài {bai ?? ""} chưa sẵn sàng trong phiên bản v2</h1>
          <p>Hiện có: {available}.</p>
        </div>
      </PublicShell>
    );
  }

  const Lesson = lesson.Component;
  return (
    <PublicShell floatingTutor={false} aiLessonCode={bai}>
      <Lesson />
    </PublicShell>
  );
}
