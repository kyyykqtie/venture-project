import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { DATABASE_CONNECTION } from './database/database.connection';
import { UserModule } from './user/user.module';
import { DepartmentModule } from './department/department.module';
import { PurchaseRequestsModule } from './permissions/request/request-creation.module';
import { ApprovalsModule } from './permissions/approvals/approvals.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    UserModule,
    DepartmentModule,
    PurchaseRequestsModule,
    ApprovalsModule,
    ConfigModule.forRoot(),
    AuthModule.forRootAsync({
      imports: [DatabaseModule, ConfigModule],
      useFactory: (database: NodePgDatabase, configService: ConfigService) => ({
        auth: betterAuth({
          plugins: [admin()],
          database: drizzleAdapter(database, {
            provider: 'pg',
          }),
          emailAndPassword: {
            enabled: true,
          },
          trustedOrigins: [
            configService.getOrThrow('UI_URL'),
            'http://localhost:5173',
          ],
        }),
      }),
      inject: [DATABASE_CONNECTION, ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
