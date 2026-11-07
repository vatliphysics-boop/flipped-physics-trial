import videoMetadata from "@/data/nuclear-video-metadata.json";

export const NUCLEAR_VIDEO_METADATA = videoMetadata;

export const NUCLEAR_LAB_PATH = "/hoc-lieu/phong-hat-nhan";

export const NUCLEAR_LAB_LESSONS = [
  {
    code: "B21", title: "Cấu trúc hạt nhân", pages: "91–95", isotopeId: "C12", isotopeLabel: "Carbon-12",
    question: "Vì sao chùm alpha đi gần tâm lại lệch nhiều hơn chùm đi xa tâm?",
    observation: "Xoay mô hình carbon-12, chọn một proton và một neutron. Đọc Z và N, rồi giải thích vì sao A vẫn bằng 12 khi bật cắt lớp.",
    videoTask: "Ghi hai điều kiện tán xạ, so sánh góc lệch và giải thích bằng tương tác điện. Nêu một giới hạn của mô hình. Cấu trúc và đồng vị ở phần bổ trợ giúp đọc Z, N, A.",
  },
  {
    code: "B22", title: "Phản ứng hạt nhân và năng lượng liên kết", pages: "96–103", isotopeId: "He4", isotopeLabel: "Helium-4",
    question: "Cần kiểm tra những đại lượng nào trước khi chấp nhận một phương trình hạt nhân?",
    observation: "Đếm proton và neutron trong helium-4. Dùng Z và A của hạt nhân này để kiểm tra tổng điện tích và tổng số nucleon ở vế sản phẩm trong phản ứng D–T.",
    videoTask: "Theo dõi trước, tương tác và sau phân hạch. Kiểm tra tổng A, Z và giải thích Q từ chênh lệch khối lượng; so sánh có và không có neutron tới trong mô hình.",
  },
  {
    code: "B23", title: "Hiện tượng phóng xạ", pages: "104–113", isotopeId: "U238", isotopeLabel: "Uranium-238",
    question: "Ta có thể dự đoán cả mẫu phân rã mà không biết lúc nào từng hạt nhân phân rã không?",
    observation: "Đọc A, Z của uranium-238 rồi tính A, Z của hạt nhân con nếu phát ra hạt alpha. So sánh với mô hình helium-4 của B22.",
    videoTask: "So sánh hai chu kì bán rã tại cùng thời điểm; ghi N₀, T và seed. Phân biệt số hạt còn lại của lượt ngẫu nhiên, số ghi nhận trong khoảng đo và giá trị kì vọng.",
  },
  {
    code: "B24", title: "Công nghiệp hạt nhân", pages: "114–118", isotopeId: "U235", isotopeLabel: "Uranium-235",
    question: "Thanh điều khiển tác động lên mắt xích nào trong phản ứng dây chuyền?",
    observation: "So sánh Z, N của uranium-235 với uranium-238. Viết A, Z của hệ gồm một uranium-235 và một neutron trước phân hạch.",
    videoTask: "Vẽ sơ đồ chuyển hóa năng lượng từ phân hạch tới điện. Ghi vào sơ đồ nơi thanh điều khiển hấp thụ neutron và nơi hơi làm quay tua-bin.",
  },
  {
    code: "B25", title: "Bài tập về vật lí hạt nhân", pages: "119–122", isotopeId: "C14", isotopeLabel: "Carbon-14",
    question: "Từ đồ thị độ phóng xạ, em sẽ đọc chu kì bán rã bằng hai mốc nào?",
    observation: "So sánh carbon-14 với carbon-12. Giải thích số proton giống nhau và dùng số neutron để phân biệt hai đồng vị.",
    videoTask: "Đọc Bảng 25.1, tìm mức bằng một nửa độ phóng xạ ban đầu và xác định hai mốc thời gian kẹp giá trị đó. Nêu vì sao kết quả từ đồ thị là ước lượng.",
  },
] as const;

export type NuclearLabLesson = (typeof NUCLEAR_LAB_LESSONS)[number];

export function nuclearLabUrl(code: NuclearLabLesson["code"], target?: "mo-hinh" | "video") {
  return `${NUCLEAR_LAB_PATH}?bai=${code}${target ? `#${target}` : ""}`;
}

export function nuclearVideoUrl(code: NuclearLabLesson["code"]) {
  return `/videos/nuclear-lessons/${code.toLowerCase()}.mp4`;
}
