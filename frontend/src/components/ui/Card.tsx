import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card = ({ children, className = '', hoverable = false, ...props }: CardProps) => (
  <div
    className={[
      'bg-[#161616] border border-white/7 rounded-2xl',
      'transition-all duration-200 overflow-hidden',
      hoverable
        ? 'hover:border-white/15 hover:bg-[#1a1a1a] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] cursor-pointer'
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
    className={`px-5 py-4 border-b border-white/6 ${className}`}
    {...props}
  >
    {title && <h3 className="text-[14px] font-semibold text-[#f5f3ef]">{title}</h3>}
    {subtitle && <p className="text-[12px] text-[#4a4845] mt-0.5">{subtitle}</p>}
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }: CardBodyProps) => (
  <div
    className={`px-5 py-4 border-t border-white/6 flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);
