import { games } from "./gameStore.js";
import { calculateScore } from "./scoring.js";
import { sendLeaderboard } from "./leaderboard.js";
import prisma from "../db/prisma.js";

export const sendQuestion = (gameCode) => {
  const game = games[gameCode];
  if (!game) return;

  const question = game.questions[game.currentQuestionIndex];
  if (!question) return;

  game.currentQuestionStartTime = Date.now();
  game.answers = {}; // reset answers

  const payload = {
    id: question.id,
    text: question.text,
    timeLimit: question.timeLimit,
    options: question.options.map((o) => ({
      id: o.id,
      text: o.text,
    })),
  };

  global.io.to(gameCode).emit("server:new_question", payload);

  setTimeout(() => {
    endQuestion(gameCode);
  }, question.timeLimit * 1000);
};
export const endGame = async (gameCode) => {
  const game = games[gameCode];
  if (!game) return;

  const leaderboard = Object.values(game.players)
    .sort((a, b) => b.score - a.score);

  global.io.to(gameCode).emit("server:game_over", leaderboard);

  const quizTitle = game.questions[0]?.quiz?.title ?? "Live Quiz";

  let rank = 1;

  for (const player of leaderboard) {
    if (!player.userId) {
      rank++;
      continue;
    }

    await prisma.playerGameResult.create({
      data: {
        userId: player.userId,
        quizTitle,
        score: player.score,
        rank,
        totalPlayers: leaderboard.length,
        accuracy:
          player.answersTotal === 0
            ? 0
            : player.answersCorrect / player.answersTotal,
      },
    });

    rank++;
  }

  delete games[gameCode];
};

export const endQuestion = (gameCode) => {
  const game = games[gameCode];
  if (!game) return;

  const question = game.questions[game.currentQuestionIndex];
  const correctOptionIds = question.options
    .filter((o) => o.isCorrect)
    .map((o) => o.id);

  console.log(`[DEBUG] Question: ${question.text}`);
  console.log(`[DEBUG] Correct Option IDs: ${JSON.stringify(correctOptionIds)}`);
  console.log(`[DEBUG] Player Answers: ${JSON.stringify(game.answers)}`);

  // Evaluate answers
  Object.entries(game.answers).forEach(([socketId, answerData]) => {
    const { optionId, timestamp } = answerData;
    const player = game.players[socketId];
    if (!player) return;

    player.answersTotal += 1;

    if (correctOptionIds.includes(optionId)) {
      player.answersCorrect += 1;

      // Calculate score based on when the user ACTUALLY answered
      const score = calculateScore({
        startTime: game.currentQuestionStartTime,
        endTime: timestamp,
        timeLimit: question.timeLimit,
      });
      
      console.log(`[SCORE] Player ${game.players[socketId].name} correct! (+${score})`);
      console.log(`[DEBUG] Previous Score: ${player.score} (Type: ${typeof player.score})`);
      console.log(`[DEBUG] Adding Score: ${score} (Type: ${typeof score})`);

      player.score += score;

      console.log(`[DEBUG] New Score: ${player.score}`);

      global.io.to(socketId).emit("server:answer_result", {
        correct: true,
        scoreGained: score,
        totalScore: player.score,
      });
    } else {
      console.log(`[SCORE] Player ${game.players[socketId].name} wrong! (Ans: ${optionId}, Correct: ${correctOptionIds})`);
      global.io.to(socketId).emit("server:answer_result", {
        correct: false,
        scoreGained: 0,
        totalScore: player.score,
      });
    }
  });

  global.io.to(gameCode).emit("server:times_up");

  sendLeaderboard(gameCode);

  game.currentQuestionIndex++;

  if (game.currentQuestionIndex < game.questions.length) {
    global.io.to(gameCode).emit("server:question_ended");
  } else {
    endGame(gameCode);
  }
};
