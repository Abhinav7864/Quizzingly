import { redis } from "../redis/client.js";
import { sendLiveLeaderboard } from "./leaderboard.js";
import prisma from "../db/prisma.js";

export const handleJoinGame = (socket) => {
  socket.on("player:join_game", async ({ gameCode, name, userId }) => {
    const exists = await redis.exists(`game:${gameCode}`);
    if (!exists) {
      socket.emit("server:error", { message: "Game not found" });
      return;
    }

    const started = await redis.hget(`game:${gameCode}`, "started");
    if (started === "true") {
      socket.emit("server:error", { message: "Game already started" });
      return;
    }

    await redis.hset(`players:${gameCode}`, socket.id, JSON.stringify({
      name,
      score: 0,
      answersCorrect: 0,
      answersTotal: 0,
      userId: userId ?? null,
    }));

    await redis.zadd(`leaderboard:${gameCode}`, 0, socket.id);

    await redis.set(`socket:${socket.id}`, gameCode);

    socket.join(gameCode);

    const players = await redis.hvals(`players:${gameCode}`);
    const names = players.map(p => JSON.parse(p).name);

    global.io.to(gameCode).emit("server:player_list_update", names);

    socket.emit("server:joined_lobby", names);

    console.log(`[PLAYER] ${name} joined ${gameCode} (Socket: ${socket.id}) with userId: ${userId}`);
  });
};

export const handleSubmitAnswer = (socket) => {
  socket.on("player:submit_answer", async ({ gameCode, optionId }) => {
    const game = await redis.hgetall(`game:${gameCode}`);
    if (!game || game.started !== "true") return;

    const hasAnswered = await redis.hexists(`answers:${gameCode}`, socket.id);
    if (hasAnswered) return;

    await redis.hset(`answers:${gameCode}`, socket.id, JSON.stringify({
      optionId,
      timestamp: Date.now()
    }));

    // Immediately tell the answering player their answer was locked in
    // NOTE: The actual correct/incorrect result is sent at endQuestion.
    // Here we just confirm receipt so the player can auto-advance to "waiting" view.
    socket.emit("server:answer_received");

    // Broadcast count update to room (e.g. host answer counter)
    socket.to(gameCode).emit("server:answer_received");

    // Push a live leaderboard snapshot to all clients (shows current scores mid-question)
    sendLiveLeaderboard(gameCode).catch((err) =>
      console.error(`[ERROR] sendLiveLeaderboard crashed for ${gameCode}:`, err)
    );

    console.log(`[ANSWER] Player ${socket.id} answered in ${gameCode}`);
  });
};

export const handleLeaveEarly = (socket) => {
  socket.on("player:leave_early", async ({ gameCode }) => {
    const game = await redis.hgetall(`game:${gameCode}`);
    if (!game) return;

    const playerJson = await redis.hget(`players:${gameCode}`, socket.id);
    if (!playerJson) return;

    const player = JSON.parse(playerJson);
    const score = parseInt((await redis.zscore(`leaderboard:${gameCode}`, socket.id)) || "0");

    console.log(`[PLAYER] ${player.name} leaving early from ${gameCode} with score ${score}`);

    // Save partial progress to DB if user is logged in
    if (player.userId) {
      const questionsJson = await redis.get(`questions:${gameCode}`);
      const questions = JSON.parse(questionsJson);
      const quizTitle = questions[0]?.quiz?.title ?? "Live Quiz";

      // Get leaderboard position
      const leaderboardData = await redis.zrange(`leaderboard:${gameCode}`, 0, -1, 'WITHSCORES');
      const allScores = [];
      for (let i = 0; i < leaderboardData.length; i += 2) {
        allScores.push(parseInt(leaderboardData[i + 1]));
      }
      allScores.sort((a, b) => b - a);
      const rank = allScores.indexOf(score) + 1;

      await prisma.playerGameResult.create({
        data: {
          userId: player.userId,
          sessionId: game.sessionId ?? null,
          quizTitle,
          score,
          rank,
          totalPlayers: allScores.length,
          accuracy:
            player.answersTotal === 0
              ? 0
              : player.answersCorrect / player.answersTotal,
        },
      });

      console.log(`[PLAYER] Saved partial result for ${player.name} (rank ${rank})`);
    }

    // Remove from Redis
    await redis.hdel(`players:${gameCode}`, socket.id);
    await redis.zrem(`leaderboard:${gameCode}`, socket.id);
    await redis.del(`socket:${socket.id}`);

    // Notify the room that a player left
    socket.to(gameCode).emit("server:player_left", { name: player.name });

    // Emit personal summary back to the leaving player
    socket.emit("server:left_early_summary", {
      score,
      name: player.name,
    });

    socket.leave(gameCode);

    console.log(`[PLAYER] ${player.name} fully removed from ${gameCode}`);
  });
};

export const handleDisconnect = (socket) => {
  socket.on("disconnect", async () => {
    const gameCode = await redis.get(`socket:${socket.id}`);

    if (gameCode) {
      const game = await redis.hgetall(`game:${gameCode}`);

      if (game) {
        const playerJson = await redis.hget(`players:${gameCode}`, socket.id);

        if (playerJson) {
          const player = JSON.parse(playerJson);
          await redis.hdel(`players:${gameCode}`, socket.id);
          await redis.zrem(`leaderboard:${gameCode}`, socket.id);

          const players = await redis.hvals(`players:${gameCode}`);
          const names = players.map(p => JSON.parse(p).name);

          socket.to(gameCode).emit("server:player_list_update", names);

          console.log(`[DISCONNECT] Player '${player.name}' left game ${gameCode}`);
        }

        if (game.hostSocketId === socket.id) {
          console.log(`[DISCONNECT] Host left game ${gameCode}. Ending game...`);

          socket.to(gameCode).emit("server:error", {
            message: "Host disconnected. Game ended."
          });

          socket.to(gameCode).emit("server:game_over");

          await redis.del(
            `game:${gameCode}`,
            `players:${gameCode}`,
            `leaderboard:${gameCode}`,
            `answers:${gameCode}`,
            `questions:${gameCode}`
          );
        }
      }
    } else {
      console.log(`[DISCONNECT] Socket ${socket.id} disconnected (No active game)`);
    }

    await redis.del(`socket:${socket.id}`);
  });
};
