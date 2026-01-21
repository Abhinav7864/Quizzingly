import { games } from "./gameStore.js";
import { generateJoinCode } from "./utils.js";
import prisma from "../db/prisma.js";
import { sendQuestion } from "./question.flow.js";


export const handleCreateGame = (socket) => {
  socket.on("host:create_game", ({ quizId }) => {
    const gameCode = generateJoinCode();

    games[gameCode] = {
      hostSocketId: socket.id,
      quizId,
      players: {},
      started: false,
    };

    socket.join(gameCode);

    socket.emit("server:game_created", {
      gameCode,
    });

    console.log(`Game created: ${gameCode}`);
  });
};

export const handleStartGame = (socket) => {
  socket.on("host:start_game", async ({ gameCode }) => {
    const game = games[gameCode];

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

    game.started = true;
    game.questions = quiz.questions;
    game.currentQuestionIndex = 0;

    sendQuestion(gameCode);
  });
};
