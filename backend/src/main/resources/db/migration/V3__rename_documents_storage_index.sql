-- Rename misleading index name: idx_documents_s3_key -> idx_documents_storage_key
-- (Index already targets the storage_key column)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND n.nspname = 'public'
      AND c.relname = 'idx_documents_s3_key'
  ) THEN
    ALTER INDEX public.idx_documents_s3_key RENAME TO idx_documents_storage_key;
  END IF;
END $$;