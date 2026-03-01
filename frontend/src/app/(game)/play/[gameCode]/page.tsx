'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore as useStore } from '@/context/GameContext';
import { initializeSocket, getSocket, emitSubmitAnswer } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Timer, Loader2 } from 'lucide-react';

const Lobby = ({ players }: { players: string[] }) => (
  <div className="text-center space-y-6">
    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
      <Loader2 size={40} className="text-indigo-400 animate-spin" />
    </div>
    <h2 className="text-2xl font-bold text-gray-100">You're In!</h2>
    <p className="text-gray-500">Waiting for the host to start the game...</p>
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
      <p className="text-xs text-gray-500 mb-1">Connected Players</p>
      <p className="text-xl font-bold text-gray-200">{players.length}</p>
    </div>
  </div>
);

const QuestionDisplay = ({ question, onAnswer, disabled }: { question: any, onAnswer: (optionId: string) => void, disabled: boolean }) => {
  const [timeLeft, setTimeLeft] = useState<number>(question.timeLimit || 10);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-2 text-indigo-400">
          <Timer size={18} />
          <span className="font-mono text-xl font-bold">{timeLeft}s</span>
        </div>
        <div className="h-1.5 flex-1 mx-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / (question.timeLimit || 10)) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-100 text-center leading-tight">
        {question.text}
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {question.options.map((opt: any, index: number) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Button 
              onClick={() => onAnswer(opt.id)} 
              disabled={disabled || timeLeft === 0} 
              fullWidth
              size="lg"
              className={`h-auto py-4 justify-start gap-3 text-left ${
                ['border-red-500/20', 'border-blue-500/20', 'border-yellow-500/20', 'border-green-500/20'][index % 4]
              }`}
              variant="secondary"
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
                ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][index % 4]
              }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{opt.text}</span>
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
    className={`p-8 rounded-2xl text-center space-y-5 ${
      result.correct 
        ? 'bg-emerald-500/10 border border-emerald-500/20' 
        : 'bg-red-500/10 border border-red-500/20'
    }`}
  >
    <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center ${
      result.correct ? 'bg-emerald-500/20' : 'bg-red-500/20'
    }`}>
      {result.correct ? <CheckCircle2 size={48} className="text-emerald-400" /> : <XCircle size={48} className="text-red-400" />}
    </div>
    <div className="space-y-1">
      <h2 className="text-3xl font-bold text-gray-100">{result.correct ? 'Correct!' : 'Wrong'}</h2>
      <p className="text-base font-medium text-gray-400">
        {result.correct ? `+${result.scoreGained} points` : 'Better luck next time'}
      </p>
    </div>
    <div className="pt-4 border-t border-gray-800">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Current Score</p>
      <p className="text-3xl font-bold text-gray-100">{result.totalScore}</p>
    </div>
  </motion.div>
);

const PlayerLeaderboardView = ({ leaderboard }: { leaderboard: any[] }) => (
  <div className="space-y-4 w-full">
    <div className="text-center">
      <Trophy size={36} className="text-yellow-500 mx-auto mb-2" />
      <h2 className="text-xl font-bold text-gray-100">Leaderboard</h2>
    </div>
    <div className="space-y-2">
      {leaderboard.slice(0, 10).map((p, i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-sm w-5">{i + 1}</span>
            <span className="font-medium text-gray-300">{p.name}</span>
          </div>
          <span className="font-bold text-indigo-400">{p.score}</span>
        </div>
      ))}
    </div>
  </div>
);

const GameOverView = ({ result, onRestart }: { result: any[], onRestart: () => void }) => (
  <div className="text-center space-y-6 w-full">
    <div className="space-y-2">
      <h2 className="text-4xl font-bold text-gray-100">Game Over!</h2>
      <p className="text-gray-500 font-medium">Excellent performance.</p>
    </div>
    <PlayerLeaderboardView leaderboard={result} />
    <Button onClick={onRestart} size="lg" fullWidth className="h-12">
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
      onTimesUp: () => {}
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
          <div className="text-center space-y-5 py-8">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-gray-900 rounded-2xl h-20 w-20 border-2 border-indigo-500 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-indigo-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-gray-100">Answer Locked!</p>
              <p className="text-gray-500 text-sm">Waiting for other players...</p>
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
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold text-gray-100 animate-pulse">
              Get Ready!
            </p>
            <p className="text-gray-500 text-sm">Next question is coming up...</p>
          </div>
        );
      case 'lobby':
      default:
        return <Lobby players={store.players} />;
    }
  };

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-80px)] py-8">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div 
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-900 border border-gray-800 p-7 md:p-8 rounded-2xl"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
