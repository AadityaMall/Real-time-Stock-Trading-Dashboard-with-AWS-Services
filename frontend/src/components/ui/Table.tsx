import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl ${className}`}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-teal-950/30 ${className}`}>
      {children}
    </thead>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function TableRow({ children, className = '', hover = true }: TableRowProps) {
  return (
    <tr
      className={`
        border-b border-teal-900/20
        ${hover ? 'transition-colors hover:bg-teal-950/20' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th
      className={`
        px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-teal-400/80
        ${className}
      `}
    >
      {children}
    </th>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-teal-900/20 ${className}`}>
      {children}
    </tbody>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 py-4 text-sm text-slate-300 ${className}`}>
      {children}
    </td>
  );
}
