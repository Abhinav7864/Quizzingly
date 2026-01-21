import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.emit("host:create_game", { quizId: "dummy-id" });

setTimeout(() => {
    console.log("Starting the game...");
    socket.emit("host:start_game", { gameCode: "ABCD12" });
  }, 2000); 

// Listen for the question to confirm it worked
socket.on("server:new_question", (data) => {
  console.log("Question started successfully:", data.text);
});

