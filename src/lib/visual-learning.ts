import type { CanonicalActivityKey } from "./curriculum";
export type VisualLessonCode = "B21" | "B22" | "B23" | "B24" | "B25";
export type VisualLesson = {
  code: VisualLessonCode; title: string; shortTitle: string; color: string; goal: string; bookPage: number; pdfPage: number;
  activity: CanonicalActivityKey; videoId: string; videoTitle: string; channel: string;
  videoTask: string; before: string; during: string; product: string; misconception: string;
  spots: { title: string; x: number; y: number; observe: string; explain: string }[];
  question: { prompt: string; options: string[]; answer: number; explanation: string };
};
export const VISUAL_LESSONS: VisualLesson[] = [
  {
    code: "B21", title: "Cấu trúc hạt nhân", shortTitle: "Cấu trúc hạt nhân", color: "#376bdd", goal: "Dùng tán xạ α để giải thích mô hình hạt nhân; đọc A, Z, xác định số neutron và phân biệt đồng vị.", bookPage: 91, pdfPage: 2,
    activity: "rutherford_alpha_scattering", videoId: "bVlwH1kfDeg", videoTitle: "Rutherford’s gold foil experiment", channel: "Khan Academy",
    videoTask: "Dừng ở hình đường đi của hạt α. Vì sao phần lớn đi thẳng, còn một số rất ít lệch mạnh? Vẽ hai đường đi và ghi kết luận bằng tiếng Việt.",
    before: "Đọc ba điểm trên hình, dự đoán đường đi của α rồi xem mô phỏng. Ghi một bằng chứng cho mỗi kết luận.",
    during: "Chiếu mô phỏng, thay đổi khoảng cách tới tâm. Nhóm đối chiếu dự đoán với quỹ đạo và giải thích bằng tương tác điện.",
    product: "Hai đường đi của α kèm giải thích; bảng A, Z, N của C-12 và C-14.", misconception: "Hạt nhân trong hình được phóng đại. Electron không chuyển động trên những đường tròn cố định như một hệ hành tinh.",
    spots: [
      { title: "Phần lớn đi thẳng", x: 16, y: 32, observe: "Nhiều hạt α qua lá vàng gần như không đổi hướng.", explain: "Phần lớn thể tích nguyên tử không chứa vùng tập trung điện tích dương và khối lượng." },
      { title: "Một số lệch mạnh", x: 46, y: 27, observe: "Hạt tới gần tâm bị lệch, một số rất ít bật ngược.", explain: "Điện tích dương tập trung trong hạt nhân nhỏ gây tương tác điện mạnh khi hạt α tới gần." },
      { title: "Đọc số nucleon", x: 75, y: 34, observe: "Hạt nhân C-12 gồm 6 proton và 6 neutron.", explain: "A = Z + N = 12. C-14 vẫn có Z = 6 nhưng N = 8; hai hạt nhân là đồng vị." },
    ],
    question: { prompt: "C-12 và C-14 có đại lượng nào giống nhau?", options: ["Số neutron", "Số proton", "Số khối"], answer: 1, explanation: "Cùng nguyên tố carbon nên cùng Z = 6; N khác nhau nên A khác nhau." },
  },
  {
    code: "B22", title: "Phản ứng hạt nhân và năng lượng liên kết", shortTitle: "Phản ứng hạt nhân", color: "#b95e39", goal: "Kiểm tra phương trình theo bảo toàn A, Z; liên hệ độ hụt khối, năng lượng liên kết, phân hạch và nhiệt hạch.", bookPage: 96, pdfPage: 7,
    activity: "nuclear_fission", videoId: "D91T-B-PVE0", videoTitle: "What Is Nuclear Fission?", channel: "FuseSchool – Global Education",
    videoTask: "Xác định neutron tới, hai mảnh phân hạch và neutron sinh ra. Video có thể minh họa một kênh phân hạch khác với mô phỏng.",
    before: "Dự đoán neutron sinh ra, chạy phân hạch theo bốn bước, kiểm tra tổng A và Z của hai vế.",
    during: "Dừng ở U-236*, yêu cầu học sinh giải thích dấu *. Quan sát quá trình tách mảnh; thử k < 1, k = 1, k > 1.",
    product: "Phương trình đúng; hai phép cộng bảo toàn; giải thích vì sao không phải neutron nào cũng gây phản ứng tiếp theo.", misconception: "Phân hạch có nhiều kênh. k > 1 chỉ biểu thị tăng theo thế hệ trong mô hình, không tự nó chứng minh có vụ nổ.",
    spots: [
      { title: "Hấp thụ neutron", x: 13, y: 31, observe: "U-235 nhận một neutron và trở thành U-236*.", explain: "A tăng từ 235 lên 236; Z vẫn là 92. Dấu * chỉ trạng thái kích thích." },
      { title: "Tách thành hai mảnh", x: 69, y: 27, observe: "Trong ví dụ này, sản phẩm gồm Y-95, I-138 và 3 neutron.", explain: "95 + 138 + 3 = 236; 39 + 53 = 92. Hình chỉ minh họa quá trình, không đo kích thước hoặc thời gian thực." },
      { title: "Năng lượng & dây chuyền", x: 88, y: 36, observe: "Mảnh phân hạch chuyển động; neutron có thể tiếp tục gây phân hạch.", explain: "Năng lượng tỏa ra gắn với chênh lệch khối lượng nghỉ. Số neutron tiếp tục phản ứng phụ thuộc hấp thụ và thoát ra." },
    ],
    question: { prompt: "Sau khi U-235 hấp thụ một neutron, số proton của hạt nhân là bao nhiêu?", options: ["93", "92", "236"], answer: 1, explanation: "Neutron không mang điện. Hạt nhân U-236* vẫn có 92 proton và có 144 neutron." },
  },
  {
    code: "B23", title: "Hiện tượng phóng xạ", shortTitle: "Hiện tượng phóng xạ", color: "#8a55b5", goal: "Nhận biết tính chất α, β, γ; giải thích tính ngẫu nhiên, vận dụng định luật phóng xạ và nêu cách giảm phơi nhiễm.", bookPage: 104, pdfPage: 15,
    activity: "radiation_properties", videoId: "P_SD5Rt6XMk", videoTitle: "Intro to radioactive decay", channel: "Khan Academy",
    videoTask: "Lập bảng ba loại bức xạ: bản chất, biến đổi A/Z, đặc điểm đâm xuyên. Tìm một chỗ video dùng cách biểu diễn khác sơ đồ của em.",
    before: "Dự đoán đường đi qua vật chắn cho từng loại; thử α, β, γ rồi sửa một nhận định ban đầu.",
    during: "Nhóm dùng bảng đếm lặp lại để phân biệt kết quả ngẫu nhiên của một khoảng đo với xu hướng thống kê N(t).",
    product: "Bảng α/β/γ, số liệu ba lần đếm và một câu giải thích dao động.", misconception: "Không có vật chắn mỏng nào chặn tuyệt đối mọi photon γ. Đâm xuyên phụ thuộc năng lượng và vật liệu.",
    spots: [
      { title: "α và giấy", x: 29, y: 28, observe: "Đường α dừng ở tấm giấy trong hình minh họa.", explain: "α là hạt nhân helium-4 mang điện +2e; khi phân rã α, A giảm 4 và Z giảm 2." },
      { title: "β và nhôm", x: 55, y: 43, observe: "Đường β xuyên qua giấy nhưng suy giảm trong nhôm.", explain: "β⁻ là electron, β⁺ là positron. A không đổi; Z tăng 1 với β⁻ hoặc giảm 1 với β⁺." },
      { title: "γ suy giảm", x: 82, y: 61, observe: "Đường γ qua chì được vẽ nhạt hơn, còn tín hiệu phía sau.", explain: "γ là photon năng lượng cao. Chì/bê tông làm suy giảm cường độ; phát γ riêng lẻ không đổi A và Z." },
    ],
    question: { prompt: "Khi một hạt nhân kích thích chỉ phát photon γ, A và Z thay đổi thế nào?", options: ["A giảm 4, Z giảm 2", "A không đổi, Z tăng 1", "A và Z không đổi"], answer: 2, explanation: "Photon không mang số nucleon hay điện tích. Hạt nhân giảm năng lượng kích thích, A và Z giữ nguyên." },
  },
  {
    code: "B24", title: "Công nghiệp hạt nhân", shortTitle: "Công nghiệp hạt nhân", color: "#137e7c", goal: "Mô tả chuyển hóa năng lượng và đánh giá ứng dụng hạt nhân bằng cơ chế, lợi ích, giới hạn.", bookPage: 114, pdfPage: 25,
    activity: "nuclear_power_energy_flow", videoId: "R7WPEYGr1Vs", videoTitle: "Những vấn đề của năng lượng hạt nhân — M. V. Ramana và Sajan Saini", channel: "TED-Ed · M. V. Ramana & Sajan Saini",
    videoTask: "Dừng ở lò phản ứng, turbine và máy phát. Ghi chuỗi chuyển hóa năng lượng. Các số liệu thị phần trong video năm 2017 không đại diện cho hiện tại.",
    before: "Theo dõi vòng sơ cấp và thứ cấp, ghi vị trí truyền nhiệt và vị trí phát điện.",
    during: "Nhóm lập bản đồ ứng dụng, sau đó đóng vai thảo luận dự án điện giả định. Mỗi lập luận có một dẫn chứng và một điều kiện áp dụng.",
    product: "Sơ đồ chuyển hóa; bản đồ ứng dụng; lập luận về lợi ích và giới hạn có dẫn nguồn.", misconception: "Trong lò nước áp lực, hai vòng nước tách biệt. Hình này không đại diện cho mọi thiết kế nhà máy điện hạt nhân.",
    spots: [
      { title: "Phân hạch → nhiệt", x: 17, y: 39, observe: "Nhiệt sinh ra trong lò được vòng sơ cấp mang tới bộ trao đổi nhiệt.", explain: "Thanh điều khiển hấp thụ neutron. Điện năng không được tạo ra trực tiếp trong nhiên liệu." },
      { title: "Trao đổi nhiệt", x: 45, y: 32, observe: "Vòng sơ cấp và thứ cấp trao đổi nhiệt qua bề mặt ngăn cách.", explain: "Với mô hình lò nước áp lực, nước của hai vòng không trộn lẫn; vòng thứ cấp tạo hơi." },
      { title: "Cơ năng → điện", x: 77, y: 36, observe: "Hơi làm quay turbine; turbine kéo máy phát.", explain: "Sau turbine, hơi ngưng tụ và quay lại vòng thứ cấp. Phân biệt dòng vật chất với dòng năng lượng." },
    ],
    question: { prompt: "Chuỗi chuyển hóa năng lượng chính trong nhà máy điện hạt nhân là gì?", options: ["Hạt nhân → nhiệt → cơ → điện", "Hạt nhân → điện trực tiếp", "Điện → hạt nhân → nhiệt"], answer: 0, explanation: "Phân hạch sinh nhiệt, hơi nước truyền năng lượng cho turbine và máy phát chuyển cơ năng thành điện năng." },
  },
  {
    code: "B25", title: "Bài tập về vật lí hạt nhân", shortTitle: "Bài tập hạt nhân", color: "#b27919", goal: "Vận dụng kí hiệu và bảo toàn số nucleon, điện tích, tính năng lượng liên kết và ước lượng chu kì bán rã từ số liệu.", bookPage: 119, pdfPage: 30,
    activity: "nuclear_physics_practice_lab", videoId: "gDpyBifg6-s", videoTitle: "Half-life", channel: "Khan Academy",
    videoTask: "Dừng ở bảng 25.1, dự đoán chu kì bán rã nằm ở khoảng nào và kiểm tra với hai điểm bao quanh nửa hoạt độ ban đầu.",
    before: "Đọc Bảng 25.1, dự đoán khoảng chứa chu kì bán rã và ghi lại hai điểm dữ liệu dùng để kiểm tra.",
    during: "Vẽ các điểm hoạt độ theo thời gian, tìm mức nửa hoạt độ ban đầu và giải thích cách ước lượng.",
    product: "Đồ thị ghi đúng trục và đơn vị, khoảng chứa chu kì bán rã và cách ước lượng từ hai mốc trong bảng.", misconception: "Sau mỗi T, số hạt giảm một nửa so với đầu khoảng đó. Số đếm cần trừ phông và các khoảng đo phải nhất quán khi xử lí thực nghiệm.",
    spots: [
      { title: "Bảng số liệu", x: 15, y: 31, observe: "Bảng 25.1 cho hoạt độ ban đầu 151 Bq, tại 30 giây là 85 Bq, tại 60 giây là 55 Bq.", explain: "Một nửa hoạt độ ban đầu là 75,5 Bq. Tìm hai điểm nằm hai bên mức này." },
      { title: "Đọc đồ thị", x: 59, y: 46, observe: "Mức nửa hoạt độ nằm giữa điểm 30 giây và 60 giây.", explain: "Có thể nội suy thẳng trong khoảng đó để ước lượng 39,5 giây. Mô hình lí tưởng giảm theo hàm mũ." },
      { title: "Phân biệt N và H", x: 82, y: 27, observe: "H = λN có cùng xu hướng giảm khi λ không đổi.", explain: "N là số hạt chưa phân rã. Hoạt độ tính bằng becquerel, tương ứng số phân rã mỗi giây; số đếm trên thiết bị còn phụ thuộc hiệu suất và phông." },
    ],
    question: { prompt: "Bảng 25.1 cho thấy chu kì bán rã nằm trong khoảng thời gian nào?", options: ["0–30 giây", "30–60 giây", "60–120 giây"], answer: 1, explanation: "Mức 75,5 Bq nhỏ hơn 85 Bq ở 30 giây và lớn hơn 55 Bq ở 60 giây." },
  },
];
export const CURRICULUM_SOURCE = "/learning/physics-curriculum-2018.pdf#page=27";
export function getVisualLesson(code?: string | null) { return VISUAL_LESSONS.find(l => l.code === code) ?? VISUAL_LESSONS[0]; }
export function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const id = ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname) && url.pathname === "/watch" ? url.searchParams.get("v") : url.hostname === "youtu.be" ? url.pathname.slice(1) : null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
