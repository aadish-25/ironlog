import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import auth from "./middlewares/clerkAuth.middleware.js";
import cors from "cors";
import pool from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// This middleware parses requests with a JSON body.
app.use(express.json());

// This middleware parses URL-encoded form data, which is commonly sent from HTML forms.
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);

            if (
                origin.includes("localhost") ||
                origin.includes("127.0.0.1") ||
                origin.includes("192.168.") ||
                origin.includes("172.") ||
                origin.includes("10.") ||
                (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
            ) {
                return callback(null, true);
            }
            // switch if cors causes an issue to essentially allow every origin
            // return callback(null, true);
            return callback(null, false)
        },
        credentials: true,
    }),
);

app.use(clerkMiddleware());

app.get("/", (req, res) => {
    res.send("<h1>Phase 1 complete!! Phase 2 in progress</h1>");
});

app.get("/protected", auth, (req, res) => {
    res.json({
        user: req.user,
        auth: req.auth,
    });
});

app.listen(PORT, () => {
    console.log(
        `App successfully running on PORT ${PORT} at http://localhost:${PORT}`,
    );
});

// Import routes
import userRoutes from "./routes/user.route.js";
import splitsRoutes from "./routes/splits.route.js";
import splitDaysRoutes from "./routes/splitDays.route.js";
import exerciseRoutes from "./routes/exercises.route.js";
import splitDayExercisesRoutes from "./routes/splitDayExercises.route.js";
import sessionsRouter from "./routes/sessions.route.js";
import setsRoutes from "./routes/sets.route.js";

// Routes
app.use("/api/users", userRoutes);
app.use("/api/splits", splitsRoutes);
app.use("/api/split-days", splitDaysRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/split-day-exercises", splitDayExercisesRoutes);
app.use("/api/sessions", sessionsRouter);
app.use("/api/sets", setsRoutes);

// Export for Vercel Serverless
export default app;
