import prisma from "../db/prisma.js";

export const createQuiz = async (req, res) => {
  console.log("--- Create Quiz Started ---");
  const { title } = req.body;
  const userId = req.user.id;
  console.log("Quiz data:", { title, userId });

  if (!title) {
    console.log("Validation failed: Missing title");
    return res.status(400).json({ message: "Quiz title required" });
  }

  console.log("Saving quiz to DB...");
  const quiz = await prisma.quiz.create({
    data: {
      title,
      creatorId: userId,
    },
  });
  console.log("Quiz created. ID:", quiz.id);

  console.log("--- Create Quiz Completed ---");
  res.status(201).json(quiz);
};

export const getMyQuizzes = async (req, res) => {
  console.log("--- Get My Quizzes Started ---");
  const userId = req.user.id;
  console.log("Fetching quizzes for user:", userId);

  const quizzes = await prisma.quiz.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
  });
  console.log("Quizzes found:", quizzes.length);

  console.log("--- Get My Quizzes Completed ---");
  res.json(quizzes);
};

export const getQuizById = async (req, res) => {
  console.log("--- Get Quiz By ID Started ---");
  const { id } = req.params;
  const userId = req.user.id;
  console.log("Request for quiz ID:", id, "by user:", userId);

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      creatorId: userId,
    },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    console.log("Quiz not found or access denied.");
    return res.status(404).json({ message: "Quiz not found" });
  }
  console.log("Quiz found.");

  console.log("--- Get Quiz By ID Completed ---");
  res.json(quiz);
};

export const updateQuiz = async (req, res) => {
  console.log("--- Update Quiz Started ---");
  const { id } = req.params;
  const { title } = req.body;
  const userId = req.user.id;
  console.log("Updating quiz:", id, "New title:", title);

  const quiz = await prisma.quiz.findFirst({
    where: { id, creatorId: userId },
  });

  if (!quiz) {
    console.log("Quiz not found or access denied.");
    return res.status(404).json({ message: "Quiz not found" });
  }

  console.log("Executing update in DB...");
  const updated = await prisma.quiz.update({
    where: { id },
    data: { title },
  });
  console.log("Quiz updated.");

  console.log("--- Update Quiz Completed ---");
  res.json(updated);
};

export const deleteQuiz = async (req, res) => {
  console.log("--- Delete Quiz Started ---");
  const { id } = req.params;
  const userId = req.user.id;
  console.log("Request to delete quiz:", id, "by user:", userId);

  const quiz = await prisma.quiz.findFirst({
    where: { id, creatorId: userId },
  });

  if (!quiz) {
    console.log("Quiz not found or access denied.");
    return res.status(404).json({ message: "Quiz not found" });
  }

  console.log("Deleting quiz from DB...");
  await prisma.quiz.delete({ where: { id } });
  console.log("Quiz deleted successfully.");

  console.log("--- Delete Quiz Completed ---");
  res.json({ message: "Quiz deleted" });
};