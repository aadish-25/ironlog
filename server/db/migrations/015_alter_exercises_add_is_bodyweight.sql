ALTER TABLE exercises ADD COLUMN is_bodyweight BOOLEAN DEFAULT FALSE;

-- Set is_bodyweight = true for exercises that usually require bodyweight
UPDATE exercises 
SET is_bodyweight = TRUE 
WHERE 'Abs' = ANY(muscle_groups) 
   OR 'Bodyweight' = ANY(equipment);
