/**
 * 🏭 Repository Factory
 * 
 * Factory Pattern pour créer les repositories selon la configuration
 * Permet de basculer dynamiquement entre SQL et NoSQL
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
import { TOKENS } from '../../../shared/constants/injection-tokens';

// Note: In-Memory repositories removed - using only SQL and NoSQL implementations

// SQL Repositories
import { TypeOrmUserRepository } from './sql/typeorm-user.repository';
import { TypeOrmBusinessRepository } from './sql/typeorm-business.repository';
import { TypeOrmCalendarRepository } from './sql/typeorm-calendar.repository';

import type { DatabaseType, RepositoryType } from './types';

interface RepositoryFactoryConfig {
  readonly defaultDatabaseType: DatabaseType;
  readonly overrides?: Partial<Record<RepositoryType, DatabaseType>>;
  readonly sqlConfig?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  readonly nosqlConfig?: {
    uri: string;
    database: string;
  };
}

@Injectable()
export class RepositoryFactory {
  private readonly config: RepositoryFactoryConfig;

  constructor(
    @Inject(TOKENS.LOGGER) private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.loadConfiguration();
    this.logConfiguration();
  }

  /**
   * 🏗️ Créer un repository User selon la configuration
   */
  createUserRepository(): UserRepository {
    const dbType = this.getDatabaseTypeFor('user');
    
    switch (dbType) {
      case 'sql':
        return this.createSqlUserRepository();
      default:
        throw new Error(`Unsupported database type for user repository: ${dbType}. Only 'sql' is supported.`);
    }
  }

  /**
   * 🏢 Créer un repository Business selon la configuration
   */
  createBusinessRepository(): BusinessRepository {
    const dbType = this.getDatabaseTypeFor('business');
    
    switch (dbType) {
      case 'sql':
        return this.createSqlBusinessRepository();
      default:
        throw new Error(`Unsupported database type for business repository: ${dbType}. Only 'sql' is supported.`);
    }
  }

  /**
   * 📅 Créer un repository Calendar selon la configuration
   */
  createCalendarRepository(): CalendarRepository {
    const dbType = this.getDatabaseTypeFor('calendar');
    
    switch (dbType) {
      case 'sql':
        return this.createSqlCalendarRepository();
      default:
        throw new Error(`Unsupported database type for calendar repository: ${dbType}. Only 'sql' is supported.`);
    }
  }

  /**
   * 📋 Créer un repository Appointment selon la configuration
   * TODO: Implémenter quand AppointmentRepository sera disponible
   */
  // createAppointmentRepository(): AppointmentRepository {
  //   const dbType = this.getDatabaseTypeFor('appointment');
  //   
  //   switch (dbType) {
  //     case 'sql':
  //       return this.createSqlAppointmentRepository();
  //     case 'nosql':
  //       return this.createNoSqlAppointmentRepository();
  //     default:
  //       throw new Error(`Unsupported database type for appointment repository: ${dbType}. Only 'sql' and 'nosql' are supported.`);
  //   }
  // }

  /**
   * 🔄 Basculer dynamiquement vers un type de base de données
   */
  switchDatabaseType(repositoryType: RepositoryType, dbType: DatabaseType): void {
    this.logger.info(
      this.i18n.t('infrastructure.repository.switching_database_type'),
      {
        repositoryType,
        oldType: this.getDatabaseTypeFor(repositoryType),
        newType: dbType,
      },
    );

    // Mettre à jour la configuration
    if (!this.config.overrides) {
      (this.config as any).overrides = {};
    }
    this.config.overrides![repositoryType] = dbType;

    this.logger.info(
      this.i18n.t('infrastructure.repository.database_type_switched'),
      { repositoryType, newType: dbType },
    );
  }

  /**
   * 📊 Obtenir les statistiques d'utilisation des repositories
   */
  getRepositoryStats(): {
    configuration: RepositoryFactoryConfig;
    activeTypes: Record<RepositoryType, DatabaseType>;
    availableTypes: DatabaseType[];
  } {
    return {
      configuration: { ...this.config },
      activeTypes: {
        user: this.getDatabaseTypeFor('user'),
        business: this.getDatabaseTypeFor('business'),
        calendar: this.getDatabaseTypeFor('calendar'),
        // Note: service and staff repositories removed - using only core entities
      },
      availableTypes: ['sql'],
    };
  }

  // 🔒 Méthodes privées pour la création des repositories

  private getDatabaseTypeFor(repositoryType: RepositoryType): DatabaseType {
    return this.config.overrides?.[repositoryType] || this.config.defaultDatabaseType;
  }

  private loadConfiguration(): RepositoryFactoryConfig {
    const defaultType = this.configService.get<string>('DATABASE_TYPE', 'sql') as DatabaseType;
    
    return {
      defaultDatabaseType: defaultType,
      overrides: {
        // Peut être configuré via des variables d'environnement spécifiques
        user: this.configService.get<DatabaseType>('USER_REPOSITORY_TYPE', defaultType),
        business: this.configService.get<DatabaseType>('BUSINESS_REPOSITORY_TYPE', defaultType),
        calendar: this.configService.get<DatabaseType>('CALENDAR_REPOSITORY_TYPE', defaultType),
        // Note: service and staff repository types removed - core entities only
      },
      sqlConfig: {
        host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
        port: this.configService.get<number>('DATABASE_PORT', 5432),
        database: this.configService.get<string>('DATABASE_NAME', 'rvproject'),
        username: this.configService.get<string>('DATABASE_USERNAME', 'postgres'),
        password: this.configService.get<string>('DATABASE_PASSWORD', 'password'),
      },
      nosqlConfig: {
        uri: this.configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017'),
        database: this.configService.get<string>('MONGODB_DATABASE', 'rvproject'),
      },
    };
  }

  private logConfiguration(): void {
    this.logger.info(
      this.i18n.t('infrastructure.repository.factory_initialized'),
      {
        defaultType: this.config.defaultDatabaseType,
        overrides: this.config.overrides,
        hasSqlConfig: !!this.config.sqlConfig,
        hasNoSqlConfig: !!this.config.nosqlConfig,
      },
    );
  }

  // Note: In-Memory repositories removed - production architecture only uses SQL and NoSQL

  // 🐘 SQL Repository Creators
  private createSqlUserRepository(): UserRepository {
    this.logger.debug(
      this.i18n.t('infrastructure.repository.creating_sql_repository'),
      { type: 'user' },
    );
    // TODO: Injecter les dépendances TypeORM appropriées
    throw new Error('SQL UserRepository creation not implemented - requires TypeORM dependencies injection');
  }

  private createSqlBusinessRepository(): BusinessRepository {
    this.logger.debug(
      this.i18n.t('infrastructure.repository.creating_sql_repository'),
      { type: 'business' },
    );
    // TODO: Injecter les dépendances TypeORM appropriées
    throw new Error('SQL BusinessRepository creation not implemented - requires TypeORM dependencies injection');
  }

  private createSqlCalendarRepository(): CalendarRepository {
    this.logger.debug(
      this.i18n.t('infrastructure.repository.creating_sql_repository'),
      { type: 'calendar' },
    );
    // TODO: Injecter les dépendances TypeORM appropriées
    throw new Error('SQL CalendarRepository creation not implemented - requires TypeORM dependencies injection');
  }

  // TODO: Implémenter quand AppointmentRepository sera disponible
  // private createSqlAppointmentRepository(): AppointmentRepository {
  //   this.logger.debug(
  //     this.i18n.t('infrastructure.repository.creating_sql_repository'),
  //     { type: 'appointment' },
  //   );
  //   // TODO: Implémenter TypeOrmAppointmentRepository
  //   throw new Error('SQL AppointmentRepository not implemented yet');
  // }

  // 🍃 NoSQL Repository Creators
  private createNoSqlUserRepository(): UserRepository {
    this.logger.debug(
      this.i18n.t('infrastructure.repository.creating_nosql_repository'),
      { type: 'user' },
    );
    // TODO: Injecter les dépendances Mongoose appropriées
    throw new Error('NoSQL UserRepository creation not implemented - requires Mongoose dependencies injection');
  }

  private createNoSqlBusinessRepository(): BusinessRepository {
    this.logger.debug(
      this.i18n.t('infrastructure.repository.creating_nosql_repository'),
      { type: 'business' },
    );
    // TODO: Injecter les dépendances Mongoose appropriées
    throw new Error('NoSQL BusinessRepository creation not implemented - requires Mongoose dependencies injection');
  }

  private createNoSqlCalendarRepository(): CalendarRepository {
    this.logger.debug(
      this.i18n.t('infrastructure.repository.creating_nosql_repository'),
      { type: 'calendar' },
    );
    // TODO: Injecter les dépendances Mongoose appropriées
    throw new Error('NoSQL CalendarRepository creation not implemented - requires Mongoose dependencies injection');
  }

  // TODO: Implémenter quand AppointmentRepository sera disponible
  // private createNoSqlAppointmentRepository(): AppointmentRepository {
  //   this.logger.debug(
  //     this.i18n.t('infrastructure.repository.creating_nosql_repository'),
  //     { type: 'appointment' },
  //   );
  //   // TODO: Implémenter MongoAppointmentRepository
  //   throw new Error('NoSQL AppointmentRepository not implemented yet');
  // }

  /**
   * 🔧 Test de connectivité pour chaque type de base de données
   */
  async testConnectivity(): Promise<{
    sql: boolean;
    nosql: boolean;
  }> {
    const results = {
      sql: false,
      nosql: false,
    };

    try {
      // Test SQL connectivity
      // TODO: Implémenter le test de connexion SQL
      this.logger.debug('Testing SQL connectivity...');
      results.sql = false; // Placeholder
    } catch (error) {
      this.logger.warn(
        this.i18n.t('infrastructure.repository.sql_connection_failed'),
        { error: error instanceof Error ? error.message : String(error) }
      );
    }

    try {
      // Test NoSQL connectivity
      // TODO: Implémenter le test de connexion MongoDB
      this.logger.debug('Testing NoSQL connectivity...');
      results.nosql = false; // Placeholder
    } catch (error) {
      this.logger.warn(
        this.i18n.t('infrastructure.repository.nosql_connection_failed'),
        { error: error instanceof Error ? error.message : String(error) }
      );
    }

    this.logger.info(
      this.i18n.t('infrastructure.repository.connectivity_test_results'),
      results,
    );

    return results;
  }
}

/**
 * 📋 Configuration Helper pour variables d'environnement
 */
export class RepositoryConfigHelper {
  /**
   * 🔧 Générer un exemple de fichier .env pour les repositories
   */
  static generateEnvExample(): string {
    return `
# 🗄️ Repository Configuration
# Choix: sql, nosql

# Configuration globale par défaut
DATABASE_TYPE=sql

# Configuration spécifique par repository (optionnel)
USER_REPOSITORY_TYPE=sql
BUSINESS_REPOSITORY_TYPE=sql
CALENDAR_REPOSITORY_TYPE=nosql
APPOINTMENT_REPOSITORY_TYPE=nosql

# 🐘 Configuration PostgreSQL (si DATABASE_TYPE=sql)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=rvproject
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# 🍃 Configuration MongoDB (si DATABASE_TYPE=nosql)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=rvproject

# 🏭 Configuration hybride pour différents environnements
TEST_DATABASE_TYPE=sql
STAGING_DATABASE_TYPE=sql
PRODUCTION_DATABASE_TYPE=nosql
    `;
  }

  /**
   * ✅ Valider la configuration
   */
  static validateConfig(config: RepositoryFactoryConfig): string[] {
    const errors: string[] = [];

    // Valider le type par défaut
    if (!['sql', 'nosql'].includes(config.defaultDatabaseType)) {
      errors.push(`Invalid default database type: ${config.defaultDatabaseType}`);
    }

    // Valider les overrides
    if (config.overrides) {
      Object.entries(config.overrides).forEach(([repo, type]) => {
        if (type && !['sql', 'nosql'].includes(type)) {
          errors.push(`Invalid database type for ${repo}: ${type}`);
        }
      });
    }

    // Valider la config SQL si utilisée
    const usesSql = config.defaultDatabaseType === 'sql' || 
                    Object.values(config.overrides || {}).includes('sql');
    if (usesSql && !config.sqlConfig) {
      errors.push('SQL configuration required but not provided');
    }

    // Note: NoSQL validation removed - SQL only implementation

    return errors;
  }
}
