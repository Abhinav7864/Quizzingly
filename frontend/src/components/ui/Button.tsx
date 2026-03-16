import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) => {
  const base = [
    'inline-flex items-center justify-center font-semibold transition-all duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b5179e]/50',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'select-none active:scale-[0.98]',
  ].join(' ');

  const variants = {
    primary: [
      'bg-[#b5179e] text-white',
      'hover:bg-[#cc2baf] hover:shadow-[0_0_20px_rgba(181,23,158,0.4)]',
    ].join(' '),
    secondary: [
      'bg-[#1a1a1a] border border-white/8 text-[#f5f3ef]',
      'hover:bg-[#222] hover:border-[#4361ee]/30',
    ].join(' '),
    ghost: [
      'bg-transparent text-[#8a8780]',
      'hover:bg-[#1a1a1a] hover:text-[#f5f3ef]',
    ].join(' '),
    outline: [
      'bg-transparent border border-white/10 text-[#f5f3ef]',
      'hover:border-[#b5179e] hover:text-[#b5179e]',
    ].join(' '),
    danger: [
      'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20',
      'hover:bg-[#ef4444]/20',
    ].join(' '),
  };

  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-lg gap-2',
    md: 'h-9 px-4 text-[14px] rounded-lg gap-2',
    lg: 'h-11 px-6 text-[15px] rounded-xl gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin shrink-0 h-[1.1em] w-[1.1em]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};
