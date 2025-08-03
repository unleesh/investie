import React from 'react';
import { View, Text } from 'react-native';
import type { StockPriceChart } from '@investie/types';

interface StockPriceChartProps {
  data: StockPriceChart;
  width?: number;
  height?: number;
}

export const StockPriceChart: React.FC<StockPriceChartProps> = ({ 
  data, 
  width = 250, 
  height = 120 
}) => {
  const trendColor = data.trend === 'up' ? '#22c55e' : data.trend === 'down' ? '#ef4444' : '#6b7280';
  
  return (
    <View 
      style={{
        width,
        height,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
      }}
    >
      <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
        Stock Price Chart Stub
      </Text>
      <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
        Period: {data.period}
      </Text>
      <Text style={{ color: trendColor, fontSize: 12, marginTop: 2 }}>
        Trend: {data.trend} ({data.changePercent.toFixed(2)}%)
      </Text>
      <Text style={{ color: '#9ca3af', fontSize: 10, marginTop: 2 }}>
        {data.data.length} data points
      </Text>
    </View>
  );
};