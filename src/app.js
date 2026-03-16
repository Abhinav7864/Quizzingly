import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import questionRoutes from "./routes/question.routes.js";
import playerRoutes from "./routes/player.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";

const app = express();

const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(",") 
  : ["https://quizzingly-frontend.onrender.com", "http://localhost:3000"];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (corsOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
console.log("[Setup] CORS middleware initialized with origins:", corsOrigins);

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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Global Error]", err);
  const status = err.status || 500;
  const message = err.message || "An internal server error occurred";
  res.status(status).json({ message });
});

export default app;
