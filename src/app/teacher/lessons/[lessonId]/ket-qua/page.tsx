import { TeacherShell } from "@/app/teacher/TeacherShell";
import { getTeacherLesson } from "@/lib/teacher-lesson";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { PHASE_NAMES, PLAN_PHASES } from "@/lib/teaching-plan";
import { validatePathwayEvidence } from "@/lib/pathway-progress";
import { RichPhysicsText } from "@/components/learning/RichPhysicsText";
import { EVIDENCE_PROMPTS } from "@/lib/nuclear-learning-sequence";
import { legacyNuclearMath } from "@/lib/legacy-nuclear-math";
import type { ClassMember } from "@/app/teacher/actions";
export default async function LessonEvidencePage({ params, searchParams }: { params: Promise<{ lessonId: string }>; searchParams: Promise<{ student?: string; phase?: string }> }) {
  const { lessonId } = await params, filters = await searchParams;
  const { supabase, lesson, classItem, curriculum } = await getTeacherLesson(lessonId);
  const result = await supabase.rpc("list_class_members_for_teacher", { p_class_id: classItem.id });
  const members = Array.isArray(result.data) ? result.data as ClassMember[] : [];
  const selected = filters.student ? members.find(member => member.student_id === filters.student) : members[0];
  const phase = PLAN_PHASES.find(p => p === filters.phase) ?? "before_class";
  const steps = await supabase.from("lesson_pathway_steps").select("id,title,instructions,is_required,is_published,step_order").eq("lesson_id", lessonId).eq("phase", phase).order("step_order").order("id");
  const progress = selected && steps.data?.length ? await supabase.from("student_step_progress").select("step_id,is_completed,evidence,completed_at").eq("lesson_id", lessonId).eq("student_id", selected.student_id).in("step_id", steps.data.map(s => s.id)) : { data: [], error: null };
  const phaseProg = selected ? await supabase.from("student_phase_progress").select("phase,is_completed,simulation_completed,assessment_answers,completed_at").eq("lesson_id", lessonId).eq("student_id", selected.student_id).eq("phase", phase).maybeSingle() : { data: null, error: null };
  const reflection = selected && phase === "after_class" ? await supabase.from("lesson_reflections").select("learned,difficult,next_step,confidence,updated_at").eq("lesson_id", lessonId).eq("student_id", selected.student_id).maybeSingle() : { data: null, error: null };
  const assessment = selected && phase === "after_class"
    ? await supabase.from("phase_assessment_questions").select("id,content").eq("lesson_id", lessonId).order("sort_order")
    : { data: [], error: null };
  const failed = result.error || steps.error || progress.error || phaseProg.error || reflection.error || assessment.error;
  const prompts = EVIDENCE_PROMPTS[phase];
  const assessmentEntries = phaseProg.data?.assessment_answers && typeof phaseProg.data.assessment_answers === "object" ? Object.entries(phaseProg.data.assessment_answers as Record<string, unknown>) : [];
  return <TeacherShell active="students" title={`Bài nộp · ${lesson.title}`} description="Xem nhiệm vụ đã giao cạnh bằng chứng học sinh đã nộp để nhận xét.">
    <LessonNavigation role="teacher" lessonId={lessonId} className={classItem.name} lessonTitle={lesson.title} classId={classItem.id} chapterCode={curriculum.chapterCode}/>
    <form method="get" className="library-filters"><label>Học sinh<select name="student" defaultValue={selected?.student_id ?? ""}>{members.map(m => <option key={m.student_id} value={m.student_id}>{m.full_name}</option>)}</select></label><label>Giai đoạn<select name="phase" defaultValue={phase}>{PLAN_PHASES.map(p => <option key={p} value={p}>{PHASE_NAMES[p]}</option>)}</select></label><button className="btn primary" disabled={!members.length}>Xem bài nộp</button></form>
    <p>“Đã nộp” xác nhận đã lưu sản phẩm. Giáo viên cần đọc nội dung để nhận xét mức độ hiểu và việc cần sửa.</p>
    {failed ? <p role="alert">Chưa tải đủ nhiệm vụ hoặc bài nộp. Kiểm tra kết nối, quyền lớp và dữ liệu tiến trình trước khi kết luận học sinh chưa làm bài.</p> : !selected ? <p>{filters.student ? "Học sinh được chọn không thuộc lớp này." : "Lớp chưa có học sinh để theo dõi."}</p> : <section className="lesson-evidence">
      <h2>{selected.full_name} · {PHASE_NAMES[phase]}</h2>
      <article className="card" data-testid="teacher-phase-summary">
        <h3>Tổng quan tiến độ giai đoạn ({PHASE_NAMES[phase]})</h3>
        <p><strong>Trạng thái hoàn thành pha:</strong> {phaseProg.data?.is_completed ? "Đã hoàn thành pha" : "Chưa hoàn thành pha"}</p>
        {phase === "in_class" ? <p><strong>Mô phỏng thực hành:</strong> {phaseProg.data?.simulation_completed ? "Đã hoàn thành mô phỏng" : "Chưa hoàn thành mô phỏng"}</p> : null}
        {phase === "after_class" ? <>
          <p><strong>Bài đánh giá cuối bài:</strong> {assessmentEntries.length ? `Đã nộp (${assessmentEntries.length} câu)` : "Chưa nộp"}</p>
          {!!assessmentEntries.length && <details>
            <summary>Đối chiếu bài đánh giá và gợi ý phản hồi</summary>
            <ol>{(assessment.data ?? []).filter(question => assessmentEntries.some(([id]) => id === question.id)).map(question => {
              const response = assessmentEntries.find(([id]) => id === question.id)?.[1];
              const key = question.content?.explanation ?? question.content?.sampleAnswer ?? question.content?.correctAnswer;
              const text = typeof response === "string" ? response : response && typeof response === "object"
                ? Object.entries(response).map(([index, value]) => `Ý ${Number(index) + 1}: ${String(value) === "true" ? "Đúng" : "Sai"}`).join("; ")
                : "Chưa có câu trả lời";
              return <li key={question.id}>
                <RichPhysicsText content={legacyNuclearMath(String(question.content?.prompt ?? "Câu hỏi"))} />
                <p><strong>Học sinh trả lời</strong></p>
                <RichPhysicsText content={legacyNuclearMath(text)} />
                {typeof key === "string" && <><p><strong>Đáp án hoặc gợi ý</strong></p><RichPhysicsText content={legacyNuclearMath(key)} /></>}
              </li>;
            })}</ol>
          </details>}
          <p><strong>Nhật kí tự học</strong> {reflection.data ? "Đã nộp" : "Chưa nộp"}</p>
          {reflection.data && <dl>
            <dt>Điều đã học</dt><dd><RichPhysicsText content={reflection.data.learned} /></dd>
            <dt>Khó khăn</dt><dd><RichPhysicsText content={reflection.data.difficult} /></dd>
            <dt>Điều chỉnh tiếp theo</dt><dd><RichPhysicsText content={reflection.data.next_step} /></dd>
            <dt>Tự nhận xét mức tự tin</dt><dd>{reflection.data.confidence}/5 · Thông tin phản hồi, không dùng làm điểm năng lực.</dd>
          </dl>}
        </> : null}
      </article>
      {!steps.data?.length ? <p>Chưa có bước học trong giai đoạn này.</p> : steps.data.map(step => {
        const submission = progress.data?.find(p => p.step_id === step.id), evidence = validatePathwayEvidence(submission?.evidence);
        return <article className="card" key={step.id}>
          <h3>{step.title}</h3>
          <p>{step.is_published ? "Đã giao" : "Bản nháp"} · {step.is_required ? "Bắt buộc" : "Tự chọn"}</p>
          <div className="role-pair">
            <div><h4>Nhiệm vụ giáo viên giao</h4><RichPhysicsText content={legacyNuclearMath(step.instructions || "Chưa ghi hướng dẫn.")} /></div>
            <div>
              <h4>Bài nộp của học sinh</h4>
              <p>{submission?.is_completed ? "Đã nộp" : "Chưa có xác nhận nộp"}</p>
              {evidence ? <dl>
                {[evidence.prediction, evidence.response, evidence.nextStep].map((value, index) => (
                  <div key={prompts[index]}>
                    <dt><strong>{prompts[index]}</strong></dt>
                    <dd><RichPhysicsText content={value || "Chưa ghi"} /></dd>
                  </div>
                ))}
              </dl> : submission ? <p>Bằng chứng đã lưu chưa đủ định dạng để hiển thị.</p> : null}
            </div>
          </div>
        </article>;
      })}
    </section>}
  </TeacherShell>;
}
