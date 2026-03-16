
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
const QuestionItem = ({ 
  question, 
  index, 
  onEdit, 
  onDelete 
}: { 
  question: Question; 
  index: number; 
  onEdit: () => void; 
  onDelete: () => void; 
}) => (
  <div className="bg-[#F3EFDA] p-6 rounded-[32px] border-[#E5E0C9] flex justify-between items-center group hover:border-[#FF319F]/30 transition-all shadow-xl">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#EDE9D5] flex items-center justify-center shrink-0 text-[#8A846B] font-mono font-bold text-sm">
        Q{index + 1}
      </div>
      <p className="font-bold text-[#3B142A]">{question.text}</p>
    </div>
    <div className="flex gap-2 transition-all">
      <Button variant="outline" size="sm" className="text-[#8A846B] border-[#E5E0C9] hover:text-[#3B142A] hover:bg-[#EDE9D5]" onClick={onEdit}>Edit</Button>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-[#FF319F] rounded-full animate-spin mx-auto" />
          <p className="text-lg font-black text-white animate-pulse tracking-tight">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (!quiz) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center font-bold text-white/50">Quiz not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-12 relative z-10">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <Card className="p-8 mb-8 border-[#E5E0C9] shadow-2xl bg-[#F3EFDA]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="rounded-full w-10 h-10 px-0 text-[#8A846B] hover:text-[#3B142A] hover:bg-[#EDE9D5]">
                <ArrowLeft size={18} />
              </Button>
              <div>
                <p className="text-[11px] font-black text-[#FF319F] uppercase tracking-[0.2em] mb-1">Editor</p>
                <h1 className="text-2xl font-black text-[#3B142A] tracking-tight">Edit Quiz</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="danger"
                size="md"
                className="font-bold bg-black/5 text-[#EF4444] border-transparent hover:bg-black/10"
                onClick={handleDeleteQuiz}
              >
                Delete Quiz
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="gap-2 px-6 font-bold shadow-lg shadow-[#FF319F]/30"
              >
                <Save size={18} /> Save to Hub
              </Button>
            </div>
          </div>
          <div className="space-y-3">
             <span className="text-[11px] font-black text-[#8A846B] uppercase tracking-[0.2em] ml-1">Quiz Title</span>
             <Input
               id="quiz-title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               onBlur={handleTitleBlur}
               className="text-xl font-black h-16 bg-[#EDE9D5] border-transparent text-[#3B142A] rounded-2xl"
             />
          </div>
        </Card>
        
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Questions ({quiz.questions?.length || 0})</h2>

        <div className="space-y-4 mb-8">
          {quiz.questions?.map((question, idx) => (
            <React.Fragment key={question.id}>
              <QuestionItem 
                question={question}
                index={idx}
                onEdit={() => setEditingQuestion(question)}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
              {editingQuestion?.id === question.id && (
                <div className="bg-[#F3EFDA] p-8 rounded-[32px] border-2 border-[#FF319F]/30 shadow-2xl">
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
          {quiz.questions?.length === 0 && <p className="text-[var(--text-secondary)] italic">No questions yet. Add one below!</p>}
        </div>

        {!editingQuestion && (
          <div>
            <h2 className="text-2xl font-black mb-6 border-t border-white/10 pt-10 text-white tracking-tight">
              Add New Question
            </h2>
            <div className="bg-[#F3EFDA] p-10 rounded-[40px] border border-[#E5E0C9] shadow-2xl relative">
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
