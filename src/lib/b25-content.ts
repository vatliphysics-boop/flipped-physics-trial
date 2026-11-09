/**
 * B25 content manifest and structure
 * SGK Vật lí 12 KNTT, Bài 25 "Bài tập về vật lí hạt nhân", tr. 119–122
 */

export const B25_HERO = {
  eyebrow: "Bài 25 · Chương IV · Vật lí 12",
  title: "Bài tập về vật lí hạt nhân",
  pages: "SGK trang 119–122",
  lead: "Bài luyện tập tổng hợp cuối Chương IV. Ba nhóm bài tập nối liền toàn bộ kiến thức: đọc đồ thị độ phóng xạ, cân bằng phương trình hạt nhân, và tính năng lượng liên kết — rồi vận dụng vào nhà máy điện, chiếu xạ thực phẩm và y học hạt nhân.",
  facts: [
    { label: "Bảng 25.1", value: "H₀ = 151 Bq, 8 mốc đo trên 360 s" },
    { label: "Ba bài ví dụ", value: "Tĩnh điện kế · Phân hạch U-235 · Xạ trị Co-60" },
    { label: "Sáu bài tập", value: "SGK trang 121–122" },
  ],
  story: {
    context:
      "Bài 25 không giới thiệu hiện tượng mới. Nó gom toàn bộ Chương IV lại thành ba nhóm kĩ năng: đọc đồ thị để tìm chu kì bán rã, viết đúng phương trình hạt nhân, và tính năng lượng từ khối lượng. Mỗi nhóm đòi một thao tác khác nhau, nhưng cả ba đều dựa trên cùng vài định luật bảo toàn.",
    graph:
      "Bảng 25.1 ghi độ phóng xạ H của một mẫu theo thời gian, từ 151 Bq lúc t = 0 xuống 9 Bq sau 360 s. Mức nửa ban đầu là 75,5 Bq, nằm giữa hai mốc 85 Bq (t = 30 s) và 55 Bq (t = 60 s). Nội suy thẳng hai mốc cho khoảng 39,5 s — một ước lượng thô cho chu kì bán rã.",
    equation:
      "Phương trình hạt nhân cân bằng theo hai định luật: tổng số khối A và tổng điện tích Z giữ nguyên trước và sau phản ứng. Với phân rã β, phương trình chỉ cân bằng khi kể thêm electron (hoặc positron) và neutrino.",
    energy:
      "Năng lượng liên kết tính từ độ hụt khối: Δm bằng tổng khối lượng các nucleon rời trừ khối lượng hạt nhân, rồi Elk = Δm·c². Chia cho số khối A được năng lượng liên kết riêng — đại lượng so sánh được độ bền giữa các hạt nhân, và là chìa khóa giải thích vì sao phân hạch U-235 tỏa năng lượng.",
    application:
      "Sáu bài tập SGK đưa các công thức trên vào tình huống thật: một nhà máy 1400 MW cần bao nhiêu U-235 mỗi ngày; nguồn Co-60 yếu dần thì phải chiếu xạ lâu hơn bao nhiêu; hai bệnh nhân tiêm FDG cách nhau một giờ thì ai cần chuẩn bị nhiều thuốc hơn.",
    challenge: "Bài toán đọc đồ thị: từ 151 Bq xuống 9 Bq trong 360 s, mẫu này có chu kì bán rã gần 40 s hay 60 s?",
  },
} as const;

export const B25_SCENES = [
  { id: "context", title: "Ba nhóm kĩ năng", text: "context" },
  { id: "graph", title: "Nhóm 1 — Đọc đồ thị H(t)", text: "graph" },
  { id: "equation", title: "Nhóm 2 — Cân bằng phương trình", text: "equation" },
  { id: "energy", title: "Nhóm 3 — Tính năng lượng liên kết", text: "energy" },
  { id: "application", title: "Vận dụng thực tế", text: "application" },
] as const;
