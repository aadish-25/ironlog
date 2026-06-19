import express, { Router } from "express";
// import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import clerkAuth from "../middlewares/clerkAuth.middleware.js";
import { 
    createSession, 
    deleteSession, 
    getSessionById, 
    getSessions, 
    getMissedSessions,
    getSessionsHistory,
    getSessionsSummary,
    completeSession
} from "../controllers/sessions.controller.js"

const router = Router();

router.post("/", clerkAuth, createSession);
router.get("/history", clerkAuth, getSessionsHistory);
router.get("/summary", clerkAuth, getSessionsSummary);
router.get("/", clerkAuth, getSessions);
router.get("/missed", clerkAuth, getMissedSessions);
router.get("/:id", clerkAuth, getSessionById);
router.patch("/:id/complete", clerkAuth, completeSession);
router.delete("/:id", clerkAuth, deleteSession);

export default router;