/**
 * B22 content manifest and structure
 * SGK Vật lí 12 KNTT, Bài 22 "Phản ứng hạt nhân và năng lượng liên kết", tr. 96–103
 */

export const B22_HERO = {
  eyebrow: "Bài 22 · Chương IV · Vật lí 12",
  title: "Phản ứng hạt nhân và năng lượng liên kết",
  pages: "SGK trang 96–103",
  lead: "Năm 1919, Rutherford bắn hạt alpha vào khí nitrogen và thấy proton bật ra — lần đầu tiên con người biến đổi hạt nhân này thành hạt nhân khác. Ba mươi năm sau, cùng nguyên lí đó dẫn tới lò phản ứng và bom nhiệt hạch.",
  facts: [
    { label: "Phản ứng đầu tiên", value: "α + ¹⁴N → ¹⁷O + p (Rutherford, 1919)" },
    { label: "Năng lượng liên kết riêng", value: "đỉnh ≈ 8,8 MeV/nucleon quanh A ≈ 56" },
    { label: "Một phân hạch U-235", value: "tỏa ≈ 200 MeV" },
  ],
  scientist: {
    name: "Patrick Blackett",
    years: "1897 – 1974",
    nobel: "Giải Nobel Vật lí 1948",
    photoUrl: "/scientists/blackett.jpg",
    photoCredit: "Chân dung Patrick Blackett — tư liệu lịch sử khoa học",
  },
  story: {
    context:
      "Trước năm 1919, người ta biết hạt nhân tồn tại nhưng cho rằng nó không thể thay đổi. Rutherford đặt một nguồn alpha trước buồng chứa khí nitrogen và quan sát: hạt alpha biến mất, thay vào đó xuất hiện hạt nhân oxygen và một proton. Đây là phản ứng hạt nhân nhân tạo đầu tiên.",
    blackett:
      "Patrick Blackett hoàn thiện buồng sương để ghi lại vết của từng hạt. Trong ảnh chụp, vết alpha dài đi vào rồi đột ngột rẽ thành hai: một vết mảnh, dài (proton) và một vết ngắn, đậm hơn (hạt nhân oxygen-17). Chính hình chữ Y này là bằng chứng trực tiếp của một phản ứng hạt nhân.",
    equation:
      "Phương trình α + ¹⁴N → ¹⁷O + p cân bằng theo hai định luật: tổng số khối A giữ nguyên (4 + 14 = 17 + 1 = 18) và tổng điện tích Z giữ nguyên (2 + 7 = 8 + 1 = 9). Không có hạt nào tự sinh ra hay biến mất — chỉ sắp xếp lại nucleon.",
    binding:
      "Khối lượng hạt nhân luôn nhỏ hơn tổng khối lượng các nucleon rời ghép lại. Phần chênh lệch Δm gọi là độ hụt khối; nhân với c² cho năng lượng liên kết Elk. Chia tiếp cho số khối được năng lượng liên kết riêng — thước đo độ bền của hạt nhân. Đồ thị Elkr theo A có đỉnh khoảng 8,8 MeV/nucleon quanh A ≈ 56 rồi giảm dần về hai đầu.",
    fission:
      "Vì hạt nhân nặng nằm thấp hơn đỉnh, tách U-235 thành hai mảnh cỡ A ≈ 100–140 làm các mảnh bền hơn — phần chênh lệch thoát ra dưới dạng động năng, khoảng 200 MeV mỗi phân hạch. Ngược lại, hai hạt nhân rất nhẹ như deuteri và triti ghép lại thành heli-4 cũng giải phóng năng lượng, nhưng phải thắng lực đẩy Coulomb nên cần nhiệt độ rất cao.",
    challenge:
      "Vì sao cả phản ứng phân hạch (tách hạt nhân nặng) và nhiệt hạch (ghép hạt nhân nhẹ) đều tỏa năng lượng?",
  },
} as const;

export const B22_SCENES = [
  { id: "context", title: "Manchester, 1919" },
  { id: "blackett", title: "Buồng sương ghi lại vết phản ứng" },
  { id: "equation", title: "Bảo toàn A và Z" },
  { id: "binding", title: "Độ hụt khối và năng lượng liên kết" },
  { id: "fission", title: "Phân hạch và nhiệt hạch" },
] as const;
