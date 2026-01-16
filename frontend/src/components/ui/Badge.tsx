import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-800 text-gray-300',
    success: 'bg-green-900/30 text-green-400 border-green-800',
    danger: 'bg-red-900/30 text-red-400 border-red-800',
    warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    info: 'bg-blue-900/30 text-blue-400 border-blue-800',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
