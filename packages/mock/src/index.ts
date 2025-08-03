import { MarketSummaryData, StockCardData, StockSymbol } from '@investie/types';
import marketSummaryData from './market-summary.json' with { type: 'json' };
import stocksData from './stocks.json' with { type: 'json' };

export const marketSummary: MarketSummaryData = marketSummaryData as MarketSummaryData;

export const stocks: Record<StockSymbol, StockCardData> = stocksData as Record<StockSymbol, StockCardData>;

export const getMarketSummary = (): MarketSummaryData => marketSummary;

export const getStock = (symbol: StockSymbol): StockCardData | undefined => stocks[symbol];

export const getAllStocks = (): StockCardData[] => Object.values(stocks);

export const getStocksBySymbols = (symbols: StockSymbol[]): StockCardData[] => 
  symbols.map(symbol => stocks[symbol]).filter(Boolean);

// Export individual JSON files for direct import
export { default as marketSummaryMock } from './market-summary.json' with { type: 'json' };
export { default as stocksMock } from './stocks.json' with { type: 'json' };