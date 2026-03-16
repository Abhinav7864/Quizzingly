import prisma from "../db/prisma.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  console.log("--- Register Process Started ---");
  try {
    const { username, email, password } = req.body;
    console.log("Register data:", { username, email, password: "***" });

    if (!username || !email || !password) {
      console.log("Register failed: Missing fields");
      return res.status(400).json({ message: "All fields required" });
    }

    console.log("Searching for existing user...");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Register failed: Email already registered");
      return res.status(409).json({ message: "Email already registered" });
    }

    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);

    console.log("Creating user in database...");
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log("User created successfully. ID:", user.id);

    console.log("Generating JWT...");
    const token = generateToken(user);

    console.log("--- Register Process Completed ---");
    res.status(201).json({ token });
  } catch (error) {
    console.error("Register process error:", error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  console.log("--- Login Process Started ---");
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    if (!email || !password) {
      console.log("Login failed: Missing fields");
      return res.status(400).json({ message: "All fields required" });
    }

    console.log("Fetching user from DB...");
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("Login failed: User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Comparing password...");
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      console.log("Login failed: Incorrect password");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("Generating JWT...");
    const token = generateToken(user);

    console.log("--- Login Process Completed ---");
    res.json({ token });
  } catch (error) {
    console.error("Login process error:", error);
    next(error);
  }
};