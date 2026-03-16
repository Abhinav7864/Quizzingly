'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Zap, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (pathname === '/login' || pathname === '/register') return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    ...(isAuthenticated ? [{ name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={13} /> }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F6F6F6] border-b-2 border-black">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 bg-[var(--primary)] rounded-lg flex items-center justify-center shrink-0 border-2 border-black shadow-[2px_2px_0px_black] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_black] transition-all">
            <Zap size={14} className="text-white fill-current" />
          </div>
          <span className="text-[14px] font-black text-[#1E1E1E] tracking-tight">Quizzingly</span>
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-bold tracking-wide transition-all ${
                  isActive
                    ? 'text-[#1E1E1E] font-black'
                    : 'text-[#6B6B6B] hover:text-[#1E1E1E]'
                }`}
              >
                {link.icon}
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#FFD166]/50 border-2 border-black rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Auth */}
        <div className="flex items-center gap-4 shrink-0">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-black text-[#1E1E1E]">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-[#6B6B6B] border-2 border-transparent hover:border-[#EF4444] hover:text-[#EF4444] transition-all"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <span className="text-[14px] font-black text-[#6B6B6B] hover:text-[#1E1E1E] transition-colors cursor-pointer px-2">Log in</span>
                  </Link>
                  <Link href="/register">
                    <button className="h-9 px-5 bg-[var(--primary)] hover:translate-x-[1px] hover:translate-y-[1px] text-white text-[14px] font-black rounded-lg border-2 border-black shadow-[3px_3px_0px_black] hover:shadow-[2px_2px_0px_black] transition-all">
                      Sign up
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
