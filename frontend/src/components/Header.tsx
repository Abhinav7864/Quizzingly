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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(13,13,13,0.95)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-[52px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 h-7 bg-[#b5179e] rounded-lg flex items-center justify-center shrink-0">
            <Zap size={14} className="text-white fill-current" />
          </div>
          <span className="text-[14px] font-semibold text-[#f5f3ef]">Quizzingly</span>
        </Link>

        <nav className="flex items-center gap-1 mx-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  isActive
                    ? 'text-[#f5f3ef]'
                    : 'text-[#8a8780] hover:text-[#f5f3ef]'
                }`}
              >
                {link.icon}
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#b5179e]/10 border border-[#b5179e]/20 rounded-full -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {!isLoading && (
          <div className="flex items-center gap-4 shrink-0">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-[12px] font-mono text-[#4a4845]">
                  {user?.username || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="text-[12px] text-[#8a8780] hover:text-[#ef4444] transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
