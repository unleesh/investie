import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};