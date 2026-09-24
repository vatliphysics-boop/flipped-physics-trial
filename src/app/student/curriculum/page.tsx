import Link from "next/link";
import { StudentShell } from "../StudentShell";
import { GRADE_12_CURRICULUM } from "@/lib/curriculum";

// Items removed as they are handled by StudentShell

export default function StudentCurriculumPage() {
  return <StudentShell active="curriculum" title="Chương trình Vật lí 12" description="Bốn chương, hai mươi lăm bài học theo đúng thứ tự chính thức.">
    <div className="chapter-section-list">{GRADE_12_CURRICULUM.map((chapter) => <Link className="card chapter-overview-row" href={`/student/curriculum/${chapter.code}`} key={chapter.code}><span className="chapter-number">0{chapter.number}</span><div><span className="chapter-kicker">CHƯƠNG {chapter.code}</span><h2>{chapter.shortTitle}</h2><p>{chapter.lessons.length} bài học · {chapter.code === "IV" ? "Học liệu số đang hoạt động" : "Học liệu đang được chuẩn bị."}</p></div><span className="arrow-link">Mở chương →</span></Link>)}</div>
  </StudentShell>;
}