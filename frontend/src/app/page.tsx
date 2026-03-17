'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { initializeSocket, emitJoinGame } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Users, FileText, Youtube, Image as ImageIcon } from 'lucide-react';

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
    if (!gameCode || !nickname.trim()) {
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
    payload.name = nickname;
    if (isAuthenticated && user) {
      payload.userId = user.id;
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
            <h1 className="text-5xl md:text-8xl font-black text-[#1E1E1E] leading-[1] tracking-tighter">
              Convert{' '}
              <span className="bg-[#A8E6CF] px-3 py-1 rounded-lg border-2 border-black inline-block transform -rotate-1 shadow-[4px_4px_0px_black]">
                PDFs,
              </span>
              <br />
              <span className="bg-[#FFD166] px-3 py-1 rounded-lg border-2 border-black inline-block transform rotate-1 shadow-[4px_4px_0px_black] my-2">
                YouTube
              </span>
              {' '}&{' '}
              <span className="bg-[#FFD1DD] px-3 py-1 rounded-lg border-2 border-black inline-block transform -rotate-1 shadow-[4px_4px_0px_black]">
                Images
              </span>
              <br />
              Into Quizzes.
            </h1>

            <p className="text-xl md:text-2xl text-[#6B6B6B] font-bold max-w-2xl leading-tight">
              The ultimate AI workspace to turn your notes, videos, and snaps into multiplayer quiz battles in seconds. 
              <span className="text-[#1E1E1E] block mt-2">Zero effort. Max engagement. 🚀</span>
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

          {/* Right Column — Neo-Brutalist UI Stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none flex items-center justify-center"
          >
            {/* Base Decorative Background */}
            <div className="absolute inset-4 bg-[#C9B1FF] border-4 border-black shadow-[16px_16px_0px_black] rounded-3xl" />

            {/* Layer 1: The "Input" (YouTube/PDF) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-0 w-3/4 bg-white border-2 border-black p-4 rounded-xl shadow-[8px_8px_0px_black] z-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FFD166] border-2 border-black rounded-lg">
                  <Youtube size={20} />
                </div>
                <div className="h-2 w-24 bg-black/10 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-black/5 rounded-full" />
                <div className="h-1.5 w-2/3 bg-black/5 rounded-full" />
              </div>
            </motion.div>

            {/* Layer 2: The "AI Engine" (Center) */}
            <motion.div 
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F55CA7] border-4 border-black rounded-full shadow-[0px_0px_40px_rgba(245,92,167,0.4)] z-20 flex items-center justify-center"
            >
              <div className="text-center text-white">
                <Zap size={48} fill="white" className="mx-auto mb-2" />
                <span className="font-black text-xs uppercase tracking-widest">Processing...</span>
              </div>
            </motion.div>

            {/* Layer 3: The "Quiz Card" (Result) */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-0 w-3/4 bg-white border-2 border-black p-5 rounded-xl shadow-[8px_8px_0px_black] z-30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-tighter bg-[#A8E6CF] px-2 py-1 border border-black rounded shadow-[2px_2px_0px_black]">Question 1/10</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/20" />)}
                </div>
              </div>
              <p className="font-bold text-sm text-[#1E1E1E] leading-tight mb-4">What is the primary function of Vision AI in Quizzingly?</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-[#FFD1DD] border-2 border-black rounded-lg" />
                <div className="h-8 border-2 border-black rounded-lg" />
              </div>
            </motion.div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-0 right-10 w-8 h-8 bg-[#FFD166] border-2 border-black rotate-12 shadow-[4px_4px_0px_black]" />
            <div className="absolute bottom-20 left-10 w-6 h-6 bg-white border-2 border-black rounded-full shadow-[3px_3px_0px_black]" />
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

      {/* ── AI Powerhouse Features ───────────────────────── */}
      <section id="ai-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t-2 border-black bg-white/50 relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F55CA7]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9B1FF]/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-16 px-4">
          <div className="inline-block bg-[#F55CA7] border-2 border-black shadow-[4px_4px_0px_black] px-5 py-2 font-black text-sm text-white rounded-full mb-6 transform hover:scale-105 transition-transform cursor-default">
            🧠 NEXT-GEN AI CAPABILITIES
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#1E1E1E] tracking-tight leading-tight">
            Turn Any Content Into <br />
            <span className="text-[#F55CA7]">Dynamic Quizzes</span>
          </h2>
          <p className="text-[#6B6B6B] font-bold mt-6 text-xl max-w-2xl mx-auto italic">
            "Your content is the syllabus; our AI is the examiner."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <FileText size={24} />, 
              title: 'PDF to Quiz', 
              desc: 'Upload textbooks, research papers, or meeting notes. Our AI digests long-form text and extracts core concepts.',
              color: '#A8E6CF',
              tag: 'QUICK'
            },
            { 
              icon: <Youtube size={24} />, 
              title: 'YouTube Sessions', 
              desc: 'Paste a video URL. We fetch the transcript and generate questions based on exactly what was said.',
              color: '#FFD166',
              tag: 'NEW'
            },
            { 
              icon: <ImageIcon size={24} />, 
              title: 'Vision Intelligence', 
              desc: 'Snapshot a whiteboard, a chart, or a printed page. Our Vision AI "sees" the data and turns it into challenges.',
              color: '#FFD1DD',
              tag: 'SMART'
            },
            { 
              icon: <Zap size={24} />, 
              title: 'Custom Prompting', 
              desc: 'Describe your topic and difficulty. Generate up to 50 questions with precision-tuned time limits.',
              color: '#C9B1FF',
              tag: 'FRESH'
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.5, ease: "easeOut" }}
              className="group relative bg-white border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_black] hover:-translate-y-2 hover:shadow-[12px_12px_0px_black] transition-all"
            >
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-white border-2 border-black rounded-lg text-[10px] font-black tracking-widest uppercase shadow-[2px_2px_0px_black] z-10">
                {feature.tag}
              </div>
              
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border-2 border-black shadow-[4px_4px_0px_black] transform group-hover:rotate-6 transition-transform"
                style={{ background: feature.color }}
              >
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-black text-[#1E1E1E] mb-4 tracking-tight group-hover:text-[#F55CA7] transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-[15px] text-[#6B6B6B] font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Social Proof / Stats ─────────────────────────── */}
      <section className="bg-[#1E1E1E] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white">
            {[
              { label: 'AI Quizzes Generated', val: '10k+' },
              { label: 'Active Players', val: '50k+' },
              { label: 'Success Rate', val: '99.9%' },
              { label: 'Average Time', val: '15s' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-5xl font-black text-[#FFD166]">{stat.val}</div>
                <div className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
