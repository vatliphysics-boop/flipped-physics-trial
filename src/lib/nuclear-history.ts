export const NUCLEAR_HISTORY = [
  {
    year: 1896, title: "Becquerel: phóng xạ tự nhiên",
    evidence: "Muối uranium làm đen kính ảnh được bọc kín ngay cả khi không được chiếu sáng.",
    conclusion: "Bức xạ phát ra từ chất, không cần ánh sáng Mặt Trời kích thích. Phân biệt phát hiện phóng xạ với phát hiện tia X.",
    question: "Quan sát nào bác bỏ giả thuyết uranium phải hấp thụ ánh sáng rồi mới phát bức xạ?",
    source: "Lawrence Berkeley National Laboratory: The Discovery of Radioactivity", url: "https://www2.lbl.gov/abc/wallchart/chapters/03/4.html",
  },
  {
    year: 1898, title: "Pierre và Marie Curie: polonium",
    evidence: "Nghiên cứu chất phóng xạ dẫn tới phát hiện nguyên tố polonium.",
    conclusion: "Phóng xạ không chỉ có ở uranium. Đây là mốc phát hiện nguyên tố, không phải năm được trao giải Nobel.",
    question: "Mốc này bổ sung điều gì so với phát hiện phóng xạ của Becquerel?",
    source: "Musée Curie: La radioactivité artificielle", url: "https://musee.curie.fr/decouvrir/exposition-permanente/visite-virtuelle/c11-la-radioactivite-artificielle",
  },
  {
    year: 1911, title: "Rutherford: mô hình hạt nhân",
    evidence: "Trong thí nghiệm tán xạ qua lá vàng, phần lớn hạt alpha đi qua, một số rất ít lệch mạnh hoặc bật ngược.",
    conclusion: "Điện tích dương và phần lớn khối lượng tập trung trong hạt nhân nhỏ. Mốc 1911 là kết luận mô hình từ bằng chứng tán xạ, không phải khám phá neutron.",
    question: "Vì sao số ít hạt alpha lệch mạnh lại quan trọng đối với mô hình nguyên tử?",
    source: "Fermilab: 1911 — Ernest Rutherford", url: "https://www.fnal.gov/pub/inquiring/timeline/03.html",
  },
  {
    year: 1932, title: "Chadwick: neutron",
    evidence: "Bức xạ từ beryllium giải phóng proton từ vật liệu chứa hydrogen; giả thuyết chỉ có photon gamma không giải thích được động học quan sát.",
    conclusion: "Neutron là thành phần không mang điện của hạt nhân. Với mô hình proton–neutron, A = Z + N; đồng vị có cùng Z nhưng khác N.",
    question: "Có thêm neutron giúp phân biệt C-12 và C-14 như thế nào?",
    source: "American Physical Society: Chadwick reports the discovery of the neutron", url: "https://www.aps.org/apsnews/2007/05/may-1932-chadwick-discovery-neutron",
  },
] as const;
