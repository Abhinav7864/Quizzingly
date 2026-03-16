import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', hoverable = false, ...props }: CardProps) => (
  <div
    className={[
      'bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl',
      'transition-all duration-200 overflow-hidden shadow-xl shadow-[rgba(0,0,0,0.08)]',
      hoverable
        ? 'hover:border-[var(--primary)]/30 hover:bg-[var(--bg-elevated)] hover:shadow-xl cursor-pointer active:scale-[0.99]'
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
    className={`px-5 py-4 border-b border-[var(--border)] ${className}`}
    {...props}
  >
    {title && <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</h3>}
    {subtitle && <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }: CardBodyProps) => (
  <div
    className={`px-5 py-4 border-t border-[var(--border)] flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);
