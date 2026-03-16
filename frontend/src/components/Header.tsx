'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (pathname === '/login' || pathname === '/register') return null;

  const navLinks = [
    ...(isAuthenticated
      ? [{ name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={14} /> }]
      : [
          { name: 'Features', href: '#features', icon: null },
          { name: 'How it Works', href: '#how-it-works', icon: null },
        ]),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F6F6F6] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-black text-2xl text-[#1E1E1E] tracking-tight hover:-translate-y-0.5 transition-transform"
        >
          QUIZZINGLY<span className="text-[#F55CA7]">.</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex gap-8 font-bold text-[#1E1E1E]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-1.5 hover:text-[#F55CA7] transition-colors ${
                pathname === link.href ? 'text-[#F55CA7]' : ''
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span className="hidden md:block font-bold text-[#1E1E1E]">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg border-2 border-transparent text-[#6B6B6B] hover:border-[#EF4444] hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-all"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden md:block font-bold text-[#1E1E1E] hover:text-[#F55CA7] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link href="/register">
                    <button className="bg-[#FFD166] text-[#1E1E1E] px-6 py-2.5 border-2 border-black shadow-[4px_4px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all font-bold rounded-lg">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
