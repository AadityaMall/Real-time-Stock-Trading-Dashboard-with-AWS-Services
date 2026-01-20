import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-xl border bg-[#0a0f0f] px-4 py-3
          text-slate-100 placeholder-slate-500
          focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20
          transition-all duration-200
          ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-teal-900/40 hover:border-teal-800/60'}
          ${props.disabled ? 'bg-slate-900/50 text-slate-400 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
