import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  variant = 'default',
  ...props 
}: CardProps) => {
  const baseStyles = "rounded-xl transition-all duration-200";
  
  const variants = {
    default: "bg-gray-900 border border-gray-800",
    elevated: "bg-gray-900 border border-gray-800 shadow-lg shadow-black/20",
    outlined: "bg-transparent border border-gray-700"
  };

  const hoverStyles = hoverable 
    ? "hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer hover:-translate-y-0.5" 
    : "";

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const CardHeader = ({ children, title, subtitle, className = '', ...props }: CardHeaderProps) => {
  return (
    <div className={`px-5 py-4 border-b border-gray-800 ${className}`} {...props}>
      {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
};

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = ({ children, className = '', ...props }: CardBodyProps) => {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div className={`px-5 py-4 border-t border-gray-800 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};
