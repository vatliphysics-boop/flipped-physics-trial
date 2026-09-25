-- PURGE LEGACY MATERIALS
-- This script safely removes old lesson materials and associated data without affecting users, classes, or base lessons.
-- Backup should be taken before running this script.

BEGIN;

-- 1. Purge Video Checkpoint Attempts (Student answers to old videos)
DELETE FROM public.video_checkpoint_attempts
WHERE checkpoint_id IN (
  SELECT id FROM public.video_checkpoints
);

-- 2. Purge Video Checkpoints (Old video checkpoints)
DELETE FROM public.video_checkpoints;

-- 3. Purge Phase Final Questions (Phase 1, 2, 3 questions)
DELETE FROM public.phase_final_questions;

-- 4. Purge Phase Assessment Questions (Phase 3 question bank)
DELETE FROM public.phase_assessment_questions;

-- 5. Purge Lesson Material Progress (Student progress on old materials)
DELETE FROM public.lesson_material_progress;

-- 6. Purge Lesson Materials (The actual materials)
DELETE FROM public.lesson_materials;

-- Storage Note: Storage objects cannot be directly deleted via standard SQL easily because they are in the `storage` schema and might require API calls. 
-- However, if using psql with supabase superuser:
-- DELETE FROM storage.objects WHERE bucket_id IN ('lesson-videos', 'lesson-materials');

COMMIT;
