CREATE TABLE split_days(
    id UUID PRIMARY KEY,
    split_id UUID REFERENCES splits(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
);