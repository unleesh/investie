export declare class CacheService {
    private readonly logger;
    private cache;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    getCacheStats(): {
        size: number;
        items: Array<{
            key: string;
            expiresAt: Date;
            isExpired: boolean;
        }>;
    };
    private cleanupExpiredItems;
    startCleanupTimer(): void;
}
