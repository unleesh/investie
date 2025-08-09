'use client';

import React from 'react';
import { SimpleChart } from './SimpleChart';
import type { SP500Sparkline as SP500SparklineType } from '@investie/types';

interface SP500SparklineProps {
  data: SP500SparklineType;
  height?: number;
  showTooltip?: boolean;
}

export const SP500Sparkline: React.FC<SP500SparklineProps> = ({ 
  data, 
  height = 80
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">S&P 500 Trend</h3>
        <span className="text-xs text-gray-400">{data.source}</span>
      </div>
      
      <SimpleChart
        data={data.data}
        height={height}
        trend={data.weeklyTrend}
        className="w-full"
      />
      
      {/* Latest value display */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Latest: ${data.data[data.data.length - 1]?.toFixed(2) || 'N/A'}</span>
        <div className={`font-medium ${
          data.weeklyTrend === 'up' ? 'text-green-600' :
          data.weeklyTrend === 'down' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          Weekly: {data.weeklyTrend}
        </div>
      </div>
    </div>
  );
};