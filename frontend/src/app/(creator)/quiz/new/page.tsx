
'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function NewQuizPage() {
  const [title, setTitle] = useState('');
  const { isLoading, exec: createQuiz } = useApi<Quiz>();
  const router = useRouter();
  const [savedQuiz, setSavedQuiz] = useState<Quiz | null>(null);

  const handleCreateAndEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newQuiz = await createQuiz('/quizzes', {
      method: 'POST',
      body: { title },
    });

    if (newQuiz) {
      router.push(`/quiz/${newQuiz.id}`);
    }
  };

  const handleSaveOnly = async () => {
    if (!title) return;

    const newQuiz = await createQuiz('/quizzes', {
      method: 'POST',
      body: { title },
    });

    if (newQuiz) {
      setSavedQuiz(newQuiz);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      <form onSubmit={handleCreateAndEdit} className="bg-gray-800 p-6 rounded-lg space-y-4">
        <Input
          id="title"
          label="Quiz Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., '80s Rock Anthems'"
          required
        />
        {savedQuiz && (
          <div className="bg-green-800 border border-green-600 text-green-200 p-4 rounded-lg">
            <p className="font-semibold">Quiz Saved!</p>
            <p className="text-sm">Your quiz "{savedQuiz.title}" has been created successfully.</p>
          </div>
        )}
        <div className="flex justify-between space-x-4">
          <Button 
            type="button" 
            onClick={handleSaveOnly}
            disabled={isLoading || !title}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {isLoading ? 'Saving...' : 'Save Only'}
          </Button>
          <Button type="submit" disabled={isLoading || !title}>
            {isLoading ? 'Creating...' : 'Create and Add Questions'}
          </Button>
        </div>
      </form>
      {savedQuiz && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quiz Options</h2>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push(`/quiz/${savedQuiz.id}`)}
              className="w-full"
            >
              Edit Questions
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
