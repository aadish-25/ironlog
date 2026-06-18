import express, { Router } from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import { createSession, deleteSession, getSessionById, getSessions, getMissedSessions } from "../controllers/sessions.controller.js"

const router = Router();

router.post("/", clerkAuth, createSession);
router.get("/", clerkAuth, getSessions);
router.get("/missed", clerkAuth, getMissedSessions);
router.get("/:id", clerkAuth, getSessionById);
router.delete("/:id", clerkAuth, deleteSession);

export default router;