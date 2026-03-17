import { redis } from "../redis/client.js";

export const sendLeaderboard = async (gameCode) => {
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

  // Sort descending manually as ioredis zrange 0 -1 returns ascending
  leaderboard.sort((a, b) => b.score - a.score);

  global.io.to(gameCode).emit("server:leaderboard_update", leaderboard);
};

/**
 * Emits a live leaderboard snapshot (top 5) mid-question whenever a player submits an answer.
 * Uses the event `server:live_leaderboard` so clients can distinguish it from end-of-question updates.
 */
export const sendLiveLeaderboard = async (gameCode) => {
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

  leaderboard.sort((a, b) => b.score - a.score);

  // Only top 5 for the live sidebar
  global.io.to(gameCode).emit("server:live_leaderboard", leaderboard.slice(0, 5));
};
