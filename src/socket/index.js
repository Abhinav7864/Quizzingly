import { handleCreateGame, handleStartGame, handleForceEndGame } from "./host.handlers.js";
import { handleJoinGame, handleSubmitAnswer, handleLeaveEarly, handleDisconnect } from "./player.handlers.js";

export const registerSocketHandlers = (io) => {
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`[CONNECTION] New socket connected: ${socket.id}`);
    handleCreateGame(socket);
    handleStartGame(socket);
    handleForceEndGame(socket);
    handleJoinGame(socket);
    handleSubmitAnswer(socket);
    handleLeaveEarly(socket);
    handleDisconnect(socket);
  });
};