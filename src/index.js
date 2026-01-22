import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketHandlers } from "./socket/index.js";
import { redis } from "./redis/client.js";

const PORT = 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

await redis.connect();
console.log("Redis connected");

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
