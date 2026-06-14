import express, { Router } from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/devAuth.middleware.js";
import {
    getExercises,
    getExerciseById,
    getExerciseProgress,
} from "../controllers/exercises.controller.js";

const router = Router();

router.get("/", getExercises);
router.get("/:id", getExercise);
router.get("/:id/progress", devAuth, getProgress);

export default router;
