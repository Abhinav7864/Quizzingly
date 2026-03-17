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
    <div className="min-h-screen pt-28 pb-16">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-black text-[#1E1E1E]">My Quizzes</h1>
            <span className="text-[13px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              {quizzes?.length || 0} Total
            </span>
          </div>
          <Link href="/quiz/new">
            <Button size="md" id="new-quiz-btn" className="gap-2">
              <Plus size={16} strokeWidth={2.5} /> New quiz
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-[2px] bg-black mb-8 shadow-[0_2px_0px_rgba(0,0,0,0.08)]" />

        {/* Quiz List / Empty State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[66px] bg-white border-2 border-black/20 rounded-xl animate-pulse shadow-[4px_4px_0px_rgba(0,0,0,0.08)]" />
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
                className="group flex items-center justify-between h-[66px] px-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_black] transition-all"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F6F6F6] border-2 border-black text-[#1E1E1E] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:border-[var(--primary)] transition-colors shadow-[2px_2px_0px_black] group-hover:shadow-[2px_2px_0px_black]">
                    <span className="text-[12px] font-black">{idx + 1}</span>
                  </div>
                  <h3 className="text-[15px] font-black text-[#1E1E1E] truncate tracking-tight">{quiz.title}</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[var(--primary)]/10 border-2 border-[var(--primary)] rounded-full shrink-0">
                    <div className="w-1 h-1 rounded-full bg-[var(--primary)]" />
                    <span className="text-[11px] font-black text-[var(--primary)] uppercase tracking-wider">
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
            <Link href="/quiz/new">
              <div className="w-20 h-20 bg-white border-2 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all cursor-pointer">
                <Plus size={36} className="text-[var(--primary)]" />
              </div>
            </Link>
            <h2 className="text-[20px] font-black text-[#1E1E1E] mb-3">Create your first quiz</h2>
            <p className="text-[14px] text-[#6B6B6B] font-medium max-w-xs mb-8">
              Start building your collection of quizzes and host live sessions for your audience.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
