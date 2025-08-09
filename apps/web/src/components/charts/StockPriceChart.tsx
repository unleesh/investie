'use client';

import React from 'react';
import { SimpleChart } from './SimpleChart';
import type { StockPriceChart as StockPriceChartType } from '@investie/types';

interface StockPriceChartProps {
  data: StockPriceChartType;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export const StockPriceChart: React.FC<StockPriceChartProps> = ({
  data,
  height = 300
}) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-sm">No chart data available</div>
      </div>
    );
  }

  // Extract price data for the chart
  const priceData = data.data.map(point => point.price);
  
  // Calculate stats
  const min = Math.min(...priceData);
  const max = Math.max(...priceData);
  const current = priceData[priceData.length - 1];
  const change = priceData.length > 1 ? current - priceData[0] : 0;
  const trend = change >= 0 ? 'up' : 'down';

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              ${current.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">{data.period || '1W'} Period</div>
          </div>
          <div className={`text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? '+' : ''}${change.toFixed(2)}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div>Low: ${min.toFixed(2)}</div>
          <div>High: ${max.toFixed(2)}</div>
        </div>
      </div>

      {/* Chart using SimpleChart fallback */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
        <SimpleChart
          data={priceData}
          height={height}
          trend={trend}
          className="w-full"
        />
      </div>
      
      {/* Period info */}
      <div className="flex items-center justify-center space-x-2 text-xs">
        <div className="text-gray-400">Period: {data.period || '1W'}</div>
        <div className="text-gray-400">
          ({data.data.length} data points)
        </div>
      </div>
    </div>
  );
};