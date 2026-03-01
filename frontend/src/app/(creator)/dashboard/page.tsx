'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { emitCreateGame, initializeSocket } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Plus, Play, Edit3, Trash2, HelpCircle, Zap } from 'lucide-react';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gray-800">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <Zap size={28} className="text-indigo-500" />
            Creator Hub
          </h1>
          <p className="text-gray-500">Manage your quiz library and host live sessions</p>
        </div>
        <Link href="/quiz/new">
          <Button size="lg" className="gap-2">
            <Plus size={20} /> Create Quiz
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-900/50 animate-pulse rounded-xl border border-gray-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={quiz.id}
              >
                <Card hoverable className="group">
                  <CardBody className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div className="flex-1 space-y-2 w-full">
                      <h2 className="text-lg font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors line-clamp-2">{quiz.title}</h2>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-xl">
                          <HelpCircle size={14} className="text-indigo-400" />
                          <span>{quiz._count?.questions ?? 0} Questions</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                      <Button 
                        onClick={() => handleHostQuiz(quiz.id)}
                        isLoading={hostingId === quiz.id}
                        disabled={hostingId !== null && hostingId !== quiz.id}
                        size="md"
                        className="flex-1 md:flex-none gap-2"
                      >
                        <Play size={16} fill="currentColor" />
                        Host
                      </Button>
                      <Link href={`/quiz/${quiz.id}`} className="flex-1 md:flex-none">
                        <Button variant="secondary" size="md" fullWidth className="gap-2">
                          <Edit3 size={16} />
                          Edit
                        </Button>
                      </Link>
                      <div className="relative group/tooltip">
                        <Button variant="ghost" size="md" className="text-gray-600 cursor-not-allowed opacity-40" disabled>
                          <Trash2 size={16} />
                        </Button>
                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-950 text-xs text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 z-10">
                          Coming Soon
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))
          ) : null}
          
          {quizzes?.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-800"
            >
              <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
                <Plus size={28} className="text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">No quizzes yet</h2>
              <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
                Create your first quiz to start hosting live multiplayer sessions.
              </p>
              <Link href="/quiz/new">
                <Button variant="outline">
                  Create Your First Quiz
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
