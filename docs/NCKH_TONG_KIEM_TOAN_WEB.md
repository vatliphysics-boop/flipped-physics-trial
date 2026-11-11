# Tổng kiểm toán NCKH — Website Vật lí Hạt nhân 12

Ngày kiểm toán: 08/11/2026. Phạm vi: Đợt 1 — xác lập tài liệu gốc, đối chiếu yêu cầu nghiên cứu với chức năng website, rà soát cấu trúc điều hướng.

## 1. Tài liệu gốc đã xác lập

| Tài liệu | Vị trí | Trạng thái |
|---|---|---|
| Thuyết minh đề tài (bản đã sửa, 04/09/2026) | `ĐÃ SỬA - NCKH.docx` (shortcut: `00_NCKH_BAT_DAU/01_THUYET_MINH_VA_PHAN_BIEN/Thuyet_minh_de_tai.docx`) | Tìm thấy, đã đọc |
| Đề cương nghiên cứu hoàn chỉnh | `DE_CUONG_NGHIEN_CUU_HOAN_CHINH.docx` | Tìm thấy, đã đọc mục lục và mục tiêu |
| Bản thảo bài báo | `BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx` | Tìm thấy, đã đọc mục lục |
| Khung báo cáo tổng kết | `OK Đề tài NCKH Khôi-Phương-Thy.docx` | Tìm thấy, đã đọc mục lục |
| Báo cáo đối chiếu + lộ trình (08/11/2026) | `00_NCKH_BAT_DAU/BAO_CAO_DOI_CHIEU_VA_LO_TRINH.md` | Tìm thấy, đã đọc toàn bộ |
| Phiếu phản biện ĐT_06 - NX (TS. Lê Minh Thành Châu) | Được trích dẫn trong báo cáo đối chiếu; bản PDF gốc trỏ link ngoài repo | CHƯA TÌM THẤY bản gốc trong repo (chỉ có tóm tắt 2 yêu cầu chỉnh sửa) |
| Bộ tài liệu tiếp thu phản biện, phiếu kiểm định AI, khảo sát GV/HS | `00_NCKH_BAT_DAU/06_TRIEN_KHAI_GOP_Y/` | Tìm thấy |
| Bảng đối chiếu SGK–đề cương–website | `docs/SGK_RESEARCH_WEB_MATRIX.md` | Tìm thấy |
| Báo cáo kiểm định kĩ thuật | `docs/AI_PROJECT_HANDOFF.md`, `docs/PHYSICS_PROCESS_VERIFICATION.md`, `docs/NARRATED_VIDEO_VERIFICATION.md`, `docs/NUCLEAR_SCIENCE_SOURCES.md` | Tìm thấy |
| SGK Vật lí 12 KNTT, sách bài tập | `Sachgiaokhoavl12vlhn/`, `public/learning/SGK-chuong-IV.pdf` | Tìm thấy |
| Chương trình GDPT 2018 môn Vật lí | `public/learning/physics-curriculum-2018.pdf` | Tìm thấy |
| Kế hoạch bài dạy mẫu (Word) | `docs/worksheets/B23-ke-hoach-bai-day.docx`, `B23-huong-dan-giao-vien.docx`, `B21-phieu-hoc-sinh.docx` | Tìm thấy |
| Nhận xét riêng của PGS.TS. Nguyễn Thị Nhị về từng chức năng | — | CHƯA TÌM THẤY. Chỉ có tên GVHD trong thuyết minh. Mọi nhận định "theo cô Nhị" phải ghi CẦN XÁC NHẬN VỚI GIẢNG VIÊN HƯỚNG DẪN |

## 2. Bảng đối chiếu: Yêu cầu nghiên cứu → Nguồn → Chức năng website → Trạng thái

| # | Yêu cầu nghiên cứu | Nguồn tài liệu | Chức năng website | Trạng thái | Lỗi/sai khác | Hướng xử lí |
|---|---|---|---|---|---|---|
| 1 | Hệ thống hóa cơ sở lí luận (học liệu số, AI, lớp học đảo ngược, năng lực tự học) | Đề cương mục 1.1–1.6 | Trang `/gioi-thieu`, `/hoc-lieu/lop-hoc-dao-nguoc` | Phù hợp nhưng cần cải thiện | Lí luận nằm trong đề cương, website chỉ trình bày tóm tắt — đúng vai trò | Không cần thêm; liên kết về hồ sơ nghiên cứu khi có không gian nghiên cứu |
| 2 | Khảo sát thực trạng (20–30 GV, 150–250 HS) | Thuyết minh mục 12.3; phiếu khảo sát trong `06_TRIEN_KHAI_GOP_Y` | Chưa có chức năng thu/nhập khảo sát trên web | Chưa phù hợp (thiếu) | Khảo sát định làm ngoài web bằng phiếu Word | Đợt sau: cân nhắc trang nhập liệu khảo sát cho nhóm nghiên cứu, hoặc ghi rõ khảo sát làm offline |
| 3 | Khung năng lực tự học + bộ chỉ báo đánh giá | Đề cương mục 1.2, nhiệm vụ 3 | Rubric trước giờ trong báo cáo đối chiếu; `EVIDENCE_PROMPTS` 3 mục/bước trong `src/lib/nuclear-learning-sequence.ts` | Phù hợp nhưng cần cải thiện | Chỉ báo 3 mục chưa bám đủ 4 tiêu chí rubric (mục tiêu/dự đoán, giải thích, tự nhận diện khó khăn, ghi kiểm chứng AI) | Đợt 3: nâng `EVIDENCE_PROMPTS` theo 4 tiêu chí rubric, mỗi tiêu chí mô tả mức |
| 4 | Tiêu chí kiểm định độ chính xác tri thức do AI tạo | Phản biện yêu cầu 2; bộ 6 tiêu chí trong báo cáo đối chiếu mục 2.2 | Có phiếu kiểm định Word; chưa có quy trình/hồ sơ trong web | Phù hợp nhưng cần cải thiện | Nội dung AI trong web (Trợ lí học tập) chưa gắn nhãn "chưa được duyệt trước" rõ ràng | Đợt 2–3: thêm ghi chú giới hạn AI + nút báo lỗi trong giao diện trợ lí |
| 5 | Quy trình xây dựng học liệu có hỗ trợ AI | Đề cương mục 1.8 | Quy trình ghi trong docs; web có công cụ soạn + AI giáo viên | Phù hợp | — | Duy trì |
| 6 | Hệ thống học liệu số B21–B25 | Đề cương mục 2.2–2.3; SGK KNTT | Video B21–B25, mô phỏng, infographic, phiếu, ngân hàng câu hỏi, kho học liệu | Phù hợp | Đã có đối chiếu nguồn trong `NUCLEAR_SCIENCE_SOURCES.md`; chưa duyệt 100% học liệu theo bộ 6 tiêu chí | Tiếp tục kiểm định theo phiếu; không tuyên bố "đã nghiệm thu" |
| 7 | Tiến trình lớp học đảo ngược 3 giai đoạn | Đề cương mục 1.9; thuyết minh | 3 trang `before-class` / `in-class` / `after-class` cho HS và GV, tiến trình bước học có khóa tuần tự | Phù hợp | Vòng 1 đã sửa lỗi chặn nộp bài bước tự chọn | Duy trì; kiểm thử E2E với tài khoản thử |
| 8 | Sản phẩm cá nhân trước giờ + GV phản hồi | Phản biện yêu cầu 1 | Form 3 mục (dự đoán/kết quả/bước tiếp) lưu qua RPC `complete_pathway_step`; GV xem tại `/teacher/lessons/[id]/ket-qua` | Phù hợp nhưng cần cải thiện | Chưa có luồng "GV phản hồi → HS xem lại phản hồi" hiển thị; chưa có đối chiếu ngẫu nhiên đầu giờ như đề xuất | Đợt 2: rà soát trang ket-qua; cân nhắc trường phản hồi GV |
| 9 | Ba kế hoạch bài dạy (đề cương 2.4–2.6) | Đề cương; `docs/worksheets/B23-ke-hoach-bai-day.docx` | Bàn soạn kế hoạch `/hoc-lieu/soan-ke-hoach` + `/teacher/plans` | Phù hợp nhưng cần cải thiện | Website tổ chức 5 bài B21–B25; đề cương có 3 kế hoạch — đã ghi nhận đúng trong `SGK_RESEARCH_WEB_MATRIX.md` (5 mục là tổ chức học liệu, không tự đồng nghĩa 5 kế hoạch) | Giữ nguyên; khi xuất DOCX ghi rõ cấu trúc 3 giai đoạn |
| 10 | Chuẩn hóa theo Công văn 5512 | CV 5512 + phụ lục I/III/IV/V | Chưa phân biệt phụ lục trong công cụ soạn kế hoạch | Chưa phù hợp (thiếu phân loại) | Hiện chỉ có một mẫu "kế hoạch dạy học" chung | Đợt 2: bổ sung chọn loại hồ sơ (KH môn học tổ / KH giáo dục GV / KH bài dạy / phiếu đánh giá) |
| 11 | Thực nghiệm sư phạm tiền–hậu kiểm, nhóm đối chứng | Thuyết minh mục 12.4; đề cương chương 3 | Chưa có (đúng — dữ liệu thật chưa thu) | Chưa có đủ minh chứng để kết luận | Không được tạo dữ liệu giả | Không xây dashboard thống kê đến khi có dữ liệu thật |
| 12 | Bài báo khoa học | Bản thảo `BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx` | Không thuộc phạm vi web | Phù hợp (ngoài web) | — | — |

## 3. Bản đồ điều hướng hiện tại

```
CÔNG KHAI (không cần đăng nhập)
├── /                          Trang chủ (hero SGU + 3 pha + mục lục B21–B25 + 4 studio)
├── /gioi-thieu                Giới thiệu học liệu
├── /hoc-lieu                  Kho học liệu
│   ├── /phong-hat-nhan        Mô hình 3D + video theo bài (?bai=B21..B25)
│   ├── /truc-quan             Phòng trực quan
│   ├── /lop-hoc-dao-nguoc     Hướng dẫn ba pha
│   ├── /chuong-trinh          Chương trình Vật lí 12
│   ├── /soan-ke-hoach         Soạn kế hoạch (công khai, nút "Đăng nhập giáo viên")
│   ├── /ai                    Trợ lí học tập (HS)
│   └── /ai-giao-vien          Công cụ giáo viên
├── /demo-lesson               Tiến trình ba pha mẫu
├── /login, /register          Đăng nhập / đăng ký

HỌC SINH (đăng nhập, role=student)
├── /student                   Tổng quan
├── /student/classes           Lớp học của em → /student/lessons/[id] → 3 pha
├── /student/lessons/[id]/before-class | in-class | after-class
├── /student/materials         Học liệu
├── /student/curriculum/[code] Chương trình
├── /student/assignments       Bài tập và kiểm tra
├── /student/journal           Nhật kí học tập
├── /student/ai                Học với AI

GIÁO VIÊN (đăng nhập, role=teacher)
├── /teacher                   Tổng quan
├── /teacher/classes           Lớp học → /teacher/classes/[id] (+ /new)
├── /teacher/lessons           Bài học hạt nhân → /teacher/lessons/[id] → 3 pha + /ket-qua
├── /teacher/curriculum        Chương trình (?chuong=)
├── /teacher/materials         Kho học liệu (?type=)
├── /teacher/plans             Kế hoạch dạy học của tôi
├── /teacher/ai                Không gian giáo viên
└── /teacher/students          Học sinh và kết quả
```

## 4. Vấn đề điều hướng phát hiện (Đợt 1)

| # | Vấn đề | Mức độ | Ghi chú |
|---|---|---|---|
| 1 | Menu công khai "Công cụ" chứa 7 mục trộn cả công cụ HS (Trợ lí học tập) và GV (Công cụ giáo viên, Soạn kế hoạch) | Cao | Người dùng khó phân vai; soạn kế hoạch là công cụ GV nhưng nằm ở khu công khai |
| 2 | `/hoc-lieu/ai-giao-vien` (công khai) và `/teacher/ai` (đăng nhập) là hai lối vào cùng nhóm chức năng | Trung bình | Cần kiểm tra nội dung hai trang có trùng lặp không |
| 3 | Không có mục "Giới thiệu dự án nghiên cứu" ở menu chính — chỉ có `/gioi-thieu` (giới thiệu học liệu) | Trung bình | Đề tài cần một trang giới thiệu nghiên cứu tách bạch, không công khai dữ liệu nội bộ |
| 4 | Chưa có không gian nghiên cứu (đề xuất mục 3D của yêu cầu Vòng 3) | Thấp | Hiện hồ sơ nghiên cứu nằm ngoài web (thư mục `00_NCKH_BAT_DAU`); chưa cần dashboard — không có dữ liệu thật |
| 5 | Tất cả route công khai trả 200; route portal đều chuyển hướng đúng `/login?next=` | Đạt | Quyền truy cập hoạt động đúng |
| 6 | Footer đã ghi rõ "sản phẩm nghiên cứu khoa học, không phải website chính thức của SGU" | Đạt | Đáp ứng yêu cầu phân biệt |

## 5. Phân loại phù hợp thuyết minh / phản biện

- **Phù hợp:** hệ thống học liệu B21–B25; tiến trình 3 pha; lưu bằng chứng bài nộp; trang GV xem kết quả; quy trình kiểm định kĩ thuật đã ghi hồ sơ.
- **Phù hợp nhưng cần cải thiện:** chỉ báo năng lực tự học (3 mục → 4 tiêu chí rubric); ghi chú giới hạn AI; luồng phản hồi GV; phân loại hồ sơ 5512 trong công cụ soạn kế hoạch.
- **Chưa phù hợp:** thiếu phân biệt Phụ lục I/III/IV/V trong công cụ kế hoạch; thiếu chức năng phục vụ khảo sát thực trạng.
- **Chưa có đủ minh chứng để kết luận:** hiệu quả năng lực tự học (chưa thực nghiệm); mọi tuyên bố kết quả HS thật — không được tạo số liệu.

## 6. Việc cần xác nhận với giảng viên hướng dẫn

1. Số lớp thực nghiệm/đối chứng (01 trường 02 lớp hay 04 lớp) — mâu thuẫn trong thuyết minh mục 12.4.
2. Thời gian thực hiện và bảng tiến độ có mốc không hợp thứ tự (11/2026–12/2027).
3. Phạm vi địa điểm khảo sát vs thực nghiệm.
4. Phương pháp phân tích dữ liệu còn ghi chung.
5. Bản thuyết minh nào là bản được phê duyệt chính thức.

(Các điểm 1–5 lấy nguyên văn từ `00_NCKH_BAT_DAU/BAO_CAO_DOI_CHIEU_VA_LO_TRINH.md` mục 4 — không phải nhận xét của cô Nhị.)

## 7. Hành động Đợt 1 đã thực hiện

- Trích xuất và đọc 5 tài liệu Word gốc + báo cáo đối chiếu + 4 báo cáo kiểm định trong `docs/`.
- Kiểm tra HTTP tất cả 13 route công khai (đều 200) và 10 route portal (đều 307 → /login đúng quyền).
- Lập bản đồ điều hướng hiện tại (mục 3) và phát hiện 6 vấn đề (mục 4).
- Lập bảng đối chiếu 12 yêu cầu nghiên cứu với chức năng (mục 2).

## 8. Hành động đề xuất Đợt 2 (hệ thống giáo viên)

1. Phân loại hồ sơ kế hoạch theo Phụ lục I/III/IV CV 5512 trong `/teacher/plans` và `/hoc-lieu/soan-ke-hoach`.
2. Rà soát xuất DOCX: cấu trúc tiêu đề, bảng, công thức, tiếng Việt Unicode, in A4.
3. Kiểm tra trùng lặp `/hoc-lieu/ai-giao-vien` vs `/teacher/ai`.
4. Rà soát trang `/teacher/lessons/[id]/ket-qua` — luồng xem bài nộp và phản hồi.

## 9. Bản đồ điều hướng đề xuất

```
CÔNG KHAI
├── /                          Trang chủ
├── /gioi-thieu                Giới thiệu học liệu (giữ nguyên)
├── /ve-du-an                  [MỚI] Giới thiệu dự án nghiên cứu
├── /hoc-lieu                  Kho học liệu B21–B25 công khai
│   ├── /phong-hat-nhan        Mô hình 3D + video
│   ├── /truc-quan             Phòng trực quan
│   ├── /lop-hoc-dao-nguoc     Hướng dẫn ba pha học tập
│   └── /chuong-trinh          Chương trình Vật lí 12
├── /cong-cu                   [MỚI HOẶC TỔ CHỨC LẠI] Trang tổng công cụ
│   ├── /hoc-sinh              → /demo-lesson, /hoc-lieu/ai
│   └── /giao-vien             → /hoc-lieu/soan-ke-hoach, /hoc-lieu/ai-giao-vien
├── /demo-lesson               Tiến trình mẫu
├── /login, /register

HỌC SINH (vai trò student)
├── /student                   Tổng quan (dashboard)
├── /student/classes           → Lớp học → tiến trình bài học
│   └── /student/lessons/[id]/before-class | in-class | after-class
├── /student/materials         Học liệu
├── /student/curriculum        Chương trình
├── /student/assignments       Bài tập
├── /student/journal           Nhật kí học tập
└── /student/ai                Trợ lí học tập

GIÁO VIÊN (vai trò teacher)
├── /teacher                   Tổng quan
├── /teacher/classes           Lớp học
│   └── /teacher/classes/[id]
├── /teacher/lessons           Bài học B21–B25
│   └── /teacher/lessons/[id]
│       ├── /before-class, /in-class, /after-class
│       └── /ket-qua           [CẦN RÀ SOÁT] Bài nộp HS + phản hồi GV
├── /teacher/curriculum        Chương trình
├── /teacher/materials         Kho học liệu
├── /teacher/plans             Kế hoạch dạy học của tôi [CẦN BỔ SUNG: chọn loại hồ sơ I/III/IV/V]
├── /teacher/ai                Công cụ soạn đề/phiếu (giống /hoc-lieu/ai-giao-vien nhưng có teacherId)
└── /teacher/students          Học sinh và kết quả

NGHIÊN CỨU (khi cần — không công khai)
├── /research/dashboard        [TÙY CHỌN ĐỢT 4] Tổng quan nghiên cứu
├── /research/surveys          [TÙY CHỌN] Nhập liệu khảo sát
├── /research/materials        Hồ sơ kiểm định học liệu
└── /research/assessment       Ma trận đánh giá năng lực tự học
```

**Nguyên tắc:**
- Không xóa route có tồn tại — dùng chuyển hướng nếu đổi URL.
- `/hoc-lieu/ai-giao-vien` (công khai) và `/teacher/ai` (đăng nhập) nên hợp nhất hoặc phân biệt rõ vai trò.
- Menu "Công cụ" đã phân nhóm 3 vai trò: Học sinh / Giáo viên / Về dự án (Đợt 1 đã triển khai).

## 10. Thay đổi đã triển khai (Đợt 1)

1. **Tạo bản kiểm toán** `docs/NCKH_TONG_KIEM_TOAN_WEB.md` — đối chiếu 12 yêu cầu nghiên cứu với chức năng.
2. **Phân nhóm menu công cụ:** tách "Dành cho học sinh" / "Dành cho giáo viên" / "Về dự án" trong header dropdown.
3. **Cấu trúc dữ liệu:** `PUBLIC_TOOL_GROUPS` với 3 nhóm, mỗi nhóm có label/description/links.
4. **CSS:** `.toolsGroup`, `.toolsGroupLabel` để hiển thị phân nhóm rõ ràng.
5. **Kiểm tra HTTP:** 13 route công khai đều 200, 10 route portal đều 307 → /login đúng.

**File đã sửa (Đợt 1):**
- `src/components/ui/site-navigation.ts` (thêm `PUBLIC_TOOL_GROUPS`)
- `src/components/ui/SiteHeader.tsx` (render menu phân nhóm)
- `src/components/ui/SiteChrome.module.css` (CSS `.toolsGroup`, `.toolsGroupLabel`)
- `docs/NCKH_TONG_KIEM_TOAN_WEB.md` (bản kiểm toán này)

## 11. Kết quả Đợt 1

- ✅ Đã xác lập 14 tài liệu gốc (11 tìm thấy, 3 cần xác nhận).
- ✅ Lập bảng đối chiếu 12 yêu cầu nghiên cứu → chức năng website.
- ✅ Lập bản đồ 43 route hiện tại + bản đồ đề xuất.
- ✅ Phát hiện 6 vấn đề điều hướng (1 cao, 3 trung bình, 2 đạt).
- ✅ Sửa vấn đề ưu tiên cao: menu công cụ trộn vai trò → phân nhóm rõ 3 vai trò.
- ⏸️ Chưa có dữ liệu thực nghiệm — không tạo dashboard thống kê giả.
- ⏸️ Chưa rà soát Đợt 2–4 (hệ thống GV, HS, nghiên cứu).

## 12. Đầu việc chuyển Đợt 2

1. Thiết kế chọn loại hồ sơ (Phụ lục I/III/IV/V) trong công cụ kế hoạch.
2. Kiểm thử xuất DOCX với bài B23 có công thức, bảng, tiếng Việt.
3. Quyết định hợp nhất hay giữ tách `/hoc-lieu/ai-giao-vien` vs `/teacher/ai`.
4. Rà soát `/teacher/lessons/[id]/ket-qua` — form phản hồi GV → HS.

## 13. Kết quả Đợt 2 (phần đã triển khai)

### 13.1. Kiểm thử xuất DOCX kế hoạch bài dạy — ĐẠT

- Hàm `teachingPlanDocx()` ([teaching-plan-docx.ts](../src/lib/teaching-plan-docx.ts)) tạo file thật: **14558 bytes** cho bài B23.
- Cấu trúc đã kiểm chứng đúng Phụ lục IV: `I. Mục tiêu` (1. Kiến thức / 2. Năng lực / 3. Phẩm chất) → `II. Thiết bị dạy học và học liệu` → `III. Tiến trình dạy học` với 4 hoạt động (Chuẩn bị → Xác định vấn đề → Thực hiện → Hoàn thiện), mỗi hoạt động đủ `a) Mục tiêu · b) Nội dung · c) Sản phẩm · d) Tổ chức thực hiện` gồm 4 bước (Giao nhiệm vụ / Thực hiện nhiệm vụ / Báo cáo và thảo luận / Kết luận và nhận định) → `IV. Điều chỉnh sau bài dạy` → `Căn cứ thiết kế` (nêu rõ Phụ lục IV CV 5512).
- Bài B23 sinh ra **136 dòng** nội dung, có công thức `x = x₀e⁻λᵗ`, tiếng Việt Unicode đúng, Times New Roman, khổ A4 (11906×16838 twips).
- Các test liên quan trong `tests/guided-teacher-workflows.test.ts` chạy bằng `npx tsx --test`: **5/5 đạt** (kể cả bài "lesson-plan samples preserve curriculum targets, four activity types, four organization steps and classroom time").
- Lưu ý: file mẫu tại `/tmp/nckh-B23-ke-hoach-bai-day.docx` (không commit); chưa mở trong Microsoft Word thật để xem in A4 — chỉ kiểm tra qua JSZip giải nén XML.

### 13.2. Hai lối vào AI giáo viên — không trùng lặp, chỉ cần phân biệt nhãn

- `/hoc-lieu/ai-giao-vien` dùng `<TeacherWorkroom demo />`: API `/api/ai/teacher-demo`, xử lí học liệu mẫu B21–B25, `readOnly`, không upload file thật, có `ai-notice` "Bản thử dùng kiến thức công khai B21–B25".
- `/teacher/ai` dùng `<TeacherWorkroom teacherId={user.id} materials={...} />`: API `/api/ai/teacher`, tải file TXT/DOCX/PDF ≤5MB, có điều kiện lớp, lưu theo phiên giáo viên.
- Kết luận: **giữ nguyên**, hai lối vào phục vụ hai mục đích (xem thử công khai vs làm việc thật). Không hợp nhất.

### 13.3. Menu công cụ công khai đã phân nhóm (Đợt 1 sửa, Đợt 2 xác minh)

- `site-navigation.ts` có `PUBLIC_TOOL_GROUPS`: "Dành cho học sinh" (Hướng dẫn ba pha, Trải nghiệm bài học mẫu, Trợ lí học tập) / "Dành cho giáo viên" (Chương trình Vật lí 12, Soạn kế hoạch dạy học, Công cụ giáo viên) / "Về dự án" (Giới thiệu học liệu).
- Xác minh trên trình duyệt (localhost:3480): dropdown mở đúng, 3 nhóm hiển thị đúng label, 7 liên kết, không trộn vai trò.

## 14. Việc chưa làm và cần xác nhận

1. **Chọn loại hồ sơ Phụ lục I/III/IV/V:** chưa triển khai — công cụ kế hoạch hiện chỉ sinh Phụ lục IV. Nên làm ở Đợt 2 tiếp hoặc Đợt 4.
2. **Rà soát trang `/teacher/lessons/[id]/ket-qua`:** chưa làm — cần tài khoản giáo viên và học sinh QA hoặc đọc mã chi tiết.
3. **In thử DOCX trên A4:** chưa mở Word thật; chỉ kiểm tra cấu trúc XML qua giải nén.
4. **Dashboard thực nghiệm:** chưa tạo — không có dữ liệu HS thật.
5. **Mâu thuẫn thuyết minh:** mục 12.3/12.4 (số lớp, thời gian) — cần cô Nhị xác nhận.

## 15. Kết quả Đợt 2 (tiếp theo — chuẩn hóa Word theo CV 5512)

### 15.1. Nguồn chính thức đã tải và đối chiếu

Tải trực tiếp 2 tệp DOCX phụ lục từ trang Công văn 5512 (thcsandong.haiphong.edu.vn, bản đính kèm của Bộ GDĐT): Phụ lục IV (khung kế hoạch bài dạy, 28 KB) và Phụ lục V (mẫu phiếu đánh giá bài dạy, 33 KB). Phụ lục I và III chưa tải — ghi ở mục việc còn lại.

### 15.2. Kế hoạch bài dạy — sửa theo Phụ lục IV chính thức

[teaching-plan-docx.ts](../src/lib/teaching-plan-docx.ts) được sửa để khớp dòng đầu của khung chính thức:
- Thêm dòng nhận diện: `Trường: …` / `Tổ: …` / `Họ và tên giáo viên: …` — để trống hiện chấm, **không tự điền** thông tin chưa có.
- `TÊN BÀI DẠY:` in đậm theo khung; `Môn học/Hoạt động giáo dục: Vật lí; lớp: …`; `Thời gian thực hiện:` (số tiết) ghi riêng với thời gian trên lớp.
- Mục tiêu đổi nhãn thành `1. Về kiến thức / 2. Về năng lực / 3. Về phẩm chất` theo đúng khung (trước là "Kiến thức và yêu cầu cần đạt").
- Dòng chú thích "(Khung kế hoạch bài dạy — Phụ lục IV Công văn 5512…)" ngay dưới tiêu đề.
- Tham số mới `PlanDocumentMeta` (school/department/teacherName/periods), mặc định rỗng — không làm hỏng lệnh gọi cũ.

### 15.3. Phiếu đánh giá bài dạy — chức năng mới theo Phụ lục V

[observation-plan-docx.ts](../src/lib/observation-plan-docx.ts) (tệp mới): xuất `PHIẾU ĐÁNH GIÁ BÀI DẠY` với đủ 3 phần, 12 tiêu chí, điểm tối đa từng tiêu chí và tổng 20,00 — **trích nguyên văn từ tệp Phụ lục V chính thức**, kèm hướng dẫn cho điểm 3 mức, bội số 0,25 và thang xếp loại GIỎI/KHÁ/TRUNG BÌNH/KHÔNG ĐẠT. Bảng có cột "Điểm đánh giá" để trống cho người đánh giá điền.

### 15.4. Giao diện giáo viên

[TeacherPreparationWizard.tsx](../src/components/learning/TeacherPreparationWizard.tsx) bước 3 bổ sung:
- Nhóm trường "Thông tin trên văn bản" (Trường / Tổ chuyên môn / Họ và tên giáo viên / Số tiết thực hiện) với ghi chú "để trống nếu dùng làm mẫu".
- Nút "Tải kế hoạch Word (Phụ lục IV)" và nút "Tải phiếu đánh giá bài dạy (Phụ lục V)".
- Đã xác minh trên trình duyệt (localhost:3480, `/hoc-lieu/ai-giao-vien` → tab "Chuẩn bị giờ học" → bước 3): cả hai nút và 4 trường hiển thị đúng.

### 15.5. Kiểm chứng bằng tệp thật

Sinh 2 tệp từ mã thật (`createGuidedPreparation('B23')`):
- `/tmp/nckh-B23-ke-hoach-IV.docx` — 14.709 bytes, 140 dòng: đủ dòng nhận diện, I/II/III/IV, 4 hoạt động với a–d và 4 bước tổ chức.
- `/tmp/nckh-B23-phieu-danh-gia-V.docx` — 12.532 bytes, 44 dòng: đủ 12 tiêu chí + tổng 20,00 + hướng dẫn cho điểm + xếp loại.
Kiểm tra bằng giải nén XML (JSZip); chưa mở trong Microsoft Word thật.

### 15.6. Kiểm thử

- `npx tsx --test tests/guided-teacher-workflows.test.ts`: **5/5 đạt**.
- `npx tsc --noEmit`: sạch. ESLint các tệp mới/sửa: sạch (đã xử lý 1 cảnh báo biến thừa).

### 15.7. Rà soát trang `/teacher/lessons/[id]/ket-qua` — đã đọc mã

Trang đã có đủ luồng: chọn học sinh + giai đoạn, tổng quan pha (trạng thái, mô phỏng, bài đánh giá cuối bài có đối chiếu đáp án/gợi ý, nhật kí tự học với 4 trường và mức tự tin), và từng bước học hiển thị **nhiệm vụ GV giao cạnh bài nộp HS** (3 mục bằng chứng theo `EVIDENCE_PROMPTS`). Có cảnh báo đúng khi dữ liệu tải lỗi ("không kết luận HS chưa làm bài"). Nhận định: **phù hợp thuyết minh và yêu cầu phản biện** (bằng chứng sản phẩm, không chỉ nhấp hoàn thành). Chưa có: ô nhập phản hồi của GV gửi về HS — ghi vào Đợt 3, cần xác nhận với giảng viên hướng dẫn trước khi thêm trường dữ liệu mới.


