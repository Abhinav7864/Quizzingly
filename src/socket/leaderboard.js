import { redis } from "../redis/client.js";

export const sendLeaderboard = async (gameCode) => {
  const leaderboardData = await redis.zRangeWithScores(
    `leaderboard:${gameCode}`,
    0,
    -1,
    { REV: true }
  );

  const leaderboard = [];
  const players = await redis.hGetAll(`players:${gameCode}`);

  for (const entry of leaderboardData) {
    const socketId = entry.value;
    const score = parseInt(entry.score);
    const playerJson = players[socketId];
    if (playerJson) {
      const player = JSON.parse(playerJson);
      leaderboard.push({
        name: player.name,
        score,
      });
    }
  }

  global.io.to(gameCode).emit("server:leaderboard_update", leaderboard);
};
