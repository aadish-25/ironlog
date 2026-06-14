import express, { Router } from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/devAuth.middleware.js";
import { updateSplitDay } from "../controllers/splitDays.controller.js";

const router = Router();

router.put("/:id", clerkAuth, updateSplitDay);

export default router;
