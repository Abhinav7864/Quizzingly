'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-[#F55CA7] rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_black]">
            <Zap size={18} className="text-white fill-current" />
          </div>
          <span className="text-[18px] font-black text-[#1E1E1E]">Quizzingly</span>
        </motion.div>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="w-full max-w-[380px]"
      >
        <Card>
          <div className="px-8 py-6 border-b-2 border-black bg-[#FFD166]">
            <h1 className="text-[22px] font-black text-[#1E1E1E] tracking-tight">Create account</h1>
            <p className="text-[14px] font-bold text-[#1E1E1E]/70 mt-1">Start hosting amazing quizzes</p>
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
                className="text-[12px] text-[#EF4444] font-bold bg-white border-2 border-[#EF4444] shadow-[2px_2px_0px_#EF4444] rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" fullWidth size="lg" className="h-12 mt-2" isLoading={loading}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="text-center text-[13px] text-[#6B6B6B] mt-6 font-bold">
          Already have an account?{' '}
          <Link href="/login" className="text-[#F55CA7] hover:underline font-black">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
