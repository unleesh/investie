import { Injectable, Logger } from '@nestjs/common';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheItem<any>>();

  async get<T>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache item expired and removed: ${key}`);
      return undefined;
    }

    this.logger.debug(`Cache hit: ${key}`);
    return item.data;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 86400): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    this.cache.set(key, {
      data: value,
      expiresAt,
    });

    this.logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`);
  }

  async del(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache item deleted: ${key}`);
    }
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cache cleared: ${size} items removed`);
  }

  getCacheStats(): {
    size: number;
    items: Array<{ key: string; expiresAt: Date; isExpired: boolean }>;
  } {
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      expiresAt: new Date(item.expiresAt),
      isExpired: Date.now() > item.expiresAt,
    }));

    return {
      size: this.cache.size,
      items,
    };
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