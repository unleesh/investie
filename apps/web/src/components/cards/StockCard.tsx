import React from 'react';
import type { StockCardData } from '@investie/types';
import { Card } from '../ui/Card';
import { StockPriceChart } from '../charts/StockPriceChart';
import { AIEvaluationCard } from '../ai/AIEvaluationCard';

interface StockCardProps {
  data: StockCardData;
}

export const StockCard: React.FC<StockCardProps> = ({ data }) => {
  const priceChangeColor = data.price.change > 0 ? 'text-green-600' : 
                          data.price.change < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <Card>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{data.symbol}</h3>
          <p className="text-gray-600 mt-1">{data.name}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-gray-900">
            ${data.price.current}
          </div>
          <div className={`text-sm font-medium ${priceChangeColor}`}>
            {data.price.change > 0 ? '+' : ''}{data.price.change} ({data.price.changePercent}%)
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <StockPriceChart data={data.priceChart} />
      </div>

      {/* AI Evaluation */}
      <AIEvaluationCard evaluation={data.aiEvaluation} />

      {/* Fundamentals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">P/E Ratio</div>
          <div className="text-sm font-medium text-gray-900">{data.fundamentals.pe}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Volume</div>
          <div className="text-sm font-medium text-gray-900">
            {(data.fundamentals.volume / 1e6).toFixed(1)}M
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Market Cap</div>
          <div className="text-sm font-medium text-gray-900">
            ${(data.fundamentals.marketCap / 1e12).toFixed(2)}T
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">RSI</div>
          <div className={`text-sm font-medium ${
            data.technicals.rsiStatus === 'overbought' ? 'text-red-600' :
            data.technicals.rsiStatus === 'oversold' ? 'text-green-600' :
            'text-gray-900'
          }`}>
            {data.technicals.rsi}
          </div>
        </div>
      </div>

      {/* News Summary */}
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Latest News</h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          {data.newsSummary.headline}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium uppercase ${
            data.newsSummary.sentiment === 'positive' ? 'text-green-600' :
            data.newsSummary.sentiment === 'negative' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {data.newsSummary.sentiment}
          </span>
          <span className="text-xs text-gray-400">
            Sector: {data.sectorPerformance.name} (
            <span className={data.sectorPerformance.weeklyChange > 0 ? 'text-green-500' : 'text-red-500'}>
              {data.sectorPerformance.weeklyChange > 0 ? '+' : ''}{data.sectorPerformance.weeklyChange}%
            </span>
            )
          </span>
        </div>
      </div>
    </Card>
  );
};