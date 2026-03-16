'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializeSocket, emitJoinGame } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Users } from 'lucide-react';

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
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-12">

        {/* ── Split Hero ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

          {/* Left: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block bg-white border-2 border-black shadow-[4px_4px_0px_black] px-4 py-1.5 font-black text-sm -rotate-2 rounded-full"
            >
              ✨ Multiplayer AI Quizzes
            </motion.div>

            {/* Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-[#1E1E1E] leading-[1.1] tracking-tight"
            >
              Best{' '}
              <span className="bg-[#F55CA7] text-white px-3 py-1 rounded-xl border-2 border-black inline-block rotate-1 shadow-[4px_4px_0px_black]">
                AI Platform
              </span>
              <br />
              To Convert Docs<br />
              To Quizzes.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[18px] text-[#6B6B6B] max-w-md font-medium leading-relaxed"
            >
              Generate engaging real-time quizzes in seconds from your notes or PDFs. Challenge your team and climb the leaderboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {!isAuthenticated ? (
                <Link href="/register">
                  <button className="w-full sm:w-auto text-[16px] px-8 py-4 bg-[#F55CA7] text-white font-black rounded-xl border-2 border-black shadow-[5px_5px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_black] transition-all">
                    Start Creating Free
                  </button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <button className="w-full sm:w-auto text-[16px] px-8 py-4 bg-[#F55CA7] text-white font-black rounded-xl border-2 border-black shadow-[5px_5px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_black] transition-all">
                    Go to Dashboard
                  </button>
                </Link>
              )}
              <Link href="#join">
                <button className="w-full sm:w-auto text-[16px] px-8 py-4 bg-white text-[#1E1E1E] font-black rounded-xl border-2 border-black shadow-[5px_5px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[2px_2px_0px_black] transition-all">
                  Join a Game
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right: Neo-Brutalist Illustration Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="relative w-full aspect-square max-w-sm mx-auto lg:max-w-none"
          >
            <div className="absolute inset-0 bg-[#FFD166] border-4 border-black shadow-[16px_16px_0px_black] rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Inner card */}
              <div className="bg-white m-8 border-2 border-black rounded-xl w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                <span className="text-7xl block">🧠</span>
                <p className="font-black text-2xl text-[#1E1E1E] text-center">Quiz your team,<br />in real time.</p>
                <div className="flex gap-2">
                  {['#F55CA7','#FFD166','#2EC4B6'].map((c) => (
                    <div key={c} className="w-4 h-4 rounded-sm border-2 border-black" style={{ background: c }} />
                  ))}
                </div>
              </div>
              {/* Floating shapes */}
              <div className="absolute top-4 left-4 w-10 h-10 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] animate-bounce" />
              <div className="absolute bottom-8 right-8 w-12 h-12 bg-white border-2 border-black shadow-[4px_4px_0px_black] rotate-12" />
              <div className="absolute top-8 right-6 w-6 h-6 bg-[#F55CA7] border-2 border-black rotate-45" />
            </div>
          </motion.div>
        </div>

        {/* ── Join Game Card ─────────────────────────────── */}
        <motion.div
          id="join"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-md mx-auto mb-16"
        >
          <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_black]">
            {/* Card Header */}
            <div className="px-8 py-4 border-b-2 border-black flex items-center justify-between bg-[#F55CA7]">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-white rounded-full" />
                <span className="text-[16px] font-black uppercase tracking-tight text-white">Join a Game</span>
              </div>
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/60 border border-white/40" />)}
              </div>
            </div>

            <div className="p-8 space-y-5">
              <form onSubmit={handleJoinGame} className="space-y-5">
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] ml-1">Pin Code</span>
                  <input
                    type="text"
                    placeholder="000 000"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full h-20 px-4 text-center text-4xl font-mono font-black tracking-[0.4em] uppercase text-[#1E1E1E] placeholder-[#A0A0A0] bg-white border-2 border-black rounded-xl focus:outline-none shadow-[4px_4px_0px_black] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] ml-1">Your Name</span>
                  <input
                    placeholder="E.g. Captain Quizz"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-14 px-5 text-[16px] font-bold text-[#1E1E1E] placeholder-[#A0A0A0] bg-white border-2 border-black rounded-xl focus:outline-none shadow-[4px_4px_0px_black] transition-all"
                  />
                </div>

                {error && <p className="text-[14px] text-[#EF4444] font-black text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full h-14 bg-[#1E1E1E] hover:translate-x-[3px] hover:translate-y-[3px] text-white font-black text-[17px] rounded-xl border-2 border-black shadow-[5px_5px_0px_#F55CA7] hover:shadow-[2px_2px_0px_#F55CA7] transition-all disabled:opacity-40"
                >
                  {isJoining ? 'Connecting…' : 'Enter Battle ⚡'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* ── Feature Cards ──────────────────────────────── */}
        {!isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={22} />, color: '#FFD166', title: 'AI Generation', desc: 'Upload a PDF or provide a prompt to generate complete quizzes in seconds.' },
              { icon: <Users size={22} />, color: '#2EC4B6', title: 'Live Multiplayer', desc: 'Host real-time sessions with dozens of players simultaneously.' },
              { icon: <BarChart3 size={22} />, color: '#F55CA7', title: 'Smart Insights', desc: 'Track performance with instant leaderboards and session summaries.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="flex flex-col items-center text-center group p-8 bg-white border-2 border-black rounded-xl shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all"
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 border-2 border-black group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: feature.color }}
                >
                  <span className="text-black">{feature.icon}</span>
                </div>
                <h3 className="text-[18px] font-black text-[#1E1E1E] mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-[14px] text-[#6B6B6B] leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
