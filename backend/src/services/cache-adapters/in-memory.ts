import { CacheAdapter } from "@/interfaces/cache-adapter";

interface CacheEntry<T> {
    value: T;
    expiresAt?: number;
}

export class InMemoryCache implements CacheAdapter {
    private cache: Map<string, CacheEntry<any>> = new Map();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        const entry: CacheEntry<T> = { value };

        if (ttl) {
            entry.expiresAt = Date.now() + ttl * 1000;
        }

        this.cache.set(key, entry);
    }

    async delete(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }
}