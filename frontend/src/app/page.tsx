'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializeSocket, emitJoinGame } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users } from 'lucide-react';

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
      },
    });

    const payload: { gameCode: string; name?: string; userId?: string } = { gameCode };
    if (nickname) payload.name = nickname;
    else if (isAuthenticated && user) {
      payload.userId = user.id;
      payload.name = user.username;
    }
    emitJoinGame(payload);
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 relative z-10">

        {/* Hero Content */}
        <div className="text-center mb-14">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD166] border-2 border-black shadow-[4px_4px_0px_black] mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="text-[13px] font-black text-black tracking-wider uppercase">Live multiplayer quizzes</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-[#1E1E1E] leading-[1.05] tracking-tight mb-6"
          >
            Quiz your team,<br />
            <span className="text-[var(--primary)]">in real time.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] text-[#6B6B6B] max-w-lg mx-auto mb-12 font-medium"
          >
            The fastest way to host engaging, AI-powered quiz sessions for your team, class, or community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            {!isAuthenticated ? (
              <Link href="/register">
                <button className="h-14 px-8 bg-[var(--primary)] hover:translate-x-[2px] hover:translate-y-[2px] text-white font-black text-[16px] rounded-xl border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] transition-all">
                  Sign up for free →
                </button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <button className="h-14 px-8 bg-[var(--primary)] hover:translate-x-[2px] hover:translate-y-[2px] text-white font-black text-[16px] rounded-xl border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] transition-all">
                  Go to Dashboard →
                </button>
              </Link>
            )}
          </motion.div>
        </div>

        {/* Join Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-md mx-auto mb-16"
        >
          <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_black] overflow-hidden">
            {/* Card header */}
            <div className="px-7 py-4 border-b-2 border-black flex items-center justify-between bg-[#FFD166]">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-black rounded-full" />
                <span className="text-[15px] font-black text-black uppercase tracking-tight">Join a game</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-black/20 border border-black/30" />)}
              </div>
            </div>

            {/* Card body */}
            <div className="p-7 space-y-6">
              <form onSubmit={handleJoinGame} className="space-y-5">
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] ml-1">Pin Code</span>
                  <input
                    type="text"
                    id="game-code"
                    placeholder="000 000"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full h-20 px-4 text-center text-4xl font-mono font-black tracking-[0.4em] uppercase text-[#1E1E1E] placeholder-[#A0A0A0] bg-white border-2 border-black rounded-xl focus:outline-none focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)] shadow-[4px_4px_0px_black] transition-all"
                  />
                </div>
                {!isAuthenticated && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] ml-1">Your Name</span>
                    <input
                      id="nickname"
                      placeholder="E.g. Captain Quizz"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full h-14 px-5 text-[16px] font-bold text-[#1E1E1E] placeholder-[#A0A0A0] bg-white border-2 border-black rounded-xl focus:outline-none focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)] shadow-[4px_4px_0px_black] transition-all"
                    />
                  </div>
                )}
                {error && <p className="text-[14px] text-[#EF4444] font-bold text-center">{error}</p>}
                <button
                  type="submit"
                  id="join-game-btn"
                  className="w-full h-14 bg-[#1E1E1E] hover:translate-x-[2px] hover:translate-y-[2px] text-white font-black text-[17px] rounded-xl border-2 border-black shadow-[4px_4px_0px_var(--primary)] hover:shadow-[2px_2px_0px_var(--primary)] transition-all"
                >
                  {isJoining ? 'Connecting...' : 'Enter Battle ⚔️'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        {!isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={22} className="fill-current" />,
                title: 'AI Generation',
                desc: 'Upload a PDF or provide a prompt to generate complete quizzes in seconds.',
                color: '#FFD166',
              },
              {
                icon: <Users size={22} />,
                title: 'Live Multiplayer',
                desc: 'Host real-time sessions with dozens of players simultaneously.',
                color: '#A8E6CF',
              },
              {
                icon: <BarChart3 size={22} />,
                title: 'Smart Insights',
                desc: 'Track performance with instant leaderboards and session summaries.',
                color: '#C9B1FF',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex flex-col items-center text-center p-8 bg-white border-2 border-black rounded-xl shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 border-2 border-black shadow-[3px_3px_0px_black]"
                  style={{ background: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-[17px] font-black text-[#1E1E1E] mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-[14px] text-[#6B6B6B] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
