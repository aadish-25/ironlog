import pool from "./server/db/connection.js";
import { getExerciseProgressService } from "./server/services/exercises.services.js";

async function run() {
    try {
        const userRes = await pool.query("SELECT id FROM users LIMIT 1;");
        const userId = userRes.rows[0].id;

        const exRes = await pool.query("SELECT id FROM exercises WHERE name = 'Machine Chest Press';");
        const exerciseId = exRes.rows[0].id;

        const progress = await getExerciseProgressService(userId, exerciseId);
        console.log("PROGRESS DATA:", JSON.stringify(progress, null, 2));

        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
