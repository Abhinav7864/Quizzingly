
'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz, Question, Option } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useParams, useRouter } from 'next/navigation';
import { QuestionForm } from '@/components/creator/QuestionForm';
import { ArrowLeft, Save } from 'lucide-react';

// Internal component for displaying a question item
const QuestionItem = ({ question, onEdit, onDelete }: { question: Question, onEdit: () => void, onDelete: () => void }) => (
  <div className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
    <p className="flex-grow">{question.text}</p>
    <div className="space-x-2 flex-shrink-0">
      <Button onClick={onEdit} className="bg-gray-600 hover:bg-gray-500">Edit</Button>
      <Button onClick={onDelete} className="bg-red-600 hover:bg-red-500">Delete</Button>
    </div>
  </div>
);


export default function EditQuizPage() {
  const params = useParams();
  const quizId = params.id as string;
  const router = useRouter();

  const { data: initialQuiz, isLoading: isLoadingQuiz, exec: fetchQuiz } = useApi<Quiz>();
  const { exec: updateQuizTitleAPI } = useApi();
  const { exec: deleteQuestionAPI } = useApi();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz(`/quizzes/${quizId}`);
    }
  }, [quizId, fetchQuiz]);

  useEffect(() => {
    if (initialQuiz) {
      setQuiz(initialQuiz);
      setTitle(initialQuiz.title);
    }
  }, [initialQuiz]);

  const handleTitleBlur = () => {
    if (quiz && title !== quiz.title) {
      updateQuizTitleAPI(`/quizzes/${quizId}`, {
        method: 'PUT',
        body: { title }
      });
    }
  };

  const handleQuestionSaved = (savedQuestion: Question) => {
    if (!quiz) return;
    
    const isEditing = quiz.questions?.some(q => q.id === savedQuestion.id);
    
    let updatedQuestions: Question[];
    if (isEditing) {
      updatedQuestions = quiz.questions!.map(q => q.id === savedQuestion.id ? savedQuestion : q);
    } else {
      updatedQuestions = [...(quiz.questions || []), savedQuestion];
    }
    
    setQuiz({ ...quiz, questions: updatedQuestions });
    setEditingQuestion(null);
  };
  
  const handleDeleteQuestion = async (questionId: string) => {
    if (!quiz) return;

    await deleteQuestionAPI(`/questions/${questionId}`, { method: 'DELETE' });
    
    setQuiz({
      ...quiz,
      questions: quiz.questions?.filter(q => q.id !== questionId)
    });
  };

  if (isLoadingQuiz) return <p className="text-center mt-10">Loading quiz...</p>;
  if (!quiz) return <p className="text-center mt-10">Quiz not found.</p>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-3xl font-bold">Editing Quiz</h1>
          </div>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="gap-2"
          >
            <Save size={18} /> Save to Hub
          </Button>
        </div>
        <Input
          id="quiz-title"
          label="Quiz Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-2xl"
        />
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Questions ({quiz.questions?.length || 0})</h2>

      <div className="space-y-4 mb-8">
        {quiz.questions?.map(question => (
          <React.Fragment key={question.id}>
            <QuestionItem 
              question={question}
              onEdit={() => setEditingQuestion(question)}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
            {editingQuestion?.id === question.id && (
              <div className="bg-gray-800 p-6 rounded-lg border-2 border-indigo-500">
                <QuestionForm 
                  quizId={quizId}
                  questionToEdit={editingQuestion}
                  onQuestionSaved={handleQuestionSaved}
                  onCancelEdit={() => setEditingQuestion(null)}
                />
              </div>
            )}
          </React.Fragment>
        ))}
        {quiz.questions?.length === 0 && <p className="text-gray-400">No questions yet. Add one below!</p>}
      </div>

      {!editingQuestion && (
        <div>
          <h2 className="text-2xl font-bold mb-4 border-t border-gray-700 pt-6">
            Add New Question
          </h2>
          <div className="bg-gray-800 p-6 rounded-lg">
            <QuestionForm 
              quizId={quizId}
              questionToEdit={null}
              onQuestionSaved={handleQuestionSaved}
              onCancelEdit={() => setEditingQuestion(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
