import { games } from "./gameStore.js";

export const sendQuestion = (gameCode) => {
  const game = games[gameCode];
  if (!game) return;

  const question = game.questions[game.currentQuestionIndex];
  if (!question) return;

  game.currentQuestionStartTime = Date.now();
  game.answers = {}; // reset answers

  const payload = {
    id: question.id,
    text: question.text,
    timeLimit: question.timeLimit,
    options: question.options.map((o) => ({
      id: o.id,
      text: o.text,
    })),
  };

  global.io.to(gameCode).emit("server:new_question", payload);

  setTimeout(() => {
    endQuestion(gameCode);
  }, question.timeLimit * 1000);
};

export const endQuestion = (gameCode) => {
  const game = games[gameCode];
  if (!game) return;

  global.io.to(gameCode).emit("server:times_up");

  game.currentQuestionIndex++;

  if (game.currentQuestionIndex < game.questions.length) {
    // wait for host to trigger next question
    global.io.to(gameCode).emit("server:question_ended");
  } else {
    global.io.to(gameCode).emit("server:game_over");
  }
};
