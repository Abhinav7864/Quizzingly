
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
      <motion.div 
        id="join-section" 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg p-8 space-y-8 bg-gray-900 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl hover:border-indigo-500/30 transition-colors duration-200"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Join a Live Game</h2>
          <p className="text-gray-400 text-sm">Enter the code provided by the host to start playing</p>
        </div>

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div className="space-y-4">
            <Input 
              id="game-code"
              placeholder="ENTER CODE"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="text-center text-4xl tracking-[0.5em] font-black h-20 uppercase"
              required
              maxLength={6}
            />
            
            {!isAuthenticated && (
              <Input
                id="name"
                label="Your Name"
                placeholder="Enter your name"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required={!isAuthenticated}
              />
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3.5"
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={isJoining} className="mt-8">
            JOIN GAME
          </Button>
        </form>
      </motion.div>

      {/* Features/CTA for Creators */}
      {!isAuthenticated && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 w-full max-w-6xl px-4"
        >
          {[
            { icon: '1', title: 'Create Quizzes', desc: 'Use AI to generate questions or write your own.', color: 'indigo' },
            { icon: '2', title: 'Host Live Sessions', desc: 'Control the flow and see live results as they happen.', color: 'purple' },
            { icon: '3', title: 'Track Stats', desc: 'See detailed leaderboards and player performance.', color: 'pink' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`p-6 space-y-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg border border-gray-700/50 hover:border-${feature.color}-500/30 transition-all duration-200`}
            >
              <div className={`w-12 h-12 bg-${feature.color}-500/20 text-${feature.color}-400 rounded-lg flex items-center justify-center mx-auto text-xl font-bold`}>
                {feature.icon}
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
