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
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-10"
      >
        <div className="w-8 h-8 bg-[#b5179e] rounded-lg flex items-center justify-center">
          <Zap size={18} className="text-white fill-current" />
        </div>
        <span className="text-[18px] font-bold text-[#f5f3ef]">Quizzingly</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="w-full max-w-[380px]"
      >
        <Card className="rounded-[32px] border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/6 bg-white/[0.02]">
            <h1 className="text-[18px] font-black text-[#f5f3ef] tracking-tight">Create account</h1>
            <p className="text-[14px] font-medium text-[#8a8780] mt-1">Start hosting amazing quizzes</p>
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
              className="h-12 bg-[#0d0d0d]"
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
              className="h-12 bg-[#0d0d0d]"
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
              className="h-12 bg-[#0d0d0d]"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-[#ef4444] font-medium bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg px-4 py-2.5"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" fullWidth size="lg" className="h-10 mt-2" isLoading={loading}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="text-center text-[13px] text-[#8a8780] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#b5179e] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
