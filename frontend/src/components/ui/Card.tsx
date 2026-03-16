import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', hoverable = false, ...props }: CardProps) => (
  <div
    className={[
      'bg-white border-2 border-black rounded-xl',
      'shadow-[6px_6px_0px_black] transition-all duration-200 overflow-hidden',
      hoverable
        ? 'hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] cursor-pointer'
        : '',
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </div>
);

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = ({ children, className = '', ...props }: CardBodyProps) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const CardHeader = ({ children, title, subtitle, className = '', ...props }: CardHeaderProps) => (
  <div
    className={`px-5 py-4 border-b-2 border-black ${className}`}
    {...props}
  >
    {title && <h3 className="text-[14px] font-black text-[var(--text-primary)]">{title}</h3>}
    {subtitle && <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }: CardBodyProps) => (
  <div
    className={`px-5 py-4 border-t-2 border-black flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);
