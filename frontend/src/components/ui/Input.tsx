import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = ({ label, id, error, helperText, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-black text-[var(--text-secondary)] mb-2 tracking-[0.2em] ml-1 uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full h-11 px-4 text-[15px] font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)]',
          'bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_black]',
          'transition-all duration-200 outline-none',
          error
            ? 'border-[#EF4444] shadow-[4px_4px_0px_#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
            : 'focus:border-[var(--primary)] focus:shadow-[4px_4px_0px_var(--primary)]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-[#EF4444] font-bold">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-[12px] text-[var(--text-secondary)] font-bold">{helperText}</p>}
    </div>
  );
};
