import { createClient } from '@supabase/supabase-js';
import { GameState, Player } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RealtimeHandlers {
  onPlayerListUpdate?: (players: string[]) => void;
  onJoinedLobby?: (players: string[]) => void;
  onNewQuestion?: (question: any) => void;
  onAnswerResult?: (result: any) => void;
  onLeaderboardUpdate?: (leaderboard: Player[]) => void;
  onTimesUp?: () => void;
  onGameOver?: (result: Player[]) => void;
  onAnswerSubmitted?: () => void;
  onError?: (message: string) => void;
}

let activeChannel: any = null;

export const initializeRealtime = (gameCode: string, handlers: RealtimeHandlers) => {
  if (activeChannel) {
    activeChannel.unsubscribe();
  }

  activeChannel = supabase.channel(`game:${gameCode}`, {
    config: {
      presence: {
        key: gameCode,
      },
    },
  });

  activeChannel
    .on('broadcast', { event: 'player_list_update' }, ({ payload }: any) => {
      handlers.onPlayerListUpdate?.(payload.players);
    })
    .on('broadcast', { event: 'new_question' }, ({ payload }: any) => {
      handlers.onNewQuestion?.(payload.question);
    })
    .on('broadcast', { event: 'answer_result' }, ({ payload }: any) => {
      handlers.onAnswerResult?.(payload.result);
    })
    .on('broadcast', { event: 'leaderboard_update' }, ({ payload }: any) => {
      handlers.onLeaderboardUpdate?.(payload.leaderboard);
    })
    .on('broadcast', { event: 'times_up' }, () => {
      handlers.onTimesUp?.();
    })
    .on('broadcast', { event: 'answer_received' }, () => {
      handlers.onAnswerSubmitted?.();
    })
    .on('broadcast', { event: 'game_over' }, ({ payload }: any) => {
      handlers.onGameOver?.(payload.leaderboard);
    })
    .on('broadcast', { event: 'error' }, ({ payload }: any) => {
      handlers.onError?.(payload.message);
    })
    .subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to game channel:', gameCode);
      }
    });

  return activeChannel;
};

export const disconnectRealtime = () => {
  if (activeChannel) {
    activeChannel.unsubscribe();
    activeChannel = null;
  }
};

// --- Emitter Replacements ---
// These will now likely call API routes or Supabase Edge Functions

export const emitCreateGame = async (quizId: string) => {
  const { data, error } = await supabase.functions.invoke('create-game', {
    body: { quizId },
  });
  if (error) throw error;
  return data;
};

export const emitStartGame = async (gameCode: string) => {
  await supabase.functions.invoke('start-game', {
    body: { gameCode },
  });
};

export const emitNextQuestion = async (gameCode: string) => {
  await supabase.functions.invoke('next-question', {
    body: { gameCode },
  });
};

export const emitJoinGame = async (payload: { gameCode: string; name: string; userId?: string }) => {
  const { data, error } = await supabase.functions.invoke('join-game', {
    body: payload,
  });
  if (error) throw error;
  return data;
};

export const emitSubmitAnswer = async (payload: { gameCode: string; optionId: string }) => {
  await supabase.functions.invoke('submit-answer', {
    body: payload,
  });
};
