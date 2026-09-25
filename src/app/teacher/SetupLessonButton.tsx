"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setupLessonAction, type SetupLessonState } from "./actions";

/**
 * Renders a "Thiết lập bài học" button that creates a lessons row
 * via setupLessonAction and then redirects to the lesson overview page.
 *
 * Props:
 *   classId     — current class UUID
 *   topicTitle  — canonical topic title (CHAPTER_TOPIC_TITLES[chapterCode])
 *   lessonTitle — fixed catalog lesson title (FixedCurriculumLesson.title)
 *   chapterCode — for redirect breadcrumb, e.g. "IV"
 */
export function SetupLessonButton({
  classId,
  topicTitle,
  lessonTitle,
}: {
  classId: string;
  topicTitle: string;
  lessonTitle: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SetupLessonState, FormData>(
    setupLessonAction,
    {},
  );

  // On success, navigate to the lesson overview.
  useEffect(() => {
    if (state.lessonId) {
      router.push(`/teacher/lessons/${state.lessonId}`);
    }
  }, [state.lessonId, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="class_id"     value={classId} />
      <input type="hidden" name="topic_title"  value={topicTitle} />
      <input type="hidden" name="lesson_title" value={lessonTitle} />
      <button
        className="btn primary"
        type="submit"
        disabled={pending}
        aria-label={`Thiết lập bài học "${lessonTitle}"`}
      >
        {pending ? "Đang thiết lập…" : "Thiết lập bài học"}
      </button>
      {state.error && (
        <p
          role="alert"
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "var(--semantic-error, #e53e3e)",
          }}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
