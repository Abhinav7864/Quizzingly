
import prisma from "../src/db/prisma.js";

async function main() {
  console.log("Seeding quiz...");

  // 1. Create a User (Creator)
  let user = await prisma.user.findFirst({ where: { email: "test@example.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: "TestHost",
        email: "test@example.com",
        password: "hashed_password_placeholder", // In real app, hash this
      },
    });
    console.log("Created user:", user.id);
  } else {
    console.log("Using existing user:", user.id);
  }

  // 2. Create a Quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: "General Knowledge Quiz",
      creatorId: user.id,
    },
  });
  console.log("Created quiz:", quiz.id);

  // 3. Add Questions
  const questionsData = [
    {
      text: "What is the capital of France?",
      timeLimit: 15,
      options: [
        { text: "London", isCorrect: false },
        { text: "Berlin", isCorrect: false },
        { text: "Paris", isCorrect: true },
        { text: "Madrid", isCorrect: false },
      ],
    },
    {
      text: "Which planet is known as the Red Planet?",
      timeLimit: 15,
      options: [
        { text: "Earth", isCorrect: false },
        { text: "Mars", isCorrect: true },
        { text: "Jupiter", isCorrect: false },
        { text: "Venus", isCorrect: false },
      ],
    },
    {
      text: "What is 2 + 2?",
      timeLimit: 10,
      options: [
        { text: "3", isCorrect: false },
        { text: "4", isCorrect: true },
        { text: "5", isCorrect: false },
        { text: "22", isCorrect: false },
      ],
    },
  ];

  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        text: q.text,
        timeLimit: q.timeLimit,
        quizId: quiz.id,
        options: {
          create: q.options,
        },
      },
    });
  }

  console.log("Added 3 questions with options.");
  console.log("===================================");
  console.log("NEW QUIZ ID:", quiz.id);
  console.log("===================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
