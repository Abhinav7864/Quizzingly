import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const Input = ({ label, id, error, success, helperText, className = '', ...props }: InputProps) => {
  const inputClasses = `w-full bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none ${
    error 
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
      : success 
      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
      : 'border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
  } disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={inputClasses}
          {...props}
        />
        {success && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
