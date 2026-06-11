CREATE TABLE users (
    id UUID PRIMARY KEY,
    clerk_id TEXT UNIQUE,
    name TEXT,
    profile_picture_url TEXT,
    preferred_workout_time TIME,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);