-- Migration 015: Add missing indexes on foreign keys and frequent query filters

-- Fast lookups when loading split details (split -> split_days)
CREATE INDEX IF NOT EXISTS idx_split_days_split_id ON split_days(split_id);

-- Fast lookups when loading exercises for a split day
CREATE INDEX IF NOT EXISTS idx_split_day_exercises_split_day_id ON split_day_exercises(split_day_id);
CREATE INDEX IF NOT EXISTS idx_split_day_exercises_exercise_id ON split_day_exercises(exercise_id);

-- Covering index for PR lookups (MAX(weight_kg) for a user on a specific exercise)
CREATE INDEX IF NOT EXISTS idx_sets_user_exercise_weight ON sets(user_id, exercise_id, weight_kg DESC);

-- Fast lookups when ordering or filtering user workout history by date
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date DESC);
