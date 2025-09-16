import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// SQL Entities
import { BusinessEntity } from './entities/sql/business.entity';
import { StaffEntity } from './entities/sql/staff.entity';
import { ServiceEntity } from './entities/sql/service.entity';
import { CalendarEntity } from './entities/sql/calendar.entity';
import { AppointmentEntity } from './entities/sql/appointment.entity';

// Repositories & Services
import { BusinessSqlRepository } from './repositories/sql/business-sql.repository';
import { DatabaseConfigService } from '../config/database-config.service';

// Mappers
import { BusinessSqlMapper } from './mappers/business-sql.mapper';

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
              BusinessEntity,
              StaffEntity,
              ServiceEntity,
              CalendarEntity,
              AppointmentEntity,
            ],
            synchronize: configService.get('NODE_ENV') === 'development',
            logging: configService.get('NODE_ENV') === 'development',
            retryAttempts: 3,
            retryDelay: 3000,
          }),
        }),

        // Configuration TypeORM pour les entités SQL
        TypeOrmModule.forFeature([
          BusinessEntity,
          StaffEntity,
          ServiceEntity,
          CalendarEntity,
          AppointmentEntity,
        ]),
      ],
      providers: [
        // Configuration Service
        DatabaseConfigService,
        {
          provide: DATABASE_CONFIG_SERVICE,
          useClass: DatabaseConfigService,
        },

        // Mappers SQL
        BusinessSqlMapper,

        // Repositories SQL
        BusinessSqlRepository,
        {
          provide: BUSINESS_REPOSITORY,
          useClass: BusinessSqlRepository,
        },
      ],
      exports: [
        DATABASE_CONFIG_SERVICE,
        BUSINESS_REPOSITORY,
        BusinessSqlMapper,
      ],
      global: true,
    };
  }
}
