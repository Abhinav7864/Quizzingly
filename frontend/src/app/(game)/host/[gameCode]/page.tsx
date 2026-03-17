'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/context/GameContext';
import { emitStartGame, emitNextQuestion, initializeSocket, getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Users, Play, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Lobby ─────────────────────────────────────────── */
const Lobby = ({ gameCode, players }: { gameCode: string; players: string[] }) => (
  <div className="space-y-10">
    <div className="p-16 text-center bg-[#FFD166] border-2 border-black shadow-[6px_6px_0px_black] rounded-xl">
      <p className="text-[12px] font-black text-black uppercase tracking-[0.4em] mb-6 animate-pulse">
        Waiting for players
      </p>
      <h1 className="font-mono text-8xl md:text-9xl font-black tracking-[0.2em] text-[#1E1E1E] leading-none">
        {gameCode}
      </h1>
    </div>

    <div>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[var(--primary)]" />
          <span className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide">Participants</span>
        </div>
        <span className="text-[13px] font-mono text-[var(--text-secondary)] font-bold">{players.length} JOINED</span>
      </div>

      <div className="bg-white border-2 border-black rounded-xl p-6 min-h-[160px] shadow-[4px_4px_0px_black]">
        {players.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            <AnimatePresence>
              {players.map((name, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 bg-white border-2 border-black rounded-full text-[13px] text-[#1E1E1E] font-bold shadow-[2px_2px_0px_black]"
                >
                  {name || 'Guest'}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
            <p className="text-[14px] font-medium animate-pulse uppercase tracking-widest">Waiting for players...</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

/* ── Question view ─────────────────────────────────── */
const QuestionView = ({ question, playersAnswered, totalPlayers }: {
  question: any; playersAnswered: number; totalPlayers: number;
}) => {
  const colors = ['#EF4444', '#3B82F6', '#F59E0B', '#22C55E'];
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 20);

  useEffect(() => {
    setTimeLeft(question.timeLimit || 20);
  }, [question]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p: number) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const pct = (timeLeft / (question.timeLimit || 20)) * 100;
  const isLow = timeLeft <= 5;

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--primary)]" />
          </div>
          <span className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Live</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">Responses</span>
            <span className="text-xl font-mono font-black text-[var(--primary)]">
              {playersAnswered}<span className="text-[var(--text-muted)] text-base">/{totalPlayers}</span>
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border-2 ${isLow ? 'bg-[#EF4444]/10 border-[#EF4444]' : 'bg-[#F6F6F6] border-black'}`}>
            <span className={`text-[22px] font-mono font-black tabular-nums ${isLow ? 'text-[#EF4444]' : 'text-[#1E1E1E]'}`}>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_black]">
        <motion.div
          className={`h-full ${isLow ? 'bg-[#EF4444]' : 'bg-[var(--primary)]'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Question text */}
      <div className="py-10">
        <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] text-center leading-[1.2]">
          {question.text}
        </h2>
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((opt: any, i: number) => (
          <div
            key={opt.id}
            className="flex items-center gap-4 p-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black]"
            style={{ borderLeftWidth: '6px', borderLeftColor: colors[i % 4] }}
          >
            <div
              className="w-8 h-8 rounded-lg text-[14px] font-black text-white flex items-center justify-center shrink-0"
              style={{ background: colors[i % 4] }}
            >
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-[18px] font-semibold text-[var(--text-primary)]">{opt.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Leaderboard ───────────────────────────────────── */
const LeaderboardView = ({ leaderboard, onNext }: { leaderboard: any[]; onNext: () => void }) => (
  <div className="space-y-8 max-w-xl mx-auto">
    <div className="text-center">
      <div className="w-16 h-16 bg-[#FFD166] rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[4px_4px_0px_black]">
        <Trophy size={32} className="text-[var(--primary)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Current Standings</h2>
    </div>

    <div className="space-y-3">
      {leaderboard.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center justify-between px-6 py-4 rounded-xl border-2 border-black transition-all ${
            i === 0
              ? 'bg-[#FFD166] scale-[1.02] shadow-[6px_6px_0px_black]'
              : 'bg-white shadow-[4px_4px_0px_black]'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`text-[15px] font-mono font-black ${i === 0 ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'} w-6`}>
              #{i + 1}
            </span>
            <span className={`text-[16px] font-bold ${i === 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
              {p.name}
            </span>
          </div>
          <span className="text-[18px] font-mono font-black text-[var(--primary)]">{p.score}</span>
        </motion.div>
      ))}
    </div>

    <div className="pt-6">
      <Button onClick={onNext} fullWidth size="lg" className="h-14 gap-3 text-lg">
        Next Question <ChevronRight size={20} />
      </Button>
    </div>
  </div>
);

/* ── Game over ─────────────────────────────────────── */
const GameOverView = ({ leaderboard, onDashboard }: { leaderboard: any[]; onDashboard: () => void }) => (
  <div className="space-y-10 text-center max-w-xl mx-auto">
    <div>
      <div className="relative inline-block mb-6">
        <Trophy size={64} className="text-[var(--primary)] mx-auto animate-bounce" />
  
      </div>
      <h2 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tight">Final Results</h2>
      <p className="text-[15px] text-[var(--text-secondary)] font-medium mt-2">Session Complete</p>
    </div>

    <div className="space-y-3 text-left">
      {leaderboard.slice(0, 5).map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center justify-between px-6 py-5 rounded-xl border-2 border-black ${
            i === 0 
              ? 'bg-[#F55CA7] text-white shadow-[6px_6px_0px_black]' 
              : 'bg-white text-[#1E1E1E] shadow-[4px_4px_0px_black]'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`text-[16px] font-mono font-black ${i === 0 ? 'text-white/60' : 'text-[var(--text-muted)]'} w-6`}>
              #{i + 1}
            </span>
            <span className="text-[18px] font-bold">{p.name}</span>
          </div>
          <span className={`text-[20px] font-mono font-black ${i === 0 ? 'text-white' : 'text-[var(--primary)]'}`}>
            {p.score}
          </span>
        </div>
      ))}
    </div>

    <div className="pt-4">
      <Button onClick={onDashboard} fullWidth size="lg" className="h-14 text-lg">
        Back to Dashboard
      </Button>
    </div>
  </div>
);

/* ── Page ──────────────────────────────────────────── */
export default function HostPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.gameCode as string;
  const store = useGameStore();
  const [view, setView] = useState<'lobby' | 'question' | 'leaderboard' | 'gameOver'>('lobby');
  const [playersAnswered, setPlayersAnswered] = useState(0);

  useEffect(() => {
    try { getSocket(); } catch { router.push('/dashboard'); return; }
    initializeSocket({
      onPlayerListUpdate: store.setPlayers,
      onNewQuestion: (q) => { store.setCurrentQuestion(q); setView('question'); setPlayersAnswered(0); },
      onLeaderboardUpdate: (l) => { store.setLeaderboard(l); setView('leaderboard'); },
      onGameOver: (r) => { store.setGameResult(r); setView('gameOver'); },
      onAnswerSubmitted: () => setPlayersAnswered((p) => p + 1),
      onTimesUp: () => setPlayersAnswered(store.players.length),
    });
  }, []);

  const renderView = () => {
    switch (view) {
      case 'question':
        return store.currentQuestion ? (
          <QuestionView question={store.currentQuestion} playersAnswered={playersAnswered} totalPlayers={store.players.length} />
        ) : null;
      case 'leaderboard':
        return <LeaderboardView leaderboard={store.leaderboard} onNext={() => emitNextQuestion(gameCode)} />;
      case 'gameOver':
        return <GameOverView leaderboard={store.gameResult || store.leaderboard} onDashboard={() => router.push('/dashboard')} />;
      default:
        return (
          <div className="space-y-10">
            <Lobby gameCode={gameCode} players={store.players} />
            <Button
              onClick={() => emitStartGame(gameCode)}
              disabled={store.players.length === 0}
              fullWidth
              size="lg"
              className="h-16 text-xl gap-4 shadow-xl"
            >
              <Play size={20} fill="currentColor" /> START SESSION
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-20 pb-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {view === 'lobby' && (
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
