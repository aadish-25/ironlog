CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ALTER TABLE users
--     ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE splits
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE split_days
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE exercises
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE split_day_exercises
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE sessions
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE sets
    ALTER COLUMN id SET DEFAULT gen_random_uuid();