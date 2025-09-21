/**
 * 🏗️ INFRASTRUCTURE MODULE - Production Ready
 * ✅ Clean Architecture compliant
 * ✅ Only real services and repositories - NO MOCKS
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Infrastructure modules - Only existing ones
import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { PinoLoggerModule } from './logging/pino-logger.module';
import { MappersModule } from './mappers/mappers.module';
import { AuthInfrastructureModule } from './modules/auth-infrastructure.module';
import { UseCasesModule } from './modules/use-cases.module';

// Shared constants

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Infrastructure modules
    DatabaseModule, // ✅ Provides USER_REPOSITORY, BUSINESS_SECTOR_REPOSITORY
    CacheModule, // ✅ Provides CACHE_SERVICE, USER_CACHE_SERVICE
    PinoLoggerModule, // ✅ Provides LOGGER
    MappersModule, // ✅ Provides domain mappers
    HealthModule, // ✅ Health checks

    // Business modules
    AuthInfrastructureModule, // ✅ Provides AUTH_SERVICE, PASSWORD_SERVICE, AUTH use cases
    UseCasesModule, // ✅ Provides all business use cases
  ],
  providers: [
    // No direct providers - everything comes from modules
  ],
  exports: [
    // Database and repositories
    DatabaseModule,

    // Cache services
    CacheModule,

    // Logging
    PinoLoggerModule,

    // Domain mappers
    MappersModule,

    // Authentication and business logic
    AuthInfrastructureModule,
    UseCasesModule,

    // Health checks
    HealthModule,
  ],
})
export class InfrastructureModule {}
