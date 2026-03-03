import { redis } from "../redis/client.js";

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

    socket.emit("server:answer_received");
    socket.to(gameCode).emit("server:answer_received");
    console.log(`[ANSWER] Player ${socket.id} answered in ${gameCode}`);
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
