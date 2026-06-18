import express from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import {
    addExercise,
    removeExercise,
    reorderExercise,
} from "../controllers/splitDayExercises.controller.js";

const router = express.Router();
router.post("/", clerkAuth, addExercise);
router.delete("/:id", clerkAuth, removeExercise);
router.patch("/:id", clerkAuth, reorderExercise);

export default router;
