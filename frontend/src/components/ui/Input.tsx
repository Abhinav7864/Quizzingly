
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, id, ...props }: InputProps) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input
        id={id}
        className="w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        {...props}
      />
    </div>
  );
};
