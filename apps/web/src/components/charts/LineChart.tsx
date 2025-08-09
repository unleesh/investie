'use client';

import React from 'react';
import { SimpleChart } from './SimpleChart';

interface LineChartProps {
  data?: number[];
  width?: number | string;
  height?: number | string;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
  showTooltip?: boolean;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  width = '100%', 
  height = 100,
  trend = 'flat',
  className = ''
}) => {
  // Use SimpleChart as a reliable fallback
  return (
    <SimpleChart
      data={data}
      width={width}
      height={typeof height === 'number' ? height : 100}
      trend={trend}
      className={className}
    />
  );
};