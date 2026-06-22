import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db/connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.resolve(__dirname, "../db/seedData/exercises.json");

const newExercises = [
    {
        name: "Lat Pulldown Narrow",
        muscle_groups: ["back"],
        equipment: ["machine"],
        description: "Targets the lats with a closer grip for increased stretch and range of motion.",
        form_guide: []
    },
    {
        name: "One Arm DB Row",
        muscle_groups: ["back"],
        equipment: ["dumbbell"],
        description: "Unilateral pulling movement that builds thickness in the mid-back and lats.",
        form_guide: []
    },
    {
        name: "One Arm DB Machine",
        muscle_groups: ["back"],
        equipment: ["machine"],
        description: "Machine variation of the one-arm row for added stability and focus on the lats.",
        form_guide: []
    },
    {
        name: "Incline DB Press",
        muscle_groups: ["chest"],
        equipment: ["dumbbell"],
        description: "Targets the upper chest and shoulders using dumbbells for a greater range of motion.",
        form_guide: []
    },
    {
        name: "Decline DB Press",
        muscle_groups: ["chest"],
        equipment: ["dumbbell"],
        description: "Focuses on the lower chest using a decline angle.",
        form_guide: []
    },
    {
        name: "Incline Pec Dec Fly",
        muscle_groups: ["chest"],
        equipment: ["machine"],
        description: "Machine fly variation that emphasizes the upper chest fibers.",
        form_guide: []
    },
    {
        name: "Machine Shoulder Press",
        muscle_groups: ["shoulders"],
        equipment: ["machine"],
        description: "Stable pressing movement to build front and side deltoids.",
        form_guide: []
    },
    {
        name: "Cable Push Down",
        muscle_groups: ["triceps"],
        equipment: ["cable"],
        description: "Isolates the triceps using constant tension from the cable machine.",
        form_guide: []
    },
    {
        name: "Cable Extension Bar/Rope",
        muscle_groups: ["triceps"],
        equipment: ["cable"],
        description: "Triceps extension utilizing a bar or rope attachment.",
        form_guide: []
    },
    {
        name: "Cable Reverse Curl",
        muscle_groups: ["biceps"],
        equipment: ["cable"],
        description: "Builds the brachialis and forearm muscles using an overhand grip.",
        form_guide: []
    },
    {
        name: "Squats",
        muscle_groups: ["legs"],
        equipment: ["bodyweight"],
        description: "Fundamental lower body movement using only body weight for resistance.",
        form_guide: []
    },
    {
        name: "Hip Abduction",
        muscle_groups: ["legs"],
        equipment: ["machine"],
        description: "Isolates the outer glutes and abductor muscles.",
        form_guide: []
    },
    {
        name: "Hip Adductor",
        muscle_groups: ["legs"],
        equipment: ["machine"],
        description: "Isolates the inner thigh muscles.",
        form_guide: []
    }
];

async function updateDB() {
    try {
        await pool.query("BEGIN");
        
        // Update renames in DB
        await pool.query(`
            UPDATE exercises 
            SET name = 'Lat Pulldown Wide', equipment = ARRAY['machine']
            WHERE name = 'Lat Pulldown'
        `);
        
        await pool.query(`
            UPDATE exercises 
            SET name = 'Seated Dumbbell Shoulder Press', equipment = ARRAY['dumbbell']
            WHERE name = 'Dumbbell Press'
        `);

        // Insert new exercises
        for (const ex of newExercises) {
            await pool.query(`
                INSERT INTO exercises (name, muscle_groups, equipment, description, form_guide)
                SELECT $1, $2, $3, $4, $5::jsonb
                WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = $1)
            `, [ex.name, ex.muscle_groups, ex.equipment, ex.description, JSON.stringify(ex.form_guide)]);
        }

        await pool.query("COMMIT");
        console.log("Database updated successfully.");
    } catch (e) {
        await pool.query("ROLLBACK");
        console.error("DB update failed:", e);
    } finally {
        await pool.end();
    }
}

async function updateJSON() {
    try {
        const raw = await fs.readFile(seedFilePath, "utf8");
        let exercises = JSON.parse(raw);

        let latUpdated = false;
        let dbPressUpdated = false;

        for (let ex of exercises) {
            if (ex.name === "Lat Pulldown") {
                ex.name = "Lat Pulldown Wide";
                ex.equipment = ["machine"];
                latUpdated = true;
            } else if (ex.name === "Dumbbell Press") {
                ex.name = "Seated Dumbbell Shoulder Press";
                ex.equipment = ["dumbbell"];
                dbPressUpdated = true;
            }
        }

        // add new ones if not already in JSON
        for (const newEx of newExercises) {
            if (!exercises.find(e => e.name === newEx.name)) {
                exercises.push(newEx);
            }
        }

        await fs.writeFile(seedFilePath, JSON.stringify(exercises, null, 4));
        console.log("exercises.json updated successfully.");
    } catch (e) {
        console.error("JSON update failed:", e);
    }
}

async function run() {
    await updateJSON();
    await updateDB();
}

run();
