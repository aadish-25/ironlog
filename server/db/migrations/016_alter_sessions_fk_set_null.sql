-- Migration 016: Change sessions foreign key to ON DELETE SET NULL to protect workout history
-- and add routine_name snapshot column.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'sessions'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%split_day%'
    ) LOOP
        EXECUTE 'ALTER TABLE sessions DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

ALTER TABLE sessions
    ADD CONSTRAINT sessions_split_day_id_fkey
    FOREIGN KEY (split_day_id) REFERENCES split_days(id) ON DELETE SET NULL;

ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS routine_name VARCHAR(100);
