import express from "express";
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

// Add question to quiz
router.post("/:quizId/questions", addQuestion);

// Update question
router.put("/questions/:questionId", updateQuestion);

// Delete question
router.delete("/questions/:questionId", deleteQuestion);

export default router;
