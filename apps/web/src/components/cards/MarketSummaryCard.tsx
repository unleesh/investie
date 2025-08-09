import React from 'react';
import type { MarketSummaryData } from '@investie/types';
import { Card } from '../ui/Card';
import { FearGreedGauge } from '../charts/FearGreedGauge';
import { SP500Sparkline } from '../charts/SP500Sparkline';

interface MarketSummaryCardProps {
  data?: MarketSummaryData;
  isLoading?: boolean;
}

export const MarketSummaryCard: React.FC<MarketSummaryCardProps> = ({ data, isLoading = false }) => {
  if (isLoading || !data) {
    return (
      <Card>
        <div className="animate-pulse">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Market Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Market Summary</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time market indicators with AI insights</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Fear & Greed Index - Enhanced with Gauge */}
        <div className="md:col-span-1">
          <FearGreedGauge data={data.fearGreedIndex} size={140} />
        </div>

        {/* S&P 500 Sparkline - Enhanced with Chart */}
        <div className="md:col-span-1">
          <SP500Sparkline data={data.sp500Sparkline} height={80} />
        </div>

        {/* VIX */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">VIX Volatility Index</h3>
            <span className="text-xs text-gray-400">{data.vix.source}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.vix.value}</div>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium uppercase px-2 py-1 rounded-full ${
              data.vix.status === 'high' ? 'bg-red-100 text-red-700' :
              data.vix.status === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {data.vix.status} volatility
            </span>
            <div className="text-xs text-gray-500">
              {data.vix.status === 'high' ? 'Market stress detected' :
               data.vix.status === 'medium' ? 'Moderate uncertainty' :
               'Low market fear'}
            </div>
          </div>
        </div>

        {/* Interest Rate with AI Outlook */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Fed Interest Rate</h3>
            <span className="text-xs text-gray-400">{data.interestRate.source}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{data.interestRate.value}%</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 text-sm font-medium">🤖 AI Outlook:</div>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed mt-1">
              {data.interestRate.aiOutlook}
            </p>
          </div>
        </div>

        {/* CPI */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Consumer Price Index</h3>
            <span className="text-xs text-gray-400">{data.cpi.source}</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-gray-900">{data.cpi.value}%</span>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              data.cpi.direction === 'up' ? 'text-red-600' : 'text-green-600'
            }`}>
              <span>{data.cpi.direction === 'up' ? '↑' : '↓'}</span>
              <span>{Math.abs(data.cpi.monthOverMonth)}% MoM</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {data.cpi.direction === 'up' ? 'Inflation pressure increasing' : 'Inflation cooling down'}
          </div>
        </div>

        {/* Unemployment Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Unemployment Rate</h3>
            <span className="text-xs text-gray-400">{data.unemploymentRate.source}</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-gray-900">{data.unemploymentRate.value}%</span>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              data.unemploymentRate.monthOverMonth > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              <span>{data.unemploymentRate.monthOverMonth > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(data.unemploymentRate.monthOverMonth)}% MoM</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {data.unemploymentRate.monthOverMonth > 0 ? 'Job market softening' : 
             data.unemploymentRate.monthOverMonth < 0 ? 'Job market strengthening' : 
             'Job market stable'}
          </div>
        </div>
      </div>

      {/* Market Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Data sources: FRED, Google Finance, Claude AI</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </Card>
  );
};