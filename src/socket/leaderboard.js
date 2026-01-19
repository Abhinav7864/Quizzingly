import { games } from "./gameStore.js";

export const sendLeaderboard = (gameCode) => {
  const game = games[gameCode];
  if (!game) return;

  const leaderboard = Object.values(game.players)
    .map((p) => ({
      name: p.name,
      score: p.score,
    }))
    .sort((a, b) => b.score - a.score);

  global.io.to(gameCode).emit("server:leaderboard_update", leaderboard);
};
