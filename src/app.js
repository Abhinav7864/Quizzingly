import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import questionRoutes from "./routes/question.routes.js";
import playerRoutes from "./routes/player.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";

const app = express();

app.use(cors());
console.log("[Setup] CORS middleware initialized");

app.use(express.json());
console.log("[Setup] JSON parsing middleware initialized");

app.use("/auth", authRoutes);
console.log("[Setup] Auth routes mounted at /auth");

app.use("/quizzes", quizRoutes);
console.log("[Setup] Quiz routes mounted at /quizzes");

app.use("/", questionRoutes);
console.log("[Setup] Question routes mounted at /questions");

app.use("/player", playerRoutes);
console.log("[Setup] Player routes mounted at /api/player");

app.get("/protected", requireAuth, (req, res) => {
  console.log("[Route] GET /protected accessed");
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

export default app;
