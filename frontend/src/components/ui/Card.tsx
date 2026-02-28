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
  const baseStyles = "rounded-lg transition-all duration-200";
  
  const variants = {
    default: "bg-gray-900 border border-gray-700 shadow-md",
    elevated: "bg-gray-850 border border-gray-700 shadow-lg",
    outlined: "bg-transparent border-2 border-gray-700"
  };

  const hoverStyles = hoverable ? "hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer hover:translate-y-[-2px]" : "";

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
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const CardHeader = ({ children, title, subtitle, className = '', ...props }: CardHeaderProps) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-700 ${className}`} {...props}>
      {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
};

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = ({ children, className = '', ...props }: CardBodyProps) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-700 flex items-center justify-between gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
};
