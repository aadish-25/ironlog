import pool from "../db/connection.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.resolve(__dirname, "../db/seedData/exercises.json");

// Form guides for exercises that are missing them
const formGuides = {
    "Lat Pulldown Narrow": {
        description: "A close-grip lat pulldown that increases stretch and range of motion through the lats. Keep elbows tucked and pull through the back.",
        form_guide: [
            { step: 1, instruction: "Grip the bar with a shoulder-width or narrower grip and sit with knees secured." },
            { step: 2, instruction: "Sit tall with a slight lean back and chest lifted." },
            { step: 3, instruction: "Pull the bar to your upper chest, driving elbows straight down." },
            { step: 4, instruction: "Return bar overhead slowly until arms are fully extended." }
        ]
    },
    "One Arm DB Row": {
        description: "A unilateral dumbbell row that builds thickness in the mid-back and lats. Brace on a bench for stability and focus on pulling with the elbow.",
        form_guide: [
            { step: 1, instruction: "Place one knee and same-side hand on a bench for support." },
            { step: 2, instruction: "Hold the dumbbell with the free hand, arm extended toward the floor." },
            { step: 3, instruction: "Row the dumbbell up toward your hip, keeping your elbow close to your body." },
            { step: 4, instruction: "Lower the dumbbell under control to full extension." }
        ]
    },
    "One Arm DB Machine": {
        description: "A machine-assisted unilateral row for isolating each side of the back with added stability. Focus on squeezing the lat at the top.",
        form_guide: [
            { step: 1, instruction: "Set the machine handle to chest height and sit or stand in position." },
            { step: 2, instruction: "Grip the handle with one hand and keep your chest tall." },
            { step: 3, instruction: "Pull the handle toward your hip, driving your elbow back." },
            { step: 4, instruction: "Return to the start position slowly with full arm extension." }
        ]
    },
    "Incline DB Press": {
        description: "A dumbbell press on an incline bench that emphasizes the upper chest and front delts. Greater range of motion than a barbell variation.",
        form_guide: [
            { step: 1, instruction: "Set the bench to a 30–45 degree incline and sit with dumbbells on your thighs." },
            { step: 2, instruction: "Lie back and press the dumbbells to chest height with palms facing forward." },
            { step: 3, instruction: "Press both dumbbells up until arms are extended above your upper chest." },
            { step: 4, instruction: "Lower slowly until elbows are slightly below bench level." }
        ]
    },
    "Decline DB Press": {
        description: "Targets the lower chest fibers using dumbbells on a decline angle. Keep shoulder blades retracted throughout.",
        form_guide: [
            { step: 1, instruction: "Set the bench to a decline and secure your feet at the top." },
            { step: 2, instruction: "Hold dumbbells at chest height with palms facing forward." },
            { step: 3, instruction: "Press both dumbbells up until arms are extended." },
            { step: 4, instruction: "Lower slowly until elbows are just below bench level." }
        ]
    },
    "Incline Pec Dec Fly": {
        description: "A machine fly variation on an incline angle that emphasizes the upper chest fibers with constant tension.",
        form_guide: [
            { step: 1, instruction: "Adjust the pec deck seat so handles are at upper chest level." },
            { step: 2, instruction: "Grip the handles and keep a slight bend in your elbows throughout." },
            { step: 3, instruction: "Bring the handles together in front of your upper chest in a hugging arc." },
            { step: 4, instruction: "Return arms out slowly to feel a full stretch in the upper chest." }
        ]
    },
    "Machine Shoulder Press": {
        description: "A stable overhead pressing movement using a machine to target the front and side deltoids. Great for controlled hypertrophy.",
        form_guide: [
            { step: 1, instruction: "Adjust the seat so handles are at shoulder height." },
            { step: 2, instruction: "Grip handles and keep your back flat against the pad." },
            { step: 3, instruction: "Press handles overhead until arms are nearly extended." },
            { step: 4, instruction: "Lower handles back to shoulder height under control." }
        ]
    },
    "Cable Bar Pushdown": {
        description: "A cable tricep exercise using a straight or EZ bar attachment that emphasizes the lateral head of the triceps.",
        form_guide: [
            { step: 1, instruction: "Attach a bar to the high cable pulley and grip it with palms facing down, slightly narrower than shoulder width." },
            { step: 2, instruction: "Keep elbows pinned to your sides throughout the movement." },
            { step: 3, instruction: "Push the bar down until arms are fully extended." },
            { step: 4, instruction: "Return the bar slowly until forearms are parallel to the floor." }
        ]
    },
    "Cable Reverse Curl": {
        description: "Builds the brachialis and forearm muscles using an overhand grip on a cable for constant tension.",
        form_guide: [
            { step: 1, instruction: "Attach a straight bar to the low cable and grip with palms facing down." },
            { step: 2, instruction: "Stand tall with elbows pinned to your sides." },
            { step: 3, instruction: "Curl the bar up toward your shoulders without swinging." },
            { step: 4, instruction: "Lower the bar slowly back to the starting position." }
        ]
    },
    "Squats": {
        description: "The fundamental bodyweight squat that builds lower body strength, mobility, and stability. Focus on depth and keeping your chest up.",
        form_guide: [
            { step: 1, instruction: "Stand with feet shoulder-width apart and toes slightly turned out." },
            { step: 2, instruction: "Brace your core and keep your chest tall throughout." },
            { step: 3, instruction: "Lower by pushing knees out and sitting back until thighs are parallel to the floor." },
            { step: 4, instruction: "Drive through your heels to stand back up to full extension." }
        ]
    },
    "Hip Abduction": {
        description: "Isolates the outer glutes and hip abductor muscles using a machine. Keep movements controlled and avoid momentum.",
        form_guide: [
            { step: 1, instruction: "Sit on the abductor machine and adjust pads to rest on your outer thighs." },
            { step: 2, instruction: "Sit upright with your back against the pad and feet planted." },
            { step: 3, instruction: "Push your legs outward against the pads as far as comfortable." },
            { step: 4, instruction: "Return legs together slowly with control." }
        ]
    },
    "Hip Adductor": {
        description: "Isolates the inner thigh adductor muscles using a machine. Focus on a slow, controlled squeeze.",
        form_guide: [
            { step: 1, instruction: "Sit on the adductor machine and adjust pads to rest on your inner thighs." },
            { step: 2, instruction: "Sit upright with your back against the pad and feet planted." },
            { step: 3, instruction: "Squeeze your legs inward against the pads until they meet." },
            { step: 4, instruction: "Return legs outward slowly to feel a full stretch." }
        ]
    }
};

const newExercise = {
    name: "Overhead Dumbbell Extension",
    muscle_groups: ["triceps"],
    equipment: ["dumbbell"],
    description: "Isolates the long head of the triceps by extending overhead. Keep your elbows locked in and avoid flaring.",
    form_guide: [
        { step: 1, instruction: "Hold one dumbbell with both hands and lift it overhead until arms are extended." },
        { step: 2, instruction: "Keep upper arms close to your head and elbows pointing forward." },
        { step: 3, instruction: "Lower the dumbbell behind your head by bending your elbows until you feel a stretch." },
        { step: 4, instruction: "Press back up to full extension by straightening your arms." }
    ]
};

async function run() {
    try {
        // --- Update JSON ---
        const raw = await fs.readFile(seedFilePath, "utf8");
        let exercises = JSON.parse(raw);

        // Remove Cable Push Down (duplicate of Rope Pushdown)
        exercises = exercises.filter(e => e.name !== "Cable Push Down");

        // Rename Cable Extension Bar/Rope → Cable Bar Pushdown + add form guide
        for (let ex of exercises) {
            if (ex.name === "Cable Extension Bar/Rope") {
                ex.name = "Cable Bar Pushdown";
                ex.equipment = ["cable"];
                ex.description = formGuides["Cable Bar Pushdown"].description;
                ex.form_guide = formGuides["Cable Bar Pushdown"].form_guide;
            }
            // Fill missing form guides
            if (formGuides[ex.name] && (!ex.form_guide || ex.form_guide.length === 0)) {
                ex.description = formGuides[ex.name].description;
                ex.form_guide = formGuides[ex.name].form_guide;
            }
        }

        // Add Overhead Dumbbell Extension if not present
        if (!exercises.find(e => e.name === newExercise.name)) {
            exercises.push(newExercise);
        }

        await fs.writeFile(seedFilePath, JSON.stringify(exercises, null, 4));
        console.log("exercises.json updated.");

        // --- Update DB ---
        await pool.query("BEGIN");

        // Delete Cable Push Down
        await pool.query(`DELETE FROM exercises WHERE name = 'Cable Push Down'`);

        // Rename + update Cable Extension Bar/Rope
        await pool.query(`
            UPDATE exercises
            SET name = 'Cable Bar Pushdown',
                equipment = ARRAY['cable'],
                description = $1,
                form_guide = $2::jsonb
            WHERE name = 'Cable Extension Bar/Rope'
        `, [formGuides["Cable Bar Pushdown"].description, JSON.stringify(formGuides["Cable Bar Pushdown"].form_guide)]);

        // Fill form guides for all exercises that are missing them
        const toFill = { ...formGuides };
        delete toFill["Cable Bar Pushdown"]; // already handled above

        for (const [name, data] of Object.entries(toFill)) {
            await pool.query(`
                UPDATE exercises
                SET description = $1, form_guide = $2::jsonb
                WHERE name = $3 AND (form_guide IS NULL OR form_guide = '[]'::jsonb)
            `, [data.description, JSON.stringify(data.form_guide), name]);
        }

        // Add Overhead Dumbbell Extension
        await pool.query(`
            INSERT INTO exercises (name, muscle_groups, equipment, description, form_guide)
            SELECT $1, $2, $3, $4, $5::jsonb
            WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = $1)
        `, [newExercise.name, newExercise.muscle_groups, newExercise.equipment, newExercise.description, JSON.stringify(newExercise.form_guide)]);

        await pool.query("COMMIT");
        console.log("Database updated.");

    } catch (e) {
        await pool.query("ROLLBACK");
        console.error("Failed:", e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
