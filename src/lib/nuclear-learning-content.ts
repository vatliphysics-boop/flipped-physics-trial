import content from "@/data/nuclear-learning.json";
import type { MaterialItem } from "./material-bank";
import { VISUAL_LESSONS } from "./visual-learning";
export const NUCLEAR_LEARNING_CONTENT = content;
const base = {
  category: "nuclear_physics" as const,
  is_published: true,
  is_system: true,
  created_at: "2026-10-04T00:00:00Z",
};
export const SUPPLEMENTARY_NUCLEAR_MATERIALS: MaterialItem[] = content.flatMap(
  (lesson) => [
    {
      ...base,
      id: `system-notes-${lesson.code}`,
      title: `${lesson.code} · Kiến thức và phiếu học tập ba giai đoạn`,
      description: `${lesson.goals.join("; ")}. Có phần ghi dự đoán, quan sát, tự đánh giá và câu hỏi chẩn đoán.`,
      material_type: "document",
      lesson_tag: lesson.code,
      content_url: `/learning/${lesson.code}-worksheet.pdf`,
      metadata: {
        author: "Học liệu Vật lí 12",
        sourceBook: `SGK Vật lí 12 KNTT · ${lesson.code}`,
      },
    },
    {
      ...base,
      id: `system-diagram-${lesson.code}`,
      title: `${lesson.code} · Infographic tương tác`,
      description:
        "Chọn các điểm trên hình để xem giải thích và trả lời câu hỏi. Có thể tải hình để trình chiếu.",
      material_type: "image",
      lesson_tag: lesson.code,
      content_url: `/illustrations/${lesson.code}-diagram.svg`,
      metadata: { workspace: "infographic", recommendedPhase: "before_class", author: "Học liệu Vật lí 12 · đồ họa vector gốc", sourceBook: "SGK Vật lí 12 KNTT" },
    },
    {
      ...base,
      id: `system-animation-${lesson.code}`,
      title: `${lesson.code} · Minh họa động quá trình`,
      description:
        "Quan sát sự thay đổi trên sơ đồ động rồi đối chiếu với thí nghiệm 3D. Kích thước và thời gian quy ước.",
      material_type: "animation",
      lesson_tag: lesson.code,
      content_url: `/illustrations/${lesson.code}-animation.svg`,
    },
    {
      ...base,
      id: `system-video-${lesson.code}`,
      title: `${lesson.code} · ${lesson.videoTitle}`,
      description: lesson.videoPrompt,
      material_type: "lecture_video",
      lesson_tag: lesson.code,
      content_url: lesson.video,
      metadata: { author: lesson.videoTitle.split(" - ")[0] },
    },
    {
      ...base,
      id: `system-quiz-${lesson.code}`,
      title: `${lesson.code} · Câu hỏi chẩn đoán có phản hồi`,
      description:
        "Ba câu kiểm tra kiến thức; chọn đáp án, kiểm tra và đọc lời giải. Kết quả tự luyện không phải điểm lớp học.",
      material_type: "colab",
      lesson_tag: lesson.code,
      content_url: `/learning/${lesson.code}-worksheet.pdf`,
      metadata: { workspace: "quiz" },
    },
  ],
);
SUPPLEMENTARY_NUCLEAR_MATERIALS.push(...VISUAL_LESSONS.map((lesson): MaterialItem => ({
  ...base, id: `system-youtube-${lesson.code}`, title: `${lesson.code} · YouTube: ${lesson.videoTitle}`,
  description: lesson.videoTask, material_type: "lecture_video", lesson_tag: lesson.code,
  content_url: `https://www.youtube.com/watch?v=${lesson.videoId}`,
  metadata: { author: lesson.channel, language: "en", verifiedAt: "2026-10-04", recommendedPhase: "before_class" },
})));
SUPPLEMENTARY_NUCLEAR_MATERIALS.push(
  {
    ...base,
    id: "system-real-cloud-chamber",
    title: "Video thực tế · Vết hạt trong buồng sương CERN",
    description:
      "Video buồng sương do CERN giới thiệu. Quan sát các vết có độ dài và bề dày khác nhau; không coi từng vết là xác định chắc chắn loại hạt khi thiếu thông tin đo.",
    material_type: "real_video",
    lesson_tag: "B23",
    content_url: "https://videos.cern.ch/record/2298686",
    metadata: {
      author: "CERN",
      sourceBook: "CERN Educational Resources · DIY Cloud Chamber",
    },
  },
  {
    ...base,
    id: "system-mindmap",
    title: "B24 · Bản đồ tư duy ứng dụng hạt nhân",
    description:
      "Bốn nhánh có ô nhập cơ chế, lợi ích và giới hạn. Làm việc cùng nhóm trên một thiết bị, tải bản ghi để chia sẻ.",
    material_type: "colab",
    lesson_tag: "B24",
    content_url: "/learning/B24-worksheet.pdf",
    metadata: { workspace: "mindmap" },
  },
  {
    ...base,
    id: "system-roleplay",
    title: "B24 · Đóng vai thảo luận dự án điện hạt nhân",
    description:
      "Chọn vai, nêu lập luận và nguồn, trả lời phản biện; bản ghi cá nhân có thể tải xuống.",
    material_type: "colab",
    lesson_tag: "B24",
    content_url: "/learning/B24-worksheet.pdf",
    metadata: { workspace: "roleplay" },
  },
  {
    ...base,
    id: "system-review-game",
    title: "B25 · Trò chơi ôn tập luân phiên hai đội",
    description:
      "15 câu ôn tập cho hai đội dùng chung thiết bị, có lời giải và điểm trong phiên học; không có phòng chơi đồng bộ qua mạng.",
    material_type: "colab",
    lesson_tag: "B25",
    content_url: "/learning/B25-worksheet.pdf",
    metadata: { workspace: "game" },
  },
  {
    ...base,
    id: "system-decay-notebook",
    title: "B23–B25 · Notebook xử lí dữ liệu phân rã",
    description:
      "Tải notebook Python, mở trong Jupyter hoặc tải lên Google Colab; vẽ đường cong mũ và ước lượng T từ bảng mẫu. Dữ liệu minh họa được ghi rõ.",
    material_type: "colab",
    lesson_tag: "B25",
    content_url: "/learning/decay-analysis.ipynb",
  },
);
