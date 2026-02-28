
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, Gamepad2, Home, LogOut, User } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show header on login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleJoinClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const joinSection = document.getElementById('join-section');
      const joinInput = document.getElementById('game-code');
      if (joinSection) {
        joinSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => joinInput?.focus(), 500);
      }
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home size={18} /> },
    { name: 'Join Game', href: '/#join-section', onClick: handleJoinClick, icon: <Gamepad2 size={18} /> },
    { name: 'Creator Hub', href: '/dashboard', private: true, icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-950/80 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-500/20">
            <span className="text-white font-black text-xl">Q</span>
          </div>
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI QUIZ
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            if (link.private && !isAuthenticated) return null;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={link.onClick}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'text-indigo-400 bg-indigo-400/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800">
                  <User size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-gray-200">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-400">
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="px-5">Join Now</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};
