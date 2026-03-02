import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketHandlers } from "./socket/index.js";
import { redis } from "./redis/client.js";

import prisma from "./db/prisma.js";

async function debugDB() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname='public';
    `;
    console.log("TABLES IN CURRENT DB:", tables);
  } catch (err) {
    console.error("Database debug failed:", err.message);
  }
}

debugDB();

const PORT = process.env.PORT || 4002;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://quizzingly-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
  transports: ['websocket']
});

try {
  await redis.connect();
  console.log("Redis connected");
} catch (err) {
  console.warn("Redis not available - game features will be limited:", err.message);
}

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
