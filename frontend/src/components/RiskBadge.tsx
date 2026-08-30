import React from 'react';

interface RiskBadgeProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  className?: string;
}

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  let styleClasses = '';
  
  switch (level) {
    case 'HIGH':
      styleClasses = 'bg-red-100 text-red-800 border-red-200';
      break;
    case 'MEDIUM':
      styleClasses = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case 'LOW':
      styleClasses = 'bg-green-100 text-green-800 border-green-200';
      break;
    default:
      styleClasses = 'bg-gray-100 text-gray-800 border-gray-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClasses} ${className}`}>
      {level}
    </span>
  );
}
