import { Module, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// NoSQL Schemas
import { BusinessMongo, BusinessSchema } from './entities/nosql/business.schema';
import { StaffMongo, StaffSchema } from './entities/nosql/staff.schema';
import { ServiceMongo, ServiceSchema } from './entities/nosql/service.schema';
import { CalendarMongo, CalendarSchema } from './entities/nosql/calendar.schema';
import { AppointmentMongo, AppointmentSchema } from './entities/nosql/appointment.schema';

// Repositories & Services
import { BusinessNoSqlRepository } from './repositories/nosql/business-nosql.repository';
import { DatabaseConfigService } from '../config/database-config.service';

// Mappers
import { BusinessNoSqlMapper } from './mappers/business-nosql.mapper';

// Tokens
import { BUSINESS_REPOSITORY } from '../../domain/repositories/business.repository.interface';
import { DATABASE_CONFIG_SERVICE } from '../../application/ports/database-config.port';

/**
 * 🍃 Module Base de Données NoSQL (MongoDB/Mongoose)
 * 
 * **Responsabilité** : Configuration exclusive NoSQL avec MongoDB
 * 
 * **Architecture** :
 * - ✅ MongoDB uniquement avec Mongoose
 * - ✅ Repositories NoSQL spécialisés avec agrégations
 * - ✅ Mappers NoSQL dédiés
 * 
 * **Variables d'Environnement** :
 * - `MONGODB_URI`
 */
@Module({})
export class DatabaseNoSqlModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DatabaseNoSqlModule,
      imports: [
        ConfigModule,
        
        // Configuration Mongoose (MongoDB)
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('MONGODB_URI', 'mongodb://localhost:27017/rvproject'),
            retryAttempts: 3,
            retryDelay: 3000,
          }),
        }),

        // Configuration Mongoose pour les schémas NoSQL
        MongooseModule.forFeature([
          { name: BusinessMongo.name, schema: BusinessSchema },
          { name: StaffMongo.name, schema: StaffSchema },
          { name: ServiceMongo.name, schema: ServiceSchema },
          { name: CalendarMongo.name, schema: CalendarSchema },
          { name: AppointmentMongo.name, schema: AppointmentSchema },
        ]),
      ],
      providers: [
        // Configuration Service
        DatabaseConfigService,
        {
          provide: DATABASE_CONFIG_SERVICE,
          useClass: DatabaseConfigService,
        },

        // Mappers NoSQL
        BusinessNoSqlMapper,

        // Repositories NoSQL
        BusinessNoSqlRepository,
        {
          provide: BUSINESS_REPOSITORY,
          useClass: BusinessNoSqlRepository,
        },
      ],
      exports: [
        DATABASE_CONFIG_SERVICE,
        BUSINESS_REPOSITORY,
        BusinessNoSqlMapper,
      ],
      global: true,
    };
  }
}
