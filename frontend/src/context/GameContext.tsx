import { create } from 'zustand';
import { GameState, Player } from '@/types';

interface GameStore extends GameState {
  setGameCode: (gameCode: string) => void;
  setPlayers: (players: string[]) => void;
  setCurrentQuestion: (question: GameState['currentQuestion']) => void;
  setLeaderboard: (leaderboard: Player[]) => void;
  setGameResult: (result: Player[]) => void;
  setIsHost: (isHost: boolean) => void;
  reset: () => void;
}

const initialState: GameState = {
  gameCode: null,
  players: [],
  currentQuestion: null,
  leaderboard: [],
  gameResult: null,
  isHost: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setGameCode: (gameCode) => set({ gameCode }),
  setPlayers: (players) => set({ players }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setGameResult: (result) => set({ gameResult: result }),
  setIsHost: (isHost) => set({ isHost }),
  reset: () => set(initialState),
}));