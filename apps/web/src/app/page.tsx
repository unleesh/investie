import React from 'react';
import { MarketSummaryCard } from '@/components/cards/MarketSummaryCard';
import { StockCard } from '@/components/cards/StockCard';
import { AIChatbot } from '@/components/ai/AIChatbot';
import { getMarketSummary, getStock } from '@investie/mock';

export default function Home() {
  const marketData = getMarketSummary();
  const appleStock = getStock('AAPL');
  const teslaStock = getStock('TSLA');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Hello Investie Web</h1>
          <p className="text-gray-300 mt-2">Phase 0 - Foundation Complete</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Market Summary */}
            <MarketSummaryCard data={marketData} />

            {/* Stock Cards */}
            <div className="space-y-6">
              {appleStock && <StockCard data={appleStock} />}
              {teslaStock && <StockCard data={teslaStock} />}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Watchlist Widget Placeholder */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Watchlist Widget
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">AAPL</span>
                    <span className="text-green-600">+1.21%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">TSLA</span>
                    <span className="text-red-600">-1.36%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">MSFT</span>
                    <span className="text-green-600">+1.24%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-4">
                  Widget stub - Phase 1 implementation
                </div>
              </div>

              {/* AI Chatbot */}
              <AIChatbot />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
