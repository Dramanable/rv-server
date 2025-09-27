import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';

/**
 * 🏥 Health Module
 *
 * Module pour les vérifications de santé de l'application
 * avec support complet pour Kubernetes et monitoring
 */
@Module({
  imports: [
    // Module Terminus pour les health checks
    TerminusModule,
    // Module de configuration
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class HealthModule {}
