-- V2: Make documents storage provider-agnostic + add optional sha256
-- Assumes V1 created documents with s3_* columns (s3_key, s3_bucket, s3_etag)

BEGIN;

-- 1) Rename S3 columns -> neutral storage columns (safe for GCS)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='s3_key'
  ) THEN
    ALTER TABLE documents RENAME COLUMN s3_key TO storage_key;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='s3_bucket'
  ) THEN
    ALTER TABLE documents RENAME COLUMN s3_bucket TO storage_bucket;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='documents' AND column_name='s3_etag'
  ) THEN
    ALTER TABLE documents RENAME COLUMN s3_etag TO storage_etag;
  END IF;
END $$;

-- 2) Ensure required columns exist (idempotent adds)
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS original_filename TEXT;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS content_type TEXT;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS storage_bucket TEXT;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS storage_key TEXT;

-- 3) Optional integrity field
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_hash_sha256 TEXT;

-- 4) Make the required ones NOT NULL (only if data is already present)
-- If you already have rows, these updates avoid NOT NULL failures.
UPDATE documents
SET original_filename = COALESCE(original_filename, '')
WHERE original_filename IS NULL;

UPDATE documents
SET storage_key = COALESCE(storage_key, '')
WHERE storage_key IS NULL;

ALTER TABLE documents
  ALTER COLUMN original_filename SET NOT NULL,
  ALTER COLUMN storage_key SET NOT NULL;

COMMIT;