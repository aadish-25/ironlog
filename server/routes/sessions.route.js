import express, { Router } from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/devAuth.middleware.js";
import { createSession, deleteSession, getSessionById, getSessions, getMissedSessions } from "../controllers/sessions.controller.js"

const router = Router();

router.post("/", devAuth, createSession);
router.get("/", devAuth, getSessions);
router.get("/missed", devAuth, getMissedSessions);
router.get("/:id", devAuth, getSessionById);
router.delete("/:id", devAuth, deleteSession);

export default router;