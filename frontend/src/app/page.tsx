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
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b5179e]/8 border border-[#b5179e]/15 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#b5179e] animate-pulse" />
          <span className="text-[12px] font-medium text-[#b5179e] tracking-wide uppercase">Live multiplayer quizzes</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold text-[#f5f3ef] leading-[1.1] tracking-tight mb-6"
        >
          Quiz your team,<br />
          <span className="text-[#b5179e]">in real time.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[16px] text-[#8a8780] max-w-md mx-auto mb-10"
        >
          The fastest way to host engaging, AI-powered quiz sessions for your team, class, or community.
        </motion.p>

        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Join Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mx-auto mt-10"
        >
          <div className="bg-[#161616] border border-[rgba(255,255,255,0.07)] rounded-3xl overflow-hidden text-left shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3 bg-white/[0.02]">
              <div className="w-1.5 h-5 bg-[#b5179e] rounded-full shadow-[0_0_10px_rgba(181,23,158,0.5)]" />
              <span className="text-[14px] font-bold text-[#f5f3ef] tracking-tight">Join a game</span>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleJoinGame} className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#4a4845] uppercase tracking-[0.2em] ml-1">Game Code</span>
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full h-16 px-4 text-center text-3xl font-mono font-black tracking-[0.3em] uppercase text-[#f5f3ef] placeholder-[#222] bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-2xl focus:border-[#b5179e]/50 focus:ring-4 focus:ring-[#b5179e]/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#4a4845] uppercase tracking-[0.2em] ml-1">Your Nickname</span>
                  <input
                    placeholder="Type your name..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-12 px-4 text-[15px] font-medium text-[#f5f3ef] placeholder-[#333] bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-xl focus:border-[#b5179e]/50 focus:ring-4 focus:ring-[#b5179e]/5 outline-none transition-all"
                  />
                </div>
                {error && <p className="text-[12px] text-[#ff4d6d] font-semibold text-center">{error}</p>}
                <button
                  type="submit"
                  className="w-full h-14 bg-[#b5179e] hover:bg-[#cc2baf] text-white font-bold text-[15px] rounded-2xl transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(181,23,158,0.2)] mt-2"
                >
                  {isJoining ? "Joining Session..." : "Join Game"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Features Row */}
        {!isAuthenticated && (
          <div className="max-w-5xl mx-auto px-4 mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Zap size={20} />,
                  title: "AI Generation",
                  desc: "Upload a PDF or provide a prompt to generate complete quizzes in seconds."
                },
                {
                  icon: <Users size={20} />,
                  title: "Live Multiplayer",
                  desc: "Host real-time sessions with dozens of players simultaneously."
                },
                {
                  icon: <BarChart3 size={20} />,
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
                  whileHover={{ y: -5, borderColor: 'rgba(181,23,158,0.3)' }}
                  className="flex flex-col items-center text-center group p-8 bg-[#161616] border border-white/7 rounded-3xl transition-all shadow-lg"
                >
                  <div className="w-14 h-14 bg-[#b5179e]/10 text-[#b5179e] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#b5179e]/20 transition-all shadow-[0_0_15px_rgba(181,23,158,0.1)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-[16px] font-bold text-[#f5f3ef] mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-[13px] text-[#8a8780] leading-relaxed font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
