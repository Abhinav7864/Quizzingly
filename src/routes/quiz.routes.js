import express from "express";
import multer from "multer";
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import { generateQuizAI } from "../controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(requireAuth);

router.post("/", createQuiz);
router.get("/", getMyQuizzes);
router.post("/generate-ai", upload.fields([{ name: "pdf", maxCount: 1 }, { name: "image", maxCount: 1 }]), generateQuizAI);
router.get("/:id", getQuizById);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

export default router;
