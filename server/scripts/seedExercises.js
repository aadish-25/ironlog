import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import pool from "../db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFilePath = path.resolve(__dirname, "../db/seedData/exercises.json");

async function readExercisesFromFile() {
    const raw = await fs.readFile(seedFilePath, "utf8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
        throw new Error("Seed data must be an array of exercise objects.");
    }

    return data;
}

async function seedExercises() {
    const exercises = await readExercisesFromFile();

    await pool.query("BEGIN");

    try {
        for (const exercise of exercises) {
            const { name, muscle_groups, equipment, description, form_guide } =
                exercise;

            await pool.query(
                `
                INSERT INTO exercises (
                    name,
                    muscle_groups,
                    equipment,
                    description,
                    form_guide,
                    picture_url,
                    demo_url,
                    demo_type
                )
                VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
                `,
                [
                    name,
                    muscle_groups,
                    equipment,
                    description,
                    JSON.stringify(form_guide),
                    null,
                    null,
                    null,
                ],
            );
        }

        await pool.query("COMMIT");
        console.log(`Seeded ${exercises.length} exercises successfully.`);
    } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
    } finally {
        await pool.end();
    }
}

seedExercises().catch((error) => {
    console.error("Failed to seed exercises:", error);
    process.exitCode = 1;
});
