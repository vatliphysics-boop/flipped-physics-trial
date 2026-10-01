# Đối chiếu học liệu số Vật lí 12 - Kết nối tri thức

Tài liệu này đối chiếu các yêu cầu cần đạt của Bộ GD&ĐT, nội dung SGK Vật lí 12 Kết nối tri thức với cuộc sống và kế hoạch xây dựng học liệu trên website lớp học đảo ngược. Phạm vi xây dựng học liệu hoàn chỉnh (mô phỏng, worksheet, database lesson) tập trung vào Chương IV (B21-B25). Các chương I-III được liệt kê danh mục để có cái nhìn tổng quan.

## I. Yêu cầu chung và đường hướng
- **Nguồn:** SGK Vật lí 12 KNTT; Chương trình GDPT môn Vật lí 2018 (Thông tư 32/2018/TT-BGDĐT).
- **Mục tiêu:** Tạo trải nghiệm khám phá dựa trên bằng chứng (thí nghiệm, số liệu).
- **Cấu trúc:** Mỗi bài chia thành 3 pha: Before Class, In Class, After Class. Mỗi hoạt động thiết kế theo chu trình: Dự đoán → Quan sát/Thao tác → Ghi nhận bằng chứng → Giải thích → Kết luận.

---

## II. Danh mục thí nghiệm/hoạt động Chương I - III (Tổng quan)

### Chương I: Vật lí nhiệt
- **Bài 1:** Thí nghiệm đun nóng nước đá (khảo sát sự chuyển thể).
- **Bài 2:** Thang nhiệt độ Celsius và Kelvin (hoạt động đổi nhiệt độ).
- **Bài 3:** Nội năng. Thí nghiệm ma sát làm tăng nội năng.
- **Bài 4:** Nhiệt dung riêng. Thực hành đo nhiệt dung riêng của nước (Hình 4.2).
- **Bài 5:** Nhiệt nóng chảy riêng. Thực hành đo nhiệt nóng chảy riêng của nước đá.
- **Bài 6:** Nhiệt hóa hơi riêng. Thực hành đo nhiệt hóa hơi riêng của nước.

### Chương II: Khí lí tưởng
- **Bài 7:** Thí nghiệm mô hình động học phân tử chất khí.
- **Bài 8:** Định luật Boyle. Thí nghiệm nén khí đẳng nhiệt.
- **Bài 9:** Định luật Charles. Thí nghiệm đun nóng khí đẳng áp.
- **Bài 10:** Định luật Gay-Lussac. Thí nghiệm đun nóng khí đẳng tích. Phương trình trạng thái.

### Chương III: Từ trường
- **Bài 12:** Từ trường, đường sức từ. Thí nghiệm mạt sắt.
- **Bài 13:** Lực từ. Thí nghiệm dây dẫn mang dòng điện trong từ trường.
- **Bài 14:** Cảm ứng từ. Thí nghiệm đo cảm ứng từ.

*(Chương I-III hiện tại chỉ lên danh mục, chưa triển khai học liệu tương tác hoàn chỉnh).*

---

## III. Ma trận đối chiếu chi tiết Chương IV (B21 - B25)

### Bài 21: Cấu trúc hạt nhân
| Trang SGK | Hình/Bảng/Thí nghiệm | Học sinh quan sát/thao tác | Kết luận cần rút ra | Yêu cầu GD&ĐT | Học liệu số / Route thực tế | Đã đối chiếu SGK | Đã nối vào code | Đã kiểm thử trên giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 91-92 | **Hình 21.3:** Tán xạ hạt $\alpha$ Rutherford | Chạy mô phỏng bắn $\alpha$ qua lá vàng. | Nguyên tử rỗng; hạt nhân siêu nhỏ mang điện dương. | Rút ra sự tồn tại và kích thước hạt nhân. | `RutherfordActivity` <br> `/student/lessons/b21/in-class` | Đạt | Đạt | Chưa |
| 94-95 | **Bảng 21.1:** Kích thước nguyên tử/hạt nhân | Kéo thả số p, n để xây dựng đồng vị. | Cấu tạo (p, n); Kí hiệu $^{A}_{Z}X$; Đồng vị. | Cấu tạo hạt nhân, kí hiệu hạt nhân. | `IsotopeActivity`, `NuclearBuilder` <br> `/student/lessons/b21/in-class` | Đạt | Đạt | Chưa |

### Bài 22: Phản ứng hạt nhân và năng lượng liên kết
| Trang SGK | Hình/Bảng/Thí nghiệm | Học sinh quan sát/thao tác | Kết luận cần rút ra | Yêu cầu GD&ĐT | Học liệu số / Route thực tế | Đã đối chiếu SGK | Đã nối vào code | Đã kiểm thử trên giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 96-97 | **Hình 22.2:** Buồng sương Blackett | Phân tích vết buồng sương, cân bằng pt. | Biến đổi hạt nhân nhân tạo. Bảo toàn A, Z. | Viết phương trình phản ứng hạt nhân. | `NuclearReactionBalancer` <br> `/student/lessons/b22/in-class` | Đạt | Đạt | Chưa |
| 100 | **Hình 22.5:** Đồ thị phân bố $E_{lkr}$ theo A | Khảo sát đồ thị, quan sát $E_{lkr}$. | Hạt nhân có $E_{lkr}$ lớn càng bền. | Đánh giá độ bền dựa vào $E_{lkr}$. | `BindingEnergyLab` <br> `/student/lessons/b22/in-class` | Đạt | Đạt | Chưa |
| 101-103| **Hình 22.6, 22.7:** Phân hạch U-235 | Kích hoạt chuỗi phân hạch, đếm neutron. | Cơ chế nhân số neutron, khối lượng tới hạn. | Nhận biết phản ứng phân hạch, tổng hợp. | `NuclearFission`, `NuclearFusion` <br> `/student/lessons/b22/in-class` | Đạt | Đạt | Chưa |

### Bài 23: Hiện tượng phóng xạ
| Trang SGK | Hình/Bảng/Thí nghiệm | Học sinh quan sát/thao tác | Kết luận cần rút ra | Yêu cầu GD&ĐT | Học liệu số / Route thực tế | Đã đối chiếu SGK | Đã nối vào code | Đã kiểm thử trên giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 105 | **Bảng 23.1, Hình 23.2:** Đếm tia Geiger | Đếm xung Geiger ngẫu nhiên. | Sự phân rã là tự phát và ngẫu nhiên. | Giải thích tính ngẫu nhiên của phóng xạ. | `GeigerRandomDecay` <br> `/student/lessons/b23/in-class` | Đạt | Đạt | Chưa |
| 105-106| **Hình 23.3, 23.4:** Tia qua vật cản, từ trường | Chọn loại tia và vật cản. | Bản chất $\alpha, \beta, \gamma$. Độ đâm xuyên. | Bản chất và tính chất các loại tia. | `RadiationProperties` <br> `/student/lessons/b23/in-class` | Đạt | Đạt | Chưa |
| 107 | **Hình 23.5:** Đồ thị định luật phóng xạ | Điều chỉnh thanh trượt thời gian t. | Hàm mũ giảm dần: $N = N_0 2^{-t/T}$. | Nêu $H = \lambda N$, tính thời gian phân rã. | `RadioactiveDecayHalfLife` <br> `/student/lessons/b23/in-class` | Đạt | Đạt | Chưa |
| 109 | **Hình 23.6:** Đồng vị C-14 định tuổi | Vận dụng tính tuổi mẫu khảo cổ. | Cách định tuổi bằng C-14 thực tế. | Vận dụng kiến thức vào thực tiễn. | `Carbon14Dating` <br> `/student/lessons/b23/in-class` | Đạt | Đạt | Chưa |
| 110-113| **Hình 23.7 - 23.13:** Cảnh báo và an toàn | Phân tích tình huống phơi nhiễm. | Khoảng cách, Thời gian, Che chắn. | Nêu nguyên tắc an toàn, nhận biết biển báo. | `RadiationSafety` <br> `/student/lessons/b23/in-class` | Đạt | Đạt | Chưa |

### Bài 24: Công nghiệp hạt nhân
| Trang SGK | Hình/Bảng/Thí nghiệm | Học sinh quan sát/thao tác | Kết luận cần rút ra | Yêu cầu GD&ĐT | Học liệu số / Route thực tế | Đã đối chiếu SGK | Đã nối vào code | Đã kiểm thử trên giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 114-115| **Hình 24.1, 24.3:** Lò phản ứng hạt nhân | Điều chỉnh thanh điều khiển xem k. | Cấu tạo lò, duy trì $k \approx 1$. | Đánh giá ứng dụng đồng vị phóng xạ. | `NuclearPowerEnergyFlow`, `ReactorControl` <br> `/student/lessons/b24/in-class` | Đạt | Đạt | Chưa |
| 116-117| **Hình 24.4:** Y học hạt nhân | So sánh cơ chế PET, SPECT, xạ trị. | Ứng dụng quan trọng chẩn đoán, điều trị. | Nêu ứng dụng y học hạt nhân. | `NuclearMedicine` <br> `/student/lessons/b24/in-class` | Đạt | Đạt | Chưa |
| 117-118| **Hình 24.5:** Chiếu xạ thực phẩm | Đánh giá ưu nhược điểm chiếu xạ. | Vai trò công nghệ bức xạ trong kinh tế. | Nêu ứng dụng nông nghiệp, công nghiệp. | `RadiationApplications` <br> `/student/lessons/b24/in-class` | Đạt | Đạt | Chưa |

### Bài 25: Bài tập về vật lí hạt nhân
| Trang SGK | Hình/Bảng/Thí nghiệm | Học sinh quan sát/thao tác | Kết luận cần rút ra | Yêu cầu GD&ĐT | Học liệu số / Route thực tế | Đã đối chiếu SGK | Đã nối vào code | Đã kiểm thử trên giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 119-120| Bài ví dụ 1, 2, 3 (Tĩnh điện kế, Xạ trị) | Xem hướng dẫn giải, áp dụng công thức. | Nắm phương pháp giải bài toán liên bài. | (Vận dụng kiến thức toàn chương). | Catalog `catalog-b25.ts` <br> `/student/lessons/b25/in-class` | Đạt | Đạt | Chưa |
| 121 | **Bảng 25.1:** Đồ thị phân rã H(t) | Vẽ và khớp đường cong lý thuyết. | Đường $H(t)$ hàm mũ. Tính $T$ từ đồ thị. | (Kĩ năng thực hành, xử lí số liệu). | `DecayGraphLab` <br> `/student/lessons/b25/in-class` | Đạt | Đạt | Chưa |
| 121-122| Bài tập 1-6 SGK | Luyện tập các kĩ năng, cân bằng pt. | Tư duy giải quyết vấn đề. | (Kiểm tra đánh giá). | `NuclearEquationBalancer`, `BindingEnergyCalculator` <br> `/student/lessons/b25/in-class` | Đạt | Đạt | Chưa |
