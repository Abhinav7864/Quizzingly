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
    <div className="flex flex-col items-center justify-center py-12 space-y-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-5 max-w-2xl px-5"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-100">
          The Live <span className="text-indigo-500">AI Quiz</span> Platform
        </h1>
        <p className="text-lg text-gray-500">
          Real-time, multiplayer quizzes powered by AI. Create, host, and play with friends.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg">Creator Hub</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Join a Game
              </Button>
            </>
          )}
        </div>
      </motion.div>

      <div id="join-section" className="w-full max-w-md p-6 space-y-5 bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-100">Join a Game</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the code from the host</p>
        </div>

        <form onSubmit={handleJoinGame} className="space-y-4">
          <Input 
            id="game-code"
            placeholder="ENTER CODE"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="text-center text-2xl tracking-[0.3em] font-bold h-14 uppercase"
            required
            maxLength={6}
          />
          
          <Input
            id="name"
            placeholder={isAuthenticated ? `Playing as ${user?.username}` : "Your Name"}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-11"
            required={!isAuthenticated}
          />

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={isJoining}>
            JOIN GAME
          </Button>
        </form>
      </div>

      {!isAuthenticated && (
        <div className="grid md:grid-cols-3 gap-4 w-full max-w-4xl px-5 text-center">
          <div className="p-5 space-y-2 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mx-auto font-bold text-lg">1</div>
            <h3 className="font-semibold text-gray-200">Create Quizzes</h3>
            <p className="text-sm text-gray-500">Use AI to generate questions or write your own.</p>
          </div>
          <div className="p-5 space-y-2 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mx-auto font-bold text-lg">2</div>
            <h3 className="font-semibold text-gray-200">Host Live Sessions</h3>
            <p className="text-sm text-gray-500">Control the flow and see live results.</p>
          </div>
          <div className="p-5 space-y-2 bg-gray-900/50 rounded-xl border border-gray-800">
            <div className="w-10 h-10 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center mx-auto font-bold text-lg">3</div>
            <h3 className="font-semibold text-gray-200">Track Stats</h3>
            <p className="text-sm text-gray-500">See detailed leaderboards and performance.</p>
          </div>
        </div>
      )}
    </div>
  );
}
