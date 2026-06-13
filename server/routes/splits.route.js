import express, { Router } from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/devAuth.middleware.js";
import {
    createSplit,
    getSplitsByUser,
    getSplitById,
    updateSplit,
    deleteSplit,
    activateSplit,
} from "../controllers/splits.controller.js";

const router = Router();

router.post("/", clerkAuth, createSplit);
router.get("/", clerkAuth, getSplitsByUser);
router.get("/:id", clerkAuth, getSplitById);
router.put("/:id", clerkAuth, updateSplit);
router.delete("/:id", clerkAuth, deleteSplit);
router.patch("/:id/activate", clerkAuth, activateSplit);

export default router;
