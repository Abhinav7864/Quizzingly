import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketHandlers } from "./socket/index.js";
import { redis } from "./redis/client.js";

const PORT = process.env.PORT || 4002;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Upstash Redis is REST-based and doesn't require explicit connection
console.log("Redis client initialized (Upstash)");

io.on('connection', (socket) => {
  console.log(`[SOCKET] New connection: ${socket.id} from ${socket.handshake.address}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`[SOCKET] Disconnection: ${socket.id} - ${reason}`);
  });
  
  socket.on('error', (error) => {
    console.error(`[SOCKET] Error for ${socket.id}:`, error);
  });
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
