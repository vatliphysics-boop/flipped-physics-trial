import type { PlanPhase } from "./teaching-plan";

export const FLIPPED_SOURCE = "https://www.utep.edu/technologysupport/_Files/docs/Flipping-the-Class-Models.pdf";
export const FLIPPED_FORMS = [
  { id: "standard", title: "Học trước – luyện tập trên lớp", example: "B23", description: "Học kiến thức nền trước giờ học; dùng giờ học để giải bài, giải thích và nhận hỗ trợ." },
  { id: "demonstration", title: "Minh họa – thực hành", example: "B25", description: "Xem hướng dẫn trước; thực hiện thao tác, ghi số liệu và giải thích kết quả trên lớp." },
  { id: "discussion", title: "Thảo luận", example: "B24", description: "Chuẩn bị thông tin trước; thảo luận tình huống, đưa bằng chứng và phản biện trên lớp." },
  { id: "group", title: "Làm việc nhóm", example: "B24", description: "Chuẩn bị cá nhân trước; phân công nhóm thực hiện nhiệm vụ và tạo sản phẩm chung trên lớp." },
] as const;
export type FlippedFormId = (typeof FLIPPED_FORMS)[number]["id"];
export function getFlippedForm(id?: string) { return FLIPPED_FORMS.find(f => f.id === id); }
export const OTHER_FLIPPED_FORMS = [
  { title: "Đảo ngược trực tuyến", description: "Hoạt động hướng dẫn và trao đổi cũng diễn ra trực tuyến.", status: "Chưa triển khai trọn vẹn: chưa có phòng học trực tuyến và luồng giao/nộp được kiểm tra với tài khoản thật." },
  { title: "Học sinh trình bày hoặc hướng dẫn lại", description: "Học sinh tạo bài trình bày hoặc video giải thích cho người khác.", status: "Có thể tổ chức ngoài web; chưa có luồng tạo, nộp và duyệt video học sinh riêng." },
] as const;

export const FLIPPED_ROLE_GUIDES: Record<FlippedFormId, Record<PlanPhase, { teacher: string; student: string; evidence: string }>> = {
  standard: {
    before_class: { teacher: "Chọn video, phiếu và câu hỏi ngắn; giao mục tiêu, thời lượng; xem câu trả lời để chọn nội dung cần hỗ trợ.", student: "Đọc hoặc xem học liệu, trả lời câu hỏi chẩn đoán; ghi điều chưa hiểu trước giờ học.", evidence: "Câu trả lời cá nhân và câu hỏi cần trao đổi." },
    in_class: { teacher: "Tổ chức luyện tập từ lỗi đã phát hiện; hỏi cách giải, hỗ trợ học sinh và chốt kiến thức.", student: "Giải bài, thử mô phỏng, trao đổi cách giải và sửa lỗi theo phản hồi.", evidence: "Bài giải hoặc bảng quan sát kèm lời giải thích." },
    after_class: { teacher: "Giao câu hỏi vận dụng; nhận xét sản phẩm và đề nghị việc cần học tiếp.", student: "Tự kiểm tra, sửa nhận định sai và ghi cách điều chỉnh việc học.", evidence: "Bài sửa và nhật kí tự học." },
  },
  demonstration: {
    before_class: { teacher: "Chọn video hoặc hình hướng dẫn thao tác; yêu cầu dự đoán, đọc tham số và chuẩn bị bảng ghi.", student: "Xem hướng dẫn, nêu dự đoán và xác định đại lượng cần quan sát hoặc đo.", evidence: "Dự đoán và bảng ghi chuẩn bị." },
    in_class: { teacher: "Hướng dẫn quy trình; yêu cầu thay một tham số mỗi lần, kiểm tra số liệu và cách giải thích.", student: "Bắt đầu mô phỏng, đổi tham số, quan sát nhiều góc, ghi số liệu và giải thích kết quả.", evidence: "Bảng số liệu, đồ thị hoặc phương trình có đơn vị và nhận xét." },
    after_class: { teacher: "Nhận xét sai lệch, giới hạn mô hình; giao một tình huống thay đổi điều kiện.", student: "Sửa cách đo hoặc cách giải thích; dùng kết quả để giải tình huống mới.", evidence: "Bản sửa và kết luận về giới hạn mô hình." },
  },
  discussion: {
    before_class: { teacher: "Giao tình huống, nguồn đọc và câu hỏi; yêu cầu mỗi học sinh chuẩn bị một lập luận có bằng chứng.", student: "Xem video, đọc thông tin và ghi lập luận ban đầu cùng nguồn.", evidence: "Lập luận cá nhân trước thảo luận." },
    in_class: { teacher: "Phân vai, điều phối thời gian; yêu cầu dẫn chứng, kiểm tra kiến thức và xử lí nhận định chưa đủ căn cứ.", student: "Trình bày theo vai, phản biện ý kiến khác và điều chỉnh lập luận khi có bằng chứng mới.", evidence: "Bảng lập luận, phản biện và kết luận có điều kiện." },
    after_class: { teacher: "Nhận xét cách dùng bằng chứng; yêu cầu học sinh giải thích điều đã thay đổi trong quan điểm.", student: "Ghi kết luận cá nhân, lí do thay đổi và điều cần tìm hiểu thêm.", evidence: "Phản tư cá nhân sau thảo luận." },
  },
  group: {
    before_class: { teacher: "Giao chuẩn bị cá nhân và tiêu chí sản phẩm nhóm; dự kiến phân công theo điều kiện thiết bị.", student: "Đọc học liệu, trả lời câu hỏi và chuẩn bị một đóng góp cho nhóm.", evidence: "Câu trả lời và ý tưởng của từng học sinh." },
    in_class: { teacher: "Phân công điều phối, ghi chép, kiểm tra nguồn và trình bày; theo dõi cả sản phẩm chung và đóng góp cá nhân.", student: "Cùng nhóm lập bản đồ, xử lí dữ liệu hoặc giải tình huống; kiểm tra chéo và trình bày sản phẩm.", evidence: "Sản phẩm nhóm và bản ghi đóng góp cá nhân." },
    after_class: { teacher: "Nhận xét sản phẩm và sự tham gia; giao tự đánh giá, sửa phần còn thiếu.", student: "Ghi việc mình đã làm, góp ý cho nhóm và sửa kiến thức chưa đúng.", evidence: "Tự đánh giá cá nhân và bản sửa sản phẩm nhóm." },
  },
};

export const HD_LEARNING_TYPES = [
  { title: "Video hoạt hình khoa học ngắn", phase: "Trước giờ học", code: "B24", resource: "system-youtube-B24", teacher: "Chọn đoạn video và câu hỏi dẫn dắt.", student: "Xem, dừng và ghi chuỗi chuyển hóa năng lượng.", status: "Có video nguồn; hướng dẫn tiếng Việt, video tiếng Anh." },
  { title: "Mô phỏng tương tác", phase: "Trước và trong giờ học", code: "B22", resource: "system-sim-nuclear-fission", teacher: "Giao dự đoán, tham số và tiêu chí quan sát.", student: "Bắt đầu, thay tham số, xoay mô hình, ghi và giải thích kết quả.", status: "Có 17 hoạt động 3D; mỗi mô hình có giới hạn được ghi rõ." },
  { title: "Infographic và sơ đồ lịch sử", phase: "Trước giờ học", code: "B21", resource: "system-diagram-B21", teacher: "Chọn sơ đồ và điểm cần giải thích.", student: "Chọn điểm trên hình, đọc giải thích và trả lời câu hỏi.", status: "Có 5 infographic tương tác; sơ đồ lịch sử riêng chưa hoàn thiện." },
  { title: "Phiếu học tập và câu hỏi chẩn đoán", phase: "Trước giờ học", code: "B23", resource: "system-quiz-B23", teacher: "Chọn mục tiêu, câu hỏi và xem điều học sinh còn vướng.", student: "Trả lời, đọc phản hồi và ghi cách sửa.", status: "Có phiếu và phản hồi tự luyện; kho công khai chưa tự gửi kết quả cho giáo viên." },
  { title: "Video từng bài giảng", phase: "Trước giờ học", code: "B23", resource: "system-video-B23", teacher: "Chọn video phù hợp bài, giao thời lượng và câu hỏi.", student: "Xem video theo nhiệm vụ, ghi ý chính và câu hỏi.", status: "Có nguồn theo B21–B25; chưa phải bộ video tự sản xuất đầy đủ." },
  { title: "Xử lí dữ liệu thí nghiệm", phase: "Trong giờ học", code: "B25", resource: "system-notes-B25", teacher: "Giao bảng số liệu, yêu cầu đồ thị, đơn vị và nhận xét.", student: "Thu số liệu mô phỏng, vẽ đồ thị, xác định chu kì bán rã.", status: "Có dữ liệu mô phỏng, CSV/đồ thị ở hoạt động và notebook; không gọi là số liệu đo thiết bị thật." },
  { title: "Bản đồ tư duy nhóm", phase: "Trong giờ học", code: "B24", resource: "system-mindmap", teacher: "Giao chủ đề, phân công và tiêu chí cơ chế–ứng dụng–giới hạn.", student: "Cùng thiết bị ghi các nhánh và kiểm tra nguồn của nhóm.", status: "Có bảng ghi nhóm trên một thiết bị; chưa có đồng biên tập nhiều thiết bị hoặc sơ đồ kéo thả." },
  { title: "Đóng vai và tình huống", phase: "Trong giờ học", code: "B24", resource: "system-roleplay", teacher: "Phân vai, điều phối phản biện và kiểm tra bằng chứng.", student: "Chọn vai, nêu lập luận, phản biện và ghi kết luận.", status: "Có bốn vai và bảng lập luận; giáo viên tổ chức trao đổi trực tiếp." },
  { title: "Trò chơi ôn tập", phase: "Trong giờ học", code: "B25", resource: "system-review-game", teacher: "Chia hai đội, điều phối lượt và yêu cầu giải thích sau đáp án.", student: "Thảo luận, chốt đáp án, đọc phản hồi và ghi nội dung cần ôn.", status: "Có trò chơi hai đội dùng chung thiết bị; chưa có thi trực tuyến đồng thời." },
] as const;
