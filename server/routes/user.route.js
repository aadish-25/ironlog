import express from "express";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import { getCurrentUser, updateCurrentUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", clerkAuth, getCurrentUser);
router.patch("/me", clerkAuth, updateCurrentUser);

export default router;
