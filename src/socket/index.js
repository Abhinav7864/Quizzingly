import { handleCreateGame, handleStartGame, handleNextQuestion } from "./host.handlers.js";
import { handleJoinGame, handleSubmitAnswer, handleDisconnect } from "./player.handlers.js";

export const registerSocketHandlers = (io) => {
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[CONNECTION] New socket connected: ${socket.id}`);
    handleCreateGame(socket);
    handleStartGame(socket);
    handleNextQuestion(socket);
    handleJoinGame(socket);
    handleSubmitAnswer(socket);
    handleDisconnect(socket);
  });
};
 //# sourceMappingURL=index.js.map