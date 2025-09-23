import { ProductionI18nService } from '@infrastructure/i18n/production-i18n.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TOKENS } from '@shared/constants/injection-tokens';
import { AppConfigService } from '../config/app-config.service';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { TypeOrmRepositoriesModule } from './typeorm-repositories.module';

// Import des entités TypeORM
import { NotificationOrmEntity } from './entities/notification-orm.entity';
import { BusinessOrmEntity } from './sql/postgresql/entities/business-orm.entity';
import { BusinessSectorOrmEntity } from './sql/postgresql/entities/business-sector-orm.entity';
import { CalendarOrmEntity } from './sql/postgresql/entities/calendar-orm.entity';
import { RefreshTokenOrmEntity } from './sql/postgresql/entities/refresh-token-orm.entity';
import { ServiceOrmEntity } from './sql/postgresql/entities/service-orm.entity';
import { StaffOrmEntity } from './sql/postgresql/entities/staff-orm.entity';
import { UserOrmEntity } from './sql/postgresql/entities/user-orm.entity';

// 🖼️ Business Image & Gallery Entities
import { BusinessGalleryOrmEntity } from './sql/postgresql/entities/business-gallery-orm.entity';
import { BusinessImageOrmEntity } from './sql/postgresql/entities/business-image-orm.entity';

/**
 * 🗄️ Simple Database Module
 * ✅ Clean Architecture compliant
 * ✅ Minimal setup for application startup
 * 🚫 Repository factories disabled until TypeORM implementation complete
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PinoLoggerModule,

    // ✅ Configuration TypeORM principale avec connexion PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'rvproject_user'),
        password: configService.get('DATABASE_PASSWORD', 'rvproject_password'),
        database: configService.get('DATABASE_NAME', 'rvproject_app'),
        schema: configService.get('DB_SCHEMA', 'rvproject_schema'),
        entities: [
          UserOrmEntity,
          RefreshTokenOrmEntity,
          BusinessOrmEntity,
          BusinessSectorOrmEntity,
          CalendarOrmEntity,
          ServiceOrmEntity,
          StaffOrmEntity,
          NotificationOrmEntity,
          // 🖼️ Business Image & Gallery Entities
          BusinessImageOrmEntity,
          BusinessGalleryOrmEntity,
        ],
        migrations: [
          'dist/infrastructure/database/sql/postgresql/migrations/*.js',
        ],
        synchronize: false, // ✅ Always false - use migrations instead
        migrationsRun: true, // ✅ Run migrations automatically on startup
        logging: true, // ✅ Activer les logs SQL pour debug
        ssl:
          configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),

    TypeOrmRepositoriesModule, // ✅ Import du module avec vraies implémentations TypeORM
  ],
  providers: [
    AppConfigService,
    ConfigService, // Ajout du ConfigService de NestJS
    { provide: TOKENS.I18N_SERVICE, useClass: ProductionI18nService },

    // ✅ Mock BusinessSector Repository pour démarrer l'app
    {
      provide: TOKENS.BUSINESS_SECTOR_REPOSITORY,
      useValue: {
        async save(businessSector: any) {
          return businessSector;
        },
        async findById() {
          return null;
        },
        async findByCode() {
          return null;
        },
        async findAll() {
          return {
            data: [],
            meta: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: 10,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        },
        async delete() {
          return;
        },
        async exists() {
          return false;
        },
        async isCodeUnique() {
          return true;
        },
        async count() {
          return 0;
        },
        async searchByText() {
          return {
            data: [],
            meta: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: 10,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        },
        async findActiveOnly() {
          return {
            data: [],
            meta: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: 10,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        },
        async updateStatus() {
          return null;
        },
        async findMostUsed() {
          return [];
        },
        async countUsageInBusinesses() {
          return 0;
        },
      },
    },

    // ✅ Mock RefreshTokenRepository pour démarrer l'app
    {
      provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
      useValue: {
        async save(token: any) {
          return token;
        },
        async findByToken() {
          return null;
        },
        async findByUserId() {
          return [];
        },
        async deleteByUserId() {
          return;
        },
        async revokeAllByUserId() {
          return;
        },
        async revokeByToken() {
          return;
        },
        async deleteExpiredTokens() {
          return 0;
        },
      },
    },

    // ✅ Mock Notification Repository pour démarrer l'app
    {
      provide: TOKENS.NOTIFICATION_REPOSITORY,
      useValue: {
        async save(notification: any) {
          return notification;
        },
        async findById() {
          return null;
        },
        async findAll() {
          return [];
        },
        async updateStatus() {
          return null;
        },
        async findPendingDeliveries() {
          return [];
        },
      },
    },

    // ✅ Mock Notification Service pour démarrer l'app
    {
      provide: TOKENS.NOTIFICATION_SERVICE,
      useValue: {
        async send() {
          return {
            messageId: 'mock-message-id',
            deliveryTime: new Date(),
            status: 'SENT',
          };
        },
        async schedule() {
          return {
            messageId: 'mock-scheduled-id',
            scheduledFor: new Date(),
            status: 'PENDING',
          };
        },
        async isDeliveryTimeValid() {
          return true;
        },
      },
    },

    // ✅ Business, Calendar, Service et Staff repositories à ajouter si nécessaires
  ],
  exports: [
    ConfigService, // Export du ConfigService
    TOKENS.I18N_SERVICE,
    TOKENS.BUSINESS_SECTOR_REPOSITORY, // ✅ Export du mock BusinessSectorRepository
    TOKENS.NOTIFICATION_REPOSITORY, // ✅ Export du mock NotificationRepository
    TOKENS.NOTIFICATION_SERVICE, // ✅ Export du mock NotificationService
    TypeOrmRepositoriesModule, // ✅ Export le module qui contient USER_REPOSITORY, PERMISSION_SERVICE, etc.
    // Les autres repositories sont exportés via TypeOrmRepositoriesModule
  ],
})
export class DatabaseModule {}
