import { io, Socket } from 'socket.io-client';
import { GameState, Player } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

let socket: Socket | null = null;

interface SocketHandlers {
  onGameCreated?: (gameCode: string) => void;
  onPlayerListUpdate?: (players: string[]) => void;
  onJoinedLobby?: (players: string[]) => void;
  onNewQuestion?: (question: GameState['currentQuestion']) => void;
  onAnswerResult?: (result: { correct: boolean; scoreGained: number; totalScore: number }) => void;
  onAnswerSubmitted?: () => void;
  onLeaderboardUpdate?: (leaderboard: Player[]) => void;
  onLiveLeaderboard?: (leaderboard: Player[]) => void;
  onTimesUp?: () => void;
  onGameOver?: (result: Player[]) => void;
  onForceEnded?: (data: { message: string }) => void;
  onNextQuestionCountdown?: (data: { seconds: number }) => void;
  onPlayerLeft?: (data: { name: string }) => void;
  onLeftEarlySummary?: (data: { score: number; name: string }) => void;
  onError?: (message: string) => void;
}

export const initializeSocket = (handlers: SocketHandlers): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      autoConnect: false,
    });
    
    socket.on('connect', () => console.log('Socket connected:', socket?.id));
    socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  }
  
  // Remove all previous listeners to avoid duplicates
  socket.off();

  // Register common listeners
  socket.on('connect', () => console.log('Socket re-connected:', socket?.id));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

  // Register new handlers
  if (handlers.onGameCreated) socket.on('server:game_created', ({ gameCode }) => handlers.onGameCreated!(gameCode));
  if (handlers.onPlayerListUpdate) socket.on('server:player_list_update', (players) => handlers.onPlayerListUpdate!(players));
  if (handlers.onJoinedLobby) socket.on('server:joined_lobby', (players) => handlers.onJoinedLobby!(players));
  if (handlers.onNewQuestion) socket.on('server:new_question', (question) => handlers.onNewQuestion!(question));
  if (handlers.onAnswerResult) socket.on('server:answer_result', (result) => handlers.onAnswerResult!(result));
  if (handlers.onAnswerSubmitted) socket.on('server:answer_received', () => handlers.onAnswerSubmitted!());
  if (handlers.onLeaderboardUpdate) socket.on('server:leaderboard_update', (leaderboard) => handlers.onLeaderboardUpdate!(leaderboard));
  if (handlers.onLiveLeaderboard) socket.on('server:live_leaderboard', (leaderboard) => handlers.onLiveLeaderboard!(leaderboard));
  if (handlers.onTimesUp) socket.on('server:times_up', () => handlers.onTimesUp!());
  if (handlers.onGameOver) socket.on('server:game_over', (result) => handlers.onGameOver!(result));
  if (handlers.onForceEnded) socket.on('server:game_force_ended', (data) => handlers.onForceEnded!(data));
  if (handlers.onNextQuestionCountdown) socket.on('server:next_question_countdown', (data) => handlers.onNextQuestionCountdown!(data));
  if (handlers.onPlayerLeft) socket.on('server:player_left', (data) => handlers.onPlayerLeft!(data));
  if (handlers.onLeftEarlySummary) socket.on('server:left_early_summary', (data) => handlers.onLeftEarlySummary!(data));
  if (handlers.onError) socket.on('server:error', ({ message }) => handlers.onError!(message));
  
  if (!socket.connected) {
    socket.connect();
  }
  
  return socket;
};

// ... (rest of the file is the same)
export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// --- Emitter Functions ---

export const emitCreateGame = (quizId: string, userId?: string) => {
  getSocket().emit('host:create_game', { quizId, userId });
};

export const emitStartGame = (gameCode: string) => {
  getSocket().emit('host:start_game', { gameCode });
};

/** Emits force-end: wipes game and no history is saved. */
export const emitForceEndGame = (gameCode: string) => {
  getSocket().emit('host:force_end_game', { gameCode });
};

export const emitJoinGame = (payload: { gameCode: string; name?: string; userId?: string }) => {
  getSocket().emit('player:join_game', payload);
};

export const emitSubmitAnswer = (payload: { gameCode: string; optionId: string }) => {
  getSocket().emit('player:submit_answer', payload);
};

/** Emits voluntary leave: saves partial score for logged-in users. */
export const emitLeaveEarly = (gameCode: string) => {
  getSocket().emit('player:leave_early', { gameCode });
};
