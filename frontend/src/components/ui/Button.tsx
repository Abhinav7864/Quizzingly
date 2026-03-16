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
    'inline-flex items-center justify-center font-bold transition-all duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(245,92,167,0.5)]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'select-none',
  ].join(' ');

  const variants = {
    primary: [
      'bg-[var(--primary)] text-white border-2 border-black shadow-[4px_4px_0px_black]',
      'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_black]',
    ].join(' '),
    secondary: [
      'bg-white text-[var(--text-primary)] border-2 border-black shadow-[4px_4px_0px_black]',
      'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_black]',
    ].join(' '),
    ghost: [
      'bg-transparent text-[var(--text-secondary)] border-2 border-transparent',
      'hover:bg-[#F0F0F0] hover:text-[var(--text-primary)] hover:border-black',
    ].join(' '),
    outline: [
      'bg-transparent border-2 border-black text-[var(--text-primary)]',
      'hover:bg-[var(--primary)] hover:text-white hover:border-black',
      'hover:shadow-[4px_4px_0px_black]',
    ].join(' '),
    danger: [
      'bg-white text-[#EF4444] border-2 border-[#EF4444] shadow-[4px_4px_0px_#EF4444]',
      'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#EF4444]',
    ].join(' '),
  };

  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-lg gap-2',
    md: 'h-10 px-5 text-[14px] rounded-xl gap-2',
    lg: 'h-12 px-7 text-[15px] rounded-xl gap-2.5',
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
