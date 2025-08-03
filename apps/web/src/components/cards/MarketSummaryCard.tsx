import React from 'react';
import type { MarketSummaryData } from '@investie/types';
import { Card } from '../ui/Card';

interface MarketSummaryCardProps {
  data?: MarketSummaryData;
}

export const MarketSummaryCard: React.FC<MarketSummaryCardProps> = ({ data }) => {
  if (!data) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Summary</h2>
        <div className="text-gray-500">Loading market data...</div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Market Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fear & Greed Index */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Fear & Greed Index</h3>
          <div className="text-2xl font-bold text-gray-900">{data.fearGreedIndex.value}</div>
          <div className={`text-sm font-medium uppercase ${
            data.fearGreedIndex.status === 'fear' ? 'text-red-600' :
            data.fearGreedIndex.status === 'greed' ? 'text-green-600' :
            'text-gray-600'
          }`}>
            {data.fearGreedIndex.status}
          </div>
        </div>

        {/* VIX */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">VIX</h3>
          <div className="text-2xl font-bold text-gray-900">{data.vix.value}</div>
          <div className="text-sm text-gray-500">
            Volatility: {data.vix.status}
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Interest Rate</h3>
          <div className="text-2xl font-bold text-gray-900">{data.interestRate.value}%</div>
          <div className="text-sm italic text-gray-600">
            AI: {data.interestRate.aiOutlook}
          </div>
        </div>

        {/* CPI */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">CPI</h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">{data.cpi.value}%</span>
            <span className={`text-sm ${data.cpi.direction === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {data.cpi.direction === 'up' ? '↑' : '↓'} {data.cpi.monthOverMonth}%
            </span>
          </div>
        </div>

        {/* Unemployment */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Unemployment</h3>
          <div className="text-2xl font-bold text-gray-900">{data.unemploymentRate.value}%</div>
          <div className="text-sm text-gray-500">
            MoM: {data.unemploymentRate.monthOverMonth}%
          </div>
        </div>

        {/* S&P 500 Sparkline */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">S&P 500 Trend</h3>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              data.sp500Sparkline.weeklyTrend === 'up' ? 'text-green-600' :
              data.sp500Sparkline.weeklyTrend === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              Weekly: {data.sp500Sparkline.weeklyTrend}
            </span>
            <span className="text-xs text-gray-400">
              {data.sp500Sparkline.data.length} points
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};