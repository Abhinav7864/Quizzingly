import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  console.log("--- Auth Middleware Started ---");
  const authHeader = req.headers.authorization;
  console.log("Auth Header present:", !!authHeader);

  if (!authHeader) {
    console.log("Auth failed: Missing header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token ? "Yes (truncated: " + token.substring(0, 10) + "...)" : "No");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified. User ID:", decoded.id);
    req.user = decoded;
    console.log("--- Auth Middleware Passed ---");
    next();
  } catch (error) {
    console.log("Auth failed: Invalid token -", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};