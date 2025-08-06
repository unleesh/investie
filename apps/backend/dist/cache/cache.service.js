"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = CacheService_1 = class CacheService {
    logger = new common_1.Logger(CacheService_1.name);
    cache = new Map();
    async get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return undefined;
        }
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.logger.debug(`Cache item expired and removed: ${key}`);
            return undefined;
        }
        this.logger.debug(`Cache hit: ${key}`);
        return item.data;
    }
    async set(key, value, ttlSeconds = 86400) {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, {
            data: value,
            expiresAt,
        });
        this.logger.debug(`Cache set: ${key} (TTL: ${ttlSeconds}s)`);
    }
    async del(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.logger.debug(`Cache item deleted: ${key}`);
        }
    }
    async clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.logger.log(`Cache cleared: ${size} items removed`);
    }
    getCacheStats() {
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
    cleanupExpiredItems() {
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
    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpiredItems();
        }, 5 * 60 * 1000);
        this.logger.log('Cache cleanup timer started (5 minute intervals)');
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map