import express from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import devAuth from "../middlewares/devAuth.middleware.js";
import {
    addExercise,
    removeExercise,
    reorderExercise,
} from "../controllers/splitDayExercises.controller.js";

const router = express.Router();
router.post("/", devAuth, addExercise);
router.delete("/:id", devAuth, removeExercise);
router.patch("/:id", devAuth, reorderExercise);

export default router;
