# PHASE 2 VISIBILITY DEBUG

Ngày audit: 23/09/2026
Phạm vi: B21 — Cấu trúc hạt nhân. Chưa kiểm tra browser auth/RLS thực tế.

## Trace B21 — `rutherford_alpha_scattering`

| Mắt xích | Kết quả | Bằng chứng |
|---|---|---|
| B21 curriculum definition | PASS | `src/lib/curriculum.ts` có catalog B21 và key canonical. |
| Real B21 lesson ID | PASS | `getStudentLesson(lessonId)` lấy lesson published, class_id, curriculum_code; chapter page truyền ID thật. |
| Student lesson overview | PASS | Overview luôn map đủ `LEARNING_PHASES`, không ẩn card khi material count bằng 0. |
| Phase-2 button/link | BROKEN | `lessonPath()` trước sửa map `in_class` sang `/simulation`; label/description chưa đúng contract. |
| `/student/lessons/[lessonId]/in-class` | MISSING trước sửa | Thư mục tồn tại nhưng không có `page.tsx`. |
| Phase-2 query | PASS catalog scaffold | `/simulation/page.tsx` lấy `curriculum.code` và render catalog; chưa có config DB. |
| Class context | PASS | `getStudentLesson()` yêu cầu membership và trả `classItem`. |
| lesson_materials/config | MISSING | Chưa có activity material/config initializer hoặc activity_key schema. |
| published filter | MISSING cho fixed catalog | Renderer hiện render catalog trực tiếp, chưa merge/filter DB publication. |
| activity key parser | MISSING | Chưa normalize raw/activity:/simulation: prefixes. |
| FixedPhysicsActivityRenderer | PASS | Key dispatch tới `RutherfordActivity`. |
| Rutherford activity | PASS | Component có bắn một hạt, bắn batch, impact parameter, counts và reset. |

## Trace B21 — `nuclear_structure_builder`

| Mắt xích | Kết quả | Bằng chứng |
|---|---|---|
| Catalog, lesson ID, overview | PASS | Cùng đường dẫn B21 ở trên. |
| Phase-2 route | BROKEN trước sửa | `/in-class` student missing; navigation dùng `/simulation`. |
| Class/config/publication | MISSING | Chưa có DB config contract. |
| Renderer | PASS | Dispatch tới `NuclearBuilderActivity`. |
| Activity | PASS | State Z/N cập nhật proton, neutron, A và kí hiệu hạt nhân. |

## Trace B21 — `isotope_and_nuclear_size`

| Mắt xích | Kết quả | Bằng chứng |
|---|---|---|
| Catalog, lesson ID, overview | PASS | Cùng đường dẫn B21 ở trên. |
| Phase-2 route | BROKEN trước sửa | `/in-class` student missing; navigation dùng `/simulation`. |
| Class/config/publication | MISSING | Chưa có DB config contract. |
| Renderer | PASS | Dispatch tới `IsotopeActivity`. |
| Activity | PASS | Đổi isotope/family và A; R gần đúng cập nhật theo A^(1/3). |

## Root cause đã xác minh

1. Student route canonical `/student/lessons/[lessonId]/in-class` bị thiếu.
2. Phase navigation trỏ Phase 2 tới `/simulation`, không khớp route nghiệm thu.
3. Phase 2 metadata chưa dùng nhãn/mô tả yêu cầu.
4. Material/config/publish contract chưa triển khai; browser auth, dữ liệu Supabase và RLS chưa được chạy.

