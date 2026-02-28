
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/context/GameContext';
import { emitStartGame, emitNextQuestion, initializeSocket, getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Users, Play, ChevronRight, Trophy, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lobby = ({ gameCode, players }: { gameCode: string; players: string[] }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-black text-white">Game Lobby</h1>
      <p className="text-gray-400">Wait for players to join using the code below</p>
    </div>
    
    <div className="bg-gray-900 border-2 border-indigo-500/30 p-8 rounded-3xl shadow-2xl shadow-indigo-500/10 text-center space-y-4">
      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Join Code</p>
      <p className="text-8xl font-black tracking-[0.2em] text-white tabular-nums">{gameCode}</p>
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={20} className="text-indigo-400" />
          Players Joined
        </h2>
        <span className="text-gray-500 font-mono">{players.length} ready</span>
      </div>
      
      <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl min-h-[200px]">
        {players.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {players.map((name, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={index} 
                  className="bg-gray-800 px-4 py-2 rounded-lg text-center font-bold text-gray-200 border border-gray-700"
                >
                  {name}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <div className="animate-pulse mb-2">Waiting for the first player...</div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const QuestionView = ({ question, playersAnswered, totalPlayers }: { question: any; playersAnswered: number; totalPlayers: number }) => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex justify-between items-center">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</p>
        <p className="text-xl font-bold text-green-400 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Question is Live
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Responses</p>
        <p className="text-2xl font-black text-white">{playersAnswered} / {totalPlayers}</p>
      </div>
    </div>

    <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-gray-700">
      <motion.div 
        className="bg-indigo-500 h-full"
        initial={{ width: 0 }}
        animate={{ width: `${totalPlayers > 0 ? (playersAnswered / totalPlayers) * 100 : 0}%` }}
      />
    </div>

    <div className="text-center space-y-6">
      <h2 className="text-5xl font-black text-white leading-tight">{question.text}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {question.options.map((opt: any, index: number) => (
          <div key={opt.id} className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-white ${
              ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][index % 4]
            }`}>
              {String.fromCharCode(65 + index)}
            </div>
            <span className="text-xl font-medium text-gray-200">{opt.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LeaderboardView = ({ leaderboard, onNextQuestion }: { leaderboard: any[], onNextQuestion: () => void }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div className="text-center space-y-2">
      <Trophy size={48} className="text-yellow-500 mx-auto mb-4" />
      <h2 className="text-4xl font-black text-white">Current Standings</h2>
    </div>
    
    <div className="space-y-3">
      {leaderboard.map((player, index) => (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          key={player.name} 
          className={`flex justify-between items-center p-4 rounded-xl border ${
            index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-gray-900/50 border-gray-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'
            }`}>
              {index + 1}
            </span>
            <span className="text-lg font-bold text-white">{player.name}</span>
          </div>
          <span className="text-xl font-black text-indigo-400">{player.score}</span>
        </motion.div>
      ))}
    </div>
    
    <Button onClick={onNextQuestion} size="lg" className="w-full h-16 text-xl gap-2">
      Next Question <ChevronRight size={24} />
    </Button>
  </div>
);

const GameOverView = ({ leaderboard, onBackToDashboard }: { leaderboard: any[], onBackToDashboard: () => void }) => (
  <div className="max-w-2xl mx-auto space-y-10 text-center">
    <div className="space-y-4">
      <div className="inline-block p-4 bg-indigo-500/20 rounded-full mb-4">
        <Trophy size={64} className="text-indigo-400" />
      </div>
      <h2 className="text-6xl font-black text-white">Game Over!</h2>
      <p className="text-gray-400 text-xl">The final scores are in.</p>
    </div>

    <div className="space-y-3 text-left">
      {leaderboard.slice(0, 5).map((player, index) => (
        <div key={player.name} className={`flex justify-between items-center p-5 rounded-2xl ${
          index === 0 ? 'bg-indigo-600 shadow-xl shadow-indigo-500/20' : 'bg-gray-900'
        }`}>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black opacity-50">{index + 1}</span>
            <span className="text-xl font-bold">{player.name}</span>
          </div>
          <span className="text-2xl font-black">{player.score}</span>
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row gap-4">
      <Button variant="secondary" onClick={onBackToDashboard} size="lg" className="flex-1 gap-2">
        <ArrowLeft size={20} /> Dashboard
      </Button>
      <Button onClick={() => window.location.reload()} size="lg" className="flex-1 gap-2">
        <Play size={20} fill="currentColor" /> Host Again
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
          <div className="space-y-10">
            <Lobby gameCode={gameCode} players={store.players} />
            <Button 
              onClick={handleStartGame} 
              disabled={store.players.length === 0} 
              size="lg"
              className="w-full max-w-2xl h-16 text-2xl gap-3 shadow-xl shadow-indigo-500/20"
            >
              <Play size={24} fill="currentColor" /> START GAME
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      {gameView === 'lobby' && (
        <div className="mb-10">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')} 
            className="text-gray-500 hover:text-white gap-2"
          >
            <ArrowLeft size={20} /> Exit to Dashboard
          </Button>
        </div>
      )}
      <div className="pt-4">
        {renderView()}
      </div>
    </div>
  );
}
