import Link from "next/link";
import { PublicShell } from "@/app/PublicShell";
import styles from "@/app/nuclear-lab.module.css";
import { NucleusExplorer } from "@/components/learning/NucleusExplorer";
import { NuclearLessonVideo } from "@/components/learning/NuclearLessonVideo";
import { NUCLEAR_LAB_LESSONS, nuclearLabUrl } from "@/lib/nuclear-lab-lessons";
import { LEARNING_PHASES, PHASE_META } from "@/lib/learning-phases";
import { NUCLEAR_SEQUENCES, formatLearningTask } from "@/lib/nuclear-learning-sequence";
import { RichPhysicsText } from "@/components/learning/RichPhysicsText";
import { NUCLEAR_SCIENCE_SOURCES } from "@/lib/nuclear-science";
import { NuclearProcessEntry } from "@/components/physics/NuclearProcessEntry";

const lessonSources = {
  B21: NUCLEAR_SCIENCE_SOURCES.carbon,
  B22: NUCLEAR_SCIENCE_SOURCES.fusion,
  B23: NUCLEAR_SCIENCE_SOURCES.halfLife,
  B24: NUCLEAR_SCIENCE_SOURCES.reactor,
  B25: NUCLEAR_SCIENCE_SOURCES.constants,
};

export default async function NuclearLabPage({ searchParams }: { searchParams: Promise<{ bai?: string }> }) {
  const { bai } = await searchParams;
  const lesson = NUCLEAR_LAB_LESSONS.find((entry) => entry.code === bai) ?? NUCLEAR_LAB_LESSONS[0];
  const source = lessonSources[lesson.code];
  return (
    <PublicShell floatingTutor={false}>
      <div className={`${styles.lab} ${styles.gallery}`}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Chương IV · Vật lí 12 · {lesson.code}</p>
          <h1>{lesson.title}</h1>
          <p className={styles.lead}>Dự đoán, chọn điều kiện và chạy quá trình. Đối chiếu hình, số liệu và lời giải thích trước khi thử một điều kiện khác.</p>
          <nav className={styles.galleryNav} aria-label="Chọn bài trong phòng khám phá">
            {NUCLEAR_LAB_LESSONS.map((entry) => (
              <Link key={entry.code} href={nuclearLabUrl(entry.code)}
                aria-label={`${entry.code} · ${entry.title}`}
                aria-current={entry.code === lesson.code ? "page" : undefined}>{entry.code}</Link>
            ))}
          </nav>
          <section id="qua-trinh" className={styles.galleryPane} aria-labelledby="process-heading" style={{ marginBottom: "24px" }}>
            <p className={styles.eyebrow}>01 · Khảo sát quá trình</p>
            <h2 id="process-heading">Mô phỏng và dữ liệu {lesson.code}</h2>
            <NuclearProcessEntry key={lesson.code} code={lesson.code} />
          </section>
          <div className={styles.galleryGrid}>
            <section id="mo-hinh" className={styles.galleryPane} aria-labelledby="nucleus-heading">
              <p className={styles.eyebrow}>Bổ trợ · Cấu trúc không gian</p>
              <h2 id="nucleus-heading">Mô hình {lesson.isotopeLabel}</h2>
              <NucleusExplorer key={lesson.isotopeId} isotopeId={lesson.isotopeId} />
              <p>{lesson.observation}</p>
            </section>
            <section id="video" className={styles.galleryPane} aria-labelledby="film-heading">
              <p className={styles.eyebrow}>02 · Giải thích quá trình</p>
              <h2 id="film-heading">Video {lesson.code}</h2>
              <p className={styles.question}>{lesson.question}</p>
              <NuclearLessonVideo key={lesson.code} lesson={lesson} />
              <p>{lesson.videoTask}</p>
              <div className={styles.links}>
                <Link href={`/hoc-lieu?bai=${lesson.code}`}>Học liệu {lesson.code}</Link>
                <Link href={`/hoc-lieu/truc-quan?bai=${lesson.code}`}>Mô phỏng và bài tập</Link>
              </div>
            </section>
          </div>
          <section className={styles.sources} aria-labelledby="sample-pathway">
            <h2 id="sample-pathway">Tiến trình mẫu của {lesson.code}</h2>
            <p>Mỗi pha để lại một sản phẩm giúp em kiểm chứng, tự đánh giá và điều chỉnh cách học. Em nộp sản phẩm trong lớp sau khi giáo viên giao bài.</p>
            {LEARNING_PHASES.map(phase => {
              const task = NUCLEAR_SEQUENCES[lesson.code].tasks[phase];
              return <details key={phase} className={styles.phaseSample}>
                <summary>{PHASE_META[phase].title} · {task.title}</summary>
                <RichPhysicsText content={formatLearningTask(task)} />
              </details>;
            })}
          </section>
          <details className={styles.sources}>
            <summary>Nguồn khoa học và quy ước</summary>
            <p>Thành phần hạt nhân được đối chiếu với IAEA. Hình cầu, màu và vị trí chỉ giúp nhận biết nucleon. Kích thước và thời gian trong minh họa được quy ước để quan sát.</p>
            <ul>
              <li><a href={NUCLEAR_SCIENCE_SOURCES.nuclides.url}>{NUCLEAR_SCIENCE_SOURCES.nuclides.title}</a></li>
              <li><a href={source.url}>{source.title}</a></li>
            </ul>
          </details>
        </div>
      </div>
    </PublicShell>
  );
}
