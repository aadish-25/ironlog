import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import auth from "./middlewares/clerkAuth.middleware.js";
import cors from "cors";
import pool from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:5173",
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
import userRoutes from "./routes/user.route.js"

// Routes
app.use("/api/users", userRoutes);