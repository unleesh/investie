import React from 'react';
import { View, Text } from 'react-native';

interface LineChartProps {
  data?: any[];
  width?: number;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, width = 200, height = 100 }) => {
  return (
    <View 
      style={{
        width,
        height,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
      }}
    >
      <Text style={{ color: '#666', fontSize: 14 }}>Line Chart Stub</Text>
      <Text style={{ color: '#999', fontSize: 12 }}>
        {data ? `${data.length} data points` : 'No data'}
      </Text>
    </View>
  );
};