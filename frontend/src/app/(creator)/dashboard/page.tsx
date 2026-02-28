
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
import { Plus, Play, Edit3, Trash2, HelpCircle, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { data: quizzes, isLoading, exec: fetchQuizzes } = useApi<Quiz[]>();
  const router = useRouter();
  const setGameCode = useGameStore(state => state.setGameCode);
  const [hostingId, setHostingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes('/quizzes');
  }, [fetchQuizzes]);

  const handleHostQuiz = (quizId: string) => {
    setHostingId(quizId);
    console.log(`Attempting to host quiz: ${quizId}`);
    
    const gameStoreActions = useGameStore.getState();

    initializeSocket({
      onGameCreated: (gameCode) => {
        console.log('Game created on server with code:', gameCode);
        setGameCode(gameCode);
        gameStoreActions.setIsHost(true);
        router.push(`/host/${gameCode}`);
      },
      onPlayerListUpdate: (players) => gameStoreActions.setPlayers(players),
      onNewQuestion: (question) => gameStoreActions.setCurrentQuestion(question),
      onLeaderboardUpdate: (leaderboard) => gameStoreActions.setLeaderboard(leaderboard),
      onAnswerResult: () => {},
      onTimesUp: () => {},
      onGameOver: () => {},
      onError: (message) => {
        setHostingId(null);
        alert(`Socket Error: ${message}`);
      },
    });

    emitCreateGame(quizId);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            Creator Hub
          </h1>
          <p className="text-gray-400 mt-1">Manage your library and start live games</p>
        </div>
        <Link href="/quiz/new">
          <Button size="lg" className="shadow-lg shadow-indigo-500/20 gap-2">
            <Plus size={20} /> Create New Quiz
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-gray-800/30 animate-pulse rounded-2xl border border-gray-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {quizzes && quizzes.map((quiz, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={quiz.id} 
              className="group bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-500/30 transition-all hover:bg-gray-800/40"
            >
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{quiz.title}</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
                    <HelpCircle size={14} className="text-indigo-400" />
                    {quiz._count?.questions ?? 0} Questions
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={14} />
                    Added {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => handleHostQuiz(quiz.id)}
                  isLoading={hostingId === quiz.id}
                  disabled={hostingId !== null && hostingId !== quiz.id}
                  className="flex-1 md:flex-none gap-2 px-6"
                >
                  {!hostingId && <Play size={18} fill="currentColor" />}
                  Host Live
                </Button>
                <Link href={`/quiz/${quiz.id}`} className="flex-1 md:flex-none">
                  <Button variant="secondary" className="w-full gap-2">
                    <Edit3 size={18} /> Edit
                  </Button>
                </Link>
                <div className="relative group/tooltip">
                  <Button variant="ghost" className="text-gray-600 hover:text-red-400/50 cursor-not-allowed opacity-40 p-2" disabled>
                    <Trash2 size={20} />
                  </Button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 text-[10px] text-white rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800">
                    Coming Soon
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {quizzes?.length === 0 && (
            <div className="text-center py-24 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus size={40} className="text-gray-600" />
              </div>
              <h2 className="text-3xl font-bold text-white">Your library is empty</h2>
              <p className="text-gray-400 mt-3 mb-8 max-w-sm mx-auto">
                Create your first quiz to start hosting live multiplayer sessions and challenging your audience.
              </p>
              <Link href="/quiz/new">
                <Button size="lg" variant="outline" className="px-8 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10">
                  Create My First Quiz
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
