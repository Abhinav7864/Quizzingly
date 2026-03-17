import { redis } from "../redis/client.js";
import { calculateScore } from "./scoring.js";
import { sendLeaderboard } from "./leaderboard.js";
import prisma from "../db/prisma.js";

// Map<gameCode, timeoutId> — tracks active question timers so they can be cancelled
const activeTimers = new Map();

export const cancelGameTimers = (gameCode) => {
  // Cancel the active question timer
  const timerId = activeTimers.get(gameCode);
  if (timerId) {
    clearTimeout(timerId);
    activeTimers.delete(gameCode);
    console.log(`[TIMER] Cancelled question timer for game ${gameCode}`);
  }
  // Also cancel any pending between-question countdown
  const countdownId = activeTimers.get(`countdown:${gameCode}`);
  if (countdownId) {
    clearTimeout(countdownId);
    activeTimers.delete(`countdown:${gameCode}`);
    console.log(`[TIMER] Cancelled countdown timer for game ${gameCode}`);
  }
};

export const sendQuestion = async (gameCode) => {
  const game = await redis.hgetall(`game:${gameCode}`);
  if (!game) return;

  const questionsJson = await redis.get(`questions:${gameCode}`);
  if (!questionsJson) return;  // game was force-ended mid-flight
  const questions = JSON.parse(questionsJson);
  const currentQuestionIndex = parseInt(game.currentQuestionIndex);

  const question = questions[currentQuestionIndex];
  if (!question) return;

  await redis.hset(`game:${gameCode}`, "currentQuestionStartTime", Date.now().toString());

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

  // Store timer so it can be cancelled on force-end
  const timerId = setTimeout(() => {
    activeTimers.delete(gameCode);
    endQuestion(gameCode).catch((err) =>
      console.error(`[ERROR] endQuestion crashed for ${gameCode}:`, err)
    );
  }, question.timeLimit * 1000);

  activeTimers.set(gameCode, timerId);
};

export const endGame = async (gameCode) => {
  // Cancel any pending timer first
  cancelGameTimers(gameCode);

  // Read game info FIRST before any redis.del calls
  const gameInfo = await redis.hgetall(`game:${gameCode}`);

  const questionsJson = await redis.get(`questions:${gameCode}`);
  const questions = JSON.parse(questionsJson);

  const leaderboardData = await redis.zrange(
    `leaderboard:${gameCode}`,
    0,
    -1,
    'WITHSCORES'
  );

  const leaderboard = [];
  const players = await redis.hgetall(`players:${gameCode}`);

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
  
  // Sort descending
  leaderboard.sort((a, b) => b.score - a.score);

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
        sessionId: gameInfo?.sessionId ?? null,
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

  if (gameInfo && gameInfo.hostUserId && gameInfo.hostUserId !== "") {
    await prisma.playerGameResult.create({
      data: {
        userId: gameInfo.hostUserId,
        sessionId: gameInfo.sessionId ?? null,
        quizTitle: `${quizTitle} (Hosted)`,
        score: 0,
        rank: 0,
        totalPlayers: leaderboard.length,
        accuracy: 0,
      },
    });
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
  const game = await redis.hgetall(`game:${gameCode}`);
  if (!game) return;

  const questionsJson = await redis.get(`questions:${gameCode}`);
  if (!questionsJson) return;  // game was force-ended mid-flight
  const questions = JSON.parse(questionsJson);
  const currentQuestionIndex = parseInt(game.currentQuestionIndex);
  const question = questions[currentQuestionIndex];

  const correctOptionIds = question.options
    .filter((o) => o.isCorrect)
    .map((o) => o.id);

  console.log(`[DEBUG] Question: ${question.text}`);
  console.log(`[DEBUG] Correct Option IDs: ${JSON.stringify(correctOptionIds)}`);

  const answers = await redis.hgetall(`answers:${gameCode}`);
  console.log(`[DEBUG] Player Answers: ${JSON.stringify(answers)}`);

  const players = await redis.hgetall(`players:${gameCode}`);

  for (const [socketId, answerJson] of Object.entries(answers)) {
    const answer = JSON.parse(answerJson);
    const { optionId, timestamp } = answer;
    const playerJson = players[socketId];

    if (!playerJson) continue;

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

      await redis.zincrby(`leaderboard:${gameCode}`, score, socketId);
      player.score += score;

      const newScore = (await redis.zscore(`leaderboard:${gameCode}`, socketId)) || score;

      global.io.to(socketId).emit("server:answer_result", {
        correct: true,
        scoreGained: score,
        totalScore: parseInt(newScore),
      });
    } else {
      console.log(`[SCORE] Player ${player.name} wrong! (Ans: ${optionId}, Correct: ${correctOptionIds})`);
      const currentScore = await redis.zscore(`leaderboard:${gameCode}`, socketId) || 0;
      global.io.to(socketId).emit("server:answer_result", {
        correct: false,
        scoreGained: 0,
        totalScore: parseInt(currentScore),
      });
    }

    await redis.hset(`players:${gameCode}`, socketId, JSON.stringify(player));
  }

  global.io.to(gameCode).emit("server:times_up");

  sendLeaderboard(gameCode).catch((err) =>
    console.error(`[ERROR] sendLeaderboard crashed for ${gameCode}:`, err)
  );

  await redis.hincrby(`game:${gameCode}`, "currentQuestionIndex", 1);

  const newIndex = parseInt(await redis.hget(`game:${gameCode}`, "currentQuestionIndex"));

  if (newIndex < questions.length) {
    // Auto-advance: send a 3-second countdown then load next question
    global.io.to(gameCode).emit("server:next_question_countdown", { seconds: 3 });

    const countdownTimer = setTimeout(() => {
      activeTimers.delete(`countdown:${gameCode}`);
      sendQuestion(gameCode).catch((err) =>
        console.error(`[ERROR] sendQuestion after countdown crashed for ${gameCode}:`, err)
      );
    }, 3000);

    activeTimers.set(`countdown:${gameCode}`, countdownTimer);
  } else {
    endGame(gameCode).catch((err) =>
      console.error(`[ERROR] endGame crashed for ${gameCode}:`, err)
    );
  }
};
