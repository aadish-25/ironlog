CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_groups TEXT[] NOT NULL,
    equipment TEXT[] NOT NULL,
    description TEXT NOT NULL,
    form_guide JSONB DEFAULT '[]'::jsonb,
    picture_url TEXT,
    demo_url TEXT,
    demo_type TEXT CHECK (demo_type IN ('gif', 'youtube')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);