import { describe, test, expect } from 'vitest';
import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  formatPriceChange,
  formatDate,
  formatTime
} from './index';

describe('@investie/utils', () => {
  describe('formatCurrency', () => {
    test('should format currency values correctly', () => {
      expect(formatCurrency(123.45)).toBe('$123.45');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-123.45)).toBe('-$123.45');
    });

    test('should handle custom options', () => {
      const result = formatCurrency(123.456, { maximumFractionDigits: 3 });
      expect(result).toBe('$123.456');
    });
  });

  describe('formatPercentage', () => {
    test('should format percentage values correctly', () => {
      expect(formatPercentage(25)).toBe('25.00%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(-12.5)).toBe('-12.50%');
      expect(formatPercentage(100)).toBe('100.00%');
    });
  });

  describe('formatLargeNumber', () => {
    test('should format numbers with appropriate suffixes', () => {
      expect(formatLargeNumber(1500000000000)).toBe('$1.50T'); // 1.5 trillion
      expect(formatLargeNumber(2500000000)).toBe('$2.50B'); // 2.5 billion
      expect(formatLargeNumber(150000000)).toBe('$150.00M'); // 150 million
      expect(formatLargeNumber(2500000)).toBe('$2.50M'); // 2.5 million
      expect(formatLargeNumber(150000)).toBe('$150.00K'); // 150 thousand
      expect(formatLargeNumber(2500)).toBe('$2.50K'); // 2.5 thousand
      expect(formatLargeNumber(123.45)).toBe('$123.45'); // under 1K
    });
  });

  describe('formatPriceChange', () => {
    test('should format positive price changes', () => {
      const result = formatPriceChange(2.34, 1.21);
      expect(result.change).toBe('+2.34');
      expect(result.changePercent).toBe('+1.21%');
      expect(result.isPositive).toBe(true);
      expect(result.isNegative).toBe(false);
      expect(result.isNeutral).toBe(false);
    });

    test('should format negative price changes', () => {
      const result = formatPriceChange(-3.42, -1.36);
      expect(result.change).toBe('-3.42');
      expect(result.changePercent).toBe('-1.36%');
      expect(result.isPositive).toBe(false);
      expect(result.isNegative).toBe(true);
      expect(result.isNeutral).toBe(false);
    });

    test('should format neutral price changes', () => {
      const result = formatPriceChange(0, 0);
      expect(result.change).toBe('0.00');
      expect(result.changePercent).toBe('0.00%');
      expect(result.isPositive).toBe(false);
      expect(result.isNegative).toBe(false);
      expect(result.isNeutral).toBe(true);
    });
  });

  describe('formatDate', () => {
    test('should format dates correctly', () => {
      const dateString = '2025-02-03T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toBe('Feb 3, 2025');
    });

    test('should handle custom date format options', () => {
      const dateString = '2025-02-03T10:30:00Z';
      const result = formatDate(dateString, { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      expect(result).toContain('Feb 3');
    });
  });

  describe('formatTime', () => {
    test('should format time correctly', () => {
      const dateString = '2025-02-03T14:30:00Z';
      const result = formatTime(dateString);
      // Time format can vary by system locale, so just check it contains expected elements
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });
  });

  describe('integration tests', () => {
    test('should work with realistic stock data', () => {
      // Test with Apple stock data
      const price = 195.89;
      const change = 2.34;
      const changePercent = 1.21;
      const marketCap = 3050000000000;
      
      expect(formatCurrency(price)).toBe('$195.89');
      expect(formatLargeNumber(marketCap)).toBe('$3.05T');
      
      const priceChange = formatPriceChange(change, changePercent);
      expect(priceChange.change).toBe('+2.34');
      expect(priceChange.changePercent).toBe('+1.21%');
      expect(priceChange.isPositive).toBe(true);
    });

    test('should work with Tesla stock data', () => {
      // Test with Tesla stock data (negative change)
      const price = 248.67;
      const change = -3.42;
      const changePercent = -1.36;
      const marketCap = 790000000000;
      
      expect(formatCurrency(price)).toBe('$248.67');
      expect(formatLargeNumber(marketCap)).toBe('$790.00B');
      
      const priceChange = formatPriceChange(change, changePercent);
      expect(priceChange.change).toBe('-3.42');
      expect(priceChange.changePercent).toBe('-1.36%');
      expect(priceChange.isNegative).toBe(true);
    });
  });
});