import pool from "../db/connection.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.resolve(__dirname, "../db/seedData/exercises.json");

const newExercises = [
    {
        name: "Front Raise",
        muscle_groups: ["shoulders"],
        equipment: ["dumbbell"],
        description: "Isolates the front delts by lifting the arms directly in front of the body. Keep the movement strict and avoid swinging.",
        form_guide: [
            { step: 1, instruction: "Stand tall holding dumbbells in front of your thighs with palms facing down." },
            { step: 2, instruction: "Raise both arms straight in front of you to shoulder height." },
            { step: 3, instruction: "Pause briefly at the top without shrugging." },
            { step: 4, instruction: "Lower dumbbells slowly back to the starting position." }
        ]
    },
    {
        name: "Overhead Dumbbell Press",
        muscle_groups: ["shoulders"],
        equipment: ["dumbbell"],
        description: "A compound shoulder movement using dumbbells for independent arm control and greater range of motion. Keep core braced throughout.",
        form_guide: [
            { step: 1, instruction: "Hold dumbbells at shoulder height with palms facing forward." },
            { step: 2, instruction: "Brace your core and keep your back upright." },
            { step: 3, instruction: "Press dumbbells overhead until arms are fully extended." },
            { step: 4, instruction: "Lower back to shoulder height under control." }
        ]
    }
];

async function run() {
    try {
        // --- Update JSON ---
        const raw = await fs.readFile(seedFilePath, "utf8");
        let exercises = JSON.parse(raw);

        for (let ex of exercises) {
            if (ex.name === "Overhead Press") {
                ex.name = "Overhead Barbell Press";
            }
        }

        for (const newEx of newExercises) {
            if (!exercises.find(e => e.name === newEx.name)) {
                exercises.push(newEx);
            }
        }

        await fs.writeFile(seedFilePath, JSON.stringify(exercises, null, 4));
        console.log("exercises.json updated.");

        // --- Update DB ---
        await pool.query("BEGIN");

        await pool.query(`
            UPDATE exercises SET name = 'Overhead Barbell Press'
            WHERE name = 'Overhead Press'
        `);

        for (const ex of newExercises) {
            await pool.query(`
                INSERT INTO exercises (name, muscle_groups, equipment, description, form_guide)
                SELECT $1, $2, $3, $4, $5::jsonb
                WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = $1)
            `, [ex.name, ex.muscle_groups, ex.equipment, ex.description, JSON.stringify(ex.form_guide)]);
        }

        await pool.query("COMMIT");
        console.log("Database updated.");
    } catch (e) {
        await pool.query("ROLLBACK");
        console.error("Failed:", e);
    } finally {
        await pool.end();
    }
}

run();
