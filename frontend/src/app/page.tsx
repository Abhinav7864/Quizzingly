'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializeSocket, emitJoinGame } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';

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
    <div className="min-h-screen bg-[var(--bg-base)] pb-10">
      {/* Hero Section with Berry Gradient */}
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-12 relative z-10">
      {/* Hero Content */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md mb-8 border border-white/10"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF319F] animate-pulse shadow-[0_0_8px_#FF319F]" />
          <span className="text-[13px] font-bold text-white tracking-wider uppercase">Live multiplayer quizzes</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8"
        >
          Quiz your team,<br />
          <span className="text-[#FF319F]">in real time.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[18px] text-white/80 max-w-lg mx-auto mb-12 font-medium"
        >
          The fastest way to host engaging, AI-powered quiz sessions for your team, class, or community.
        </motion.p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {!isAuthenticated ? (
            <Link href="/register">
              <button className="h-14 px-8 bg-[#FF319F] hover:bg-[#E72B8F] text-white font-black text-[16px] rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-[#FF319F]/30">
                Sign up for free
              </button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <button className="h-14 px-8 bg-[#FF319F] hover:bg-[#E72B8F] text-white font-black text-[16px] rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-[#FF319F]/30">
                Go to Dashboard
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Join Card Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md mx-auto mb-10"
      >
        <div className="bg-[#F3EFDA] border-[#E5E0C9] rounded-[40px] overflow-hidden text-left shadow-2xl">
          <div className="px-8 py-6 border-b border-[#E5E0C9]/50 flex items-center justify-between text-[#3B142A]">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#FF319F] rounded-full" />
              <span className="text-[16px] font-black uppercase tracking-tight">Join a game</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#E5E0C9]" />)}
            </div>
          </div>
          <div className="p-8 space-y-6">
            <form onSubmit={handleJoinGame} className="space-y-6">
              <div className="space-y-3">
                <span className="text-[11px] font-black text-[#8A846B] uppercase tracking-[0.2em] ml-1">Pin Code</span>
                <input
                  type="text"
                  placeholder="000 000"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full h-20 px-4 text-center text-4xl font-mono font-black tracking-[0.4em] uppercase text-[#3B142A] placeholder-[#C5C0A8] bg-[#EDE9D5] border-transparent rounded-2xl focus:border-[#FF319F] focus:ring-4 focus:ring-[#FF319F]/5 outline-none transition-all shadow-inner"
                />
              </div>
              <div className="space-y-3">
                <span className="text-[11px] font-black text-[#8A846B] uppercase tracking-[0.2em] ml-1">Your Name</span>
                <input
                  placeholder="E.g. Captain Quizz"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full h-14 px-5 text-[16px] font-bold text-[#3B142A] placeholder-[#8A846B]/50 bg-[#EDE9D5] border-transparent rounded-2xl focus:border-[#FF319F] focus:ring-4 focus:ring-[#FF319F]/5 outline-none transition-all shadow-inner"
                />
              </div>
              {error && <p className="text-[14px] text-[#EF4444] font-bold text-center">{error}</p>}
              <button
                type="submit"
                className="w-full h-16 bg-[#FF319F] hover:bg-[#E72B8F] text-white font-black text-[18px] rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#FF319F]/30"
              >
                {isJoining ? "Connecting..." : "Enter Battle"}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Features Row */}
      {!isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap size={22} />,
              title: "AI Generation",
              desc: "Upload a PDF or provide a prompt to generate complete quizzes in seconds."
            },
            {
              icon: <Users size={22} />,
              title: "Live Multiplayer",
              desc: "Host real-time sessions with dozens of players simultaneously."
            },
            {
              icon: <BarChart3 size={22} />,
              title: "Smart Insights",
              desc: "Track performance with instant leaderboards and session summaries."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              whileHover={{ y: -5, borderColor: '#FF319F' }}
              className="flex flex-col items-center text-center group p-10 bg-[#F3EFDA] border-transparent rounded-[40px] transition-all shadow-2xl"
            >
              <div className="w-16 h-16 bg-[#FF319F]/10 text-[#FF319F] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#FF319F]/15 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-[18px] font-black text-[#3B142A] mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-[14px] text-[#6B6651] leading-relaxed font-bold">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
