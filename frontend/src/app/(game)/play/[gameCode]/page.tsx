
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore as useStore } from '@/context/GameContext';
import { initializeSocket, getSocket, emitSubmitAnswer } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Timer, Loader2 } from 'lucide-react';

// --- View Components ---
const Lobby = ({ players }: { players: string[] }) => (
  <div className="text-center space-y-6">
    <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
      <Loader2 size={48} className="text-indigo-400 animate-spin" />
    </div>
    <h2 className="text-4xl font-black text-white">You're In!</h2>
    <p className="text-gray-400 text-lg">Waiting for the host to start the game...</p>
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
      <p className="text-sm text-gray-500 mb-2">Connected Players</p>
      <p className="text-2xl font-bold text-white">{players.length}</p>
    </div>
  </div>
);

const QuestionDisplay = ({ question, onAnswer, disabled }: { question: any, onAnswer: (optionId: string) => void, disabled: boolean }) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit || 10);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-2 text-indigo-400">
          <Timer size={20} />
          <span className="font-mono text-2xl font-black">{timeLeft}s</span>
        </div>
        <div className="h-2 flex-1 mx-4 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / (question.timeLimit || 10)) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-black text-white text-center leading-tight">
        {question.text}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {question.options.map((opt: any, index: number) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button 
              onClick={() => onAnswer(opt.id)} 
              disabled={disabled || timeLeft === 0} 
              className={`w-full text-xl p-6 h-auto justify-start gap-4 border-2 ${
                ['border-red-500/30', 'border-blue-500/30', 'border-yellow-500/30', 'border-green-500/30'][index % 4]
              }`}
              variant="secondary"
            >
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-white shrink-0 ${
                ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][index % 4]
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-left">{opt.text}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AnswerResultView = ({ result }: { result: { correct: boolean; scoreGained: number; totalScore: number }}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`p-10 rounded-3xl text-center space-y-6 shadow-2xl ${
      result.correct 
        ? 'bg-green-500/10 border-2 border-green-500/50 text-green-400' 
        : 'bg-red-500/10 border-2 border-red-500/50 text-red-400'
    }`}
  >
    <div className="mx-auto w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
      {result.correct ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
    </div>
    <div className="space-y-2">
      <h2 className="text-5xl font-black">{result.correct ? 'BRILLIANT!' : 'NOT QUITE'}</h2>
      <p className="text-2xl font-bold opacity-80">
        {result.correct ? `+${result.scoreGained} points` : 'Better luck next time'}
      </p>
    </div>
    <div className="pt-6 border-t border-white/10">
      <p className="text-sm uppercase tracking-widest opacity-60 mb-1">Current Score</p>
      <p className="text-4xl font-black text-white">{result.totalScore}</p>
    </div>
  </motion.div>
);

const PlayerLeaderboardView = ({ leaderboard }: { leaderboard: any[] }) => (
  <div className="space-y-6 w-full">
    <div className="text-center">
      <Trophy size={48} className="text-yellow-500 mx-auto mb-2" />
      <h2 className="text-3xl font-black text-white">Leaderboard</h2>
    </div>
    <div className="space-y-2">
      {leaderboard.slice(0, 10).map((p, i) => (
        <div key={i} className="flex justify-between items-center p-4 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-lg">{i + 1}</span>
            <span className="font-bold text-gray-200">{p.name}</span>
          </div>
          <span className="font-black text-indigo-400">{p.score}</span>
        </div>
      ))}
    </div>
  </div>
);

const GameOverView = ({ result, onRestart }: { result: any[], onRestart: () => void }) => (
  <div className="text-center space-y-8 w-full">
    <div className="space-y-4">
      <h2 className="text-6xl font-black text-white bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent italic">
        FINISH!
      </h2>
      <p className="text-gray-400 text-xl font-medium">Excellent performance.</p>
    </div>
    <PlayerLeaderboardView leaderboard={result} />
    <Button onClick={onRestart} size="lg" className="w-full h-16 text-xl">
      PLAY AGAIN
    </Button>
  </div>
);


export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.gameCode as string;

  const store = useStore();
  const [view, setView] = useState('lobby');
  const [answerResult, setAnswerResult] = useState<any>(null);

  useEffect(() => {
    try { getSocket() } catch (error) { router.push('/'); return; }

    initializeSocket({
      onPlayerListUpdate: store.setPlayers,
      onNewQuestion: (q) => { 
        store.setCurrentQuestion(q); 
        setView('question'); 
        setAnswerResult(null);
      },
      onAnswerResult: (r) => { 
        setAnswerResult(r); 
        setView('result'); 
      },
      onLeaderboardUpdate: (l) => { 
        store.setLeaderboard(l); 
        setView('leaderboard'); 
      },
      onGameOver: (r) => { 
        store.setGameResult(r); 
        setView('gameOver'); 
      },
      onTimesUp: () => {
        // If player hasn't answered, they'll be stuck on 'question' view
        // The server will eventually send answerResult or leaderboardUpdate
      }
    });
  }, [router, store]);

  useEffect(() => {
    if (view === 'leaderboard') {
      const timer = setTimeout(() => setView('waiting'), 5000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleAnswer = (optionId: string) => {
    emitSubmitAnswer({ gameCode, optionId });
    setView('waiting_for_result');
  };

  const renderView = () => {
    switch (view) {
      case 'question':
        return store.currentQuestion ? <QuestionDisplay question={store.currentQuestion} onAnswer={handleAnswer} disabled={false} /> : null;
      case 'waiting_for_result':
        return (
          <div className="text-center space-y-6 py-10">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-gray-900 rounded-full h-24 w-24 border-4 border-indigo-500 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-indigo-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-black text-white">Answer Locked!</p>
              <p className="text-gray-400">Waiting for other players...</p>
            </div>
          </div>
        );
      case 'result':
        return answerResult && <AnswerResultView result={answerResult} />;
      case 'leaderboard':
        return <PlayerLeaderboardView leaderboard={store.leaderboard} />;
      case 'gameOver':
        return store.gameResult && <GameOverView result={store.gameResult} onRestart={() => router.push('/')} />;
      case 'waiting':
        return (
          <div className="text-center space-y-4">
            <p className="text-3xl font-black text-white animate-pulse italic uppercase tracking-tighter">
              Get Ready!
            </p>
            <p className="text-gray-500">Next question is coming up...</p>
          </div>
        );
      case 'lobby':
      default:
        return <Lobby players={store.players} />;
    }
  };

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-120px)] py-10">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-950/40 backdrop-blur-xl border border-gray-800 p-8 md:p-12 rounded-[2rem] shadow-2xl transition-all duration-500"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
