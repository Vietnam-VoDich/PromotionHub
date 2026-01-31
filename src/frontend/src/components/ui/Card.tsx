import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  variant?: 'default' | 'glass';
}

export function Card({ children, className, onClick, hover, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variant === 'default' && 'bg-dark-800/80 border border-dark-700/50',
        variant === 'glass' && 'glass',
        hover && 'transition-all hover:border-dark-600 hover:shadow-lg hover:shadow-dark-950/50 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 border-b border-dark-700/50', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4 bg-dark-900/50 border-t border-dark-700/50', className)}>{children}</div>;
}
