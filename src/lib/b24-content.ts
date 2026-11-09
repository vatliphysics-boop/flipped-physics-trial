/**
 * B24 content manifest and structure
 * SGK Vật lí 12 KNTT, Bài 24 "Công nghiệp hạt nhân", tr. 114–118
 */

export const B24_HERO = {
  eyebrow: "Bài 24 · Chương IV · Vật lí 12",
  title: "Công nghiệp hạt nhân",
  pages: "SGK trang 114–118",
  lead: "Một lò phản ứng 1000 MW tiêu thụ vài kg uranium mỗi ngày — lượng nhiên liệu mà nhà máy than cần hàng nghìn tấn để làm việc tương đương. Cùng nguyên lí phân hạch, cùng đồng vị phóng xạ, đang chạy trong lò phản ứng, trong máy PET của bệnh viện và trong dây chuyền chiếu xạ nông sản.",
  facts: [
    { label: "Lò phản ứng", value: "điều khiển k ≈ 1 bằng thanh hấp thụ neutron" },
    { label: "Y học hạt nhân", value: "PET, SPECT chẩn đoán · xạ trị điều trị" },
    { label: "Chiếu xạ", value: "diệt khuẩn, kéo dài bảo quản nông sản" },
  ],
  story: {
    context:
      "Năm 1942, lò phản ứng hạt nhân đầu tiên của Enrico Fermi đạt tới hạn dưới khán đài sân vận động ở Chicago. Từ đó, phản ứng dây chuyền có kiểm soát trở thành nguồn năng lượng công nghiệp. Bài 24 đi qua ba lĩnh vực ứng dụng: sản xuất điện, y học hạt nhân, và công nghệ bức xạ trong nông nghiệp – công nghiệp.",
    reactor:
      "Trong lò, neutron sinh ra từ một phân hạch có thể kích hoạt phân hạch tiếp theo. Hệ số nhân k là tỉ số số neutron thế hệ sau chia thế hệ trước. k < 1 phản ứng tắt dần; k = 1 duy trì công suất ổn định; k > 1 tăng theo cấp số nhân. Thanh điều khiển bằng boron hoặc cadmium hấp thụ neutron — rút ra thì k tăng, cắm vào thì k giảm.",
    flow:
      "Nhiệt sinh ra trong lõi được chất tải nhiệt (nước áp suất cao) mang tới bộ trao đổi nhiệt. Ở đó nước của vòng thứ hai hóa hơi, quay tuabin, kéo máy phát. Hai vòng nước tách biệt: vòng sơ cấp có thể nhiễm phóng xạ, vòng thứ hai thì không — đây là lí do các nhà máy PWR dùng hai vòng.",
    medicine:
      "Đồng vị phóng xạ dùng trong y học theo hai hướng. Chẩn đoán: đưa một lượng rất nhỏ dược chất phóng xạ vào cơ thể, rồi ghi lại bức xạ phát ra để dựng ảnh chức năng. PET dùng ¹⁸F (T = 110 phút), SPECT dùng ⁹⁹ᵐTc (T = 6 giờ). Điều trị: dùng liều cao hơn để phá hủy mô bệnh, như xạ trị ⁶⁰Co trong điều trị ung thư.",
    food:
      "Chiếu xạ thực phẩm dùng tia gamma từ ⁶⁰Co hoặc chùm electron từ máy gia tốc để diệt vi khuẩn, côn trùng và kìm hãm nảy mầm. Quá trình không làm thực phẩm nhiễm phóng xạ, không thay đổi đáng kể giá trị dinh dưỡng ở liều cho phép. Ở Việt Nam, Trung tâm chiếu xạ Hà Nội và TP.HCM vận hành các dây chuyền này.",
    challenge:
      "Thanh điều khiển đưa sâu vào lõi lò phản ứng. Hệ số nhân k và số phân hạch qua các thế hệ thay đổi thế nào?",
  },
} as const;

export const B24_SCENES = [
  { id: "context", title: "Từ Chicago 1942 đến nhà máy điện" },
  { id: "reactor", title: "Điều khiển phản ứng dây chuyền" },
  { id: "flow", title: "Từ nhiệt hạt nhân đến điện" },
  { id: "medicine", title: "Y học hạt nhân" },
  { id: "food", title: "Chiếu xạ nông sản" },
] as const;
