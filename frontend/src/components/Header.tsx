'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut, PlusSquare, Home } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (pathname === '/login' || pathname === '/register') return null;

  const navLinks = [
    ...(isAuthenticated
      ? [
          { name: 'Home', href: '/', icon: <Home size={18} /> },
          { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
          { name: 'New Quiz', href: '/quiz/new', icon: <PlusSquare size={18} /> },
        ]
      : [
          { name: 'Home', href: '/', icon: <Home size={18} /> },
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
              className={`flex items-center gap-2 hover:text-[#F55CA7] transition-all hover:-translate-y-0.5 ${
                pathname === link.href ? 'text-[#F55CA7]' : ''
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA / User Profile - Right Side */}
        <div className="flex gap-4 items-center">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_black] font-bold text-[#1E1E1E]">
                    <div className="w-6 h-6 bg-[#F55CA7] rounded-full border border-black flex items-center justify-center text-white text-xs">
                      {(user?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    </div>
                    {user?.username || user?.email?.split('@')[0]}
                  </div>

                  <button
                    onClick={logout}
                    className="bg-white p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_black] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_black] hover:bg-[#EF4444] hover:text-white transition-all text-[#1E1E1E]"
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
