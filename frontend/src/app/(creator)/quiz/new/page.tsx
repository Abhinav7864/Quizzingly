
'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ChevronRight, CheckCircle2, Wand2, Upload, FileText, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewQuizPage() {
  const [generationMode, setGenerationMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const { isLoading, exec: createQuiz } = useApi<Quiz>();
  const router = useRouter();

  const handleCreateManual = async (e: React.FormEvent) => {
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

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !prompt) {
      alert('Please upload a PDF and enter a prompt.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('prompt', prompt);

      const newQuiz = await createQuiz('/quizzes/generate-ai', {
        method: 'POST',
        body: formData,
      });

      if (newQuiz && newQuiz.id) {
        router.push(`/quiz/${newQuiz.id}`);
      } else {
        alert('AI Generation failed. Check the console for details.');
      }
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      alert(`Error: ${err.message || 'Something went wrong'}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-black text-white">Create New Quiz</h1>
      </div>

      <div className="flex p-1 bg-gray-900 rounded-xl border border-gray-800">
        <button
          onClick={() => setGenerationMode('manual')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            generationMode === 'manual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          Manual Creation
        </button>
        <button
          onClick={() => setGenerationMode('ai')}
          className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            generationMode === 'ai' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wand2 size={18} /> AI Generator
        </button>
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6"
      >
        <AnimatePresence mode="wait">
          {generationMode === 'manual' ? (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Quiz Title
                </label>
                <Input
                  id="title"
                  placeholder="e.g., '80s Rock Anthems'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold h-16 border-gray-800 focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-4 border-t border-gray-800">
                <Button 
                  onClick={handleCreateManual}
                  isLoading={isLoading}
                  disabled={!title}
                  className="w-full h-14 gap-2"
                >
                  Continue to Questions <ChevronRight size={18} />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Upload PDF Content
                </label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 ${
                    file ? 'border-indigo-500 bg-indigo-500/5' : 'border-gray-800'
                  }`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <>
                      <FileText className="text-indigo-500" size={48} />
                      <div className="text-center">
                        <p className="font-bold text-white">{file.name}</p>
                        <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-600" size={48} />
                      <div className="text-center">
                        <p className="font-bold text-gray-300">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 text-balance">PDF files containing the study material</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  AI Prompt <Sparkles size={14} className="text-indigo-400" />
                </label>
                <textarea
                  placeholder="e.g., 'Generate 10 difficult multiple-choice questions focusing on Quantum Mechanics...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-800">
                <Button 
                  onClick={handleGenerateAI}
                  isLoading={isLoading}
                  disabled={!file || !prompt}
                  className="w-full h-14 gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20"
                >
                  <Wand2 size={18} /> {isLoading ? 'Generating Quiz...' : 'Generate AI Quiz'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="p-6 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800 text-center">
        <p className="text-sm text-gray-500 italic">
          {generationMode === 'manual' 
            ? "Create your quiz manually and add questions one by one." 
            : "The AI will analyze your PDF and generate relevant questions automatically."}
        </p>
      </div>
    </div>
  );
}
