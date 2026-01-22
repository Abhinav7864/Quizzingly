import { redis } from "../redis/client.js";
import { calculateScore } from "./scoring.js";
import { sendLeaderboard } from "./leaderboard.js";
import prisma from "../db/prisma.js";

export const sendQuestion = async (gameCode) => {
  const game = await redis.hGetAll(`game:${gameCode}`);
  if (!game) return;

  const questionsJson = await redis.get(`questions:${gameCode}`);
  const questions = JSON.parse(questionsJson);
  const currentQuestionIndex = parseInt(game.currentQuestionIndex);

  const question = questions[currentQuestionIndex];
  if (!question) return;

  await redis.hSet(`game:${gameCode}`, "currentQuestionStartTime", Date.now().toString());

  await redis.del(`answers:${gameCode}`);

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
  const questionsJson = await redis.get(`questions:${gameCode}`);
  const questions = JSON.parse(questionsJson);

  const leaderboardData = await redis.zRevRange(
    `leaderboard:${gameCode}`,
    0,
    -1,
    { WITHSCORES: true }
  );

  const leaderboard = [];
  const players = await redis.hGetAll(`players:${gameCode}`);

  for (let i = 0; i < leaderboardData.length; i += 2) {
    const socketId = leaderboardData[i];
    const score = parseInt(leaderboardData[i + 1]);
    const playerJson = players[socketId];
    if (playerJson) {
      const player = JSON.parse(playerJson);
      leaderboard.push({
        name: player.name,
        score,
      });
    }
  }

  global.io.to(gameCode).emit("server:game_over", leaderboard);

  const quizTitle = questions[0]?.quiz?.title ?? "Live Quiz";

  let rank = 1;

  for (const entry of leaderboard) {
    const player = Object.values(players).find(p => JSON.parse(p).name === entry.name);
    if (!player) {
      rank++;
      continue;
    }

    const playerData = JSON.parse(player);
    if (!playerData.userId) {
      rank++;
      continue;
    }

    await prisma.playerGameResult.create({
      data: {
        userId: playerData.userId,
        quizTitle,
        score: entry.score,
        rank,
        totalPlayers: leaderboard.length,
        accuracy:
          playerData.answersTotal === 0
            ? 0
            : playerData.answersCorrect / playerData.answersTotal,
      },
    });

    rank++;
  }

  await redis.del(
    `game:${gameCode}`,
    `players:${gameCode}`,
    `leaderboard:${gameCode}`,
    `answers:${gameCode}`,
    `questions:${gameCode}`
  );
};

export const endQuestion = async (gameCode) => {
  const game = await redis.hGetAll(`game:${gameCode}`);
  if (!game) return;

  const questionsJson = await redis.get(`questions:${gameCode}`);
  const questions = JSON.parse(questionsJson);
  const currentQuestionIndex = parseInt(game.currentQuestionIndex);
  const question = questions[currentQuestionIndex];

  const correctOptionIds = question.options
    .filter((o) => o.isCorrect)
    .map((o) => o.id);

  console.log(`[DEBUG] Question: ${question.text}`);
  console.log(`[DEBUG] Correct Option IDs: ${JSON.stringify(correctOptionIds)}`);

  const answers = await redis.hGetAll(`answers:${gameCode}`);
  console.log(`[DEBUG] Player Answers: ${JSON.stringify(answers)}`);

  const players = await redis.hGetAll(`players:${gameCode}`);

  Object.entries(answers).forEach(async ([socketId, answerJson]) => {
    const answer = JSON.parse(answerJson);
    const { optionId, timestamp } = answer;
    const playerJson = players[socketId];

    if (!playerJson) return;

    const player = JSON.parse(playerJson);

    player.answersTotal += 1;

    if (correctOptionIds.includes(optionId)) {
      player.answersCorrect += 1;

      const score = calculateScore({
        startTime: parseInt(game.currentQuestionStartTime),
        endTime: timestamp,
        timeLimit: question.timeLimit,
      });

      console.log(`[SCORE] Player ${player.name} correct! (+${score})`);

      await redis.zIncrBy(`leaderboard:${gameCode}`, score, socketId);
      player.score += score;

      const newScore = (await redis.zScore(`leaderboard:${gameCode}`, socketId)) || score;

      global.io.to(socketId).emit("server:answer_result", {
        correct: true,
        scoreGained: score,
        totalScore: newScore,
      });
    } else {
      console.log(`[SCORE] Player ${player.name} wrong! (Ans: ${optionId}, Correct: ${correctOptionIds})`);
      const currentScore = await redis.zScore(`leaderboard:${gameCode}`, socketId) || 0;
      global.io.to(socketId).emit("server:answer_result", {
        correct: false,
        scoreGained: 0,
        totalScore: currentScore,
      });
    }

    await redis.hSet(`players:${gameCode}`, socketId, JSON.stringify(player));
  });

  global.io.to(gameCode).emit("server:times_up");

  sendLeaderboard(gameCode);

  await redis.hIncrBy(`game:${gameCode}`, "currentQuestionIndex", 1);

  const newIndex = parseInt(await redis.hGet(`game:${gameCode}`, "currentQuestionIndex"));

  if (newIndex < questions.length) {
    global.io.to(gameCode).emit("server:question_ended");
  } else {
    endGame(gameCode);
  }
};
