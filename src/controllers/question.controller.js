import prisma from "../db/prisma.js";

/**
 * Add a question with options to a quiz
 */
export const addQuestion = async (req, res) => {
  const { quizId } = req.params;
  const { text, timeLimit, options } = req.body;

  if (!text || !options || options.length < 2) {
    return res.status(400).json({ message: "Invalid question data" });
  }

  // Verify quiz ownership
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      creatorId: req.user.id,
    },
  });

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const question = await prisma.question.create({
    data: {
      text,
      timeLimit,
      quizId,
      options: {
        create: options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect ?? false,
        })),
      },
    },
    include: { options: true },
  });

  res.status(201).json(question);
};

/**
 * Update a question and replace its options
 */
export const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { text, timeLimit, options } = req.body;

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      quiz: { creatorId: req.user.id },
    },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const updated = await prisma.$transaction([
    prisma.option.deleteMany({
      where: { questionId },
    }),
    prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        timeLimit,
        options: {
          create: options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
          })),
        },
      },
      include: { options: true },
    }),
  ]);

  res.json(updated[1]);
};

/**
 * Delete a question
 */
export const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      quiz: { creatorId: req.user.id },
    },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  await prisma.question.delete({
    where: { id: questionId },
  });

  res.json({ message: "Question deleted" });
};
