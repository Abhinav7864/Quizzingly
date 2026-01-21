import { handleCreateGame, handleStartGame } from "./host.handlers.js";
import { handleJoinGame, handleSubmitAnswer } from "./player.handlers.js";

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    handleCreateGame(socket);
    handleStartGame(socket);
    handleSubmitAnswer(socket);
    handleJoinGame(socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
