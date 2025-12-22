import prisma from "../db/prisma.js";

/**
 * Add a question with options to a quiz
 */
export const addQuestion = async (req, res) => {
  console.log("--- Add Question Started ---");
  const { quizId } = req.params;
  const { text, timeLimit, options } = req.body;
  const userId = req.user.id;
  console.log("Adding question to Quiz:", quizId, "by User:", userId);

  if (!text || !options || options.length < 2) {
    console.log("Validation failed: Text or options missing/insufficient");
    return res.status(400).json({ message: "Invalid question data" });
  }

  // Verify quiz ownership
  console.log("Verifying quiz ownership...");
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      creatorId: userId,
    },
  });

  if (!quiz) {
    console.log("Quiz not found or unauthorized.");
    return res.status(404).json({ message: "Quiz not found" });
  }

  console.log("Creating question and options in DB...");
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
  console.log("Question created. ID:", question.id);

  console.log("--- Add Question Completed ---");
  res.status(201).json(question);
};

/**
 * Update a question and replace its options
 */
export const updateQuestion = async (req, res) => {
  console.log("--- Update Question Started ---");
  const { questionId } = req.params;
  const { text, timeLimit, options } = req.body;
  const userId = req.user.id;
  console.log("Updating Question:", questionId, "by User:", userId);

  console.log("Verifying question ownership...");
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      quiz: { creatorId: userId },
    },
  });

  if (!question) {
    console.log("Question not found or unauthorized.");
    return res.status(404).json({ message: "Question not found" });
  }

  console.log("Executing transaction to update question and replace options...");
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
  console.log("Question updated successfully.");

  console.log("--- Update Question Completed ---");
  res.json(updated[1]);
};

/**
 * Delete a question
 */
export const deleteQuestion = async (req, res) => {
  console.log("--- Delete Question Started ---");
  const { questionId } = req.params;
  const userId = req.user.id;
  console.log("Request to delete question:", questionId, "by User:", userId);

  console.log("Verifying question ownership...");
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      quiz: { creatorId: userId },
    },
  });

  if (!question) {
    console.log("Question not found or unauthorized.");
    return res.status(404).json({ message: "Question not found" });
  }

  console.log("Deleting question from DB...");
  await prisma.question.delete({
    where: { id: questionId },
  });
  console.log("Question deleted successfully.");

  console.log("--- Delete Question Completed ---");
  res.json({ message: "Question deleted" });
};