import { games, socketGameMap } from "./gameStore.js";

export const handleJoinGame = (socket) => {
  socket.on("player:join_game", ({ gameCode, name }) => {
    const game = games[gameCode];

    if (!game) {
      socket.emit("server:error", { message: "Game not found" });
      return;
    }

    if (game.started) {
      socket.emit("server:error", { message: "Game already started" });
      return;
    }

    game.players[socket.id] = {
      name,
      score: 0,
    };
    
    // Map player to game
    socketGameMap[socket.id] = gameCode;

    socket.join(gameCode);

    const playerNames = Object.values(game.players).map((p) => p.name);

    socket.to(gameCode).emit("server:player_list_update", playerNames);

    socket.emit("server:joined_lobby", playerNames);

    console.log(`[PLAYER] ${name} joined ${gameCode} (Socket: ${socket.id})`);
  });
};

export const handleSubmitAnswer = (socket) => {
  socket.on("player:submit_answer", ({ gameCode, optionId }) => {
    const game = games[gameCode];
    if (!game || !game.started) return;

    // One answer per question
    if (game.answers[socket.id]) return;

    game.answers[socket.id] = {
      optionId,
      timestamp: Date.now()
    };

    socket.emit("server:answer_received");
    console.log(`[ANSWER] Player ${socket.id} answered in ${gameCode}`);
  });
};

export const handleDisconnect = (socket) => {
  socket.on("disconnect", () => {
    const gameCode = socketGameMap[socket.id];

    if (gameCode && games[gameCode]) {
      const game = games[gameCode];

      // 1. Handle Player Disconnect
      if (game.players[socket.id]) {
        const { name } = game.players[socket.id];
        delete game.players[socket.id];

        const playerNames = Object.values(game.players).map((p) => p.name);
        socket.to(gameCode).emit("server:player_list_update", playerNames);

        console.log(`[DISCONNECT] Player '${name}' left game ${gameCode}`);
      }

      // 2. Handle Host Disconnect
      if (game.hostSocketId === socket.id) {
        console.log(`[DISCONNECT] Host left game ${gameCode}. Ending game...`);
        
        socket.to(gameCode).emit("server:error", {
          message: "Host disconnected. Game ended."
        });
        
        socket.to(gameCode).emit("server:game_over");
        delete games[gameCode];
      }
    } else {
      console.log(`[DISCONNECT] Socket ${socket.id} disconnected (No active game)`);
    }

    delete socketGameMap[socket.id];
  });
};
