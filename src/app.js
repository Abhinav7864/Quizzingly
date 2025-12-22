import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";
const app = express();

app.use(cors());
console.log("CORS middleware initialized");

app.use(express.json());
console.log("JSON parsing middleware initialized");

app.use("/auth", authRoutes);
console.log("Auth routes mounted at /auth");

app.get("/protected", requireAuth, (req, res) => {
  console.log("Protected route accessed");
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

export default app;


