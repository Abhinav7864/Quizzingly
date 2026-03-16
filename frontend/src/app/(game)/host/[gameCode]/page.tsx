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
    <Card className="p-16 text-center border-white/10 bg-[#161616] shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-[40px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#b5179e] to-transparent opacity-50" />
      <p className="text-[12px] font-black text-[#b5179e] uppercase tracking-[0.4em] mb-6 animate-pulse">
        Waiting for players
      </p>
      <h1 className="font-mono text-8xl md:text-9xl font-black tracking-[0.2em] text-[#f5f3ef] leading-none drop-shadow-[0_0_30px_rgba(181,23,158,0.2)]">
        {gameCode}
      </h1>
    </Card>

    <div>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#b5179e]" />
          <span className="text-[14px] font-bold text-[#f5f3ef] uppercase tracking-wide">Participants</span>
        </div>
        <span className="text-[13px] font-mono text-[#4a4845] font-bold">{players.length} JOINED</span>
      </div>

      <div className="bg-[#0d0d0d] border border-white/6 rounded-2xl p-6 min-h-[160px]">
        {players.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            <AnimatePresence>
              {players.map((name, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 bg-[#161616] border border-white/8 rounded-full text-[13px] text-[#f5f3ef] font-semibold"
                >
                  {name}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-[#4a4845]">
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
  const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-6 py-4 bg-[#161616] border border-white/8 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b5179e] opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#b5179e]" />
          </div>
          <span className="text-[14px] font-bold text-[#f5f3ef] uppercase tracking-wider">Live</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-bold text-[#4a4845] uppercase tracking-wide">Responses</span>
          <span className="text-2xl font-mono font-black text-[#b5179e]">
            {playersAnswered}<span className="text-[#4a4845] text-lg">/{totalPlayers}</span>
          </span>
        </div>
      </div>

      <div className="py-12">
        <h2 className="text-3xl md:text-5xl font-bold text-[#f5f3ef] text-center leading-[1.2]">
          {question.text}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((opt: any, i: number) => (
          <div
            key={opt.id}
            className="flex items-center gap-4 p-6 bg-[#161616] border border-white/6 rounded-2xl transition-all hover:border-white/12"
            style={{ borderLeftWidth: '6px', borderLeftColor: colors[i % 4] }}
          >
            <div
              className="w-8 h-8 rounded-lg text-[14px] font-black text-white flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: colors[i % 4] }}
            >
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-[18px] font-semibold text-[#f5f3ef]">{opt.text}</span>
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
      <div className="w-16 h-16 bg-[#b5179e]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#b5179e]/20 shadow-[0_0_20px_rgba(181,23,158,0.1)]">
        <Trophy size={32} className="text-[#b5179e]" />
      </div>
      <h2 className="text-2xl font-bold text-[#f5f3ef]">Current Standings</h2>
    </div>

    <div className="space-y-3">
      {leaderboard.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${
            i === 0
              ? 'bg-[#b5179e]/10 border-[#b5179e]/30 scale-[1.02] shadow-[0_0_30px_rgba(181,23,158,0.1)]'
              : 'bg-[#161616] border-white/7'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`text-[15px] font-mono font-black ${i === 0 ? 'text-[#b5179e]' : 'text-[#4a4845]'} w-6`}>
              #{i + 1}
            </span>
            <span className={`text-[16px] font-bold ${i === 0 ? 'text-[#f5f3ef]' : 'text-[#8a8780]'}`}>
              {p.name}
            </span>
          </div>
          <span className="text-[18px] font-mono font-black text-[#b5179e]">{p.score}</span>
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
        <Trophy size={64} className="text-[#b5179e] mx-auto animate-bounce" />
        <div className="absolute inset-0 bg-[#b5179e]/20 blur-3xl rounded-full -z-10" />
      </div>
      <h2 className="text-4xl font-black text-[#f5f3ef] uppercase tracking-tight">Final Results</h2>
      <p className="text-[15px] text-[#8a8780] font-medium mt-2">Session Complete</p>
    </div>

    <div className="space-y-3 text-left">
      {leaderboard.slice(0, 5).map((p, i) => (
        <div
          key={p.name}
          className={`flex items-center justify-between px-6 py-5 rounded-2xl border ${
            i === 0 
              ? 'bg-[#b5179e] border-transparent text-black shadow-xl' 
              : 'bg-[#161616] border-white/7 text-[#f5f3ef]'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`text-[16px] font-mono font-black ${i === 0 ? 'text-black/50' : 'text-[#4a4845]'} w-6`}>
              #{i + 1}
            </span>
            <span className="text-[18px] font-bold">{p.name}</span>
          </div>
          <span className={`text-[20px] font-mono font-black ${i === 0 ? 'text-black' : 'text-[#b5179e]'}`}>
            {p.score}
          </span>
        </div>
      ))}
    </div>

    <div className="flex gap-4">
      <Button variant="secondary" onClick={onDashboard} fullWidth size="lg" className="h-14">
        Dashboard
      </Button>
      <Button onClick={() => window.location.reload()} fullWidth size="lg" className="h-14 gap-3">
        <Play size={18} fill="currentColor" /> Replay
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
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        {view === 'lobby' && (
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-[13px] font-bold text-[#4a4845] hover:text-[#f5f3ef] uppercase tracking-widest transition-colors"
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
