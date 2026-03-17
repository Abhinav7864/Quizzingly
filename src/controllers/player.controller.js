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

export const getSessionResults = async (req, res) => {
  const { sessionId } = req.params;

  const results = await prisma.playerGameResult.findMany({
    where: { sessionId },
    include: { user: { select: { username: true, email: true } } },
    orderBy: { score: "desc" },
  });

  // Exclude the host record (rank === 0) since they didn't play
  const players = results
    .filter(r => r.rank !== 0)
    .map(r => ({
      name: r.user.username || r.user.email.split('@')[0],
      score: r.score,
      rank: r.rank,
      accuracy: Math.round(r.accuracy * 100),
    }));

  res.json(players);
};
