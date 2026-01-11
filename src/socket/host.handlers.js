import { games } from "./gameStore.js";
import { generateJoinCode } from "./utils.js";

export const handleCreateGame = (socket) => {
  socket.on("host:create_game", ({ quizId }) => {
    const gameCode = generateJoinCode();

    games[gameCode] = {
      hostSocketId: socket.id,
      quizId,
      players: {},
      started: false,
    };

    socket.join(gameCode);

    socket.emit("server:game_created", {
      gameCode,
    });

    console.log(`Game created: ${gameCode}`);
  });
};
