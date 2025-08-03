import React from 'react';
import type { StockPriceChart } from '@investie/types';

interface StockPriceChartProps {
  data: StockPriceChart;
  width?: number | string;
  height?: number | string;
}

export const StockPriceChart: React.FC<StockPriceChartProps> = ({ 
  data, 
  width = '100%', 
  height = 120 
}) => {
  const trendColor = data.trend === 'up' ? 'text-green-500' : 
                    data.trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div 
      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
      style={{ width, height }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-gray-700 text-sm font-medium mb-2">
          Stock Price Chart Stub
        </div>
        <div className="text-gray-500 text-xs mb-1">
          Period: {data.period}
        </div>
        <div className={`text-xs font-medium ${trendColor} mb-1`}>
          Trend: {data.trend} ({data.changePercent.toFixed(2)}%)
        </div>
        <div className="text-gray-400 text-xs">
          {data.data.length} data points
        </div>
      </div>
    </div>
  );
};