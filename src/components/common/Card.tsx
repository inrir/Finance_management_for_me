import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: ReactNode;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function Card({ title, value, sub, trend, className = '' }: CardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-gray-500';

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${className}`}>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && (
        <p className={`text-sm mt-1 font-medium ${trendColor}`}>{sub}</p>
      )}
    </div>
  );
}
