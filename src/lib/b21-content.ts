/**
 * B21 content manifest and structure
 * SGK Vật lí 12 KNTT, Bài 21 "Cấu trúc hạt nhân", tr. 91–95
 */

export const B21_HERO = {
  eyebrow: "Bài 21 · Chương IV · Vật lí 12",
  title: "Cấu trúc hạt nhân",
  pages: "SGK trang 91–95",
  lead: "Manchester, 1911. Rutherford cho chùm hạt alpha bắn vào lá vàng mỏng và thấy một điều không thể giải thích bằng mô hình nguyên tử cũ: vài hạt bật ngược trở lại. Từ đó ông suy ra hạt nhân — một khối đặc, bé nhỏ, mang toàn bộ điện tích dương của nguyên tử.",
  facts: [
    { label: "Kích thước nguyên tử", value: "cỡ 10⁻¹⁰ m" },
    { label: "Kích thước hạt nhân", value: "cỡ 10⁻¹⁴–10⁻¹⁵ m (bé hơn ~10⁴–10⁵ lần)" },
    { label: "Công thức bán kính", value: "R ≈ 1,2·A^(1/3) fm" },
  ],
  story: {
    context:
      "Mô hình Thomson đầu thế kỉ 20 hình dung nguyên tử như một quả cầu tích điện dương đều, electron cắm rải rác bên trong. Rutherford kiểm tra mô hình đó bằng cách bắn chùm hạt alpha (nhân heli, điện tích +2e) vào một lá vàng chỉ dày vài nghìn nguyên tử.",
    setup:
      "Hạt alpha phát ra từ nguồn phóng xạ, đi qua một khe hẹp cho thành chùm, rồi đập vào lá vàng mỏng. Phía sau lá là màn huỳnh quang ghi lại vị trí hạt đập vào. Toàn bộ đặt trong chân không để hạt không bị không khí cản.",
    observation:
      "Nếu điện tích dương phân bố đều khắp nguyên tử, hạt alpha phải lệch rất ít. Thực tế: phần lớn hạt đi thẳng qua, một số lệch góc nhỏ, và khoảng một phần tám nghìn hạt bật ngược lại với góc lớn hơn 90°.",
    reveal:
      "Hạt alpha bật ngược chỉ có thể do nó gặp một điện tích dương tập trung, lớn, trong một vùng cực nhỏ. Rutherford kết luận: nguyên tử gần như trống rỗng, điện tích dương và gần như toàn bộ khối lượng tập trung ở hạt nhân có bán kính cỡ 10⁻¹⁴–10⁻¹⁵ m — bé hơn nguyên tử khoảng mười nghìn đến một trăm nghìn lần.",
    structure:
      "Hạt nhân gồm Z proton và N neutron. Số proton Z quyết định nguyên tố; tổng A = Z + N là số khối. Cùng Z nhưng khác N là các đồng vị của cùng một nguyên tố. Bán kính hạt nhân lớn dần theo A theo quy luật R ≈ 1,2·A^(1/3) fm — tăng chậm hơn nhiều so với số nucleon vì thể tích mới tỉ lệ với A.",
    challenge:
      "Vì sao chỉ khoảng một phần tám nghìn hạt alpha bật ngược, trong khi phần lớn đi thẳng qua lá vàng?",
  },
} as const;

export const B21_SCENES = [
  { id: "context", title: "Manchester, 1911" },
  { id: "setup", title: "Bố trí thí nghiệm" },
  { id: "observation", title: "Kết quả quan sát" },
  { id: "reveal", title: "Hạt nhân được phát hiện" },
  { id: "structure", title: "Từ hạt nhân đến kí hiệu" },
] as const;
