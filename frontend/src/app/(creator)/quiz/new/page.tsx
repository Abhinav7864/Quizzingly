'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Quiz } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wand2, Upload, FileText, Sparkles, ArrowRight, Youtube, Image as ImageIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewQuizPage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [numQuestions, setNumQuestions] = useState<number | string>(25);
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
    // Validate: must provide at least one source (prompt, pdf, image, or youtube)
    if (!prompt && !pdfFile && !imageFile && !youtubeUrl) {
      alert('Please provide at least one source (Prompt, PDF, Image, or YouTube URL)');
      return;
    }

    try {
      const fd = new FormData();
      if (pdfFile) fd.append('pdf', pdfFile);
      if (imageFile) fd.append('image', imageFile);
      if (youtubeUrl) fd.append('youtubeUrl', youtubeUrl);
      if (prompt) fd.append('prompt', prompt);
      fd.append('timeLimit', timeLimit.toString());
      fd.append('numQuestions', numQuestions.toString());

      const q = await createQuiz('/quizzes/generate-ai', { method: 'POST', body: fd });
      if (q?.id) router.push(`/quiz/${q.id}`);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-28 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 font-medium group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>

          {/* Heading */}
          <h1 className="text-2xl font-black text-[var(--text-primary)] mb-8">Create New Quiz</h1>

          {/* Mode Toggle */}
          <div className="flex p-1.5 bg-white border-2 border-black rounded-xl mb-10 relative shadow-[4px_4px_0px_black]">
            {(['manual', 'ai'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg text-[14px] font-bold transition-all z-10 ${
                  mode === m
                    ? 'text-[#1E1E1E]'
                    : 'text-[#6B6B6B] hover:text-[#1E1E1E]'
                }`}
              >
                {m === 'ai' && <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Wand2 size={16} /></motion.div>}
                {m === 'manual' ? 'Manual Create' : 'AI Generation'}
                {mode === m && (
                  <motion.div
                    layoutId="mode-bg"
                    className="absolute inset-y-1.5 bg-[#FFD166] border-2 border-black rounded-lg -z-10 shadow-[3px_3px_0px_black]"
                    style={{ width: 'calc(50% - 6px)', left: m === 'manual' ? '6px' : 'calc(50%)' }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Card Container */}
          <Card className="shadow-2xl overflow-visible">
            <AnimatePresence mode="wait">
              {mode === 'manual' ? (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="p-8"
                >
                  <form onSubmit={handleManual} className="space-y-6">
                    <Input
                      id="title"
                      label="Quiz Title"
                      placeholder="e.g. Master React Hooks"
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
                      className="h-14 gap-2 text-lg shadow-[4px_4px_0px_black]"
                    >
                      Continue to Editor <ArrowRight size={18} />
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
                  className="p-8 space-y-8"
                >
                  {/* Multiple Sources Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PDF Upload */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                        <FileText size={14} /> Source PDF
                      </label>
                      <div
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        className={`group relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-black rounded-xl cursor-pointer transition-all shadow-[4px_4px_0px_black] ${
                          pdfFile
                            ? 'bg-[#A8E6CF] border-black'
                            : 'bg-white hover:bg-[#F6F6F6]'
                        }`}
                      >
                        <input
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        />
                        {pdfFile ? (
                          <>
                            <FileText size={24} className="text-black" />
                            <div className="text-center w-full px-2">
                              <p className="text-[13px] font-bold text-black truncate mb-0.5">
                                {pdfFile.name}
                              </p>
                              <p className="text-[11px] text-black/60">
                                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 border-black rounded-full text-white flex items-center justify-center text-[14px] shadow-[2px_2px_0px_black] hover:translate-y-0.5 transition-all"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-[#6B6B6B] group-hover:text-black transition-colors" />
                            <p className="text-[13px] text-[#6B6B6B] font-bold group-hover:text-black">Upload PDF</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                        <ImageIcon size={14} /> Source Image
                      </label>
                      <div
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className={`group relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-black rounded-xl cursor-pointer transition-all shadow-[4px_4px_0px_black] ${
                          imageFile
                            ? 'bg-[#FFD1DD] border-black'
                            : 'bg-white hover:bg-[#F6F6F6]'
                        }`}
                      >
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        />
                        {imageFile ? (
                          <>
                            <ImageIcon size={24} className="text-black" />
                            <div className="text-center w-full px-2">
                              <p className="text-[13px] font-bold text-black truncate mb-0.5">
                                {imageFile.name}
                              </p>
                              <p className="text-[11px] text-black/60">
                                {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setImageFile(null); }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 border-black rounded-full text-white flex items-center justify-center text-[14px] shadow-[2px_2px_0px_black] hover:translate-y-0.5 transition-all"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-[#6B6B6B] group-hover:text-black transition-colors" />
                            <p className="text-[13px] text-[#6B6B6B] font-bold group-hover:text-black">Upload Image</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* YouTube URL */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                      <Youtube size={14} className="text-[#FF0000]" /> YouTube Video Link
                    </label>
                    <div className="relative group">
                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full h-14 pl-12 pr-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] focus:shadow-[6px_6px_0px_black] focus:-translate-y-0.5 outline-none transition-all font-bold text-[14px]"
                      />
                      <Youtube size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B] group-focus-within:text-[#FF0000] transition-colors" />
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t-2 border-black/5 mt-2">
                    {/* Time limit selector */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                        <Clock size={14} /> Time Per Question
                      </label>
                      <div className="flex gap-2">
                        {[10, 15, 20, 30].map((t) => (
                          <button
                            key={t}
                            onClick={() => setTimeLimit(t)}
                            className={`flex-1 h-12 rounded-xl border-2 border-black font-black text-[14px] transition-all shadow-[2px_2px_0px_black] ${
                              timeLimit === t
                                ? 'bg-[#C9B1FF] translate-y-0.5 shadow-[0px_0px_0px_black]'
                                : 'bg-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_black]'
                            }`}
                          >
                            {t}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Count selector */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                        <Sparkles size={14} /> Question Count
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={numQuestions}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setNumQuestions('');
                              return;
                            }
                            const num = parseInt(val);
                            if (!isNaN(num)) {
                              setNumQuestions(Math.min(Math.max(num, 1), 50));
                            }
                          }}
                          className="w-full h-12 pl-4 pr-12 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] focus:shadow-[6px_6px_0px_black] focus:-translate-y-0.5 outline-none transition-all font-black text-[14px]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-[#A0A0A0] uppercase tracking-wide">
                          MAX 50
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                      Additional Instructions <Sparkles size={14} className="text-[#FFD166]" />
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g. Focus on advanced patterns, omit introductory concepts..."
                      className="w-full h-24 p-4 text-[14px] font-bold text-[var(--text-primary)] bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black] focus:shadow-[6px_6px_0px_black] focus:-translate-y-0.5 outline-none transition-all resize-none placeholder:text-[#A0A0A0] placeholder:font-medium"
                    />
                  </div>

                  <Button
                    onClick={handleAI}
                    isLoading={isLoading}
                    disabled={isLoading}
                    fullWidth
                    size="lg"
                    className="h-16 gap-3 text-lg font-black shadow-[6px_6px_0px_black]"
                  >
                    {isLoading ? (
                      <>Generating {numQuestions} Questions...</>
                    ) : (
                      <>
                        <Wand2 size={20} className="fill-current" />
                        Generate AI Quiz
                      </>
                    )}
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
