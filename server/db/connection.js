import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { Pool } = pg;

// Parse Postgres DATE (OID 1082) as exact 'YYYY-MM-DD' string to eliminate timezone shifts
pg.types.setTypeParser(1082, (val) => val);

const connectionString = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace("sslmode=require", "uselibpqcompat=true&sslmode=require")
    : undefined;

const pool = new Pool({
    connectionString,
});

export default pool;
