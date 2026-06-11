CREATE TABLE split_day_exercises (
    id UUID PRIMARY KEY,
    split_day_id UUID REFERENCES split_days(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);