
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/context/GameContext';
import { emitStartGame, emitNextQuestion, initializeSocket, getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Lobby = ({ gameCode, players }: { gameCode: string; players: string[] }) => (
  <div className="max-w-md mx-auto">
    <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
    <p className="text-lg text-gray-400 mb-6">Share this code with your players!</p>
    <div className="bg-gray-800 inline-block p-4 rounded-lg mb-8">
      <p className="text-6xl font-extrabold tracking-widest text-indigo-400">{gameCode}</p>
    </div>
    <h2 className="text-2xl font-bold mb-4">Players Joined ({players.length})</h2>
    <div className="bg-gray-800 p-4 rounded-lg min-h-[100px]">
      {players.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">{players.map((name, index) => <li key={index} className="bg-gray-700 p-2 rounded">{name}</li>)}</ul>
      ) : (
        <p className="text-gray-500">Waiting for players to join...</p>
      )}
    </div>
  </div>
);

const QuestionView = ({ question, playersAnswered, totalPlayers }: { question: any; playersAnswered: number; totalPlayers: number }) => (
  <div>
    <p className="text-xl text-gray-400 mb-2">Question is live!</p>
    <div className="bg-gray-700 p-4 rounded-lg mb-4">
      <p className="text-lg">Players Answered: {playersAnswered}/{totalPlayers}</p>
      <div className="w-full bg-gray-600 rounded-full h-4 mt-2">
        <div 
          className="bg-green-500 h-4 rounded-full transition-all duration-300" 
          style={{ width: `${totalPlayers > 0 ? (playersAnswered / totalPlayers) * 100 : 0}%` }}
        ></div>
      </div>
    </div>
    <h2 className="text-4xl font-bold my-4">{question.text}</h2>
    <div className="grid grid-cols-2 gap-4 mt-6">
      {question.options.map((opt: any, index: number) => (
        <div key={opt.id} className="bg-gray-700 p-4 rounded-lg">
          <span className="text-lg font-semibold">{String.fromCharCode(65 + index)}.</span> {opt.text}
        </div>
      ))}
    </div>
  </div>
);

const LeaderboardView = ({ leaderboard, onNextQuestion }: { leaderboard: any[], onNextQuestion: () => void }) => (
  <div>
    <h2 className="text-4xl font-bold mb-6">Leaderboard</h2>
    <ul className="space-y-2">
      {leaderboard.map((player, index) => (
        <li key={player.name} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg text-lg">
          <span>{index + 1}. {player.name}</span>
          <span className="font-bold">{player.score}</span>
        </li>
      ))}
    </ul>
    <Button onClick={onNextQuestion} className="mt-8 w-full text-2xl">Next Question</Button>
  </div>
);

const GameOverView = ({ leaderboard, onBackToDashboard }: { leaderboard: any[], onBackToDashboard: () => void }) => (
  <div>
    <h2 className="text-5xl font-bold mb-6">Final Results</h2>
    {/* Podium component could be added here */}
    <ul className="space-y-2">
      {leaderboard.map((player, index) => (
        <li key={player.name} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg text-xl">
          <span className="font-bold">{index + 1}. {player.name}</span>
          <span className="font-bold text-indigo-400">{player.score}</span>
        </li>
      ))}
    </ul>
    <div className="mt-8 space-x-4">
      <Button onClick={onBackToDashboard} className="bg-gray-600 hover:bg-gray-700">
        Back to Dashboard
      </Button>
      <Button onClick={() => window.location.reload()}>
        Host New Game
      </Button>
    </div>
  </div>
);


export default function HostPage() {
  const router = useRouter();
  const params = useParams();
  const gameCode = params.gameCode as string;
  
  const store = useGameStore();
  const [gameView, setGameView] = useState<'lobby' | 'question' | 'leaderboard' | 'gameOver'>('lobby');
  const [playersAnswered, setPlayersAnswered] = useState(0);

  useEffect(() => {
    try { getSocket() } catch (error) { router.push('/dashboard'); return; }
    
    initializeSocket({
      onPlayerListUpdate: (players) => store.setPlayers(players),
      onNewQuestion: (q) => { store.setCurrentQuestion(q); setGameView('question'); setPlayersAnswered(0); },
      onLeaderboardUpdate: (l) => { store.setLeaderboard(l); setGameView('leaderboard'); },
      onGameOver: (r) => { store.setGameResult(r); setGameView('gameOver'); },
      onAnswerSubmitted: () => { setPlayersAnswered(prev => prev + 1); },
      onTimesUp: () => { setPlayersAnswered(store.players.length); }
    });
  }, [router, store]);
  
  const handleStartGame = () => emitStartGame(gameCode);
  const handleNextQuestion = () => emitNextQuestion(gameCode);

  const renderView = () => {
    switch (gameView) {
      case 'question':
        return store.currentQuestion && <QuestionView 
          question={store.currentQuestion} 
          playersAnswered={playersAnswered}
          totalPlayers={store.players.length}
        />;
      case 'leaderboard':
        return <LeaderboardView leaderboard={store.leaderboard} onNextQuestion={handleNextQuestion} />;
      case 'gameOver':
        return <GameOverView 
          leaderboard={store.gameResult || store.leaderboard} 
          onBackToDashboard={() => router.push('/dashboard')}
        />;
      case 'lobby':
      default:
        return (
          <>
            <Lobby gameCode={gameCode} players={store.players} />
            <Button onClick={handleStartGame} disabled={store.players.length === 0} className="mt-6 w-full max-w-md text-xl">
              Start Game
            </Button>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <div className="mb-4 flex justify-start">
        <Button 
          onClick={() => router.push('/dashboard')} 
          className="bg-gray-600 hover:bg-gray-700"
        >
          ← Back to Dashboard
        </Button>
      </div>
      {renderView()}
    </div>
  );
}
