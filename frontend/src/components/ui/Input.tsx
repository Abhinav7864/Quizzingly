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
          className="block text-[11px] font-black text-[#8A846B] mb-2 tracking-[0.2em] ml-1 uppercase"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full h-11 px-4 text-[15px] font-bold text-[#3B142A] placeholder-[#8A846B]/50',
          'bg-[#EDE9D5] border-transparent rounded-xl',
          'transition-all duration-200 outline-none',
          error
            ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
            : 'focus:border-[#FF319F] focus:ring-4 focus:ring-[#FF319F]/5',
          'disabled:opacity-40 disabled:cursor-not-allowed shadow-inner',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-[#EF4444]">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-[12px] text-[#8A846B] font-bold">{helperText}</p>}
    </div>
  );
};
