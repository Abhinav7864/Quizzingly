'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore as useStore } from '@/context/GameContext';
import { initializeSocket, getSocket, emitSubmitAnswer, emitLeaveEarly } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Timer, Loader2, Lock, LogOut } from 'lucide-react';

/* ── Live Leaderboard Sidebar ─────────────────────── */
const LiveLeaderboardSidebar = ({ leaderboard }: { leaderboard: any[] }) => (
  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-1.5 px-1">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
      </div>
      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Live Scores</span>
    </div>
    {leaderboard.length === 0 ? (
      <p className="text-[11px] text-[var(--text-muted)] text-center py-2">Be the first to answer!</p>
    ) : (
      leaderboard.map((p, i) => (
        <motion.div
          key={p.name}
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-black text-xs ${
            i === 0 ? 'bg-[#FFD166]' : 'bg-white'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-mono font-black text-[var(--text-muted)] shrink-0">#{i + 1}</span>
            <span className="font-bold text-[var(--text-primary)] truncate">{p.name}</span>
          </div>
          <span className="font-mono font-black text-[var(--primary)] shrink-0 ml-2">{p.score}</span>
        </motion.div>
      ))
    )}
  </div>
);

/* ── Lobby ─────────────────────────────────────────── */
const Lobby = ({ players }: { players: string[] }) => (
  <div className="text-center py-4 space-y-6">
    <div className="w-16 h-16 bg-[#FFD166] border-2 border-black rounded-xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_black]">
      <Loader2 size={28} className="text-[var(--primary)] animate-spin" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">You&apos;re in!</h2>
      <p className="text-[14px] text-[var(--text-secondary)] mt-2">Waiting for host to start...</p>
    </div>
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_black]">
      <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Players</span>
      <span className="text-[14px] font-mono font-black text-[var(--primary)]">{players.length}</span>
    </div>
  </div>
);

/* ── Question ──────────────────────────────────────── */
const QuestionDisplay = ({
  question,
  onAnswer,
  disabled,
  liveLeaderboard,
}: {
  question: any;
  onAnswer: (id: string) => void;
  disabled: boolean;
  liveLeaderboard: any[];
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
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
           <Timer size={14} className={isLow ? 'text-[#ef4444]' : 'text-[var(--text-secondary)]'} />
           <span className={`text-[13px] font-mono font-bold ${isLow ? 'text-[#ef4444]' : 'text-[var(--text-secondary)]'}`}>
            {timeLeft}s
           </span>
        </div>
        <div className="h-1.5 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_black]">
          <motion.div
            className={`h-full ${isLow ? 'bg-[#ef4444]' : 'bg-[var(--primary)]'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      <h3 className="text-xl font-bold text-[var(--text-primary)] text-center leading-tight">
        {question.text}
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt: any, i: number) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onAnswer(opt.id)}
            disabled={disabled || timeLeft === 0}
            className="group flex items-center gap-4 w-full p-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_black] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-left disabled:opacity-50 outline-none"
          >
            <div
              className="w-8 h-8 rounded-xl text-[13px] font-black text-white flex items-center justify-center shrink-0 shadow-lg"
              style={{ background: colors[i % 4] }}
            >
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-[15px] font-bold text-[var(--text-primary)] tracking-tight">{opt.text}</span>
          </motion.button>
        ))}
      </div>

      {/* Live leaderboard mini sidebar below question */}
      <LiveLeaderboardSidebar leaderboard={liveLeaderboard} />
    </div>
  );
};

/* ── Answer result ─────────────────────────────────── */
const AnswerResult = ({
  result,
  autoAdvanceIn,
  liveLeaderboard,
}: {
  result: { correct: boolean; scoreGained: number; totalScore: number };
  autoAdvanceIn: number;
  liveLeaderboard: any[];
}) => (
  <div className="text-center py-4 space-y-6">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border-2 ${
        result.correct ? 'bg-[#A8E6CF] border-black shadow-[4px_4px_0px_black]' : 'bg-[#EF4444]/10 border-[#EF4444] shadow-[4px_4px_0px_#EF4444]'
      }`}
    >
      {result.correct 
        ? <CheckCircle2 size={40} className="text-[#22c55e]" /> 
        : <XCircle size={40} className="text-[#ef4444]" />
      }
    </motion.div>

    <div>
      <h2 className={`text-2xl font-black uppercase tracking-tight ${result.correct ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
        {result.correct ? 'Correct!' : 'Incorrect'}
      </h2>
      <p className="text-[16px] font-bold text-[var(--text-primary)] mt-1">
        {result.correct ? `+${result.scoreGained} Pts` : 'No points'}
      </p>
    </div>

    <div className="pt-6 border-t-2 border-black">
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2">Score</p>
      <p className="text-4xl font-mono font-black text-[var(--primary)]">{result.totalScore}</p>
    </div>

    {autoAdvanceIn > 0 && (
      <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
        Next question in {autoAdvanceIn}s…
      </p>
    )}

    <LiveLeaderboardSidebar leaderboard={liveLeaderboard} />
  </div>
);

/* ── Waiting screen ────────────────────────────────── */
const WaitingForNext = ({ countdown }: { countdown: number | null }) => (
  <div className="text-center py-10 space-y-4">
    <p className="text-xl font-black text-[var(--primary)] animate-pulse uppercase tracking-[0.2em]">Ready?</p>
    {countdown !== null ? (
      <p className="text-[14px] text-[var(--text-secondary)]">Next question in <strong>{countdown}s</strong></p>
    ) : (
      <p className="text-[14px] text-[var(--text-secondary)]">Next question starting soon</p>
    )}
  </div>
);

/* ── Leaderboard ───────────────────────────────────── */
const PlayerLeaderboard = ({ leaderboard }: { leaderboard: any[] }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 px-1">
      <Trophy size={16} className="text-[var(--primary)]" />
      <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider">Standings</h3>
    </div>
    <div className="space-y-2">
      {leaderboard.slice(0, 5).map((p, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_black]">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-mono font-bold text-[var(--text-muted)] w-5">#{i + 1}</span>
            <span className="text-[14px] font-bold text-[var(--text-primary)]">{p.name}</span>
          </div>
          <span className="text-[14px] font-mono font-black text-[var(--primary)]">{p.score}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Early Leave Summary ───────────────────────────── */
const EarlyLeaveSummary = ({ score, name, onHome }: { score: number; name: string; onHome: () => void }) => (
  <div className="text-center space-y-6 py-4">
    <div className="w-16 h-16 bg-[#FFD166] border-2 border-black rounded-xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_black]">
      <Trophy size={28} className="text-[var(--primary)]" />
    </div>
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight text-[var(--text-primary)]">You Left Early</h2>
      <p className="text-[14px] text-[var(--text-secondary)] mt-1">{name}, your results have been saved.</p>
    </div>
    <div className="py-4 border-y-2 border-black">
      <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Your Score</p>
      <p className="text-4xl font-mono font-black text-[var(--primary)]">{score}</p>
    </div>
    <Button onClick={onHome} fullWidth size="lg" className="h-14 shadow-xl">Back to Home</Button>
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
  const [liveLeaderboard, setLiveLeaderboard] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [earlyLeaveSummary, setEarlyLeaveSummary] = useState<{ score: number; name: string } | null>(null);
  const [autoAdvanceIn, setAutoAdvanceIn] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try { getSocket(); } catch { router.push('/'); return; }
    initializeSocket({
      onPlayerListUpdate: store.setPlayers,
      onNewQuestion: (q) => {
        store.setCurrentQuestion(q);
        setView('question');
        setAnswerResult(null);
        setLiveLeaderboard([]);
        setCountdown(null);
        setAutoAdvanceIn(0);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      },
      onAnswerResult: (r) => {
        setAnswerResult(r);
        setView('result');
        // Auto-advance to waiting view after 2 seconds
        setAutoAdvanceIn(2);
        let remaining = 2;
        const tick = setInterval(() => {
          remaining -= 1;
          setAutoAdvanceIn(remaining);
          if (remaining <= 0) {
            clearInterval(tick);
            setView('waiting');
          }
        }, 1000);
        resultTimerRef.current = tick as any;
      },
      onLiveLeaderboard: (l) => setLiveLeaderboard(l),
      onLeaderboardUpdate: (l) => { store.setLeaderboard(l); },
      onNextQuestionCountdown: ({ seconds }) => {
        setCountdown(seconds);
        if (countdownRef.current) clearInterval(countdownRef.current);
        let remaining = seconds;
        countdownRef.current = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(countdownRef.current!);
            setCountdown(null);
          } else {
            setCountdown(remaining);
          }
        }, 1000);
      },
      onGameOver: (r) => { store.setGameResult(r); setView('gameOver'); },
      onForceEnded: () => {
        setView('forceEnded');
        setTimeout(() => router.push('/'), 3000);
      },
      onLeftEarlySummary: (data) => {
        setEarlyLeaveSummary(data);
        setView('earlyLeave');
      },
      onTimesUp: () => {},
    });

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    };
  }, []);

  const handleAnswer = (optionId: string) => {
    emitSubmitAnswer({ gameCode, optionId });
    setView('waiting_for_result');
  };

  const handleLeaveEarly = () => {
    emitLeaveEarly(gameCode);
  };

  const renderView = () => {
    switch (view) {
      case 'question':
        return store.currentQuestion
          ? (
            <QuestionDisplay
              question={store.currentQuestion}
              onAnswer={handleAnswer}
              disabled={false}
              liveLeaderboard={liveLeaderboard}
            />
          )
          : null;
      case 'waiting_for_result':
        return (
          <div className="text-center py-10 space-y-6">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto"
            >
              <Lock size={28} className="text-[var(--primary)]" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Locked In</h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-2">Waiting for results...</p>
            </div>
            <LiveLeaderboardSidebar leaderboard={liveLeaderboard} />
          </div>
        );
      case 'result':
        return answerResult && (
          <AnswerResult
            result={answerResult}
            autoAdvanceIn={autoAdvanceIn}
            liveLeaderboard={liveLeaderboard}
          />
        );
      case 'waiting':
        return <WaitingForNext countdown={countdown} />;
      case 'gameOver':
        return (
          <div className="space-y-8">
            <div className="text-center">
               <Trophy size={48} className={`text-[var(--primary)] mx-auto mb-4`} />
               <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">Game Over</h2>
            </div>
            <PlayerLeaderboard leaderboard={store.gameResult || store.leaderboard} />
            <Button onClick={() => router.push('/')} fullWidth size="lg" className="h-14 shadow-xl">Back to Home</Button>
          </div>
        );
      case 'forceEnded':
        return (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-xl flex items-center justify-center mx-auto">
              <XCircle size={28} className="text-[#EF4444]" />
            </div>
            <h2 className="text-xl font-black uppercase text-[var(--text-primary)]">Host Ended the Quiz</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">Redirecting you home…</p>
          </div>
        );
      case 'earlyLeave':
        return earlyLeaveSummary && (
          <EarlyLeaveSummary
            score={earlyLeaveSummary.score}
            name={earlyLeaveSummary.name}
            onHome={() => router.push('/')}
          />
        );
      default:
        return <Lobby players={store.players} />;
    }
  };

  const showLeaveButton =
    view === 'question' || view === 'waiting_for_result' || view === 'result' || view === 'waiting';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
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

              {/* Leave early button */}
              {showLeaveButton && (
                <div className="mt-6 pt-4 border-t-2 border-black/10">
                  <button
                    id="leave-early-btn"
                    onClick={() => {
                      if (confirm('Leave the quiz? Your current score will be saved if you are logged in.')) {
                        handleLeaveEarly();
                      }
                    }}
                    className="flex items-center gap-2 text-[12px] font-bold text-[var(--text-muted)] hover:text-[#EF4444] uppercase tracking-wider transition-colors mx-auto"
                  >
                    <LogOut size={13} /> Leave Quiz
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
