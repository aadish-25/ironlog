import pool from "./server/db/connection.js";

async function run() {
    try {
        // Find user
        const userRes = await pool.query("SELECT id FROM users LIMIT 1;");
        if (userRes.rows.length === 0) {
            console.log("No users found.");
            process.exit(1);
        }
        const userId = userRes.rows[0].id;

        // Find exercise
        const exRes = await pool.query("SELECT id FROM exercises WHERE name = 'Machine Chest Press';");
        if (exRes.rows.length === 0) {
            console.log("Exercise not found.");
            process.exit(1);
        }
        const exerciseId = exRes.rows[0].id;

        // Find split_day (just any to attach session to)
        const sdRes = await pool.query("SELECT id FROM split_days LIMIT 1;");
        const splitDayId = sdRes.rows[0].id;

        console.log(`User: ${userId}, Ex: ${exerciseId}, SplitDay: ${splitDayId}`);

        // Insert dummy sessions & sets for the past 4 weeks
        const now = new Date();
        const dates = [
            new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // ~4 weeks ago
            new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000), // ~3 weeks ago
            new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000), // ~2 weeks ago
            new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),  // ~1 week ago
        ];

        const weights = [60, 75, 85, 95];

        for (let i = 0; i < dates.length; i++) {
            const d = dates[i];
            const w = weights[i];

            const dateStr = d.toISOString().split("T")[0];

            // Create session
            const sessionRes = await pool.query(
                `INSERT INTO sessions (user_id, split_day_id, date, is_completed) VALUES ($1, $2, $3, true) RETURNING id`,
                [userId, splitDayId, dateStr]
            );
            const sessionId = sessionRes.rows[0].id;

            // Create 3 sets
            for(let setNum = 1; setNum <= 3; setNum++) {
                const isPr = setNum === 3;
                const setWeight = isPr ? w : w - 10;
                await pool.query(
                    `INSERT INTO sets (session_id, exercise_id, user_id, set_number, weight_kg, reps, is_pr) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [sessionId, exerciseId, userId, setNum, setWeight, 10, isPr]
                );
            }
            console.log(`Inserted session for ${dateStr} with max weight ${w}`);
        }

        console.log("Done inserting dummy data.");
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();
