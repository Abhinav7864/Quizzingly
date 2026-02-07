
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/context/GameContext';
import { initializeSocket, getSocket, emitSubmitAnswer } from '@/lib/socket';
import { Button } from '@/components/ui/Button';

// --- View Components ---
const Lobby = ({ players }: { players: string[] }) => (
  <div><h2 className="text-3xl font-bold">You're in!</h2><p className="text-gray-400 mt-2">Waiting for the host to start...</p></div>
);

const QuestionDisplay = ({ question, onAnswer, disabled }: { question: any, onAnswer: (optionId: string) => void, disabled: boolean }) => (
  <div>
    <p className="text-lg text-gray-400">Time Limit: {question.timeLimit}s</p>
    <h2 className="text-3xl font-bold my-4">{question.text}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options.map((opt: any) => (
        <Button key={opt.id} onClick={() => onAnswer(opt.id)} disabled={disabled} className="text-xl p-4 h-full">
          {opt.text}
        </Button>
      ))}
    </div>
  </div>
);

const AnswerResult = ({ result }: { result: { correct: boolean; scoreGained: number; totalScore: number }}) => (
  <div className={`p-6 rounded-lg ${result.correct ? 'bg-green-500' : 'bg-red-500'}`}>
    <h2 className="text-4xl font-bold">{result.correct ? 'Correct!' : 'Incorrect'}</h2>
    <p className="text-2xl mt-2">+ {result.scoreGained} points</p>
    <p className="text-lg mt-4">Total Score: {result.totalScore}</p>
  </div>
);

const LeaderboardView = ({ leaderboard }: { leaderboard: any[] }) => (
  <div><h2 className="text-3xl font-bold mb-4">Leaderboard</h2><ul className="space-y-2">{leaderboard.map((p, i) => <li key={i} className="flex justify-between p-2 bg-gray-700 rounded"><span>{i + 1}. {p.name}</span><span>{p.score}</span></li>)}</ul></div>
);

const GameOverView = ({ result }: { result: any[] }) => (
    <div><h2 className="text-4xl font-bold mb-4">Game Over!</h2><p>Final results:</p><LeaderboardView leaderboard={result} /></div>
);


export default function PlayPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.gameCode as string;

  const store = useGameStore();
  const [view, setView] = useState('lobby');
  const [answerResult, setAnswerResult] = useState<any>(null);

  useEffect(() => {
    try { getSocket() } catch (error) { router.push('/'); return; }

    initializeSocket({
      onPlayerListUpdate: store.setPlayers,
      onNewQuestion: (q) => { store.setCurrentQuestion(q); setView('question'); },
      onAnswerResult: (r) => { setAnswerResult(r); setView('result'); },
      onLeaderboardUpdate: (l) => { store.setLeaderboard(l); setView('leaderboard'); },
      onGameOver: (r) => { store.setGameResult(r); setView('gameOver'); }
    });
  }, [router, store]);

  useEffect(() => {
    // Automatically move from leaderboard to a "get ready" screen after a few seconds
    if (view === 'leaderboard') {
      const timer = setTimeout(() => setView('waiting'), 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
    
    // Safety fallback: if stuck on waiting_for_result for too long, show result
    if (view === 'waiting_for_result') {
      const timer = setTimeout(() => {
        setView('result');
        setAnswerResult({ correct: false, scoreGained: 0, totalScore: 0 });
      }, 10000); // 10 second fallback
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
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <p className="text-2xl animate-pulse">Answer locked in!</p>
            <p className="text-gray-400 mt-2">Waiting for other players and results...</p>
          </div>
        );
      case 'result':
        return answerResult && <AnswerResult result={answerResult} />;
      case 'leaderboard':
        return store.leaderboard.length > 0 && <LeaderboardView leaderboard={store.leaderboard} />;
      case 'gameOver':
        return store.gameResult && <GameOverView result={store.gameResult} />;
      case 'waiting':
        return <p className="text-2xl animate-pulse">Get ready for the next question...</p>;
      case 'lobby':
      default:
        return <Lobby players={store.players} />;
    }
  };

  return (
    <div className="container mx-auto p-4 text-center flex items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl transition-all duration-500">
        {renderView()}
      </div>
    </div>
  );
}
