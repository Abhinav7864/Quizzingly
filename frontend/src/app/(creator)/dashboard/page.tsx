'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { Quiz, PlayerGameResult } from '@/types';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { emitCreateGame, initializeSocket } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';
import { motion } from 'framer-motion';
import { Plus, Play, Edit3, History, Award, X, Trophy, Target } from 'lucide-react';
import { SessionPlayer } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: quizzes, isLoading: isLoadingQuizzes, exec: fetchQuizzes } = useApi<Quiz[]>();
  const { data: history, isLoading: isLoadingHistory, exec: fetchHistory } = useApi<PlayerGameResult[]>();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'history'>('quizzes');
  const [sessionModal, setSessionModal] = useState<{ title: string; sessionId: string } | null>(null);
  const { data: sessionPlayers, isLoading: isLoadingSession, exec: fetchSession } = useApi<SessionPlayer[]>();
  const router = useRouter();
  const setGameCode = useGameStore((s) => s.setGameCode);
  const [hostingId, setHostingId] = useState<string | null>(null);
  useEffect(() => { 
    fetchQuizzes('/quizzes'); 
    fetchHistory('/player/history');
  }, [fetchQuizzes, fetchHistory]);

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
    emitCreateGame(quizId, user?.id);
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-black text-[#1E1E1E] flex flex-col">
              Dashboard
            </h1>
            <div className="flex bg-[#F6F6F6] p-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_black]">
              <button 
                onClick={() => setActiveTab('quizzes')}
                className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'quizzes' ? 'bg-[#FFD166] text-black border-2 border-black shadow-[2px_2px_0px_black]' : 'text-[#6B6B6B] border-2 border-transparent hover:text-black'}`}
              >
                My Quizzes
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'history' ? 'bg-[#A8E6CF] text-black border-2 border-black shadow-[2px_2px_0px_black]' : 'text-[#6B6B6B] border-2 border-transparent hover:text-black'}`}
              >
                History
              </button>
            </div>
          </div>
          <Link href="/quiz/new">
            <Button size="md" id="new-quiz-btn" className="gap-2 shadow-sm">
              <Plus size={16} strokeWidth={2.5} /> New quiz
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-[2px] bg-black mb-10 shadow-[0_2px_0px_rgba(0,0,0,0.08)]" />

        {/* Dynamic Content */}
        {activeTab === 'quizzes' ? (
        <>
        {isLoadingQuizzes ? (
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
        </>
        ) : (
        /* History View */
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[76px] bg-white border-2 border-black/20 rounded-xl animate-pulse shadow-[4px_4px_0px_rgba(0,0,0,0.08)]" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((record, idx) => {
                const isHosted = record.rank === 0;
                const hasSession = !!record.sessionId;
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      if (!hasSession) return;
                      setSessionModal({ title: record.quizTitle, sessionId: record.sessionId! });
                      fetchSession(`/player/session/${record.sessionId}`);
                    }}
                    className={`flex flex-col p-5 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] transition-all ${hasSession ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[6px_6px_0px_black]' : 'opacity-80'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0 pr-4">
                        <h3 className="text-[16px] font-black text-[#1E1E1E] truncate mb-1">{record.quizTitle}</h3>
                        <p className="text-[12px] font-bold text-[#6B6B6B]">
                          {new Date(record.playedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`shrink-0 px-3 py-1 border-2 border-black rounded-md text-[11px] font-black uppercase tracking-widest ${isHosted ? 'bg-[#C9B1FF] text-black shadow-[2px_2px_0px_black]' : 'bg-[#FFD166] text-black shadow-[2px_2px_0px_black]'}`}>
                        {isHosted ? 'Hosted' : 'Played'}
                      </div>
                    </div>
                    
                    {!isHosted && (
                      <div className="flex gap-4 pt-3 border-t-2 border-black/10 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Award size={14} className="text-[#F55CA7]" />
                          <span className="text-[13px] font-bold text-[#1E1E1E]">Rank #{record.rank}<span className="text-[#6B6B6B]">/{record.totalPlayers}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E1E1E]"></span>
                          <span className="text-[13px] font-bold text-[#1E1E1E]">{record.score} Pts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E1E1E]"></span>
                          <span className="text-[13px] font-bold text-[#1E1E1E]">{Math.round(record.accuracy * 100)}%</span>
                        </div>
                      </div>
                    )}
                    {isHosted && (
                      <div className="flex items-center justify-between pt-3 border-t-2 border-black/10 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <History size={14} className="text-[#22C55E]" />
                          <span className="text-[13px] font-bold text-[#1E1E1E]">{record.totalPlayers} Players</span>
                        </div>
                        {hasSession && <span className="text-[11px] font-bold text-[#6B6B6B] uppercase tracking-wide">Click to see results →</span>}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-[#F6F6F6] border-2 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[6px_6px_0px_black]">
                <History size={32} className="text-[#6B6B6B]" />
              </div>
              <h2 className="text-[20px] font-black text-[#1E1E1E] mb-3">No history yet</h2>
              <p className="text-[14px] text-[#6B6B6B] font-medium max-w-sm">
                Games you play or host will show up here.
              </p>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Session Leaderboard Modal */}
      {sessionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSessionModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black rounded-2xl shadow-[10px_10px_0px_black] w-full max-w-md overflow-hidden"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#FFD166]">
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-[#1E1E1E]" />
                <div>
                  <p className="text-[11px] font-black text-[#1E1E1E]/60 uppercase tracking-wider">Session Results</p>
                  <h3 className="text-[15px] font-black text-[#1E1E1E] truncate max-w-[240px]">{sessionModal.title.replace(' (Hosted)', '')}</h3>
                </div>
              </div>
              <button
                onClick={() => setSessionModal(null)}
                className="p-1.5 rounded-lg border-2 border-black bg-white/50 hover:bg-white transition-colors shadow-[2px_2px_0px_black]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {isLoadingSession ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-[#F6F6F6] border-2 border-black/20 rounded-xl animate-pulse" />)}
                </div>
              ) : sessionPlayers && sessionPlayers.length > 0 ? (
                sessionPlayers.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-xl border-2 border-black ${i === 0 ? 'bg-[#F55CA7] text-white shadow-[4px_4px_0px_black]' : 'bg-white shadow-[3px_3px_0px_black]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-[14px] font-mono font-black w-6 ${i === 0 ? 'text-white/70' : 'text-[#6B6B6B]'}`}>#{p.rank}</span>
                      <span className={`text-[15px] font-bold ${i === 0 ? 'text-white' : 'text-[#1E1E1E]'}`}>{p.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Target size={12} className={i === 0 ? 'text-white/70' : 'text-[#6B6B6B]'} />
                        <span className={`text-[12px] font-bold ${i === 0 ? 'text-white/80' : 'text-[#6B6B6B]'}`}>{p.accuracy}%</span>
                      </div>
                      <span className={`text-[16px] font-mono font-black ${i === 0 ? 'text-white' : 'text-[var(--primary)]'}`}>{p.score}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-[14px] font-bold text-[#6B6B6B]">No logged-in players in this session.</p>
                  <p className="text-[12px] text-[#A0A0A0] mt-1">Only authenticated players appear in session results.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
