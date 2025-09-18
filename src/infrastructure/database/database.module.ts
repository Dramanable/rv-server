import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RepositoryFactory } from './repositories/repository.factory';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { AppConfigService } from '../config/app-config.service';
import type { I18nService } from '../../application/ports/i18n.port';

class DatabaseI18nService implements I18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      'infrastructure.repository.factory_initialized':
        'Repository factory initialized',
      'infrastructure.repository.switching_database_type':
        'Switching database type',
      'infrastructure.repository.database_type_switched':
        'Database type switched',
      'infrastructure.repository.creating_sql_repository':
        'Creating SQL repository',
      'infrastructure.repository.creating_nosql_repository':
        'Creating NoSQL repository',
      'infrastructure.repository.sql_connection_failed':
        'SQL connection failed',
      'infrastructure.repository.nosql_connection_failed':
        'NoSQL connection failed',
      'infrastructure.repository.connectivity_test_results':
        'Connectivity test results',
    };

    let result = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  }

  translate(key: string, params?: Record<string, unknown>): string {
    return this.t(key, params);
  }

  setDefaultLanguage(): void {
    // Mock implementation
  }

  exists(): boolean {
    return true;
  }
}

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
  ],
  providers: [
    AppConfigService,
    ConfigService, // Ajout du ConfigService de NestJS
    { provide: TOKENS.I18N_SERVICE, useClass: DatabaseI18nService },
    // RepositoryFactory, // Temporarily disabled - causes startup errors
    // Repository factories disabled until TypeORM repositories are properly implemented
  ],
  exports: [
    ConfigService, // Export du ConfigService
    TOKENS.I18N_SERVICE,
  ],
})
export class DatabaseModule {}
