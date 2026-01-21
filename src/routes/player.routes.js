import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getPlayerSummary,
  getPlayerHistory,
} from "../controllers/player.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/summary", getPlayerSummary);
router.get("/history", getPlayerHistory);

export default router;
