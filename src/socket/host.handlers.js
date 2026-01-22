import { redis } from "../redis/client.js";
import { generateJoinCode } from "./utils.js";
import prisma from "../db/prisma.js";
import { sendQuestion } from "./question.flow.js";

export const handleCreateGame = (socket) => {
  socket.on("host:create_game", async ({ quizId }) => {
    const gameCode = generateJoinCode();

    await redis.hSet(`game:${gameCode}`, {
      hostSocketId: socket.id,
      quizId,
      started: "false",
      currentQuestionIndex: "0",
    });

    await redis.set(`socket:${socket.id}`, gameCode);

    socket.join(gameCode);

    socket.emit("server:game_created", { gameCode });

    console.log(`[HOST] Game created: ${gameCode} (Socket: ${socket.id})`);
  });
};

export const handleStartGame = (socket) => {
  socket.on("host:start_game", async ({ gameCode }) => {
    const game = await redis.hGetAll(`game:${gameCode}`);

    if (!game || game.hostSocketId !== socket.id) {
      socket.emit("server:error", { message: "Not authorized" });
      return;
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: game.quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz || quiz.questions.length === 0) {
      socket.emit("server:error", { message: "Quiz has no questions" });
      return;
    }

    await redis.hSet(`game:${gameCode}`, {
      started: "true",
      currentQuestionIndex: "0",
    });

    await redis.set(`questions:${gameCode}`, JSON.stringify(quiz.questions));

    sendQuestion(gameCode);
  });
};

export const handleNextQuestion = (socket) => {
  socket.on("host:next_question", async ({ gameCode }) => {
    const game = await redis.hGetAll(`game:${gameCode}`);

    if (!game || game.hostSocketId !== socket.id) {
      socket.emit("server:error", { message: "Not authorized" });
      return;
    }

    sendQuestion(gameCode);
  });
};

