import prisma from "../db/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  console.log("--- Register Request Started ---");
  const { username, email, password } = req.body;
  console.log("Received data:", { username, email, password: "***" });

  if (!username || !email || !password) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ message: "All fields required" });
  }

  console.log("Checking if user exists with email:", email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("User already exists with ID:", existingUser.id);
    return res.status(409).json({ message: "Email already registered" });
  }

  console.log("Hashing password...");
  const hashedPassword = await hashPassword(password);
  console.log("Password hashed.");

  console.log("Creating user in database...");
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
  console.log("User created with ID:", user.id);

  console.log("Generating token...");
  const token = generateToken(user);
  console.log("Token generated.");

  console.log("--- Register Request Completed ---");
  res.status(201).json({ token });
};

export const login = async (req, res) => {
  console.log("--- Login Request Started ---");
  const { email, password } = req.body;
  console.log("Received login attempt for:", email);

  if (!email || !password) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ message: "All fields required" });
  }

  console.log("Fetching user from DB...");
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found for email:", email);
    return res.status(401).json({ message: "Invalid credentials" });
  }
  console.log("User found with ID:", user.id);

  console.log("Comparing passwords...");
  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    console.log("Password mismatch for user:", user.email);
    return res.status(401).json({ message: "Invalid credentials" });
  }
  console.log("Password verified.");

  console.log("Generating token...");
  const token = generateToken(user);
  console.log("Token generated.");

  console.log("--- Login Request Completed ---");
  res.json({ token });
};
