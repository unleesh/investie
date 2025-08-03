import React from 'react';
import { View, Text } from 'react-native';
import type { MarketSummaryData } from '@investie/types';
import { Card } from '../ui/Card';

interface MarketSummaryCardProps {
  data?: MarketSummaryData;
}

export const MarketSummaryCard: React.FC<MarketSummaryCardProps> = ({ data }) => {
  if (!data) {
    return (
      <Card>
        <Text style={{ 
          color: '#1f2937', 
          fontSize: 18, 
          fontWeight: '600',
          marginBottom: 8 
        }}>
          Market Summary
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 14 }}>
          Loading market data...
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={{ 
        color: '#1f2937', 
        fontSize: 18, 
        fontWeight: '600',
        marginBottom: 12 
      }}>
        Market Summary
      </Text>
      
      {/* Fear & Greed Index */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
          Fear & Greed Index: {data.fearGreedIndex.value}
        </Text>
        <Text style={{ 
          color: data.fearGreedIndex.status === 'fear' ? '#ef4444' : 
                data.fearGreedIndex.status === 'greed' ? '#22c55e' : '#6b7280',
          fontSize: 12,
          textTransform: 'uppercase'
        }}>
          {data.fearGreedIndex.status}
        </Text>
      </View>

      {/* VIX */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
          VIX: {data.vix.value}
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 12 }}>
          Volatility: {data.vix.status}
        </Text>
      </View>

      {/* Interest Rate with AI Outlook */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
          Interest Rate: {data.interestRate.value}%
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 12, fontStyle: 'italic' }}>
          AI Outlook: {data.interestRate.aiOutlook}
        </Text>
      </View>

      {/* CPI & Unemployment */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginBottom: 8 
      }}>
        <View>
          <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
            CPI: {data.cpi.value}%
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            {data.cpi.direction === 'up' ? '↑' : '↓'} {data.cpi.monthOverMonth}%
          </Text>
        </View>
        <View>
          <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
            Unemployment: {data.unemploymentRate.value}%
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            MoM: {data.unemploymentRate.monthOverMonth}%
          </Text>
        </View>
      </View>

      {/* S&P 500 Sparkline */}
      <View>
        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
          S&P 500 Trend
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 4
        }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            Weekly: {data.sp500Sparkline.weeklyTrend}
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: 10 }}>
            Sparkline: {data.sp500Sparkline.data.length} points
          </Text>
        </View>
      </View>
    </Card>
  );
};