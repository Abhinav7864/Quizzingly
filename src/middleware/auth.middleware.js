import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  console.log("--- Auth Middleware Started ---");
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader ? "Present" : "Missing");

  if (!authHeader) {
    console.log("Access denied: No auth header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted (partial):", token ? token.substring(0, 10) + "..." : "None");

  try {
    console.log("Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token valid. User ID:", decoded.userId);
    req.user = decoded;
    console.log("--- Auth Middleware Passed ---");
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
