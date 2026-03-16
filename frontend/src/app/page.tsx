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
    <div className="min-h-[calc(100vh-5rem)]">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Micro-decoration badge */}
            <div className="inline-block bg-white border-2 border-black shadow-[4px_4px_0px_black] px-4 py-1.5 font-bold text-sm transform -rotate-2 rounded-full">
              ✨ Multiplayer AI Quizzes
            </div>

            {/* Editorial Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-[#1E1E1E] leading-[1.1] tracking-tight">
              Best{' '}
              <span className="bg-[#F55CA7] text-white px-3 py-1 rounded-lg border-2 border-black inline-block transform rotate-1 shadow-[4px_4px_0px_black]">
                AI Platform
              </span>
              <br />
              To Convert Docs
              <br />
              To Quizzes.
            </h1>

            <p className="text-xl text-[#6B6B6B] font-medium max-w-lg leading-relaxed">
              Generate engaging real-time quizzes in seconds from your notes or PDFs. Challenge your friends and climb the leaderboard.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 pt-2">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="w-full sm:w-auto text-lg px-8 py-4 bg-[#F55CA7] text-white border-2 border-black shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all font-black rounded-lg">
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/register">
                  <button className="w-full sm:w-auto text-lg px-8 py-4 bg-[#F55CA7] text-white border-2 border-black shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all font-black rounded-lg">
                    Start Creating Free
                  </button>
                </Link>
              )}
              <button
                onClick={() => document.getElementById('join-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-[#1E1E1E] border-2 border-black shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all font-bold rounded-lg"
              >
                Join a Game
              </button>
            </div>
          </motion.div>

          {/* Right Column — Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none"
          >
            <div className="absolute inset-0 bg-[#FFD166] border-4 border-black shadow-[16px_16px_0px_black] rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="text-center p-8 bg-white m-8 border-2 border-black rounded-2xl w-full h-full flex flex-col items-center justify-center gap-4">
                <span className="text-7xl block transform hover:scale-110 transition-transform cursor-pointer">🚀</span>
                <div>
                  <p className="font-black text-2xl text-[#1E1E1E]">Quiz Illustration</p>
                  <p className="font-bold text-[#6B6B6B] mt-1 text-sm">Replace with SVG from Storyset</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['AI', 'Live', 'Fun'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#FFD166] border-2 border-black rounded-full text-sm font-black shadow-[2px_2px_0px_black]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* Floating shapes */}
              <div className="absolute top-6 left-6 w-10 h-10 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_black] animate-bounce" />
              <div className="absolute bottom-10 right-10 w-12 h-12 bg-white border-2 border-black shadow-[4px_4px_0px_black] transform rotate-12" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Join a Game Section ───────────────────────────── */}
      <section id="join-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t-2 border-black">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-[#A8E6CF] border-2 border-black shadow-[4px_4px_0px_black] px-4 py-1.5 font-black text-sm rounded-full mb-4">
              🎮 Jump Right In
            </span>
            <h2 className="text-3xl font-black text-[#1E1E1E] tracking-tight">Join a live game</h2>
          </div>

          <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_black] overflow-hidden">
            {/* Card header */}
            <div className="px-7 py-4 border-b-2 border-black bg-[#FFD166] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-black rounded-full" />
                <span className="text-[15px] font-black text-black uppercase tracking-tight">Enter Game Code</span>
              </div>
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-black/20 border border-black/30" />)}
              </div>
            </div>

            {/* Card body */}
            <div className="p-7">
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
                    className="w-full h-20 px-4 text-center text-4xl font-mono font-black tracking-[0.4em] uppercase text-[#1E1E1E] placeholder-[#A0A0A0] bg-white border-2 border-black rounded-xl outline-none focus:border-[#F55CA7] focus:shadow-[4px_4px_0px_#F55CA7] shadow-[4px_4px_0px_black] transition-all"
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
                      className="w-full h-14 px-5 text-[16px] font-bold text-[#1E1E1E] placeholder-[#A0A0A0] bg-white border-2 border-black rounded-xl outline-none focus:border-[#F55CA7] focus:shadow-[4px_4px_0px_#F55CA7] shadow-[4px_4px_0px_black] transition-all"
                    />
                  </div>
                )}
                {error && <p className="text-[14px] text-[#EF4444] font-bold text-center">{error}</p>}
                <button
                  type="submit"
                  id="join-game-btn"
                  className="w-full h-14 bg-[#1E1E1E] text-white font-black text-[17px] rounded-xl border-2 border-black shadow-[4px_4px_0px_#F55CA7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#F55CA7] transition-all"
                >
                  {isJoining ? 'Connecting...' : 'Enter Battle ⚔️'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      {!isAuthenticated && (
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t-2 border-black">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-[#1E1E1E] tracking-tight">Why Quizzingly?</h2>
            <p className="text-[#6B6B6B] font-medium mt-3 text-lg">Everything you need for an amazing quiz session.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={22} className="fill-current" />, title: 'AI Generation', desc: 'Upload a PDF or provide a prompt to generate complete quizzes in seconds.', color: '#FFD166' },
              { icon: <Users size={22} />, title: 'Live Multiplayer', desc: 'Host real-time sessions with dozens of players simultaneously.', color: '#A8E6CF' },
              { icon: <BarChart3 size={22} />, title: 'Smart Insights', desc: 'Track performance with instant leaderboards and session summaries.', color: '#C9B1FF' },
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
        </section>
      )}

    </div>
  );
}
