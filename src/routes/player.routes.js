import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getPlayerSummary,
  getPlayerHistory,
  getSessionResults,
} from "../controllers/player.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/summary", getPlayerSummary);
router.get("/history", getPlayerHistory);
router.get("/session/:sessionId", getSessionResults);

export default router;
