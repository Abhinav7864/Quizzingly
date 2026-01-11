// 1. Correct ESM import for Node.js
import { io } from "socket.io-client";

// 2. Initialize connection
const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected to server! ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Connection failed:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.emit("host:create_game", { quizId: "dummy-id" });
