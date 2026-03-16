'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wand2, Upload, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewQuizPage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { isLoading, exec: createQuiz } = useApi<Quiz>();
  const router = useRouter();

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const q = await createQuiz('/quizzes', { method: 'POST', body: { title } });
    if (q) router.push(`/quiz/${q.id}`);
  };

  const handleAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !prompt) return;
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      fd.append('prompt', prompt);
      const q = await createQuiz('/quizzes/generate-ai', { method: 'POST', body: fd });
      if (q?.id) router.push(`/quiz/${q.id}`);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-28 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 font-medium group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>

          {/* Heading */}
          <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-6">New Quiz</h1>

          {/* Mode Toggle */}
          <div className="flex p-1.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl mb-10 relative">
            {(['manual', 'ai'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[13px] font-bold transition-all z-10 ${
                  mode === m
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {m === 'ai' && <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Wand2 size={14} /></motion.div>}
                {m === 'manual' ? 'Manual Create' : 'AI Generation'}
                {mode === m && (
                  <motion.div
                    layoutId="mode-bg"
                    className="absolute inset-y-1.5 bg-[var(--bg-elevated)] rounded-xl -z-10 shadow-sm"
                    style={{ width: 'calc(50% - 6px)', left: m === 'manual' ? '6px' : 'calc(50%)' }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Card Container */}
          <Card className="shadow-xl">
            <AnimatePresence mode="wait">
              {mode === 'manual' ? (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  <form onSubmit={handleManual} className="space-y-6">
                    <Input
                      id="title"
                      label="Quiz Title"
                      placeholder="e.g. Frontend Development Quiz"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      autoFocus
                    />
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={!title}
                      fullWidth
                      size="lg"
                      className="gap-2"
                    >
                      Continue <ArrowRight size={16} />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 space-y-6"
                >
                  {/* PDF Upload Zone */}
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-3 tracking-wide uppercase">
                      Upload Source PDF
                    </label>
                      <div
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          file
                            ? 'bg-[var(--primary)]/5 border-[var(--primary)]/30'
                            : 'bg-transparent border-[var(--border)] hover:border-[var(--primary)]/30'
                        }`}
                      >
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        {file ? (
                          <>
                            <FileText size={24} className="text-[#7C3AED]" />
                          <div className="text-center">
                            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1 truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)]">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="text-[12px] text-[#EF4444] font-medium hover:underline mt-1"
                          >
                            Remove file
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center">
                            <Upload size={18} className="text-[var(--text-secondary)]" />
                          </div>
                          <p className="text-[13px] text-[var(--text-secondary)] font-medium">Click to upload document</p>
                          <p className="text-[11px] text-[var(--text-muted)]">Maximum size: 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div>
                    <label className="flex items-center gap-2 text-[12px] font-medium text-[var(--text-secondary)] mb-3 tracking-wide uppercase">
                      AI Instructions <Sparkles size={12} className="text-[var(--primary)]" />
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Create 10 challenging questions focusing on React hooks..."
                      className="w-full h-[96px] p-4 text-[14px] text-[var(--text-primary)] bg-transparent border border-[var(--border)] rounded-xl focus:border-[var(--primary)]/50 outline-none transition-all resize-none placeholder:text-[var(--text-muted)]"
                    />
                  </div>

                  <Button
                    onClick={handleAI}
                    isLoading={isLoading}
                    disabled={!file || !prompt}
                    fullWidth
                    size="lg"
                    className="gap-2"
                  >
                    <Wand2 size={16} />
                    {isLoading ? 'Generating Questions...' : 'Generate with AI'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}
