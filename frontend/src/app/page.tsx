
'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializeSocket, emitJoinGame } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const gameStoreActions = useGameStore.getState();

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode || (!isAuthenticated && !nickname)) {
      setError('Please provide a game code and your name.');
      return;
    }
    
    setError('');
    setIsJoining(true);

    initializeSocket({
      onJoinedLobby: (players) => {
        setIsJoining(false);
        gameStoreActions.setGameCode(gameCode);
        gameStoreActions.setPlayers(players);
        gameStoreActions.setIsHost(false);
        router.push(`/play/${gameCode}`);
      },
      onError: (message) => {
        setIsJoining(false);
        setError(message);
      }
    });

    const payload: { gameCode: string; name?: string; userId?: string } = { gameCode };
    if (nickname) {
      payload.name = nickname;
    } else if (isAuthenticated && user) {
      payload.userId = user.id;
      payload.name = user.username;
    }
    
    emitJoinGame(payload);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-10">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
          The Live <span className="text-indigo-500">AI Quiz</span> Platform
        </h1>
        <p className="text-xl text-gray-400 font-medium">
          Real-time, multiplayer quizzes powered by AI. Create, host, and play with friends.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="px-10">Go to Creator Hub</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" className="px-10">Get Started Free</Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Join a Game
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Join Section */}
      <div id="join-section" className="w-full max-w-lg p-8 space-y-8 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Join a Live Game</h2>
          <p className="text-gray-400 mt-2">Enter the code provided by the host</p>
        </div>

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div className="space-y-4">
            <Input 
              id="game-code"
              placeholder="ENTER CODE"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="text-center text-4xl tracking-[0.5em] font-black h-20 uppercase border-2 focus:border-indigo-500"
              required
              maxLength={6}
            />
            
            <Input
              id="name"
              placeholder={isAuthenticated ? `Playing as ${user?.username}` : "Enter Your Name"}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-center h-12"
              required={!isAuthenticated}
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full text-xl h-14" isLoading={isJoining}>
            JOIN GAME
          </Button>
        </form>
      </div>

      {/* Features/CTA for Creators */}
      {!isAuthenticated && (
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl px-4 text-center">
          <div className="p-6 space-y-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
            <h3 className="text-xl font-bold">Create Quizzes</h3>
            <p className="text-gray-400 text-sm">Use AI to generate questions or write your own.</p>
          </div>
          <div className="p-6 space-y-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">2</div>
            <h3 className="text-xl font-bold">Host Live Sessions</h3>
            <p className="text-gray-400 text-sm">Control the flow and see live results as they happen.</p>
          </div>
          <div className="p-6 space-y-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">3</div>
            <h3 className="text-xl font-bold">Track Stats</h3>
            <p className="text-gray-400 text-sm">See detailed leaderboards and player performance.</p>
          </div>
        </div>
      )}
    </div>
  );
}
