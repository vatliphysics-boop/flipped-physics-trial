import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { GRADE_12_CURRICULUM } from "@/lib/curriculum";

const items = [
  { label: "Tổng quan", href: "/student" },
  { label: "Chương trình học", href: "/student/curriculum", active: true },
  { label: "Lớp học của em", href: "/student#student-classes" },
  { label: "Nhật kí học tập", href: "/student#learning-log" },
];

export default function StudentCurriculumPage() {
  return <div className="shell"><AppSidebar items={items} /><main className="main dashboard-main curriculum-page">
    <header className="page-title dashboard-header"><div><div className="breadcrumbs"><Link href="/student">Vật lí 12</Link><span>›</span><strong>Chương trình học</strong></div><span className="eyebrow">Lộ trình Grade 12</span><h1>Chương trình Vật lí 12</h1><p>Bốn chương, hai mươi lăm bài học theo đúng thứ tự chính thức.</p></div><LogoutButton /></header>
    <div className="chapter-section-list">{GRADE_12_CURRICULUM.map((chapter) => <Link className="card chapter-overview-row" href={`/student/curriculum/${chapter.code}`} key={chapter.code}><span className="chapter-number">0{chapter.number}</span><div><span className="chapter-kicker">CHƯƠNG {chapter.code}</span><h2>{chapter.shortTitle}</h2><p>{chapter.lessons.length} bài học · {chapter.code === "IV" ? "Học liệu số đang hoạt động" : "Học liệu đang được chuẩn bị."}</p></div><span className="arrow-link">Mở chương →</span></Link>)}</div>
  </main></div>;
}