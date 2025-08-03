import React from 'react';

interface LineChartProps {
  data?: any[];
  width?: number | string;
  height?: number | string;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  width = '100%', 
  height = 100 
}) => {
  return (
    <div 
      className="bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200"
      style={{ width, height }}
    >
      <div className="text-center">
        <div className="text-gray-600 text-sm font-medium">Line Chart Stub</div>
        <div className="text-gray-400 text-xs mt-1">
          {data ? `${data.length} data points` : 'No data'}
        </div>
      </div>
    </div>
  );
};