'use client';

import React from 'react';

interface SimpleGaugeProps {
  value: number; // 0-100
  size?: number;
  status: 'fear' | 'neutral' | 'greed';
  title?: string;
  className?: string;
}

export const SimpleGauge: React.FC<SimpleGaugeProps> = ({
  value,
  size = 120,
  status,
  title,
  className = ''
}) => {
  // Determine color based on Fear & Greed Index value
  const getColorForValue = (val: number) => {
    if (val <= 24) return '#dc2626'; // red-600 - Extreme Fear
    if (val <= 44) return '#ea580c'; // orange-600 - Fear
    if (val <= 55) return '#ca8a04'; // yellow-600 - Neutral
    if (val <= 75) return '#16a34a'; // green-600 - Greed
    return '#15803d'; // green-700 - Extreme Greed
  };

  // Get status label with color
  const getStatusInfo = (val: number) => {
    let label: string = status;
    let colorClass = 'text-gray-600';
    
    if (val <= 24) {
      label = 'Extreme Fear';
      colorClass = 'text-red-600';
    } else if (val <= 44) {
      label = 'Fear';
      colorClass = 'text-orange-600';
    } else if (val <= 55) {
      label = 'Neutral';
      colorClass = 'text-yellow-600';
    } else if (val <= 75) {
      label = 'Greed';
      colorClass = 'text-green-600';
    } else {
      label = 'Extreme Greed';
      colorClass = 'text-green-700';
    }
    
    return { label, colorClass };
  };

  const color = getColorForValue(value);
  const statusInfo = getStatusInfo(value);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`${className} flex flex-col items-center space-y-3`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      )}
      
      <div className="relative p-4 bg-white rounded-lg border border-gray-200 shadow-sm" style={{ width: size + 32, height: size + 32 }}>
        {/* Background Circle */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="transform -rotate-90 drop-shadow-sm"
        >
          <defs>
            <linearGradient id={`gauge-gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor={color} stopOpacity="1"/>
            </linearGradient>
          </defs>
          
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#f3f4f6"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={`url(#gauge-gradient-${value})`}
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
        </svg>
        
        {/* Center Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">
            {value}
          </div>
          <div className="text-xs text-gray-500">
            /100
          </div>
        </div>
      </div>
      
      {/* Status Label */}
      <div className="text-center">
        <div className={`text-sm font-semibold uppercase tracking-wide ${statusInfo.colorClass}`}>
          {statusInfo.label}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Market Sentiment
        </div>
      </div>
      
      {/* Scale Reference */}
      <div className="flex justify-between text-xs text-gray-400 w-full border-t border-gray-100 pt-2">
        <span>Fear</span>
        <span>Neutral</span>
        <span>Greed</span>
      </div>
    </div>
  );
};