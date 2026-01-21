import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.emit("player:join_game", {
  gameCode: "ABCD12",
  name: "Abhijit"
});

socket.on("disconnect", () => {
  console.log("Disconnected:", socket.id);
});

socket.on("server:new_question", (payload) => {
  console.log("New Question Received:", payload.text);

  // 2. Submit an answer automatically to test the flow
  socket.emit("player:submit_answer", {
    gameCode: "ABCD12",
    optionId: payload.options[0].id // Picking the first option for testing
  });
  console.log("Answer submitted!");
});

// 3. Listen for the timer ending (from your 'endQuestion' function)
socket.on("server:times_up", () => {
  console.log("Time is up! The server called endQuestion.");
});