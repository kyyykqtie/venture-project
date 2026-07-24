import { Injectable } from '@nestjs/common';

interface CacheEntry {
  pdfBase64: string;
  expiresAt: number;
}

@Injectable()
export class PdfCacheService {
  private cache = new Map<string, CacheEntry>();

  set(key: string, value: string, ttlSeconds: number) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { pdfBase64: value, expiresAt });
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.pdfBase64;
  }
}
