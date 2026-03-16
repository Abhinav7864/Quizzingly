
'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz, Question, Option } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useParams, useRouter } from 'next/navigation';
import { QuestionForm } from '@/components/creator/QuestionForm';
import { ArrowLeft, Save } from 'lucide-react';

// Internal component for displaying a question item
const QuestionItem = ({ question, onEdit, onDelete }: { question: Question, onEdit: () => void, onDelete: () => void }) => (
  <div className="bg-[#161616] p-5 rounded-2xl border border-white/7 flex justify-between items-center group hover:border-[#b5179e]/30 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-[#8a8780] font-mono font-bold text-sm">
        Q
      </div>
      <p className="font-semibold text-[#f5f3ef]">{question.text}</p>
    </div>
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
      <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>
      <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
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

  const { exec: deleteQuizAPI } = useApi();

  const handleDeleteQuiz = async () => {
    if (window.confirm('Are you sure you want to delete this quiz entire quiz? This action cannot be undone.')) {
      await deleteQuizAPI(`/quizzes/${quizId}`, { method: 'DELETE' });
      router.push('/dashboard');
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#b5179e]/20 border-t-[#b5179e] rounded-full animate-spin mx-auto" />
          <p className="text-lg font-black text-[#f5f3ef] animate-pulse tracking-tight">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (!quiz) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-center font-bold text-[#8a8780]">Quiz not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-28 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <Card className="p-8 mb-8 border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="rounded-full w-10 h-10 px-0">
                <ArrowLeft size={18} />
              </Button>
              <div>
                <p className="text-[11px] font-black text-[#b5179e] uppercase tracking-[0.2em] mb-1">Editor</p>
                <h1 className="text-2xl font-black text-[#f5f3ef] tracking-tight">Edit Quiz</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="danger"
                size="md"
                className="font-bold border-red-500/20 hover:bg-red-500/10"
                onClick={handleDeleteQuiz}
              >
                Delete Quiz
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="gap-2 px-6 font-bold"
              >
                <Save size={18} /> Save to Hub
              </Button>
            </div>
          </div>
          <div className="space-y-2">
             <span className="text-[10px] font-black text-[#4a4845] uppercase tracking-[0.2em] ml-1">Quiz Title</span>
             <Input
               id="quiz-title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               onBlur={handleTitleBlur}
               className="text-xl font-bold h-14 bg-[#0d0d0d] border-white/10"
             />
          </div>
        </Card>
        
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
    </div>
  );
}
