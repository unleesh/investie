'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { FearGreedIndex } from '@investie/types';

interface FearGreedGaugeProps {
  data: FearGreedIndex;
  size?: number;
  showTooltip?: boolean;
}

export const FearGreedGauge: React.FC<FearGreedGaugeProps> = ({ 
  data, 
  size = 120,
  showTooltip = true 
}) => {
  // Create gauge data - split the circle into segments
  const gaugeData = React.useMemo(() => {
    const value = Math.max(0, Math.min(100, data.value));
    return [
      { 
        name: 'value', 
        value: value, 
        fill: getColorForValue(value) 
      },
      { 
        name: 'remaining', 
        value: 100 - value, 
        fill: '#f3f4f6' // gray-100
      }
    ];
  }, [data.value]);

  // Determine color based on Fear & Greed Index value
  function getColorForValue(value: number): string {
    if (value <= 24) return '#dc2626'; // red-600 - Extreme Fear
    if (value <= 44) return '#ea580c'; // orange-600 - Fear
    if (value <= 55) return '#ca8a04'; // yellow-600 - Neutral
    if (value <= 75) return '#16a34a'; // green-600 - Greed
    return '#15803d'; // green-700 - Extreme Greed
  }

  // Get status label with color
  const statusInfo = React.useMemo(() => {
    const value = data.value;
    let label: string = data.status;
    let colorClass = 'text-gray-600';
    
    if (value <= 24) {
      label = 'Extreme Fear';
      colorClass = 'text-red-600';
    } else if (value <= 44) {
      label = 'Fear';
      colorClass = 'text-orange-600';
    } else if (value <= 55) {
      label = 'Neutral';
      colorClass = 'text-yellow-600';
    } else if (value <= 75) {
      label = 'Greed';
      colorClass = 'text-green-600';
    } else {
      label = 'Extreme Greed';
      colorClass = 'text-green-700';
    }
    
    return { label, colorClass };
  }, [data.value, data.status]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Fear & Greed Index</h3>
        <span className="text-xs text-gray-400">{data.source}</span>
      </div>
      
      <div className="relative flex items-center justify-center">
        {/* Gauge Chart */}
        <div style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={450}
                innerRadius="70%"
                outerRadius="90%"
                paddingAngle={0}
                dataKey="value"
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              {showTooltip && (
                <Tooltip 
                  content={({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number }> }) => {
                    if (active && payload && payload.length && payload[0].name === 'value') {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                          <span className="text-sm font-medium text-gray-900">
                            {data.value}/100
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-gray-900">
            {data.value}
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
      <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
        <span>Fear</span>
        <span>Neutral</span>
        <span>Greed</span>
      </div>
    </div>
  );
};