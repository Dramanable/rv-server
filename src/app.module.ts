import { Module } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PresentationModule } from './presentation/presentation.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
// 🛡️ Security imports
import { JwtAuthGuard } from './presentation/security/auth.guard';
import { SecurityValidationPipe } from './presentation/security/validation.pipe';

@Module({
  imports: [
    // 🛡️ Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute par IP
      },
      {
        name: 'auth',
        ttl: 300000, // 5 minutes
        limit: 10, // 10 auth requests per 5 minutes par IP
      },
    ]),
    InfrastructureModule,
    PresentationModule,
  ],
  controllers: [],
  providers: [
    // 🛡️ Global security providers
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 🔐 JWT guard global (avec @Public() pour bypass)
    },
    {
      provide: APP_PIPE,
      useClass: SecurityValidationPipe, // 🧹 Validation/sanitization globale
    },
  ],
})
export class AppModule {}
