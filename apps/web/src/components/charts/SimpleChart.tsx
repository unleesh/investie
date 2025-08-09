'use client';

import React from 'react';

interface SimpleChartProps {
  data?: number[];
  width?: number | string;
  height?: number;
  trend?: 'up' | 'down' | 'flat';
  title?: string;
  className?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  width = '100%',
  height = 60,
  trend = 'flat',
  title,
  className = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`${className} bg-gray-50 rounded border flex items-center justify-center`} style={{ width, height }}>
        <span className="text-xs text-gray-400">No data</span>
      </div>
    );
  }

  // Simple SVG sparkline
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#6b7280';
  const trendBgColor = trend === 'up' ? '#dcfce7' : trend === 'down' ? '#fef2f2' : '#f9fafb';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

  return (
    <div className={`${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">{title}</span>
          <div className="flex items-center space-x-1">
            <span style={{ color: trendColor }}>{trendIcon}</span>
            <span className="text-xs capitalize" style={{ color: trendColor }}>{trend}</span>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" style={{ width, height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="block"
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id={`gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.1"/>
              <stop offset="100%" stopColor={trendColor} stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <polygon
            fill={`url(#gradient-${trend})`}
            points={`0,100 ${points} 100,100`}
          />
          
          {/* Main line */}
          <polyline
            fill="none"
            stroke={trendColor}
            strokeWidth="2.5"
            points={points}
            vectorEffect="non-scaling-stroke"
            className="drop-shadow-sm"
          />
          
          {/* End point */}
          <circle
            cx={data.length > 1 ? ((data.length - 1) / (data.length - 1)) * 100 : 50}
            cy={data.length > 1 ? 100 - ((data[data.length - 1] - min) / range) * 100 : 50}
            r="2"
            fill="white"
            stroke={trendColor}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>${min.toFixed(2)}</span>
        <span>{data.length} points</span>
        <span>${max.toFixed(2)}</span>
      </div>
    </div>
  );
};