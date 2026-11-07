"use client";
/* eslint-disable @next/next/no-img-element -- Official archival scientist portraits stored locally in public/scientists/ */

import React from "react";

export type ScientistId =
  | "democritus"
  | "dalton"
  | "thomson"
  | "rutherford"
  | "bohr"
  | "schrodinger"
  | "chadwick"
  | "becquerel"
  | "curie"
  | "einstein"
  | "blackett"
  | "fermi"
  | "hahn"
  | "libby";

export interface ScientistProfile {
  id: ScientistId;
  name: string;
  years: string;
  discoveryYear: string;
  nationality: string;
  /** Các bài học SGK có nhắc trực tiếp tới nhà khoa học này */
  lessonCodes: ("B21" | "B22" | "B23" | "B24" | "B25")[];
  lessonBadge: string;
  /** Phân loại theo mục SGK */
  sectionCode: string;
  sectionTitle: string;
  sgkRef: string;
  modelName: string;
  evidence: string;
  conclusion: string;
  accentColor: string;
  photoUrl: string;
  secondaryPhotoUrl?: string;
  photoCredit: string;
  /** Vị trí căn khung ảnh chân dung chính thức */
  objectPosition?: string;
}

export const SGK_SCIENTISTS: ScientistProfile[] = [
  /* ═══ BÀI 21: CẤU TRÚC HẠT NHÂN (SGK tr. 91–95) ═══ */
  {
    id: "democritus",
    name: "Democritus",
    years: "460 – 370 TCN",
    discoveryYear: "400 TCN",
    nationality: "Triết gia Hy Lạp cổ đại",
    lessonCodes: ["B21"],
    lessonBadge: "Bài 21 · Lịch sử nguyên tử",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Lịch sử khám phá cấu trúc nguyên tử",
    sgkRef: "Lịch sử mô hình nguyên tử (Mở đầu Bài 21)",
    modelName: "Khái niệm nguyên tử bất khả phân (Atomos)",
    evidence: "Tư duy triết học tự nhiên: nếu chia nhỏ vật chất mãi sẽ tới giới hạn những hạt không thể cắt đôi được nữa.",
    conclusion: "Đề xuất vật chất cấu tạo từ các hạt cực nhỏ, đặc khít, không thể phân chia gọi là 'atomos'.",
    accentColor: "#f59e0b",
    photoUrl: "/scientists/democritus.jpg",
    photoCredit: "Tượng bán thân cổ điển (Bảo tàng Pushkin / Wikimedia Commons)",
    objectPosition: "center 18%",
  },
  {
    id: "dalton",
    name: "John Dalton",
    years: "1766 – 1844",
    discoveryYear: "1803 – 1808",
    nationality: "Nhà hoá học & vật lí học người Anh",
    lessonCodes: ["B21"],
    lessonBadge: "Bài 21 · Thuyết nguyên tử cổ điển",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Lịch sử khám phá cấu trúc nguyên tử",
    sgkRef: "Lịch sử mô hình nguyên tử trước khi tìm ra electron (B21 tr. 91)",
    modelName: "Mô hình nguyên tử quả cầu đặc đồng nhất",
    evidence: "Định luật bảo toàn khối lượng và định luật tỉ lệ bội trong các phản ứng hoá học.",
    conclusion: "Mỗi nguyên tố gồm các nguyên tử là quả cầu đặc đồng nhất, cùng khối lượng; chưa biết cấu trúc bên trong nguyên tử.",
    accentColor: "#ef4444",
    photoUrl: "/scientists/dalton.jpg",
    photoCredit: "Chân dung bởi Thomas Phillips, 1835 (National Portrait Gallery, London)",
    objectPosition: "center 18%",
  },
  {
    id: "thomson",
    name: "J.J. Thomson",
    years: "1856 – 1940",
    discoveryYear: "1897",
    nationality: "Nhà vật lí người Anh · Giải Nobel Vật lí 1906",
    lessonCodes: ["B21"],
    lessonBadge: "Bài 21 · Mục I (tr. 91)",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Thí nghiệm tán xạ & Khám phá electron",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 21, trang 91 (Hình 21.1)",
    modelName: "Phát hiện Electron & Mô hình bánh ngọt có mận khô",
    evidence: "Năm 1897, phát hiện hạt electron mang điện tích âm (-e) trong thí nghiệm phóng điện qua chất khí áp suất thấp.",
    conclusion: "Đề xuất mô hình nguyên tử giống một chiếc bánh ngọt tích điện dương đồng đều, bên trong có các hạt mận khô là các electron tích điện âm (Hình 21.1 SGK).",
    accentColor: "#ea580c",
    photoUrl: "/scientists/thomson.jpg",
    photoCredit: "Ảnh lưu trữ Cavendish Laboratory / Nobel Foundation",
    objectPosition: "center 20%",
  },
  {
    id: "rutherford",
    name: "Ernest Rutherford",
    years: "1871 – 1937",
    discoveryYear: "1911 (B21) & 1919 (B22)",
    nationality: "Nhà vật lí người New Zealand / Anh · Giải Nobel 1908",
    lessonCodes: ["B21", "B22"],
    lessonBadge: "Bài 21 (tr. 91–92) & Bài 22 (tr. 96)",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Tán xạ hạt alpha (B21) & Phản ứng hạt nhân đầu tiên (B22)",
    sgkRef: "SGK Bài 21 tr. 91–92 (Hình 21.2–21.5a) & Bài 22 tr. 96 (Hình 22.1)",
    modelName: "Khám phá Hạt nhân nguyên tử (1911) & Phản ứng hạt nhân đầu tiên (1919)",
    evidence: "Bài 21 (1911): Thí nghiệm tán xạ hạt α qua lá vàng mỏng (4·10⁻⁷ m) — đa số hạt đi thẳng, một tỉ lệ rất nhỏ (~10⁻⁴) bật ngược. Bài 22 (1919): Dùng nguồn ²¹⁰Po bắn hạt α vào khí Nitrogen.",
    conclusion: "Bài 21: Nguyên tử rỗng, ở tâm có hạt nhân mang điện dương kích thước rất nhỏ (~10⁻¹⁴ m) tập trung gần hết khối lượng (mẫu hành tinh nguyên tử Hình 21.5a). Bài 22: Thực hiện phản ứng hạt nhân nhân tạo đầu tiên ⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁H.",
    accentColor: "#0284c7",
    photoUrl: "/scientists/rutherford.jpg",
    photoCredit: "Library of Congress / Bain News Service Archival Portrait",
    objectPosition: "center 18%",
  },
  {
    id: "bohr",
    name: "Niels Bohr",
    years: "1885 – 1962",
    discoveryYear: "1913",
    nationality: "Nhà vật lí người Đan Mạch · Giải Nobel Vật lí 1922",
    lessonCodes: ["B21"],
    lessonBadge: "Bài 21 · Em có biết (tr. 93)",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Mẫu hành tinh nguyên tử & Quỹ đạo dừng",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 21, trang 93 (Mục Em có biết)",
    modelName: "Mẫu nguyên tử Bohr & Quỹ đạo dừng lượng tử",
    evidence: "Vận dụng thuyết lượng tử ánh sáng để khắc phục hạn chế của mẫu hành tinh nguyên tử Rutherford và giải thích quang phổ vạch nguyên tử Hydrogen.",
    conclusion: "Electron chuyển động quanh hạt nhân trên những quỹ đạo dừng có bán kính và năng lượng xác định mà không bức xạ năng lượng; chỉ phát hoặc hấp thụ photon khi chuyển giữa các quỹ đạo dừng.",
    accentColor: "#059669",
    photoUrl: "/scientists/bohr.jpg",
    photoCredit: "Ảnh chân dung chính thức Nobel Foundation, 1922",
    objectPosition: "center 18%",
  },
  {
    id: "schrodinger",
    name: "Erwin Schrödinger",
    years: "1887 – 1961",
    discoveryYear: "1926",
    nationality: "Nhà vật lí người Áo · Giải Nobel Vật lí 1933",
    lessonCodes: ["B21"],
    lessonBadge: "Bài 21 · Hình 21.5b & Em có biết (tr. 92–93)",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Mô hình hiện đại đám mây điện tử",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 21, trang 92–93 (Hình 21.5b)",
    modelName: "Mô hình nguyên tử hiện đại (Mô hình đám mây điện tử)",
    evidence: "Xây dựng phương trình sóng cơ học lượng tử mô tả trạng thái chuyển động của electron trong nguyên tử.",
    conclusion: "Các electron chuyển động rất nhanh xung quanh hạt nhân không theo những quỹ đạo cố định mà tạo thành một đám mây xác suất gọi là đám mây điện tử (Hình 21.5b SGK).",
    accentColor: "#7c3aed",
    photoUrl: "/scientists/schrodinger.jpg",
    photoCredit: "Ảnh chân dung chính thức Nobel Foundation, 1933",
    objectPosition: "center 18%",
  },
  {
    id: "chadwick",
    name: "James Chadwick",
    years: "1891 – 1974",
    discoveryYear: "1932",
    nationality: "Nhà vật lí người Anh · Giải Nobel Vật lí 1935",
    lessonCodes: ["B21"],
    lessonBadge: "Bài 21 · Mục II.1 (tr. 93)",
    sectionCode: "Mục II",
    sectionTitle: "Mục II: Cấu tạo hạt nhân & Khám phá Neutron",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 21, trang 93 (Mục II.1 & Hình 21.6)",
    modelName: "Tìm ra hạt Neutron — Hoàn thiện cấu tạo hạt nhân (Proton & Neutron)",
    evidence: "Năm 1932, dùng hạt α bắn phá Beryllium phát hiện ra hạt trung hoà về điện trong hạt nhân có khối lượng xấp xỉ hạt proton.",
    conclusion: "Chứng minh hạt nhân được tạo thành bởi hai loại hạt là proton (+e) và neutron (q = 0), gọi chung là nucleon; tổng số nucleon là số khối A = Z + N.",
    accentColor: "#16a34a",
    photoUrl: "/scientists/chadwick.jpg",
    photoCredit: "Ảnh chân dung lưu trữ chính thức Nobel Foundation / Los Alamos",
    objectPosition: "center 12%",
  },

  /* ═══ BÀI 22: NĂNG LƯỢNG LIÊN KẾT CỦA HẠT NHÂN. PHẢN ỨNG HẠT NHÂN (SGK tr. 96–103) ═══ */
  {
    id: "blackett",
    name: "Patrick Blackett",
    years: "1897 – 1974",
    discoveryYear: "1925",
    nationality: "Nhà vật lí người Anh · Giải Nobel Vật lí 1948",
    lessonCodes: ["B22"],
    lessonBadge: "Bài 22 · Mục I (tr. 96–97)",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Phản ứng hạt nhân & Hai định luật bảo toàn",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 22, trang 96–97 (Hình 22.2)",
    modelName: "Chụp ảnh vết phản ứng hạt nhân trong Buồng sương (Hình 22.2)",
    evidence: "Dùng buồng sương chứa khí Nitrogen chụp ảnh đường đi của các hạt alpha (α) và ghi nhận trực tiếp 8 sự kiện vết hạt α rẽ thành hai nhánh sau va chạm.",
    conclusion: "Cung cấp bằng chứng hình ảnh trực tiếp cho phản ứng hạt nhân ⁴₂He + ¹⁴₇N → ¹⁷₈O + ¹₁H: một vết dài, mảnh của hạt proton (¹₁H) và một vết ngắn, đậm của hạt nhân ¹⁷₈O.",
    accentColor: "#0284c7",
    photoUrl: "/scientists/blackett.jpg",
    photoCredit: "Ảnh chân dung chính thức Nobel Foundation, 1948",
    objectPosition: "center 15%",
  },
  {
    id: "einstein",
    name: "Albert Einstein",
    years: "1879 – 1955",
    discoveryYear: "1905",
    nationality: "Nhà vật lí lí thuyết người Đức / Mỹ · Giải Nobel Vật lí 1921",
    lessonCodes: ["B22"],
    lessonBadge: "Bài 22 · Mục II.3 (tr. 99)",
    sectionCode: "Mục II",
    sectionTitle: "Mục II: Năng lượng liên kết & Độ hụt khối",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 22, trang 99 (Công thức 22.3 & 22.4)",
    modelName: "Hệ thức liên hệ Năng lượng – Khối lượng E = mc²",
    evidence: "Thuyết tương đối hẹp chứng minh một vật có khối lượng m thì cũng có năng lượng tương ứng E và ngược lại: E = mc² (Công thức 22.3 SGK).",
    conclusion: "Giải thích nguồn gốc năng lượng liên kết hạt nhân từ độ hụt khối: E_lk = Δm·c² = [Z·m_p + (A−Z)·m_n − m_X]·c² (Công thức 22.4 SGK), với 1 amu·c² ≈ 931,5 MeV.",
    accentColor: "#2563eb",
    photoUrl: "/scientists/einstein.jpg",
    photoCredit: "Chân dung bởi Orren Jack Turner, Princeton, 1947",
    objectPosition: "center 20%",
  },
  {
    id: "hahn",
    name: "Otto Hahn & Lise Meitner",
    years: "1879–1968 & 1878–1968",
    discoveryYear: "1938",
    nationality: "Nhà hoá học & vật lí người Đức / Áo · Giải Nobel 1944",
    lessonCodes: ["B22", "B24"],
    lessonBadge: "Bài 22 (tr. 100) & Bài 24 (tr. 114)",
    sectionCode: "Mục III",
    sectionTitle: "Mục III: Phản ứng phân hạch & Nhiệt hạch",
    sgkRef: "SGK Bài 22 tr. 100–101 (Phân hạch ²³⁵U) & Bài 24 tr. 114",
    modelName: "Khám phá Hiện tượng Phân hạch hạt nhân Uranium (1938)",
    evidence: "Bắn phá Uranium bằng neutron chậm và phát hiện ra Barium (Z=56) trong sản phẩm — chứng minh hạt nhân nặng ²³⁵U đã vỡ thành các hạt nhân trung bình kèm 2–3 neutron thứ cấp và giải phóng ~200 MeV.",
    conclusion: "Đặt cơ sở vật lí nền tảng cho phản ứng dây chuyền và năng lượng của nhà máy điện nguyên tử hiện đại.",
    accentColor: "#dc2626",
    photoUrl: "/scientists/hahn.jpg",
    secondaryPhotoUrl: "/scientists/meitner.jpg",
    photoCredit: "Nobel Foundation / Austrian Academy of Sciences Archival Portrait",
    objectPosition: "center 18%",
  },

  /* ═══ BÀI 23: HIỆN TƯỢNG PHÓNG XẠ (SGK tr. 104–112) ═══ */
  {
    id: "becquerel",
    name: "Henri Becquerel",
    years: "1852 – 1908",
    discoveryYear: "1896",
    nationality: "Nhà vật lí người Pháp · Giải Nobel Vật lí 1903",
    lessonCodes: ["B22", "B23", "B25"],
    lessonBadge: "Bài 23 (tr. 104, 108) & Bài 25",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Khám phá hiện tượng phóng xạ tự nhiên",
    sgkRef: "SGK Bài 23 tr. 104, tr. 108 (Đơn vị Becquerel - Bq)",
    modelName: "Phát hiện hiện tượng Phóng xạ tự nhiên (Đơn vị SI: Becquerel - Bq)",
    evidence: "Năm 1896, phát hiện muối Uranium bọc kín trong giấy đen để trong tối vẫn tự phát ra tia bức xạ không nhìn thấy làm đen kính ảnh và in rõ hình chữ thập bằng đồng (Mở đầu Bài 23 tr. 104).",
    conclusion: "Mở đầu kỉ nguyên Vật lí hạt nhân: chứng minh hạt nhân không bền tự phát phân rã không phụ thuộc tác động bên ngoài. Tên ông được đặt cho đơn vị độ phóng xạ trong hệ SI: Becquerel (1 Bq = 1 phân rã/giây, SGK tr. 108).",
    accentColor: "#d97706",
    photoUrl: "/scientists/becquerel.jpg",
    photoCredit: "Chân dung nhiếp ảnh bởi Paul Nadar (Bibliothèque nationale de France)",
    objectPosition: "center 18%",
  },
  {
    id: "curie",
    name: "Marie Curie & Pierre Curie",
    years: "1867–1934 & 1859–1906",
    discoveryYear: "1898",
    nationality: "Nhà vật lí & hoá học người Ba Lan / Pháp · Giải Nobel 1903, 1911",
    lessonCodes: ["B23", "B25"],
    lessonBadge: "Bài 23 · Mục II.2 (tr. 108) & Bài 25",
    sectionCode: "Mục II",
    sectionTitle: "Mục II: Định luật phóng xạ & Đơn vị Curie (Ci)",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 23, trang 108 (Đơn vị Curie - Ci)",
    modelName: "Khám phá Polonium, Radium & Đơn vị độ phóng xạ Curie (Ci)",
    evidence: "Nghiên cứu sâu rộng các hợp chất phóng xạ từ quặng Uranium, phát hiện hai nguyên tố phóng xạ mới là Polonium (Po) và Radium (²²⁶₈₈Ra) năm 1898.",
    conclusion: "Đặt nền móng cho ngành phóng xạ học hiện đại. Để vinh danh hai ông bà, đơn vị độ phóng xạ thực tế được đặt tên là Curie: 1 Ci = 3,7·10¹⁰ Bq (tương đương độ phóng xạ của 1 gam ²²⁶₈₈Ra, SGK tr. 108).",
    accentColor: "#be185d",
    photoUrl: "/scientists/curie.jpg",
    secondaryPhotoUrl: "/scientists/pierre_curie.jpg",
    photoCredit: "Ảnh chân dung lưu trữ Nobel Foundation / Musée Curie, Paris",
    objectPosition: "center 18%",
  },

  /* ═══ BÀI 24: CÔNG NGHỆ HẠT NHÂN VÀ NGUYÊN TẮC AN TOÀN (SGK tr. 113–119) ═══ */
  {
    id: "fermi",
    name: "Enrico Fermi",
    years: "1901 – 1954",
    discoveryYear: "1942",
    nationality: "Nhà vật lí người Ý / Mỹ · Giải Nobel Vật lí 1938",
    lessonCodes: ["B24"],
    lessonBadge: "Bài 24 · Mục I (tr. 114–115)",
    sectionCode: "Mục I",
    sectionTitle: "Mục I: Lò phản ứng hạt nhân & Nhà máy điện hạt nhân",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 24, trang 114–115 (Hình 24.1 & 24.2)",
    modelName: "Lò phản ứng hạt nhân đầu tiên (Chicago Pile-1) & Thanh điều khiển neutron",
    evidence: "Năm 1942 tại Đại học Chicago, thiết kế và điều hành thành công lò phản ứng hạt nhân nhân tạo đầu tiên trên thế giới (Chicago Pile-1), dùng thanh Cadmium hấp thụ neutron để kiểm soát phản ứng phân hạch dây chuyền.",
    conclusion: "Khởi đầu kỉ nguyên điện hạt nhân. Chứng minh có thể duy trì phản ứng phân hạch dây chuyền ở trạng thái tới hạn an toàn (k = 1) để khai thác nhiệt năng phát điện.",
    accentColor: "#0f766e",
    photoUrl: "/scientists/fermi.jpg",
    photoCredit: "Archival portrait, Los Alamos National Laboratory / Wikimedia Commons",
    objectPosition: "center 18%",
  },
  {
    id: "libby",
    name: "Willard Libby",
    years: "1908 – 1980",
    discoveryYear: "1946",
    nationality: "Nhà hoá học người Mỹ · Giải Nobel Hoá học 1960",
    lessonCodes: ["B24"],
    lessonBadge: "Bài 24 · Mục II.4 (tr. 119)",
    sectionCode: "Mục II",
    sectionTitle: "Mục II: Ứng dụng phóng xạ & Định tuổi cổ vật bằng Carbon-14",
    sgkRef: "SGK Vật lí 12 KNTT — Bài 24, trang 119 (Mục Khảo cổ học)",
    modelName: "Phát minh Phương pháp định tuổi bằng đồng vị phóng xạ Carbon-14",
    evidence: "Năm 1946, phát hiện tỉ lệ đồng vị ¹⁴₆C / ¹²₆C trong cơ thể sinh vật sống không đổi do trao đổi chất; khi sinh vật chết, quá trình hấp thụ ngừng lại và ¹⁴₆C phân rã theo chu kì T = 5730 năm.",
    conclusion: "Phương pháp định tuổi đồng vị phóng xạ giúp xác định chính xác niên đại của các di chỉ khảo cổ, cổ vật và hoá thạch có tuổi lên tới 50.000 năm (SGK tr. 119).",
    accentColor: "#6d28d9",
    photoUrl: "/scientists/libby.jpg",
    photoCredit: "Chân dung bởi Willy Pragher, 1974 / Wikimedia Commons",
    objectPosition: "center 18%",
  },
];

/**
 * Trả về đúng danh sách các nhà khoa học được nhắc tới trong bài học SGK tương ứng.
 */
export function getScientistsByLesson(lessonCode: string): ScientistProfile[] {
  const normalized = lessonCode.toUpperCase();
  if (normalized === "ALL" || normalized === "SCIENTISTS") {
    return SGK_SCIENTISTS;
  }
  return SGK_SCIENTISTS.filter((s) =>
    s.lessonCodes.includes(normalized as "B21" | "B22" | "B23" | "B24" | "B25")
  );
}

/**
 * Hiển thị ảnh chân dung lịch sử chính thức (Official Archival Photograph) của nhà khoa học.
 */
export function ScientistPortraitBust({
  id,
  size = 92,
  accentColor = "#38bdf8",
}: {
  id: ScientistId;
  size?: number;
  accentColor?: string;
}) {
  const profile = SGK_SCIENTISTS.find((s) => s.id === id);
  const photoUrl = profile?.photoUrl ?? `/scientists/${id}.jpg`;
  const secondaryPhotoUrl = profile?.secondaryPhotoUrl;

  if (secondaryPhotoUrl) {
    // Dual official portraits for Marie Curie & Pierre Curie
    return (
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexShrink: 0,
        }}
        title={profile?.photoCredit}
      >
        {[
          { src: photoUrl, alt: "Chân dung chính thức Marie Curie" },
          { src: secondaryPhotoUrl, alt: "Chân dung chính thức Pierre Curie" },
        ].map((img) => (
          <div
            key={img.src}
            style={{
              width: `${Math.round(size * 0.72)}px`,
              height: `${Math.round(size * 1.08)}px`,
              borderRadius: "12px",
              overflow: "hidden",
              border: `2px solid ${accentColor}`,
              boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
              background: "#0f172a",
              position: "relative",
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 18%",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${Math.round(size * 1.16)}px`,
        borderRadius: "14px",
        overflow: "hidden",
        border: `2px solid ${accentColor}`,
        boxShadow: "0 8px 18px rgba(0,0,0,0.45)",
        background: "#0f172a",
        flexShrink: 0,
        position: "relative",
      }}
      title={profile?.photoCredit}
    >
      <img
        src={photoUrl}
        alt={`Ảnh chân dung chính thức ${profile?.name ?? id}`}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: profile?.objectPosition ?? "center 18%",
          display: "block",
        }}
      />
    </div>
  );
}
