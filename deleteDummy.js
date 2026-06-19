import pool from "./server/db/connection.js";

async function run() {
    try {
        const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        // Find dummy sessions (anything created with date strictly before today)
        const res = await pool.query("SELECT id, date FROM sessions WHERE date < $1", [todayStr]);
        
        if (res.rows.length === 0) {
            console.log("No dummy sessions found prior to today.");
        } else {
            console.log(`Found ${res.rows.length} dummy sessions to delete.`);
            // Delete sets
            const sessionIds = res.rows.map(r => r.id);
            await pool.query("DELETE FROM sets WHERE session_id = ANY($1::uuid[])", [sessionIds]);
            // Delete sessions
            await pool.query("DELETE FROM sessions WHERE id = ANY($1::uuid[])", [sessionIds]);
            console.log("Successfully deleted dummy sessions and sets.");
        }

    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();
