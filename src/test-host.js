
import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const QUIZ_ID = "fe743d09-2949-4df5-89b6-d8041e386a73"; // Valid ID fetched from DB
let myGameCode = null;

socket.on("connect", () => {
  console.log("Host connected! ID:", socket.id);
  console.log("Creating game...");
  socket.emit("host:create_game", { quizId: QUIZ_ID });
});

socket.on("server:game_created", ({ gameCode }) => {
  myGameCode = gameCode;
  console.log("\n=================================");
  console.log(" GAME CREATED! CODE: " + gameCode);
  console.log("=================================\n");
  console.log("Share this code with players.");
  console.log("Waiting for players to join...");
  console.log("Press ENTER to start the game when ready.");
  
  rl.on("line", () => {
      if (myGameCode) {
          console.log("Starting game...");
          socket.emit("host:start_game", { gameCode: myGameCode });
      }
  });
});

socket.on("server:player_list_update", (players) => {
  console.log("\nCurrent Players:", players);
});

socket.on("server:new_question", (question) => {
  console.log("\n[HOST] Question Sent:", question.text);
  console.log("Time Limit:", question.timeLimit, "s");
});

socket.on("server:times_up", () => {
  console.log("\n[HOST] Time's Up!");
});

socket.on("server:leaderboard_update", (leaderboard) => {
  console.log("\n--- Current Leaderboard ---");
  leaderboard.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name}: ${p.score} pts`);
  });
  console.log("---------------------------");
});

socket.on("server:question_ended", () => {
  console.log("[HOST] Question ended.");
  console.log("Press ENTER to send next question.");
  
  rl.removeAllListeners("line"); // Clear previous listeners
  rl.once("line", () => {
      console.log("Requesting next question...");
      socket.emit("host:next_question", { gameCode: myGameCode });
  });
});

socket.on("server:game_over", (leaderboard) => {
  console.log("\n[HOST] Game Over!");
  console.log("Final Leaderboard:");
  if (leaderboard && Array.isArray(leaderboard)) {
    leaderboard.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}: ${p.score} pts`);
    });
  } else {
    console.log("No leaderboard data received.");
  }
  socket.disconnect();
  process.exit(0);
});

socket.on("server:error", (err) => {
    console.error("Server Error:", err);
});

socket.on("disconnect", () => {
  console.log("Disconnected.");
});

