CREATE TABLE sets (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight_kg DECIMAL(5,2),
    reps INTEGER,
    is_pr BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    set_number INTEGER NOT NULL CHECK (set_number > 0),
    weight_kg DECIMAL(5,2) CHECK (weight_kg > 0),
    reps INTEGER CHECK (reps > 0),
);