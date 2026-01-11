import { handleCreateGame } from "./host.handlers.js";
import { handleJoinGame } from "./player.handlers.js";

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    handleCreateGame(socket);
    handleJoinGame(socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};
