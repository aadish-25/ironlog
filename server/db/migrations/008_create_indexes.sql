CREATE INDEX idx_splits_user_id ON splits(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sets_user_id ON sets(user_id);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX idx_sets_session_id ON sets(session_id);