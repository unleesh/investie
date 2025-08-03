import React from 'react';
import { View, Text } from 'react-native';
import type { StockCardData } from '@investie/types';
import { Card } from '../ui/Card';
import { StockPriceChart } from '../charts/StockPriceChart';
import { AIEvaluationCard } from '../ai/AIEvaluationCard';

interface StockCardProps {
  data: StockCardData;
}

export const StockCard: React.FC<StockCardProps> = ({ data }) => {
  const priceChangeColor = data.price.change > 0 ? '#22c55e' : 
                          data.price.change < 0 ? '#ef4444' : '#6b7280';

  return (
    <Card>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12 
      }}>
        <View>
          <Text style={{ 
            color: '#1f2937', 
            fontSize: 18, 
            fontWeight: '600' 
          }}>
            {data.symbol}
          </Text>
          <Text style={{ 
            color: '#6b7280', 
            fontSize: 14,
            marginTop: 2 
          }}>
            {data.name}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ 
            color: '#1f2937', 
            fontSize: 18, 
            fontWeight: '600' 
          }}>
            ${data.price.current}
          </Text>
          <Text style={{ 
            color: priceChangeColor, 
            fontSize: 14,
            fontWeight: '500' 
          }}>
            {data.price.change > 0 ? '+' : ''}{data.price.change} ({data.price.changePercent}%)
          </Text>
        </View>
      </View>

      {/* Price Chart */}
      <StockPriceChart data={data.priceChart} />

      {/* AI Evaluation */}
      <AIEvaluationCard evaluation={data.aiEvaluation} />

      {/* Fundamentals */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ 
          color: '#374151', 
          fontSize: 14, 
          fontWeight: '500',
          marginBottom: 6 
        }}>
          Fundamentals
        </Text>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: 4 
        }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            P/E: {data.fundamentals.pe}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            Volume: {(data.fundamentals.volume / 1e6).toFixed(1)}M
          </Text>
        </View>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between' 
        }}>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            Market Cap: ${(data.fundamentals.marketCap / 1e12).toFixed(2)}T
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12 }}>
            RSI: {data.technicals.rsi}
          </Text>
        </View>
      </View>

      {/* News Summary */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ 
          color: '#374151', 
          fontSize: 14, 
          fontWeight: '500',
          marginBottom: 4 
        }}>
          Latest News
        </Text>
        <Text style={{ 
          color: '#6b7280', 
          fontSize: 12, 
          lineHeight: 16 
        }}>
          {data.newsSummary.headline}
        </Text>
        <Text style={{ 
          color: data.newsSummary.sentiment === 'positive' ? '#22c55e' : 
                data.newsSummary.sentiment === 'negative' ? '#ef4444' : '#6b7280',
          fontSize: 10,
          marginTop: 2,
          textTransform: 'uppercase'
        }}>
          {data.newsSummary.sentiment}
        </Text>
      </View>

      {/* Sector Performance */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ color: '#9ca3af', fontSize: 10 }}>
          Sector: {data.sectorPerformance.name} (
          <Text style={{ 
            color: data.sectorPerformance.weeklyChange > 0 ? '#22c55e' : '#ef4444' 
          }}>
            {data.sectorPerformance.weeklyChange > 0 ? '+' : ''}{data.sectorPerformance.weeklyChange}%
          </Text>
          )
        </Text>
      </View>
    </Card>
  );
};