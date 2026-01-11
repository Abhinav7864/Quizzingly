import { games } from "./gameStore.js";

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

    socket.join(gameCode);

    const playerNames = Object.values(game.players).map((p) => p.name);

    socket.to(gameCode).emit("server:player_list_update", playerNames);
    
    socket.emit("server:joined_lobby", playerNames);

    console.log(`${name} joined ${gameCode}`);
  });
};
