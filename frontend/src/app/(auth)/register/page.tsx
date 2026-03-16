'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(username, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center px-4">
      <Link href="/">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-[var(--primary)] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_black] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_black] transition-all">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <span className="text-[18px] font-black text-[#1E1E1E]">Quizzingly</span>
        </motion.div>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="w-full max-w-[380px]"
      >
        <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_black] overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-6 border-b-2 border-black bg-[#A8E6CF]">
            <h1 className="text-[22px] font-black text-[#1E1E1E] tracking-tight">Create account</h1>
            <p className="text-[14px] font-bold text-[#1E1E1E]/60 mt-1">Start hosting amazing quizzes</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <Input
              id="username"
              label="Username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-12"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="name@quizzingly.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-12"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-[#EF4444] font-bold bg-[#EF4444]/5 border-2 border-[#EF4444] rounded-lg px-4 py-2.5"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" id="register-submit" fullWidth size="lg" className="h-12 mt-2" isLoading={loading}>
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#6B6B6B] mt-6 font-bold">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--primary)] hover:underline font-black">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
