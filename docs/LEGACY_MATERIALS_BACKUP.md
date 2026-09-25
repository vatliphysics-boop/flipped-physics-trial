# LEGACY MATERIALS BACKUP & PURGE PLAN

## Scope of Purge
- `video_checkpoints` & `video_checkpoint_attempts`
- `phase_final_questions`
- `phase_assessment_questions`
- `lesson_material_progress`
- `lesson_materials`
- Associated storage objects in `lesson-videos` and `lesson-materials` buckets.

## Why Purge?
The user requested a full reset of legacy materials across all chapters to clean up the system and fix the upload/storage architecture.

## Backup Data
*Note: Due to lack of direct database API access during this session, a live export of the JSON rows could not be performed. The SQL script `PURGE_LEGACY_MATERIALS.sql` was created instead for safe execution on the backend.*
