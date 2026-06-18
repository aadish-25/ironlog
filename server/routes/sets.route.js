import express from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import {
    createSet,
    updateSet,
    deleteSet,
} from "../controllers/sets.controller.js";

const router = express.Router();

router.post("/", clerkAuth, createSet);
router.put("/:id", clerkAuth, updateSet);
router.delete("/:id", clerkAuth, deleteSet);

export default router;
