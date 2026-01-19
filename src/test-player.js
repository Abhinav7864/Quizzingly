import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let myGameCode = "";
let myName = "";

socket.on("connect", () => {
  console.log("Player connected! ID:", socket.id);
  
  rl.question("Enter Game Code: ", (code) => {
    myGameCode = code.trim();
    rl.question("Enter Your Name: ", (name) => {
      myName = name.trim();
      console.log(`Joining game ${myGameCode} as ${myName}...`);
      socket.emit("player:join_game", { gameCode: myGameCode, name: myName });
    });
  });
});

socket.on("server:joined_lobby", (players) => {
  console.log("\nJoined Lobby! Players:", players);
  console.log("Waiting for host to start...");
});

socket.on("server:player_list_update", (players) => {
  console.log("Player joined/left. Current list:", players);
});

socket.on("server:new_question", (q) => {
  console.log("\n--------------------------------");
  console.log("QUESTION:", q.text);
  console.log("Time Limit:", q.timeLimit);
  console.log("Options:");
  q.options.forEach((opt, idx) => {
    console.log(`  [${idx + 1}] ${opt.text} (ID: ${opt.id})`);
  });
  console.log("--------------------------------");
  console.log("Enter Option ID (copy from above) or index (1-4) to answer:");
  
  const answerListener = (input) => {
      let ans = input.trim();
      // If user typed 1, 2, 3, 4, try to map to ID
      if (ans.length < 5 && !isNaN(ans)) {
          const idx = parseInt(ans) - 1;
          if (q.options[idx]) {
              ans = q.options[idx].id;
          }
      }
      
      console.log("Submitting answer:", ans);
      socket.emit("player:submit_answer", { gameCode: myGameCode, optionId: ans });
      console.log("Answer submitted. Waiting...");
      // We don't remove listener here immediately if we want them to change answer? 
      // But typically one answer per q.
      // Let's remove it to prevent spamming
      // But we need to re-add for next q. 
      // Actually readline stays open. We just need to know if we are in "answering mode".
  };
  
  rl.removeAllListeners("line");
  rl.once("line", answerListener);
});

socket.on("server:times_up", () => {
  console.log("\nTime's Up!");
});

socket.on("server:answer_received", () => {
    console.log("Server confirmed receipt of answer.");
});

socket.on("server:game_over", () => {
  console.log("\nGAME OVER");
  socket.disconnect();
  process.exit(0);
});

socket.on("server:error", (err) => {
  console.error("Server Error:", err);
});

socket.on("disconnect", () => {
  console.log("Disconnected.");
});

