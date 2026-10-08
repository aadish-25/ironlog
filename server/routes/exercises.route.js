import { Router } from "express";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import {
    getExercises,
    getExerciseById,
    getExerciseProgress,
    createExercise,
    updateExercise,
    deleteExercise,
} from "../controllers/exercises.controller.js";

const router = Router();

router.get("/", clerkAuth, getExercises);
router.post("/", clerkAuth, createExercise);
router.get("/:id", getExerciseById);
router.put("/:id", clerkAuth, updateExercise);
router.delete("/:id", clerkAuth, deleteExercise);
router.get("/:id/progress", clerkAuth, getExerciseProgress);

export default router;
