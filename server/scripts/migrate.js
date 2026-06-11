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
// load the file path of the migration sql file, pass the filename as param
const migrationFile = getMigrationPath("001_create_users.sql");

async function runMigration() {
    const sql_string = await fs.promises.readFile(migrationFile, "utf8");
    await pool.query(sql_string);
}

runMigration().catch(console.error);
