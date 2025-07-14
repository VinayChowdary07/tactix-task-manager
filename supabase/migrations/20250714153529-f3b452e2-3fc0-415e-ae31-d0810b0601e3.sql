
-- Remove tag-related tables and columns
DROP TABLE IF EXISTS public.task_tags;
DROP TABLE IF EXISTS public.tags;

-- Remove tag-related columns from tasks table (if any were added)
-- Note: Based on the schema, tasks table doesn't have direct tag columns, so no changes needed there

-- Clean up any tag-related functions or triggers if they exist
-- (None found in the current schema)
