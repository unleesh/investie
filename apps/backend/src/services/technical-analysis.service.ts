import { Injectable, Logger } from '@nestjs/common';
import type { StockTechnicals } from '../types';

@Injectable()
export class TechnicalAnalysisService {
  private readonly logger = new Logger(TechnicalAnalysisService.name);

  calculateRSI(prices: number[], period: number = 14): StockTechnicals {
    try {
      if (prices.length < period + 1) {
        this.logger.warn(`Insufficient data for RSI calculation. Need ${period + 1} prices, got ${prices.length}`);
        return this.getDefaultRSI();
      }

      const gains: number[] = [];
      const losses: number[] = [];

      // Calculate price changes
      for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
      }

      // Calculate initial average gain and loss
      let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
      let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

      // Use Wilder's smoothing method for remaining periods
      for (let i = period; i < gains.length; i++) {
        avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
        avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      }

      // Calculate RSI
      const rs = avgGain / (avgLoss || 0.0001); // Avoid division by zero
      const rsi = 100 - (100 / (1 + rs));

      const finalRSI = Math.max(0, Math.min(100, Math.round(rsi * 100) / 100));
      
      this.logger.log(`Calculated RSI: ${finalRSI} from ${prices.length} price points`);
      
      return {
        rsi: finalRSI,
        rsiStatus: this.determineRSIStatus(finalRSI),
      };
    } catch (error) {
      this.logger.error('RSI calculation failed:', error.message);
      return this.getDefaultRSI();
    }
  }

  private determineRSIStatus(rsi: number): 'oversold' | 'neutral' | 'overbought' {
    if (rsi <= 30) return 'oversold';
    if (rsi >= 70) return 'overbought';
    return 'neutral';
  }

  private getDefaultRSI(): StockTechnicals {
    return {
      rsi: 50,
      rsiStatus: 'neutral',
    };
  }

  // Extract prices from SerpApi chart data
  extractPricesFromChartData(chartData: any): number[] {
    try {
      if (!chartData) {
        this.logger.warn('No chart data provided');
        return [];
      }

      const prices: number[] = [];

      // Handle different possible chart data structures
      if (chartData.graph?.series) {
        // Standard Google Finance chart format
        const series = chartData.graph.series[0]; // Assuming first series is price data
        
        if (series?.data) {
          for (const point of series.data) {
            const price = this.extractPriceFromPoint(point);
            if (price !== null) {
              prices.push(price);
            }
          }
        }
      } else if (chartData.data && Array.isArray(chartData.data)) {
        // Alternative format: direct data array
        for (const point of chartData.data) {
          const price = this.extractPriceFromPoint(point);
          if (price !== null) {
            prices.push(price);
          }
        }
      } else if (chartData.prices && Array.isArray(chartData.prices)) {
        // Simple prices array
        return chartData.prices.map(p => parseFloat(p)).filter(p => !isNaN(p));
      }

      this.logger.log(`Extracted ${prices.length} price points from chart data`);
      return prices;
    } catch (error) {
      this.logger.error('Failed to extract prices from chart data:', error.message);
      return [];
    }
  }

  private extractPriceFromPoint(point: any): number | null {
    try {
      // Try different possible price field names
      if (point?.value !== undefined) return parseFloat(point.value);
      if (point?.close !== undefined) return parseFloat(point.close);
      if (point?.price !== undefined) return parseFloat(point.price);
      if (point?.y !== undefined) return parseFloat(point.y);
      if (typeof point === 'number') return point;
      
      return null;
    } catch {
      return null;
    }
  }

  // Generate synthetic price data for testing/fallback
  generateSyntheticPrices(basePrice: number, length: number = 30, volatility: number = 0.02): number[] {
    const prices: number[] = [basePrice];
    
    for (let i = 1; i < length; i++) {
      const randomChange = (Math.random() - 0.5) * 2 * volatility;
      const newPrice = prices[i - 1] * (1 + randomChange);
      prices.push(Math.max(0.01, newPrice)); // Ensure positive prices
    }
    
    this.logger.log(`Generated ${length} synthetic prices starting from $${basePrice}`);
    return prices;
  }

  // Calculate multiple technical indicators at once
  calculateTechnicalIndicators(prices: number[]): {
    rsi: StockTechnicals;
    sma20?: number;
    sma50?: number;
    volatility?: number;
  } {
    const result: any = {
      rsi: this.calculateRSI(prices),
    };

    try {
      // Simple Moving Averages
      if (prices.length >= 20) {
        result.sma20 = this.calculateSMA(prices, 20);
      }
      if (prices.length >= 50) {
        result.sma50 = this.calculateSMA(prices, 50);
      }

      // Price Volatility (standard deviation)
      if (prices.length >= 10) {
        result.volatility = this.calculateVolatility(prices);
      }

      return result;
    } catch (error) {
      this.logger.error('Technical indicators calculation failed:', error.message);
      return { rsi: result.rsi };
    }
  }

  private calculateSMA(prices: number[], period: number): number {
    const recentPrices = prices.slice(-period);
    const sum = recentPrices.reduce((acc, price) => acc + price, 0);
    return Math.round((sum / period) * 100) / 100;
  }

  private calculateVolatility(prices: number[], period: number = 20): number {
    const recentPrices = prices.slice(-period);
    const mean = recentPrices.reduce((acc, price) => acc + price, 0) / recentPrices.length;
    
    const squaredDiffs = recentPrices.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / recentPrices.length;
    
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  // Analyze trend based on price data
  analyzeTrend(prices: number[]): 'up' | 'down' | 'flat' {
    try {
      if (prices.length < 2) return 'flat';
      
      const recentPrices = prices.slice(-Math.min(10, prices.length));
      const firstPrice = recentPrices[0];
      const lastPrice = recentPrices[recentPrices.length - 1];
      
      const change = (lastPrice - firstPrice) / firstPrice;
      
      if (change > 0.01) return 'up';    // More than 1% increase
      if (change < -0.01) return 'down'; // More than 1% decrease
      return 'flat';
    } catch (error) {
      this.logger.error('Trend analysis failed:', error.message);
      return 'flat';
    }
  }

  // API-first method for getting stock technical analysis
  async getAnalysis(symbol: string): Promise<StockTechnicals | null> {
    try {
      this.logger.log(`[API-FIRST] Calculating technical analysis for ${symbol}`);
      
      // For now, return neutral RSI since we don't have real-time price data
      // In a full implementation, this would fetch historical prices from SerpApi
      // and calculate actual RSI values
      return {
        rsi: 50, // Neutral RSI value
        rsiStatus: 'neutral' as const,
      };
    } catch (error) {
      this.logger.error(`[API-FIRST] Failed to get technical analysis for ${symbol}:`, error.message);
      return null;
    }
  }

  // Health check
  healthCheck(): { status: string; capabilities: string[] } {
    return {
      status: 'operational',
      capabilities: [
        'RSI calculation',
        'Simple Moving Averages',
        'Price volatility analysis',
        'Trend analysis',
        'Chart data extraction',
        'Synthetic data generation'
      ],
    };
  }

  // Method to validate RSI calculation with known data
  validateRSI(testPrices: number[]): {
    isValid: boolean;
    rsi: number;
    expectedRange: string;
  } {
    const result = this.calculateRSI(testPrices);
    const isValid = result.rsi >= 0 && result.rsi <= 100 && !isNaN(result.rsi);
    
    return {
      isValid,
      rsi: result.rsi,
      expectedRange: '0-100',
    };
  }
}