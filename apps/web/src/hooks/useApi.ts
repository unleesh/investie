'use client';

import { useState, useEffect } from 'react';
import type { MarketSummaryData, StockCardData, StockSymbol } from '@investie/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Custom hook for API calls
export function useApi<T>(
  endpoint: string,
  options?: RequestInit
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, options]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

// Market Summary hook
export function useMarketSummary() {
  return useApi<MarketSummaryData>('/api/v1/market-summary');
}

// Stock data hook
export function useStock(symbol: StockSymbol) {
  return useApi<StockCardData>(`/api/v1/stocks/${symbol}`);
}

// All stocks hook
export function useAllStocks() {
  return useApi<StockCardData[]>('/api/v1/stocks');
}

// Stock chart data hook
export function useStockChart(symbol: StockSymbol, period: string = '1W') {
  return useApi<{ data: number[]; timeLabels: string[] }>(`/api/v1/stocks/${symbol}/chart?period=${period}`);
}

// Chat hooks
export function useChatSessions() {
  return useApi<Array<{ id: string; title: string; lastMessage?: string }>>('/api/v1/chat/sessions');
}

// Health check hook
export function useHealthCheck() {
  return useApi<{ status: string; message: string; timestamp: string }>('/api/v1/health');
}