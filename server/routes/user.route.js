import express from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import {
    getCurrentUser,
    updateCurrentUser,
    getUserStats,
    getUserPRs,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", clerkAuth, getCurrentUser);
router.patch("/me", clerkAuth, updateCurrentUser);
router.get("/me/stats", clerkAuth, getUserStats);
router.get("/me/prs", clerkAuth, getUserPRs);

export default router;
