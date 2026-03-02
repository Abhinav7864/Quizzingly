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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800 py-3' : 'bg-transparent py-5'}`}>
      <div className="w-full px-6 md:px-10 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-lg">Q</span>
          </div>
          <span className="text-xl font-bold text-gray-100 tracking-tight">
            Quizzingly
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.private && !isAuthenticated) return null;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={link.onClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-indigo-400 bg-indigo-500/10' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {!isLoading && (
            isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800">
                  <User size={14} className="text-indigo-400" />
                  <span className="text-xs font-medium text-gray-300">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-400 flex items-center gap-2 pr-2">
                  <span className="text-xs font-medium uppercase tracking-wider">Exit</span>
                  <LogOut size={18} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};
