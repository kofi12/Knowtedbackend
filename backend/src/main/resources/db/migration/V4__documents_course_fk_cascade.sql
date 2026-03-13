-- V4__documents_course_fk_cascade.sql
BEGIN;

-- Drop the existing FK (name may vary; this is the one you showed earlier)
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_course_id_fkey;

-- Re-add with CASCADE
ALTER TABLE documents
  ADD CONSTRAINT documents_course_id_fkey
  FOREIGN KEY (course_id)
  REFERENCES courses(course_id)
  ON DELETE CASCADE;

COMMIT;