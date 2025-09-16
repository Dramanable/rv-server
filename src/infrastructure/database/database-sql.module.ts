import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// SQL Entities - Direct imports for Node.js 24 compatibility
import { BusinessOrmEntity } from './entities/typeorm/business.entity';
import { CalendarOrmEntity } from './entities/typeorm/calendar.entity';
import { UserOrmEntity } from './entities/typeorm/user-orm.entity';
import { RefreshTokenOrmEntity } from './entities/typeorm/refresh-token-orm.entity';

// Repositories & Services
import { TypeOrmBusinessRepository } from './repositories/sql/typeorm-business.repository';
import { DatabaseConfigService } from '../config/database-config.service';

// Tokens
import { BUSINESS_REPOSITORY } from '../../domain/repositories/business.repository.interface';
import { DATABASE_CONFIG_SERVICE } from '../../application/ports/database-config.port';

/**
 * 🗄️ Module Base de Données SQL (PostgreSQL/TypeORM)
 *
 * **Responsabilité** : Configuration exclusive SQL avec TypeORM
 *
 * **Architecture** :
 * - ✅ PostgreSQL uniquement avec TypeORM
 * - ✅ Repositories SQL spécialisés
 * - ✅ Mappers SQL dédiés
 *
 * **Variables d'Environnement** :
 * - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
 */
@Module({})
export class DatabaseSqlModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DatabaseSqlModule,
      imports: [
        ConfigModule,

        // Configuration TypeORM (PostgreSQL)
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST', 'localhost'),
            port: configService.get('DB_PORT', 5432),
            username: configService.get('DB_USER', 'postgres'),
            password: configService.get('DB_PASS', 'password'),
            database: configService.get('DB_NAME', 'rvproject'),
            entities: [
              BusinessOrmEntity,
              CalendarOrmEntity,
              UserOrmEntity,
              RefreshTokenOrmEntity,
            ],
            synchronize: configService.get('NODE_ENV') === 'development',
            logging: configService.get('NODE_ENV') === 'development',
            retryAttempts: 3,
            retryDelay: 3000,
          }),
        }),

        // Configuration TypeORM pour les entités SQL
        TypeOrmModule.forFeature([
          BusinessOrmEntity,
          CalendarOrmEntity,
          UserOrmEntity,
          RefreshTokenOrmEntity,
        ]),
      ],
      providers: [
        // Configuration Service
        DatabaseConfigService,
        {
          provide: DATABASE_CONFIG_SERVICE,
          useClass: DatabaseConfigService,
        },

        // Repositories SQL
        TypeOrmBusinessRepository,
        {
          provide: BUSINESS_REPOSITORY,
          useClass: TypeOrmBusinessRepository,
        },
      ],
      exports: [DATABASE_CONFIG_SERVICE, BUSINESS_REPOSITORY],
      global: true,
    };
  }
}
