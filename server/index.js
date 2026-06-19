import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import auth from "./middlewares/clerkAuth.middleware.js";
import cors from "cors";
import pool from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://172.25.208.1:5173",
    "https://172.25.208.1:5173",
    "http://172.31.183.44:5173",
    "https://172.31.183.44:5173",
    "https://192.168.1.5:5173" 
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

app.use(clerkMiddleware());

app.get("/", (req, res) => {
    res.send("<h1>Hello World</h1>");
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
