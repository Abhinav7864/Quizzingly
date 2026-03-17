export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Quiz {
  id: string;
  title: string;
  creatorId: string;
  createdAt: string;
  _count?: {
    questions: number;
  };
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  timeLimit: number;
  quizId: string;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PlayerGameResult {
  id: string;
  userId: string;
  sessionId: string | null;
  quizTitle: string;
  score: number;
  rank: number;
  totalPlayers: number;
  accuracy: number;
  playedAt: string;
}

export interface SessionPlayer {
  name: string;
  score: number;
  rank: number;
  accuracy: number;
}

export interface Player {
  name: string;
  score: number;
}

export interface GameState {
  gameCode: string | null;
  players: string[];
  currentQuestion: {
    id: string;
    text: string;
    timeLimit: number;
    options: { id: string; text: string }[];
  } | null;
  leaderboard: Player[];
  gameResult: Player[] | null;
  isHost: boolean;
}