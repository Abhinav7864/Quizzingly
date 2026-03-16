'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Zap, LogOut, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (pathname === '/login' || pathname === '/register') return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    ...(isAuthenticated ? [{ name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={13} /> }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#3B142A]/80 backdrop-blur-xl border-b border-white/10">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 bg-[var(--primary)] rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-[rgba(255,49,159,0.3)] group-hover:scale-110 transition-transform">
            <Zap size={14} className="text-white fill-current" />
          </div>
          <span className="text-[14px] font-bold text-white tracking-tight">Quizzingly</span>
        </Link>

        {/* Center: Navigation */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[14px] font-bold tracking-wide transition-all ${
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.icon}
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[rgba(255,49,159,0.1)] border border-[rgba(255,49,159,0.2)] rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Auth / Theme */}
        <div className="flex items-center gap-4 shrink-0">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-bold text-white">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-white/60 hover:bg-[#EF4444]/20 hover:text-[#EF4444] transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <span className="text-[14px] font-bold text-white/80 hover:text-white transition-colors cursor-pointer px-2">Log in</span>
                  </Link>
                  <Link href="/register">
                    <button className="h-9 px-5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[14px] font-bold rounded-xl transition-all shadow-md">
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
