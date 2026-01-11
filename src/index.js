import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketHandlers } from "./socket/index.js";

const PORT = 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});

registerSocketHandlers(io);
// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);
// });

// io.on("disconnect", (socket) => {
//   console.log("Client disconnected:", socket.id);
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
