// One-off script: copies all data from the OLD Neon DB to the NEW Neon DB.
// The schema must already exist on the NEW DB (run `npm run migration` against it first).
// Usage (PowerShell, from /server):
//   $env:OLD_DATABASE_URL="postgresql://..."   # old DIRECT (non-pooled) URL
//   $env:NEW_DATABASE_URL="postgresql://..."   # new DIRECT (non-pooled) URL
//   node scripts/copyDb.js
import pg from "pg";

const { Pool } = pg;

const fix = (url) =>
    url.replace("sslmode=require", "uselibpqcompat=true&sslmode=require");

const { OLD_DATABASE_URL, NEW_DATABASE_URL } = process.env;
if (!OLD_DATABASE_URL || !NEW_DATABASE_URL) {
    console.error("Set OLD_DATABASE_URL and NEW_DATABASE_URL first.");
    process.exit(1);
}
if (OLD_DATABASE_URL === NEW_DATABASE_URL) {
    console.error("OLD and NEW URLs are identical. Aborting.");
    process.exit(1);
}

const oldDb = new Pool({ connectionString: fix(OLD_DATABASE_URL) });
const newDb = new Pool({ connectionString: fix(NEW_DATABASE_URL) });

// Parents before children, so foreign keys are satisfied.
const TABLES = [
    "users",
    "splits",
    "split_days",
    "exercises",
    "split_day_exercises",
    "sessions",
    "sets",
];
const CHUNK = 500;

async function copyTable(table) {
    const { rows } = await oldDb.query(`SELECT * FROM ${table}`);
    if (rows.length === 0) {
        console.log(`${table}: 0 rows`);
        return;
    }

    for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        // json_populate_recordset maps JSON keys to the table's columns and types,
        // so UUIDs, timestamps, numerics and arrays are preserved exactly.
        await newDb.query(
            `INSERT INTO ${table}
             SELECT * FROM json_populate_recordset(NULL::${table}, $1::json)
             ON CONFLICT DO NOTHING`,
            [JSON.stringify(chunk)],
        );
    }
    console.log(`${table}: copied ${rows.length} rows`);
}

async function verify() {
    let ok = true;
    for (const table of TABLES) {
        const a = await oldDb.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
        const b = await newDb.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
        const match = a.rows[0].n === b.rows[0].n;
        if (!match) ok = false;
        console.log(
            `${match ? "OK  " : "DIFF"} ${table}: old=${a.rows[0].n} new=${b.rows[0].n}`,
        );
    }
    return ok;
}

try {
    for (const table of TABLES) {
        await copyTable(table);
    }
    console.log("\nVerifying row counts...");
    const ok = await verify();
    console.log(ok ? "\nAll tables match." : "\nMISMATCH, check the output above.");
    process.exitCode = ok ? 0 : 1;
} catch (err) {
    console.error("Copy failed:", err);
    process.exitCode = 1;
} finally {
    await oldDb.end();
    await newDb.end();
}
