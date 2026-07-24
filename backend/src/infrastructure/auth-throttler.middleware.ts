import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectThrottlerStorage, ThrottlerStorage } from '@nestjs/throttler';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthThrottlerMiddleware implements NestMiddleware {
  constructor(
    @InjectThrottlerStorage() private readonly storage: ThrottlerStorage,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const limit = 5;
    const ttl = 60000; // 1 minute (in milliseconds)
    const key = `auth:${ip}`;

    try {
      const record = await this.storage.increment(
        key,
        ttl,
        limit,
        ttl, // blockDuration
        'auth',
      );

      if (record.totalHits > limit) {
        res.status(429).json({
          statusCode: 429,
          message: 'Too Many Requests',
          error: 'ThrottlerException: Too Many Requests',
        });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}
