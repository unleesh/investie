// Stock validation helper for NewsService
import axios from 'axios';

export interface ValidationResult {
  isValid: boolean;
  symbol: string;
  method: string;
  reason?: string;
  error?: string;
  price?: number;
}

export class StockValidatorHelper {
  private knownValidSymbols = new Set([
    // Major US Stocks
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'INTC',
    'NFLX', 'UBER', 'LYFT', 'SNAP', 'TWTR', 'SHOP', 'PYPL', 'SQ', 'ZOOM', 'CRM',
    'ORCL', 'IBM', 'CSCO', 'ADBE', 'NOW', 'WDAY', 'OKTA', 'ZM', 'DOCU', 'PLTR',
    'COIN', 'HOOD', 'RBLX', 'U', 'DDOG', 'CRWD', 'ZS', 'SNOW', 'MDB', 'TEAM',
    
    // Traditional Stocks
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'AXP', 'COF',
    'JNJ', 'PFE', 'UNH', 'ABBV', 'BMY', 'MRK', 'GILD', 'AMGN', 'CVS', 'WBA',
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'VLO', 'PSX', 'OXY', 'KMI',
    'KO', 'PEP', 'WMT', 'TGT', 'HD', 'LOW', 'MCD', 'SBUX', 'NKE', 'DIS',
    
    // ETFs
    'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'IVV', 'VEA', 'VWO', 'AGG', 'BND'
  ]);

  // Check against known valid symbols (fastest)
  isKnownValidSymbol(symbol: string): ValidationResult {
    const upperSymbol = symbol.toUpperCase().trim();
    return {
      isValid: this.knownValidSymbols.has(upperSymbol),
      method: 'known_symbols',
      symbol: upperSymbol,
      reason: this.knownValidSymbols.has(upperSymbol) ? 'Found in known symbols' : 'Not in known symbols'
    };
  }

  // Basic format validation
  hasValidFormat(symbol: string): ValidationResult {
    const upperSymbol = symbol.toUpperCase().trim();
    const isValidFormat = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(upperSymbol);
    
    return {
      isValid: isValidFormat,
      method: 'format_check',
      symbol: upperSymbol,
      reason: isValidFormat ? 'Valid format' : 'Invalid format (must be 1-5 letters)'
    };
  }

  // Yahoo Finance API validation (free, no key needed)
  async validateWithYahooFinance(symbol: string): Promise<ValidationResult> {
    try {
      const upperSymbol = symbol.toUpperCase().trim();
      
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${upperSymbol}`,
        {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const chart = response.data.chart;
      const isValid = chart && chart.result && chart.result.length > 0 && 
                     !chart.result[0].meta.error;
      
      if (isValid) {
        const meta = chart.result[0].meta;
        return {
          isValid: true,
          method: 'yahoo_finance_api',
          symbol: upperSymbol,
          reason: 'Found market data',
          price: meta.regularMarketPrice
        };
      }
      
      return {
        isValid: false,
        method: 'yahoo_finance_api',
        symbol: upperSymbol,
        reason: 'No market data found'
      };
      
    } catch (error) {
      return {
        isValid: false,
        method: 'yahoo_finance_api',
        symbol: symbol.toUpperCase(),
        error: axios.isAxiosError(error) && error.response?.status === 404 
          ? 'Symbol not found' 
          : (error as Error).message
      };
    }
  }

  // Comprehensive validation (multi-tier)
  async validateSymbol(symbol: string): Promise<ValidationResult> {
    // Step 1: Format check
    const formatResult = this.hasValidFormat(symbol);
    if (!formatResult.isValid) {
      return formatResult;
    }

    // Step 2: Known symbols (fastest)
    const knownResult = this.isKnownValidSymbol(symbol);
    if (knownResult.isValid) {
      return knownResult;
    }

    // Step 3: API validation
    const apiResult = await this.validateWithYahooFinance(symbol);
    return apiResult;
  }

  // Get suggestions for invalid symbols
  getSuggestions(invalidSymbol: string): string[] {
    const upper = invalidSymbol.toUpperCase();
    const suggestions: string[] = [];
    
    for (const validSymbol of this.knownValidSymbols) {
      if (validSymbol.includes(upper) || upper.includes(validSymbol)) {
        suggestions.push(validSymbol);
      }
      if (suggestions.length >= 5) break;
    }
    
    return suggestions;
  }
}