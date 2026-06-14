ALTER TABLE exercises
DROP CONSTRAINT IF EXISTS exercises_demo_type_check;

ALTER TABLE exercises
ADD CONSTRAINT exercises_demo_type_check
CHECK (demo_type IN ('gif', 'youtube', 'mp4'));
