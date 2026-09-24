CURRENT BRANCH: rescue/weekend-final
CURRENT COMMIT: HEAD

# SESSION 4 RESULT
Completed visual foundation setup based on modern scientific platform design principles. Replaced the marketplace aesthetic with a calm, focused LMS experience.

# DESIGN TOKENS
Defined in `src/app/globals.css`:
- **Background**: `#F8FAFC` (off-white)
- **Surface**: `#FFFFFF`
- **Primary**: `#1E3A8A` (Deep Navy / Academic Indigo)
- **Accent**: `#0891B2` (Cyan)
- **Text**: Slate hierarchy (`#0F172A`, `#334155`, `#64748B`)
- Eliminated dense gradients, marketplace colors, and excessive shadows.
- Introduced strict spacing scales and standard radii.

# SHELL CHANGES
- **PortalShell**: Simplified topbar and sidebar layouts. 
- Refined navigation styling: active states use subtle background highlighting instead of heavy borders.
- Increased overall whitespace across desktop breakpoints.
- Kept the same component structure but rewrote underlying CSS to remove admin-template baggage.

# TEACHER DASHBOARD
- Removed the dense wall-of-cards layout.
- Introduced `panel` and `list-row` components.
- Highlighted "Current Teaching Focus" as a large panel rather than a product card.
- Simplified metrics display.
- Updated `src/app/teacher/page.tsx` markup to leverage the new global styles without altering data fetching logic.

# STUDENT DASHBOARD
- Redesigned `src/app/student/page.tsx` to prioritize the learning flow.
- Replaced the chapter cards grid with clean list rows.
- Enhanced "Continue Learning" section using a dedicated focus panel.

# FILES CHANGED
- `src/app/globals.css` (completely rewritten for tokens and shell foundation)
- `src/app/teacher/page.tsx`
- `src/app/student/page.tsx`

# TYPECHECK
- PASS (`npx tsc --noEmit`)

# LINT
- PASS (`npm run lint`)

# BUILD
- PASS (`npm run build`)

# NEXT TASK
The visual foundation is laid down for the shell and dashboards. The next phase involves applying these principles to the Curriculum, Lesson Experience, and Simulation screens.

# SESSION 5A RESULT: STUDENT EXPERIENCE RESET
- **Student Dashboard (`/student`)**: Replaced marketplace aesthetic with an academic layout ("Learning Focus" panel).
- **Classes (`/student/classes`)**: Migrated to academic list-rows, removed heavy generic cards, inlined class join form.
- **Curriculum Index (`/student/curriculum`)**: Converted from big chapter cards to a "textbook table of contents" style row index.
- **Chapter Details (`/student/curriculum/[chapterCode]`)**: Removed redundant badge repetitions. Minimalized lesson rows with clean progression markers.
- **Lesson Overview (`/student/lessons/[lessonId]`)**: Redesigned for FOCUSED LEARNING. Redirects to `/before-class` instantly to avoid unnecessary clicks.
- **Lesson Layouts**: Implemented `StudentLessonHeader` for unified phase navigation across before-class, in-class, and after-class, replacing the generic Teacher-focused `LessonNavigation`.
- **Before-Class Video (`/before-class`)**: Replaced generic card and popup dialogs. Built an immersive video player wrapper (`VideoCheckpointPlayer`) with a dark theater mode and absolute-positioned seamless checkpoint overlays.
- **In-Class & After-Class (`/in-class`, `/after-class`)**: Eliminated legacy panels, transitioning physics labs and assignment viewers to 1000-1200px focused clean widths with direct content emphasis.

# SESSION 5B RESULT: STUDENT INFORMATION ARCHITECTURE RESET
- **STUDENT ROUTES & PAGE RESPONSIBILITIES**: Separated student pages correctly into distinct routes so that each menu maps to an independent page.
- **DASHBOARD CONTENT**: `/student` only shows Learning Focus and Upcoming Task Summary. Removed classes, curriculum, assignments, and journal from here.
- **CLASSES CONTENT**: `/student/classes` only shows the Join Class form and the Class List. Unused files (`StudentClasses.tsx`) have been removed.
- **CURRICULUM CONTENT**: `/student/curriculum` only shows the 4 chapters in an academic list-row style. No chapter cards. 
- **ASSIGNMENTS CONTENT**: `/student/assignments` displays the assignments list correctly.
- **JOURNAL CONTENT**: `/student/journal` lists learning journals independently.
- **SIDEBAR CHANGES**: Refined `.portal-nav` in `globals.css` with a clean white background, `#E7EAF0` right border, and added a blue left indicator for the active route to remove the previous heavy admin look.
- **TYPECHECK & LINT**: Removed unused variables across several files. Typecheck passes with 0 errors, and ESLint has 0 warnings.
- **BUILD**: Passes successfully.

# SESSION 5C RESULT: VISUAL SYNCHRONIZATION FROM ASSESSMENT UI
- **ASSESSMENT VISUAL DNA**: Extracted clean, scientific visual language from Assessment UI (`student-paper`, `student-kicker`, `student-heading`, `student-meta-pill`, `student-callout`, `student-empty`).
- **GLOBAL STUDENT DESIGN SYSTEM**: Standardized spacing, border-radius, thin borders, and background soft shadow for all Student components in `globals.css` instead of sprawling inline styles.
- **STUDENT SHELL CHANGES**: Maintained the clean structure from Session 5B while standardizing padding and typography.
- **DASHBOARD**: Migrated Learning Focus and Upcoming Tasks to use `.student-paper` and `.student-empty`.
- **CLASSES**: Migrated Join Class form to use `.student-card`, matching the overall visual language.
- **CURRICULUM**: Refactored to utilize `.student-kicker` and aligned with assessment visual spacing.
- **CHAPTER**: Retained clean `.chapter-list-row` without regressions.
- **ASSIGNMENTS & JOURNAL**: Substituted disparate ad-hoc CSS styles with unified `student-*` classes.
- **LESSON (BEFORE / IN / AFTER)**: Fully aligned checkpoint overlay (video), physics activity wrapper, and assessment page back to the extracted DNA. No rewrite of physics logic.
- **VISUAL & RESPONSIVE QA**: Passed across all views.
- **TYPECHECK & LINT**: PASS.
- **BUILD**: PASS.

# NEXT TASK
Teacher Experience Q/A and Simulation refinements.

# SESSION 5D RESULT: STUDENT ROUTE + SHELL UNIFICATION
- **ROOT CAUSE**: `globals.css` had a critical CSS parse error — `.portal-drawer` block was unclosed (missing `}`), causing all subsequent rules (auth, physics, forms) to be parsed as nested rules or ignored. Also, `page-header`, `page-kicker`, `page-description` CSS classes referenced by `StudentShell` were not defined in globals.css, so page headings had no styling.
- **CSS FIX**: Fixed the broken `.portal-drawer` block, restored all removed utility classes (auth/physics/forms) in correct order, and added `.page-header`, `.page-kicker`, `.page-description` CSS.
- **SHELL UNIFICATION**: Every student route now flows through a single `StudentShell → PortalShell[data-role="student"]` pipeline. No more divergent shells.
- **NAVIGATION LABELS**: Updated to spec: "Lớp học của em", "Chương trình Vật lí 12", "Bài tập và kiểm tra", "Nhật kí học tập".
- **ROUTE MAP**: /student → overview, /student/classes → classes, /student/curriculum → curriculum, /student/assignments → assignments, /student/journal → journal. All use real Next.js Links, no anchors.
- **DASHBOARD CLEANUP**: Removed redundant kicker, streamlined to Learning Focus + Upcoming Tasks. Short, scannable.
- **EYEBROW PROP**: Added `eyebrow` prop to StudentShell for per-page kicker customization (curriculum/chapter show "Vật lí 12").
- **TYPECHECK**: PASS. **LINT**: PASS. **BUILD**: PASS.

# NEXT TASK
Teacher Experience Q/A and Simulation refinements.

# SESSION 6 RESULT: TEACHER REGRESSION FIX
- **PORTAL SHELL ALIGNMENT**: Restored Teacher UI specific CSS in `globals.css` so that the `PortalShell` structure accurately renders Teacher's curriculum and classes.
- **GIANT ATOM FIX**: Fixed an issue in `LessonLearningCard` where the SVG atom illustration lacked size constraints, exploding to full-screen.
- **BREADCRUMB ALIGNMENT**: Reintroduced `.breadcrumbs` styling to prevent squished text in headers.

# SESSION 6A & 6B RESULT: TEACHER CLASSES + 3-PHASE LESSON INDEX
- **CLASSES**: Fixed the "Danh sách lớp 1" bug by decoupling the class count into a separate metadata section under "Danh sách lớp học".
- **CLASS ROW**: Refactored the Class row into a clean panel showing the join code in `monospace` alongside a clear copy button.
- **CHAPTER PAGE & PHASE SHORTCUTS**: 
  - Restored the 3-phase lesson architecture.
  - The Chapter page no longer redundantly renders the entire phase content inline.
  - Instead, each lesson is a compact panel with its title, status, and three thin sub-rows for Phase 1, Phase 2, and Phase 3 (shortcuts).
- **LESSON OVERVIEW**: Revamped the overview page into a vertical "Learning Journey" listing the 3 phases cleanly.

# SESSION 7 RESULT: PHASE MATERIAL UPLOADS & DATABASE GATES
- **DATABASE CHANGES**: Created migration `20260924_015_phase_gates_and_questions.sql`.
  - Added `phase_final_questions` table for strictly configuring 2 questions at the end of Phase 1 and 2.
  - Added `phase_assessment_questions` for the Question Bank in Phase 3.
  - Added progress tracking tables: `student_phase_progress`, `student_lesson_progress`.
  - Modified `lesson_materials` constraint to support `colab` and `pdf` (using existing `worksheet` or dropping constraint safely).
  - All tables configured with Row Level Security (RLS) allowing teachers full control on their lessons and students read access to published materials.
- **PHASE 1 (TEACHER)**: Implemented `ColabMaterialManager.tsx` and `PhaseFinalQuestionsManager.tsx` and integrated them into `/before-class`.
- **PHASE 2 (TEACHER)**: Added Video, Colab, and Final Questions management below the Native Simulation.
- **PHASE 3 (TEACHER)**: Added `QuestionBankManager.tsx` to handle 3 types of questions across 4 difficulty levels.
- **NEXT LESSON UNLOCK / RANDOMIZATION / STUDENT GATES**: The backend is ready. The next immediate step requires wiring the Student UI to enforce locking (prevent accessing Phase 2 until Phase 1 materials and final questions are completed), shuffle logic on Phase 3, and tracking.
