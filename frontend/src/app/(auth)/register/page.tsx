'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-950">
      <Link href="/" className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">
            Quizzingly
          </span>
        </div>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-gray-900 border border-gray-800 rounded-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">Create Account</h1>
          <p className="text-gray-500 mt-2">Join our community of quiz creators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="username"
            label="Username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3"
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-gray-900 px-3 text-gray-500">Already have an account?</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400">
          Already a member?{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </motion.div>

      <Link href="/" className="mt-8 text-sm text-gray-500 hover:text-gray-400">
        ← Back to home
      </Link>
    </div>
  );
}
