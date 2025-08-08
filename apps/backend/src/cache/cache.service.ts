import { Injectable, Logger } from '@nestjs/common';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

interface CacheStats {
  totalItems: number;
  hitRate: number;
  memoryUsage: string;
  itemsByType: Record<string, number>;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheItem<any>>();
  private hits = 0;
  private misses = 0;

  // TTL constants (seconds)
  private readonly TTL = {
    ECONOMIC_DATA: 24 * 60 * 60, // 24 hours
    AI_CONTENT: 12 * 60 * 60,    // 12 hours  
    NEWS_DATA: 6 * 60 * 60,      // 6 hours
    CHAT_CONTEXT: 1 * 60 * 60,   // 1 hour
    STOCK_DATA: 5 * 60,          // 5 minutes
    CHART_DATA: 1 * 60 * 60,     // 1 hour
  };

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      this.logger.debug(`Cache item expired and removed: ${key}`);
      return null;
    }

    this.hits++;
    return item.data as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds || this.getDefaultTTL(key);
    const expiresAt = Date.now() + (ttl * 1000);
    
    this.cache.set(key, {
      data: value,
      expiresAt,
    });

    this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
  }

  async del(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache item deleted: ${key}`);
    }
  }

  // Synchronous version for compatibility
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.logger.log(`Cache cleared: ${size} items removed`);
  }

  // Specific caching methods with proper TTL
  setEconomicData<T>(key: string, data: T): void {
    this.set(`economic:${key}`, data, this.TTL.ECONOMIC_DATA * 1000);
  }

  getEconomicData<T>(key: string): T | null {
    return this.get<T>(`economic:${key}`);
  }

  setAIContent<T>(key: string, data: T): void {
    this.set(`ai:${key}`, data, this.TTL.AI_CONTENT * 1000);
  }

  getAIContent<T>(key: string): T | null {
    return this.get<T>(`ai:${key}`);
  }

  setNewsData<T>(key: string, data: T): void {
    this.set(`news:${key}`, data, this.TTL.NEWS_DATA * 1000);
  }

  getNewsData<T>(key: string): T | null {
    return this.get<T>(`news:${key}`);
  }

  setStockData<T>(key: string, data: T): void {
    this.set(`stock:${key}`, data, this.TTL.STOCK_DATA * 1000);
  }

  getStockData<T>(key: string): T | null {
    return this.get<T>(`stock:${key}`);
  }

  setChatContext<T>(key: string, data: T): void {
    this.set(`chat:${key}`, data, this.TTL.CHAT_CONTEXT * 1000);
  }

  getChatContext<T>(key: string): T | null {
    return this.get<T>(`chat:${key}`);
  }

  setChartData<T>(key: string, data: T): void {
    this.set(`chart:${key}`, data, this.TTL.CHART_DATA * 1000);
  }

  getChartData<T>(key: string): T | null {
    return this.get<T>(`chart:${key}`);
  }

  getCacheStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    const itemsByType: Record<string, number> = {};
    for (const key of this.cache.keys()) {
      const type = key.split(':')[0];
      itemsByType[type] = (itemsByType[type] || 0) + 1;
    }

    return {
      totalItems: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: `${Math.round(this.estimateMemoryUsage() / 1024 / 1024 * 100) / 100}MB`,
      itemsByType,
    };
  }

  private getDefaultTTL(key: string): number {
    if (key.startsWith('economic:')) return this.TTL.ECONOMIC_DATA;
    if (key.startsWith('ai:')) return this.TTL.AI_CONTENT;
    if (key.startsWith('news:')) return this.TTL.NEWS_DATA;
    if (key.startsWith('chat:')) return this.TTL.CHAT_CONTEXT;
    if (key.startsWith('stock:')) return this.TTL.STOCK_DATA;
    if (key.startsWith('chart:')) return this.TTL.CHART_DATA;
    
    return 5 * 60; // Default 5 minutes
  }

  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // UTF-16 characters
      size += JSON.stringify(item).length * 2;
    }
    return size;
  }

  // Cleanup expired items periodically
  private cleanupExpiredItems(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired cache items`);
    }
  }

  // Auto-cleanup every 5 minutes
  startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredItems();
    }, 5 * 60 * 1000); // 5 minutes
    
    this.logger.log('Cache cleanup timer started (5 minute intervals)');
  }
}