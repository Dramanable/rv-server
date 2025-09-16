import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SimpleBusinessRepository } from './repositories/simple-business.repository';
import { DatabaseConfigService } from '../config/database-config.service';

// Tokens
import { BUSINESS_REPOSITORY } from '../../domain/repositories/business.repository.interface';
import { DATABASE_CONFIG_SERVICE } from '../../application/ports/database-config.port';

/**
 * 🔧 Module Base de Données Simple (pour tests)
 * 
 * **Responsabilité** : Configuration simple pour tester l'architecture
 */
@Module({
  imports: [ConfigModule],
  providers: [
    // Configuration Service
    DatabaseConfigService,
    {
      provide: DATABASE_CONFIG_SERVICE,
      useClass: DatabaseConfigService,
    },

    // Simple Repository pour tests
    SimpleBusinessRepository,
    {
      provide: BUSINESS_REPOSITORY,
      useClass: SimpleBusinessRepository,
    },
  ],
  exports: [
    DATABASE_CONFIG_SERVICE,
    BUSINESS_REPOSITORY,
  ],
  global: true,
})
export class DatabaseSimpleModule {}
