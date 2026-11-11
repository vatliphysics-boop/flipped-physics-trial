# SIMULATION SYSTEM AUDIT — VÒNG 5 MASTER PROMPT

**Ngày tổng kiểm toán:** 2026-11-09  
**Phạm vi:** Cấu trúc website hiện tại, các mô phỏng đang triển khai, physics kernel, renderer, kiến trúc activity

## 1. TỔNG QUAN REPO

| Thuộc tính | Giá trị |
|---|---|
| Framework | Next.js 16.3.5 (Canary; xem AGENTS.md) |
| React | 19.2.0 |
| TypeScript | 5, strict mode |
| 3D Library | Three.js 0.186.1 (không có React Three Fiber) |
| Node | v24.21.0 |
| Dev server | Port 3000 (đang chạy) |
| Git branch | `rescue/weekend-final` |
| Modified files | 63 (chủ yếu CSS, mô phỏng, phiếu học) |
| Untracked | 63 (docs mới, dữ liệu video, tmp/) |

## 2. CẤU TRÚC ACTIVITY HIỆN TẠI

### 2.1 Catalog (src/lib/curriculum.ts)

```
NUCLEAR_PHYSICS_ACTIVITY_CATALOG = {
  B21: [ rutherford_alpha_scattering, nuclear_structure_builder, isotope_and_nuclear_size ]
  B22: [ nuclear_reaction_balancer, binding_energy_lab, nuclear_fission, nuclear_fusion ]
  B23: [ geiger_random_decay, radiation_properties, radioactive_decay_half_life, 
         carbon14_dating, radiation_safety ]
  B24: [ nuclear_power_energy_flow, reactor_control_concept, nuclear_medicine, 
         radiation_applications ]
  B25: [ nuclear_physics_practice_lab ]
}
```
**Tổng:** 19 activities. **Fixed:** 19 (all marked `fixed: true`)

### 2.2 Render Dispatch (src/components/physics/FixedPhysicsActivityRenderer.tsx)

- Dispatcher chính cho tất cả activities
- Ánh xạ `CanonicalActivityKey → Component`
- Nhóm components cao nhất:
  - **3D sims:** `RutherfordActivity`, `GuidedFissionLab`, `ReactorControlConcept`
  - **Lab/interactive:** `RadioactiveDecayHalfLife` (= DecayProcessLab), `BindingEnergyLab`
  - **Generic Simulation3D wrapper:** hầu hết activities khác
  
**Lưu ý:** Một số activities chính (rutherford, decay, fission, reactor, practice) có `return` cứng trước generic wrapper (ln 113–117) để tránh re-render hỏng state.

### 2.3 Physics Kernels Hiện Tại

| Kernel | Vị trí | LOC | Mô tả | Test |
|---|---|---|---|---|
| `radioactive-decay-model.ts` | `src/lib/` | 45 | Exponential decay với seed, Poisson | ✅ `decay-data.test.ts` |
| `rutherford-model.ts` | `src/lib/` | 130 | Coulomb scattering angle | ✅ `nucleus-layout.test.ts` |
| `fission-model.ts` | `src/lib/` | 72 | Fragment A/Z (sơ đồ) | ✅ `nuclear-science.test.ts` |
| `reactor-model.ts` | `src/lib/` | 37 | Chain reaction control | ✅ (implicitly) |
| `physics.ts` | `src/lib/` | 59 | Constants, binding energy, Poisson | ✅ Inline + decay-data |

**Tổng test stats:** 62/62 pass (xem `AI_PROJECT_HANDOFF.md`), không có lỗi thời gian chạy.

## 3. RENDERER 3D HIỆN TẠI

### 3.1 Simulation3D.tsx (1911 LOC — lớn nhất)

**Phạm vi:**
- Chứa **Activity3DConfig interface** định nghĩa tham số cho từng activity
- **Renderer THREE.js** cùng file (khoảng 1400 LOC mã render)
- **17 activity configs**, phủ toàn bộ 19 key ngoại trừ `rutherford_alpha_scattering` và `nuclear_fission` (đi qua component riêng)

**Vấn đề:**
- Toàn bộ mã chung 1 file lớn
- Không có abstraction timeline/scene
- Không có auto-transition cảnh
- Camera được điều khiển thủ công qua OrbitControls
- Tham số phụ thuộc vào từng cấu hình riêng (không tiêu chuẩn)

### 3.2 Component khác

| Tên | LOC | Chức năng |
|---|---|---|
| `GuidedFissionLab.tsx` | 115 | Mô phỏng phân hạch với timer, bộ đếm neutron |
| `DecayProcessLab.tsx` | 86 | Bản decay hiển thị với đồ thị |
| `DecayProcessVisual.tsx` | 100 | Canvas 2D decay histogram |
| `RutherfordActivity.tsx` | (B21Activities) | Tương tác Rutherford |
| `NucleusExplorer.tsx` | 297 | Khám phá 3D hạt nhân |
| `nucleus-scene.ts` | 190 | Hình dạng hạt nhân, lớp cắt |

**Quan hệ:** 
- Simulation3D được gọi từ FixedPhysicsActivityRenderer
- DecayProcessLab được re-export làm `RadioactiveDecayHalfLife`
- GuidedFissionLab được gọi cứng khi `nuclear_fission`
- NucleusExplorer được dùng ở trang chủ và phòng khám phá

### 3.3 Hoạt cảnh & Timeline

**Hiện tại:** KHÔNG CÓ
- Mỗi activity chỉ có play/pause/reset với thời gian mô phỏng vật lí
- Không có scene sequencing
- Không có camera animation transition
- Không có khác cảnh tự động (auto-advance)

## 4. TÍCH HỢP VỚI HỌC SINH / GIÁO VIÊN

### 4.1 onProgress Callback

**Được sử dụng:**
- `LearningResourcePreview.tsx` gọi activity với `onProgress` callback
- `FixedPhysicsActivityRenderer` khớp `onObserved` + `onAnswered`
- `StudentPathwayStepViewer` khóa nút "Nộp kết quả" tới khi `activityDone`

**Các nút kích hoạt onProgress:**
- Thay đổi tham số
- Trả lời câu hỏi
- Hoàn thành nhiệm vụ (số lần chạy đủ, có đủ dữ liệu)

### 4.2 Teacher Control

**Hiện tại:** KHÔNG CÓ
- Không có chế độ "giáo viên kiểm soát" riêng
- Xem trước giáo viên ở `/teacher/lessons/[id]` chỉ hiển thị nội dung nhưng không có điều khiển cảnh

## 5. DỮ LIỆU VẬT LÍ

### 5.1 Nguồn

| Nguồn | Tệp | Người dùng |
|---|---|---|
| OpenStax University Physics 3 §10.3 | `radioactive-decay-model.ts` | Decay |
| College Physics 2e Appendix A | `physics.ts` (BINDING_NUCLIDES) | Binding energy |
| SGK KNTT Vật lí 12 | `nuclear-science.ts` (NUCLIDES) | Nucleus data |
| Rutherford scattering formula | `rutherford-model.ts` | Scattering angle |

### 5.2 Kiểm chứng

- `NUCLEAR_SCIENCE_SOURCES.md` (docs/) ghi rõ từng tài liệu
- `PHYSICS_PROCESS_VERIFICATION.md` liệt kê các kiểm thử hình dạo hàm
- Tất cả decay data, fission, fusion đều đã kiểm tra vs SGK

## 6. KHẢO SÁT COMPONENT HIỆN CÓ

### 6.1 Mô phỏng 3D riêng (custom)

1. **RutherfordActivity** (B21, ~80 LOC)
   - Canvas quỹ đạo 2D
   - Tham số: b (impact parameter), energy
   - Tính góc Rutherford, vẽ hạch và đường đi
   - onProgress: vẽ 2–3 quỹ đạo với b khác nhau

2. **NucleusExplorer** (nhóm learning, 297 LOC)
   - Three.js 3D hạt nhân
   - Proton (tím), neutron (xanh)
   - Camera orbit, cắt lớp, thông tin nucleon
   - **Không có timeline**, **không auto-scene**

3. **GuidedFissionLab** (B22, 115 LOC)
   - Three.js mô phỏng phân hạch
   - Timer, đếm neutron
   - Không có cảnh, không animate transition
   - onProgress: 3 neutron ra, 3 lần chạy vs năng lượng khác

4. **DecayProcessLab** (B23, 86 LOC)
   - Thời gian mô phỏng, vẽ 2D histogram
   - Tương tác: thay N₀, T₁/₂
   - onProgress: chạy ≥3 lần

### 6.2 Generic 3D Wrapper (Simulation3D)

Dùng cho:
- Binding energy visualization
- Fission sơ đồ
- Medicine (gamma source)
- Reactor control (thanh nút)

**Cấu trúc:**
```
Activity3DConfig { title, tham số, buildLatex(), buildMetrics() }
```

**Vấn đề:** Không có cơ chế dùng chung cho tất cả, mỗi activity có logic riêng.

## 7. ROUTE & MENU

### 7.1 Public

- `/` – Hero, 3 pha, lựa chọn B21–B25
- `/hoc-lieu/phong-hat-nhan?bai=B21..B25` – Phòng khám phá (hiển thị NucleusExplorer + FixedPhysicsActivityRenderer)
- `/demo-lesson` – Tiến trình mẫu

### 7.2 Student

- `/student/lessons/[id]/before-class` → FixedPhysicsActivityRenderer với `rutherford_alpha_scattering`
- `/student/lessons/[id]/in-class` → Mô phỏng chính (nhóm B21–B25)
- `/student/lessons/[id]/after-class` → Luyện tập + đánh giá

### 7.3 Teacher

- `/teacher/lessons/[id]` → Xem mục tiêu, nhiệm vụ, xem trước
- `/teacher/lessons/[id]/ket-qua` → Xem bài nộp học sinh

## 8. PERFORMANCE & BUILD

| Metric | Kết quả |
|---|---|
| `npm run build` | ✅ Pass |
| ESLint | ✅ Pass (0 lỗi, 0 cảnh báo) |
| TypeScript (strict) | ✅ Pass |
| Unit tests | ✅ 62/62 pass |
| Dev HMR | ✅ Hoạt động |
| WebGL support | ✅ Chrome, Firefox, Safari |

**Không có:** Performance bottleneck báo cáo. Simulation3D (1911 LOC) là component lớn nhất nhưng không được lazy-load tư động.

## 9. PHÁT HIỆN VẤN ĐỀ

| # | Vấn đề | Ảnh hưởng | Ưu tiên |
|---|---|---|---|
| 1 | Simulation3D chứa 6 activity logic → khó bảo trì | Kỹ thuật | Cao |
| 2 | Không có auto-scene transition → giáo viên phải click | Sư phạm | Cao |
| 3 | Không có timeline chung → mỗi sim vẽ UI riêng | Giao diện | Cao |
| 4 | Physics kernel nhỏ gọn nhưng cách ly kém | Kỹ thuật | Trung bình |
| 5 | Giáo viên không thể điều khiển cảnh trong trình diễn | Tương tác | Trung bình |
| 6 | Không có fallback 2D khi WebGL fail | Truy cập | Thấp |
| 7 | Xem trước giáo viên không có interaction | Tích hợp | Thấp |

## 10. KHUYẾN CÁO CẤU TRÚC V2

**Kế thừa:**
- Physics kernels (`radioactive-decay-model.ts`, `rutherford-model.ts`, v.v.)
- Activity dispatch pattern (FixedPhysicsActivityRenderer)
- Data sources + verification (`NUCLEAR_SCIENCE_SOURCES.md`)

**Xây dựng mới (v2/):**

```
src/simulations-v2/
├── core/
│   ├── SimulationEngine.ts       # Timeline, state, camera control
│   ├── Scene.ts                   # Scene definition + sequencing
│   ├── Timeline.ts                # Auto-advance, keyframe, pause
│   └── types.ts                   # Shared interfaces
├── physics/
│   ├── DecayPhysics.ts            # Wrap radioactive-decay-model.ts
│   ├── RutherfordPhysics.ts       # Wrap rutherford-model.ts
│   ├── FissionPhysics.ts
│   ├── index.ts
│   └── __tests__/                 # Test tầng physics riêng
├── renderer/
│   ├── ThreeSetup.ts              # Canvas, context, cleanup
│   ├── Camera.ts                  # Orbit, focus, reset, preview
│   ├── Lighting.ts
│   ├── Materials.ts
│   └── Meshes.ts                  # Reusable geometry
├── scenes/
│   ├── B23_DecayScene.ts          # Tự chuyển cảnh decay
│   ├── B21_RutherfordScene.ts
│   ├── B22_FissionScene.ts
│   └── index.ts
├── overlays/
│   ├── ScientificUI.tsx           # Parameters, graphs, annotations
│   ├── TimelineControl.tsx        # Play/pause, speed, scene list
│   ├── TeacherPanel.tsx           # Scene override, timing display
│   └── index.tsx
├── learning/
│   ├── ActivityBinding.ts         # onProgress logic, completion
│   └── index.ts
├── utils/
│   ├── math.ts
│   ├── random.ts
│   └── formatting.ts
└── index.ts                        # Public exports
```

**Điểm tích hợp:**
- `FixedPhysicsActivityRenderer` → kiểm tra v2 flag → `<SimulationV2 activityKey=... />`
- Legacy components giữ nguyên cho rollback
- Cùng `onProgress` interface

## 11. TIÊU CHÍ NGHIỆM THU V2

| Tiêu chí | Chỉ báo | Cách kiểm |
|---|---|---|
| Physics chính xác | Decay: N(t) = N₀ × 2^(-t/T) ✓; Rutherford: θ = 2arctan(...) ✓ | Unit test |
| Timeline auto | ≥8 cảnh, chuyển tiếp suôn sẻ, pause khi cần | E2E |
| UI 3D | Nhãn rõ, camera cân bằng, bố cục không tràn | Screenshot |
| Giáo viên | Có thể điều khiển ≥50% cảnh, xem tham số | Manual test |
| Tích hợp | onProgress báo đạt, route không hỏng, xem trước hoạt động | Regression test |
| Hiệu suất | ≥30 FPS ở 768px, không rò rỉ | Perf profile |

## 12. KẾ HOẠCH TRIỂN KHAI

**Tuần tự:**
1. Tạo `simulations-v2/core/` + ThreeSetup + Timeline (không activity, chỉ test skeleton)
2. Wrap physics kernel → test chính xác
3. Tạo Scene definitions (B23 tham chiếu)
4. Renderer 3D tối thiểu (meshes, camera, lighting)
5. Auto-scene transition + keyframe
6. Scientific UI overlay
7. Activity binding + onProgress
8. B21, B22, B24, B25 tuần tự
9. Kiểm thử tích hợp + rollback test
10. Bàn giao tài liệu

**Checkpoint:** Sau B23, đánh giá v2 có thay thế v1 không.

---

**Tài liệu liên quan:**
- `PHYSICS_PROCESS_VERIFICATION.md` – Chi tiết công thức
- `NUCLEAR_SCIENCE_SOURCES.md` – Nguồn dữ liệu
- `SGK_RESEARCH_WEB_MATRIX.md` – Đối chiếu với nội dung học
