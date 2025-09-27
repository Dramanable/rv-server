/**
 * 🏗️ Application Module - Clean Architecture
 * ✅ Configuration centralisée avec ConfigService
 * ✅ Environnements spécifiques (.env.development, .env.production, .env.test)
 * ✅ Security guards et pipes globaux
 */

import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ExceptionFiltersModule } from '@presentation/filters/exception-filters.module';
import { PresentationModule } from '@presentation/presentation.module';
import { JwtAuthGuard } from '@presentation/security/guards/jwt-auth.guard';
import { SecurityValidationPipe } from '@presentation/security/validation.pipe';

@Module({
  imports: [
    // 🔧 Configuration globale avec support environnements
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env', // Fallback
      ],
      expandVariables: true,
      cache: true, // Performance optimization
    }),

    // 🏗️ Architecture modules
    InfrastructureModule,
    PresentationModule,

    // 🚨 Exception handling
    ExceptionFiltersModule,
  ],
  controllers: [],
  providers: [
    // 🛡️ Global security providers
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: SecurityValidationPipe,
    },
  ],
})
export class AppModule {}
