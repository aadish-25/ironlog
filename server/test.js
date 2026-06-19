import { getSplitsByUserService } from "./services/splits.services.js";
import pool from "./db/connection.js";

async function run() {
    try {
        // You can use a dummy user ID or we can fetch a user first
        const users = await pool.query("SELECT id FROM users LIMIT 1");
        if (users.rows.length > 0) {
            const userId = users.rows[0].id;
            const splits = await getSplitsByUserService(userId);
            console.log(JSON.stringify(splits, null, 2));
        } else {
            console.log("No users");
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
