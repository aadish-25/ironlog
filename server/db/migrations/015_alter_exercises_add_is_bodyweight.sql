ALTER TABLE exercises ADD COLUMN is_bodyweight BOOLEAN DEFAULT FALSE;

-- Set is_bodyweight = true for exercises that usually require bodyweight
UPDATE exercises 
SET is_bodyweight = TRUE 
WHERE 'abs' = ANY(muscle_groups) 
   OR 'bodyweight' = ANY(equipment)
   OR 'calisthenics' = ANY(equipment);
