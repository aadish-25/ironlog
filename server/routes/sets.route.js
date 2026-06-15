import express from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import devAuth from "../middlewares/devAuth.middleware.js";
import {
    createSet,
    updateSet,
    deleteSet,
} from "../controllers/sets.controller.js";

const router = express.Router();

router.post("/", devAuth, createSet);
router.put("/:id", devAuth, updateSet);
router.delete("/:id", devAuth, deleteSet);

export default router;
