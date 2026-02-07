
'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { emitCreateGame, initializeSocket } from '@/lib/socket';
import { useGameStore } from '@/context/GameContext';

export default function DashboardPage() {
  const { data: quizzes, isLoading, exec: fetchQuizzes } = useApi<Quiz[]>();
  const router = useRouter();
  const setGameCode = useGameStore(state => state.setGameCode);

  useEffect(() => {
    fetchQuizzes('/quizzes');
  }, [fetchQuizzes]);

  const handleHostQuiz = (quizId: string) => {
    console.log(`Attempting to host quiz: ${quizId}`);
    
    const gameStoreActions = useGameStore.getState();

    const socket = initializeSocket({
      onGameCreated: (gameCode) => {
        console.log('Game created on server with code:', gameCode);
        setGameCode(gameCode);
        gameStoreActions.setIsHost(true);
        router.push(`/host/${gameCode}`);
      },
      onPlayerListUpdate: (players) => gameStoreActions.setPlayers(players),
      onNewQuestion: (question) => gameStoreActions.setCurrentQuestion(question),
      onLeaderboardUpdate: (leaderboard) => gameStoreActions.setLeaderboard(leaderboard),
      // ... other handlers
      onAnswerResult: () => {},
      onTimesUp: () => {},
      onGameOver: () => {},
      onError: (message) => alert(`Socket Error: ${message}`),
    });

    emitCreateGame(quizId);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <Link href="/quiz/new">
          <Button>Create New Quiz</Button>
        </Link>
      </div>
      {isLoading && <p>Loading quizzes...</p>}
      <div className="space-y-4">
        {quizzes && quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{quiz.title}</h2>
              <p className="text-sm text-gray-400">{quiz._count?.questions ?? 0} questions</p>
            </div>
            <div className="space-x-2">
              <Button onClick={() => handleHostQuiz(quiz.id)}>Host</Button>
              <Link href={`/quiz/${quiz.id}`}>
                <Button className="bg-gray-600 hover:bg-gray-700">Edit</Button>
              </Link>
              <Button className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
          </div>
        ))}
        {!isLoading && quizzes?.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <h2 className="text-xl">No quizzes found.</h2>
            <p className="text-gray-400 mt-2">Get started by creating a new one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
