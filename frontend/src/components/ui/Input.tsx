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
          className="block text-[12px] font-medium text-[#8a8780] mb-2 tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full h-11 px-4 text-[14px] text-[#f5f3ef] placeholder-[#4a4845]',
          'bg-[#0d0d0d] border rounded-xl',
          'transition-all duration-200 outline-none',
          error
            ? 'border-[#ef4444] focus:ring-2 focus:ring-[#ef4444]/20'
            : 'border-white/8 focus:border-[#b5179e]/50 focus:ring-4 focus:ring-[#b5179e]/10',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-[#ef4444]">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-[12px] text-[#4a4845]">{helperText}</p>}
    </div>
  );
};
