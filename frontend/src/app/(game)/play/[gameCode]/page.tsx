'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore as useStore } from '@/context/GameContext';
import { initializeSocket, getSocket, emitSubmitAnswer } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Timer, Loader2, Lock } from 'lucide-react';

/* ── Lobby ─────────────────────────────────────────── */
const Lobby = ({ players }: { players: string[] }) => (
  <div className="text-center py-4 space-y-6">
    <div className="w-16 h-16 bg-[#FFD166] border-2 border-black rounded-xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_black]">
      <Loader2 size={28} className="text-[#1E1E1E] animate-spin" />
    </div>
    <div>
      <h2 className="text-xl font-black text-[#1E1E1E]">You&apos;re in!</h2>
      <p className="text-[14px] text-[#6B6B6B] mt-2 font-medium">Waiting for host to start...</p>
    </div>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_black]">
      <span className="text-[12px] font-black text-[#6B6B6B] uppercase tracking-wider">Players</span>
      <span className="text-[14px] font-mono font-black text-[#F55CA7]">{players.length}</span>
    </div>
  </div>
);

/* ── Question ──────────────────────────────────────── */
const QuestionDisplay = ({ question, onAnswer, disabled }: {
  question: any; onAnswer: (id: string) => void; disabled: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 15);
  const colors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e'];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p: number) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const pct = (timeLeft / (question.timeLimit || 15)) * 100;
  const isLow = timeLeft <= 5;

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <Timer size={14} className={isLow ? 'text-[#ef4444]' : 'text-[#6B6B6B]'} />
          <span className={`text-[13px] font-mono font-black ${isLow ? 'text-[#ef4444]' : 'text-[#6B6B6B]'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="h-2 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_black]">
          <motion.div
            className={`h-full rounded-full ${isLow ? 'bg-[#ef4444]' : 'bg-[#F55CA7]'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      <h3 className="text-xl font-black text-[#1E1E1E] text-center leading-tight">{question.text}</h3>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt: any, i: number) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onAnswer(opt.id)}
            disabled={disabled || timeLeft === 0}
            className="group flex items-center gap-4 w-full p-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_black] text-left disabled:opacity-50 transition-all outline-none"
          >
            <div
              className="w-8 h-8 rounded-lg text-[13px] font-black text-white flex items-center justify-center shrink-0 border-2 border-black"
              style={{ background: colors[i % 4] }}
            >
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-[15px] font-black text-[#1E1E1E] tracking-tight">{opt.text}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/* ── Answer result ─────────────────────────────────── */
const AnswerResult = ({ result }: { result: { correct: boolean; scoreGained: number; totalScore: number } }) => (
  <div className="text-center py-4 space-y-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`w-20 h-20 rounded-xl flex items-center justify-center mx-auto border-2 border-black shadow-[4px_4px_0px_black] ${
        result.correct ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
      }`}
    >
      {result.correct
        ? <CheckCircle2 size={40} className="text-white" />
        : <XCircle size={40} className="text-white" />
      }
    </motion.div>

    <div>
      <h2 className={`text-2xl font-black uppercase tracking-tight ${result.correct ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
        {result.correct ? 'Correct!' : 'Incorrect'}
      </h2>
      <p className="text-[16px] font-black text-[#1E1E1E] mt-1">
        {result.correct ? `+${result.scoreGained} Pts` : 'No points'}
      </p>
    </div>

    <div className="pt-6 border-t-2 border-black">
      <p className="text-[11px] font-black text-[#A0A0A0] uppercase tracking-[0.2em] mb-2">Score</p>
      <p className="text-4xl font-mono font-black text-[#F55CA7]">{result.totalScore}</p>
    </div>
  </div>
);

/* ── Leaderboard ───────────────────────────────────── */
const PlayerLeaderboard = ({ leaderboard }: { leaderboard: any[] }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 px-1">
      <Trophy size={16} className="text-[#F55CA7]" />
      <h3 className="text-[14px] font-black text-[#1E1E1E] uppercase tracking-wider">Standings</h3>
    </div>
    <div className="space-y-2">
      {leaderboard.slice(0, 5).map((p, i) => (
        <div key={i} className={`flex justify-between items-center p-3 border-2 border-black rounded-xl shadow-[2px_2px_0px_black] ${i === 0 ? 'bg-[#FFD166]' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-mono font-black text-[#A0A0A0] w-5">#{i + 1}</span>
            <span className="text-[14px] font-black text-[#1E1E1E]">{p.name}</span>
          </div>
          <span className="text-[14px] font-mono font-black text-[#F55CA7]">{p.score}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Page ──────────────────────────────────────────── */
export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.gameCode as string;
  const store = useStore();
  const [view, setView] = useState('lobby');
  const [answerResult, setAnswerResult] = useState<any>(null);

  useEffect(() => {
    try { getSocket(); } catch { router.push('/'); return; }
    initializeSocket({
      onPlayerListUpdate: store.setPlayers,
      onNewQuestion: (q) => { store.setCurrentQuestion(q); setView('question'); setAnswerResult(null); },
      onAnswerResult: (r) => { setAnswerResult(r); setView('result'); },
      onLeaderboardUpdate: (l) => { store.setLeaderboard(l); setView('leaderboard'); },
      onGameOver: (r) => { store.setGameResult(r); setView('gameOver'); },
      onTimesUp: () => {},
    });
  }, []);

  useEffect(() => {
    if (view === 'leaderboard') {
      const t = setTimeout(() => setView('waiting'), 5000);
      return () => clearTimeout(t);
    }
  }, [view]);

  const handleAnswer = (optionId: string) => {
    emitSubmitAnswer({ gameCode, optionId });
    setView('waiting_for_result');
  };

  const renderView = () => {
    switch (view) {
      case 'question':
        return store.currentQuestion
          ? <QuestionDisplay question={store.currentQuestion} onAnswer={handleAnswer} disabled={false} />
          : null;
      case 'waiting_for_result':
        return (
          <div className="text-center py-10 space-y-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-[#FFD166] border-2 border-black rounded-xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_black]"
            >
              <Lock size={28} className="text-[#1E1E1E]" />
            </motion.div>
            <div>
              <h3 className="text-lg font-black text-[#1E1E1E]">Locked In</h3>
              <p className="text-[13px] text-[#6B6B6B] mt-2 font-medium">Waiting for results...</p>
            </div>
          </div>
        );
      case 'result':
        return answerResult && <AnswerResult result={answerResult} />;
      case 'leaderboard':
        return <PlayerLeaderboard leaderboard={store.leaderboard} />;
      case 'gameOver':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFD166] border-2 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_black]">
                <Trophy size={32} className="text-[#1E1E1E]" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#1E1E1E]">Game Over</h2>
            </div>
            <PlayerLeaderboard leaderboard={store.gameResult || store.leaderboard} />
            <Button onClick={() => router.push('/')} fullWidth size="lg" className="h-14">Back to Home</Button>
          </div>
        );
      case 'waiting':
        return (
          <div className="text-center py-10 space-y-4">
            <p className="text-xl font-black text-[#F55CA7] animate-pulse uppercase tracking-[0.2em]">Ready?</p>
            <p className="text-[14px] text-[#6B6B6B] font-medium">Next question starting soon</p>
          </div>
        );
      default:
        return <Lobby players={store.players} />;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <div className="w-full max-w-sm mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Card className="p-7">
                {renderView()}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
