'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/context/GameContext';
import { emitStartGame, emitNextQuestion, initializeSocket, getSocket } from '@/lib/socket';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Users, Play, ChevronRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lobby = ({ gameCode, players }: { gameCode: string; players: string[] }) => (
  <div className="max-w-2xl mx-auto space-y-8">
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-bold text-gray-100">Game Lobby</h1>
      <p className="text-gray-500">Wait for players to join using the code below</p>
    </div>
    
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center space-y-4">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Join Code</p>
      <p className="text-7xl font-black tracking-[0.15em] text-gray-100 tabular-nums">{gameCode}</p>
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <Users size={20} className="text-indigo-400" />
          Players Joined
        </h2>
        <span className="text-gray-500 font-mono text-sm">{players.length} ready</span>
      </div>
      
      <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl min-h-[180px]">
        {players.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <AnimatePresence>
              {players.map((name, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={index} 
                  className="bg-gray-800 px-3 py-2 rounded-xl text-center font-medium text-gray-300 text-sm border border-gray-700"
                >
                  {name}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <div className="animate-pulse text-sm">Waiting for the first player...</div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const QuestionView = ({ question, playersAnswered, totalPlayers }: { question: any; playersAnswered: number; totalPlayers: number }) => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex justify-between items-center">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
        <p className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Question Live
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Responses</p>
        <p className="text-2xl font-bold text-gray-100">{playersAnswered} / {totalPlayers}</p>
      </div>
    </div>

    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
      <motion.div 
        className="bg-indigo-500 h-full"
        initial={{ width: 0 }}
        animate={{ width: `${totalPlayers > 0 ? (playersAnswered / totalPlayers) * 100 : 0}%` }}
      />
    </div>

    <div className="text-center space-y-6">
      <h2 className="text-4xl font-bold text-gray-100 leading-tight">{question.text}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
        {question.options.map((opt: any, index: number) => (
          <div key={opt.id} className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl flex items-center gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm ${
              ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][index % 4]
            }`}>
              {String.fromCharCode(65 + index)}
            </div>
            <span className="text-base font-medium text-gray-300">{opt.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LeaderboardView = ({ leaderboard, onNextQuestion }: { leaderboard: any[], onNextQuestion: () => void }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center space-y-2">
      <Trophy size={40} className="text-yellow-500 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-gray-100">Current Standings</h2>
    </div>
    
    <div className="space-y-2">
      {leaderboard.map((player, index) => (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          key={player.name} 
          className={`flex justify-between items-center p-4 rounded-xl border ${
            index === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-gray-900/50 border-gray-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm ${
              index === 0 ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'
            }`}>
              {index + 1}
            </span>
            <span className="font-medium text-gray-200">{player.name}</span>
          </div>
          <span className="text-lg font-bold text-indigo-400">{player.score}</span>
        </motion.div>
      ))}
    </div>
    
    <Button onClick={onNextQuestion} size="lg" fullWidth className="h-14 gap-2">
      Next Question <ChevronRight size={20} />
    </Button>
  </div>
);

const GameOverView = ({ leaderboard, onBackToDashboard }: { leaderboard: any[], onBackToDashboard: () => void }) => (
  <div className="max-w-2xl mx-auto space-y-8 text-center">
    <div className="space-y-3">
      <div className="inline-block p-4 bg-indigo-500/10 rounded-2xl">
        <Trophy size={48} className="text-indigo-400" />
      </div>
      <h2 className="text-4xl font-bold text-gray-100">Game Over!</h2>
      <p className="text-gray-500">The final scores are in.</p>
    </div>

    <div className="space-y-2 text-left">
      {leaderboard.slice(0, 5).map((player, index) => (
        <div key={player.name} className={`flex justify-between items-center p-4 rounded-xl ${
          index === 0 ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-gray-900 border border-gray-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-500 w-6">{index + 1}</span>
            <span className="font-semibold text-gray-200">{player.name}</span>
          </div>
          <span className="text-xl font-bold text-gray-100">{player.score}</span>
        </div>
      ))}
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
      <Button variant="secondary" onClick={onBackToDashboard} size="lg" fullWidth className="gap-2">
        <ArrowLeft size={20} /> Dashboard
      </Button>
      <Button onClick={() => window.location.reload()} size="lg" fullWidth className="gap-2">
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
          <div className="space-y-8">
            <Lobby gameCode={gameCode} players={store.players} />
            <Button 
              onClick={handleStartGame} 
              disabled={store.players.length === 0} 
              size="lg"
              fullWidth
              className="h-14 text-lg gap-2"
            >
              <Play size={22} fill="currentColor" /> START GAME
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 pb-16">
      {gameView === 'lobby' && (
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')} 
            className="text-gray-500 hover:text-gray-300 gap-2"
          >
            <ArrowLeft size={18} /> Exit to Dashboard
          </Button>
        </div>
      )}
      <div className="pt-2">
        {renderView()}
      </div>
    </div>
  );
}
