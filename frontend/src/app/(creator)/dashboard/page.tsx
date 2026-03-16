'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { emitCreateGame, initializeSocket } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Plus, Play, Edit3 } from 'lucide-react';

export default function DashboardPage() {
  const { data: quizzes, isLoading, exec: fetchQuizzes } = useApi<Quiz[]>();
  const router = useRouter();
  const setGameCode = useGameStore((s) => s.setGameCode);
  const [hostingId, setHostingId] = useState<string | null>(null);

  useEffect(() => { fetchQuizzes('/quizzes'); }, [fetchQuizzes]);

  const handleHostQuiz = (quizId: string) => {
    setHostingId(quizId);
    const gameStoreActions = useGameStore.getState();
    initializeSocket({
      onGameCreated: (gameCode) => {
        setGameCode(gameCode);
        gameStoreActions.setIsHost(true);
        router.push(`/host/${gameCode}`);
      },
      onPlayerListUpdate: (players) => gameStoreActions.setPlayers(players),
      onNewQuestion: (q) => gameStoreActions.setCurrentQuestion(q),
      onLeaderboardUpdate: (l) => gameStoreActions.setLeaderboard(l),
      onAnswerResult: () => {},
      onTimesUp: () => {},
      onGameOver: () => {},
      onError: (msg) => { setHostingId(null); alert(msg); },
    });
    emitCreateGame(quizId);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-[#f5f3ef]">My Quizzes</h1>
            <span className="text-[13px] text-[#4a4845] font-medium uppercase tracking-wider">
              {quizzes?.length || 0} Total
            </span>
          </div>
          <Link href="/quiz/new">
            <Button size="md" className="gap-2">
              <Plus size={16} strokeWidth={2.5} /> New quiz
            </Button>
          </Link>
        </div>

        {/* Thin Divider */}
        <div className="h-px bg-white/6 mb-8" />

        {/* Quiz List / Empty State */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[56px] bg-[#161616] border border-white/7 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : quizzes && quizzes.length > 0 ? (
          <div className="space-y-3">
            {quizzes.map((quiz, idx) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center justify-between h-[64px] px-6 bg-[#161616] border border-white/7 rounded-2xl hover:border-[#b5179e]/30 hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#b5179e]/10 group-hover:text-[#b5179e] transition-colors">
                    <span className="text-[12px] font-black">{idx + 1}</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#f5f3ef] truncate tracking-tight">{quiz.title}</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#b5179e]/8 border border-[#b5179e]/15 rounded-full shrink-0">
                    <div className="w-1 h-1 rounded-full bg-[#b5179e] shadow-[0_0_5px_rgba(181,23,158,0.8)]" />
                    <span className="text-[11px] font-bold text-[#b5179e] uppercase tracking-wider">
                      {quiz._count?.questions ?? 0} Qs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                  <Link href={`/quiz/${quiz.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-8">
                      <Edit3 size={14} /> Edit
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 h-8 font-bold"
                    isLoading={hostingId === quiz.id}
                    onClick={() => handleHostQuiz(quiz.id)}
                  >
                    <Play size={10} fill="currentColor" /> Host
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 bg-[#ff6b2b]/8 border border-[#ff6b2b]/15 rounded-2xl flex items-center justify-center mb-6">
              <Plus size={32} className="text-[#ff6b2b]" />
            </div>
            <h2 className="text-[18px] font-bold text-[#f5f3ef] mb-2">Create your first quiz</h2>
            <p className="text-[14px] text-[#8a8780] max-w-xs mb-8">
              Start building your collection of quizzes and host live sessions for your audience.
            </p>
            <Link href="/quiz/new">
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
