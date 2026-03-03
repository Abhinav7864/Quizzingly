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
