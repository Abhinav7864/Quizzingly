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
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,49,159,0.4)]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'select-none active:scale-[0.98]',
  ].join(' ');

  const variants = {
    primary: [
      'bg-[var(--primary)] text-white shadow-sm',
      'hover:bg-[var(--primary-hover)] hover:shadow-md hover:shadow-[rgba(255,49,159,0.2)]',
    ].join(' '),
    secondary: [
      'bg-[#EDE9D5] text-[#3B142A] border border-[#E5E0C9] shadow-sm',
      'hover:bg-[#E5E0C9] hover:shadow-md transition-all',
    ].join(' '),
    ghost: [
      'bg-transparent text-[#8A846B] font-bold',
      'hover:bg-[#EDE9D5] hover:text-[#3B142A]',
    ].join(' '),
    outline: [
      'bg-transparent border-2 border-[#E5E0C9] text-[#3B142A] font-bold',
      'hover:border-[#FF319F] hover:text-[#FF319F] hover:bg-[#FF319F]/5',
    ].join(' '),
    danger: [
      'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 font-bold',
      'hover:bg-[#EF4444]/15',
    ].join(' '),
  };

  const sizes = {
    sm: 'h-8 px-3 text-[13px] rounded-xl gap-2',
    md: 'h-10 px-5 text-[14px] rounded-2xl gap-2',
    lg: 'h-12 px-7 text-[15px] rounded-2xl gap-2.5',
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
