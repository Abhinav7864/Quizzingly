
'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializeSocket, emitJoinGame } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  
  const gameStoreActions = useGameStore.getState();

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode || (!isAuthenticated && !nickname)) {
      setError('Please provide a game code and a nickname.');
      return;
    }
    
    setError('');

    initializeSocket({
      onJoinedLobby: (players) => {
        gameStoreActions.setGameCode(gameCode);
        gameStoreActions.setPlayers(players);
        gameStoreActions.setIsHost(false);
        router.push(`/play/${gameCode}`);
      },
      onError: (message) => {
        setError(message);
      }
    });

    const payload: { gameCode: string; name?: string; userId?: string } = { gameCode };
    if (isAuthenticated && user) {
      payload.userId = user.id;
      payload.name = user.username;
    } else {
      payload.name = nickname;
    }
    
    emitJoinGame(payload);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="w-full max-w-lg p-8 space-y-8 bg-gray-800 rounded-lg shadow-2xl">
        <h1 className="text-5xl font-extrabold text-white">
          The Live AI Quiz Platform
        </h1>
        <p className="text-lg text-gray-300">
          Challenge your friends, test your knowledge.
        </p>

        {isAuthenticated && user ? (
          <div className="space-y-4">
            <p className="text-xl">Welcome back, <span className="font-bold text-indigo-400">{user.username || user.email}</span>!</p>
            <div className="flex justify-center space-x-4">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Button onClick={logout} className="bg-red-600 hover:bg-red-700">Logout</Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">Register</Button>
            </Link>
          </div>
        )}

        <div className="pt-8 border-t border-gray-700">
          <h2 className="text-3xl font-bold text-white">Join a Game</h2>
          <form onSubmit={handleJoinGame} className="mt-6 space-y-4">
            <Input 
              id="game-code"
              placeholder="Enter Game Code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="text-center text-2xl tracking-widest font-bold"
              required
            />
            {!isAuthenticated && (
              <Input
                id="nickname"
                placeholder="Enter Your Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="text-center"
                required
              />
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full text-xl">
              Join
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}