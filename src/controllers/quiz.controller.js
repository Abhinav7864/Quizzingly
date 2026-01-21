import prisma from "../db/prisma.js";

export const createQuiz = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Quiz title required" });
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      creatorId: req.user.id,
    },
  });

  res.status(201).json(quiz);
};

export const getMyQuizzes = async (req, res) => {
  const quizzes = await prisma.quiz.findMany({
    where: { creatorId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json(quizzes);
};

export const getQuizById = async (req, res) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      creatorId: req.user.id,
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
    return res.status(404).json({ message: "Quiz not found" });
  }

  res.json(quiz);
};

export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const quiz = await prisma.quiz.findFirst({
    where: { id, creatorId: req.user.id },
  });

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const updated = await prisma.quiz.update({
    where: { id },
    data: { title },
  });

  res.json(updated);
};

export const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findFirst({
    where: { id, creatorId: req.user.id },
  });

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  await prisma.quiz.delete({ where: { id } });

  res.json({ message: "Quiz deleted" });
};
