import express from "express";
import {
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/:quizId/questions", addQuestion);

router.put("/questions/:questionId", updateQuestion);

router.delete("/questions/:questionId", deleteQuestion);

export default router;
