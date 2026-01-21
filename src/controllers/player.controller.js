import prisma from "../db/prisma.js";

export const getPlayerSummary = async (req, res) => {
  const userId = req.user.id;

  const results = await prisma.playerGameResult.findMany({
    where: { userId },
  });

  const totalGames = results.length;
  const wins = results.filter(r => r.rank === 1).length;
  const podiums = results.filter(r => r.rank <= 3).length;

  const accuracy =
    totalGames === 0
      ? 0
      : results.reduce((sum, r) => sum + r.accuracy, 0) / totalGames;

  res.json({
    totalGames,
    wins,
    podiums,
    accuracy: Number((accuracy * 100).toFixed(1)),
  });
};

export const getPlayerHistory = async (req, res) => {
  const userId = req.user.id;

  const history = await prisma.playerGameResult.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
  });

  res.json(history);
};
