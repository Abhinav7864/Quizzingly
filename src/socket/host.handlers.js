import { redis } from "../redis/client.js";
import { generateJoinCode } from "./utils.js";
import prisma from "../db/prisma.js";
import { sendQuestion, cancelGameTimers } from "./question.flow.js";
import { randomUUID } from "crypto";

export const handleCreateGame = (socket) => {
  socket.on("host:create_game", async ({ quizId, userId }) => {
    console.log(`[HOST] Received create_game request for quizId: ${quizId} from socket: ${socket.id} (user: ${userId})`);
    
    const gameCode = generateJoinCode();

    const sessionId = randomUUID();

    await redis.hset(`game:${gameCode}`, {
      hostSocketId: socket.id,
      hostUserId: userId || "",
      sessionId,
      quizId,
      started: "false",
      currentQuestionIndex: "0",
    });

    await redis.set(`socket:${socket.id}`, gameCode);

    socket.join(gameCode);

    socket.emit("server:game_created", { gameCode });

    console.log(`[HOST] Game created: ${gameCode} (Socket: ${socket.id}) for quiz: ${quizId}`);
  });
};

export const handleStartGame = (socket) => {
  socket.on("host:start_game", async ({ gameCode }) => {
    const game = await redis.hgetall(`game:${gameCode}`);

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

    await redis.hset(`game:${gameCode}`, {
      started: "true",
      currentQuestionIndex: "0",
    });

    await redis.set(`questions:${gameCode}`, JSON.stringify(quiz.questions));

    sendQuestion(gameCode);
  });
};

export const handleForceEndGame = (socket) => {
  socket.on("host:force_end_game", async ({ gameCode }) => {
    const game = await redis.hgetall(`game:${gameCode}`);

    if (!game || game.hostSocketId !== socket.id) {
      socket.emit("server:error", { message: "Not authorized" });
      return;
    }

    console.log(`[HOST] Force-ending game ${gameCode}`);

    // Cancel any pending question timers
    cancelGameTimers(gameCode);

    // Notify all clients — no DB write
    global.io.to(gameCode).emit("server:game_force_ended", {
      message: "Host ended the quiz early.",
    });

    // Wipe Redis data
    await redis.del(
      `game:${gameCode}`,
      `players:${gameCode}`,
      `leaderboard:${gameCode}`,
      `answers:${gameCode}`,
      `questions:${gameCode}`
    );

    console.log(`[HOST] Game ${gameCode} force-ended and Redis cleaned.`);
  });
};
