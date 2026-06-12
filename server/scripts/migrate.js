import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import pool from "../db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// migrations folder path wrt the cwd
const migrationsDir = path.resolve(__dirname, "../db/migrations");

// returns the full path of the sql file to be migrated
function getMigrationPath(filename) {
    return path.join(migrationsDir, filename);
}

async function ensureMigrationTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);
}

async function hasMigrationBeenApplied(filename) {
    const result = await pool.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [filename],
    );

    return result.rowCount > 0;
}

function isAlreadyAppliedError(error) {
    return ["42P07", "42710", "42701"].includes(error?.code);
}

async function markMigrationAsApplied(filename) {
    await pool.query(
        `
        INSERT INTO schema_migrations (filename)
        VALUES ($1)
        ON CONFLICT (filename) DO NOTHING
        `,
        [filename],
    );
}

// Runs migrations on all files in the migration folder
async function runMigrations() {
    await ensureMigrationTable();

    const migrationFiles = (await fs.promises.readdir(migrationsDir))
        .filter((filename) => filename.endsWith(".sql"))
        .sort();

    for (const migrationFile of migrationFiles) {
        if (await hasMigrationBeenApplied(migrationFile)) {
            console.log(`Skipped migration: ${migrationFile}`);
            continue;
        }

        const sqlString = await fs.promises.readFile(
            getMigrationPath(migrationFile),
            "utf8",
        );

        try {
            await pool.query(sqlString);
            await markMigrationAsApplied(migrationFile);
            console.log(`Executed migration: ${migrationFile}`);
        } catch (error) {
            if (isAlreadyAppliedError(error)) {
                await markMigrationAsApplied(migrationFile);
                console.log(`Skipped migration: ${migrationFile}`);
                continue;
            }

            throw error;
        }
    }
}

runMigrations().catch(console.error);
