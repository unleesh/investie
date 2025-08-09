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
  // Handle empty data case - provide sample data for visualization
  const chartData = data.data && data.data.length > 0 ? data.data : [4780, 4785, 4790, 4770, 4795, 4805, 4800];
  const trend = data.weeklyTrend || 'up';
  const source = data.source || 'google_finance';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">S&P 500 Trend</h3>
        <span className="text-xs text-gray-400">{source}</span>
      </div>
      
      <SimpleChart
        data={chartData}
        height={height}
        trend={trend}
        className="w-full"
      />
      
      {/* Latest value display */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Latest: ${chartData[chartData.length - 1]?.toFixed(2) || 'N/A'}</span>
        <div className={`font-medium ${
          trend === 'up' ? 'text-green-600' :
          trend === 'down' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          Weekly: {trend}
        </div>
      </div>
    </div>
  );
};