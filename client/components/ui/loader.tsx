import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
}

export function Loader({ className, size = 'md', variant = 'spinner' }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center gap-1.5 py-1", className)}>
        <span 
          className={cn(
            "rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 animate-bounce",
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
          )}
          style={{ animationDelay: '0ms', animationDuration: '0.8s' }} 
        />
        <span 
          className={cn(
            "rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 animate-bounce",
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
          )}
          style={{ animationDelay: '150ms', animationDuration: '0.8s' }} 
        />
        <span 
          className={cn(
            "rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 animate-bounce",
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2'
          )}
          style={{ animationDelay: '300ms', animationDuration: '0.8s' }} 
        />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        <div className={cn("rounded-full bg-cyan-500/80 animate-pulse", sizeClasses[size])} />
        <div className={cn("rounded-full bg-purple-500/80 animate-pulse delay-75", sizeClasses[size])} />
        <div className={cn("rounded-full bg-pink-500/80 animate-pulse delay-150", sizeClasses[size])} />
      </div>
    );
  }

  // default 'spinner' - A beautiful premium circular gradient spinner
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div 
        className={cn(
          "rounded-full animate-spin border-t-2 border-r-2 border-b-2 border-transparent",
          sizeClasses[size]
        )}
        style={{
          background: 'linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899) border-box',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </div>
  );
}
