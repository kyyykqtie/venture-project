import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5,
      },
      {
        name: 'pdf',
        ttl: 60000, // 1 minute
        limit: 3,
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class RateLimitModule {}
