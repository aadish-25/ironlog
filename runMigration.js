import pool from "./server/db/connection.js";

async function run() {
    try {
        await pool.query("ALTER TABLE split_days ADD COLUMN is_rest BOOLEAN DEFAULT false;");
        console.log("Migration successful");
    } catch(err) {
        console.log("Migration failed or already applied:", err.message);
    } finally {
        process.exit(0);
    }
}

run();
