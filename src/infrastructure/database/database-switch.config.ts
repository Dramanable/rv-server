/**
 * 🔄 Database Switch Configuration - Clean Architecture
 * ✅ Support multi-base de données (PostgreSQL, MongoDB)
 * ✅ Configuration centralisée et type-safe avec ConfigService
 * ✅ Support environnements multiples
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Entities SQL
import { RefreshTokenOrmEntity } from './sql/postgresql/entities/refresh-token-orm.entity';
import { UserOrmEntity } from './sql/postgresql/entities/user-orm.entity';

export type DatabaseType = 'postgresql' | 'mongodb';

export interface DatabaseConfig {
  type: DatabaseType;
  sqlConfig?: TypeOrmModuleOptions;
  nosqlConfig?: MongooseModuleOptions;
}

@Injectable()
export class DatabaseSwitchConfig {
  private readonly logger = new Logger(DatabaseSwitchConfig.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * 🎯 Configuration de base de données basée sur l'environnement
   */
  getDatabaseConfig(): DatabaseConfig {
    const dbType = this.getDatabaseType();

    this.logger.log(`🔧 Configuration database type: ${dbType}`);

    switch (dbType) {
      case 'postgresql':
        return {
          type: 'postgresql',
          sqlConfig: this.getPostgreSQLConfig(),
        };

      case 'mongodb':
        return {
          type: 'mongodb',
          nosqlConfig: this.getMongoDBConfig(),
        };

      default: {
        // TypeScript exhaustiveness check - ce cas ne devrait jamais arriver
        throw new Error(`Database type non supporté: ${String(dbType)}`);
      }
    }
  }

  /**
   * 🐘 Configuration PostgreSQL
   */
  private getPostgreSQLConfig(): TypeOrmModuleOptions {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    const isProduction = env === 'production';

    return {
      type: 'postgres',
      host: this.configService.get<string>('DATABASE_HOST', 'localhost'),
      port: this.configService.get<number>('DATABASE_PORT', 5432),
      username: this.configService.get<string>('DATABASE_USERNAME', 'postgres'),
      password: this.configService.get<string>('DATABASE_PASSWORD', 'postgres'),
      database: this.configService.get<string>(
        'DATABASE_NAME',
        'cleanarchi_dev',
      ),
      schema: this.configService.get<string>('DB_SCHEMA', 'rvproject_app'),
      synchronize: !isProduction, // ⚠️ Seulement en développement
      logging: env === 'development',
      entities: [UserOrmEntity, RefreshTokenOrmEntity],
      autoLoadEntities: true,
      ssl: isProduction,
      extra: isProduction
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : undefined,
    };
  }

  /**
   * 🍃 Configuration MongoDB
   */
  private getMongoDBConfig(): MongooseModuleOptions {
    const connectionString = this.configService.get<string>(
      'MONGODB_CONNECTION_STRING',
    );
    const username = this.configService.get<string>(
      'MONGODB_USERNAME',
      'admin',
    );
    const password = this.configService.get<string>(
      'MONGODB_PASSWORD',
      'admin',
    );
    const host = this.configService.get<string>('MONGODB_HOST', 'localhost');
    const port = this.configService.get<number>('MONGODB_PORT', 27017);
    const database = this.configService.get<string>(
      'MONGODB_DATABASE',
      'cleanarchi_dev',
    );

    const uri =
      connectionString ||
      `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

    return {
      uri,
    };
  }

  /**
   * 🔍 Détection automatique du type de base de données
   */
  private getDatabaseType(): DatabaseType {
    // Priorité configurée explicitement
    const configuredType = this.configService.get<string>('DATABASE_TYPE');
    if (configuredType === 'postgresql' || configuredType === 'mongodb') {
      return configuredType;
    }

    // Auto-détection basée sur les variables d'environnement disponibles
    if (this.hasPostgreSQLConfig()) {
      return 'postgresql';
    }

    if (this.hasMongoDBConfig()) {
      return 'mongodb';
    }

    // Défaut : PostgreSQL
    this.logger.warn(
      '⚠️ Aucune configuration détectée, utilisation PostgreSQL par défaut',
    );
    return 'postgresql';
  }

  /**
   * 🔍 Vérification configuration PostgreSQL
   */
  private hasPostgreSQLConfig(): boolean {
    return !!(
      this.configService.get('DATABASE_HOST') &&
      this.configService.get('DATABASE_USERNAME')
    );
  }

  /**
   * 🔍 Vérification configuration MongoDB
   */
  private hasMongoDBConfig(): boolean {
    const mongoConnectionString = this.configService.get<string>(
      'MONGODB_CONNECTION_STRING',
    );
    const mongoHost = this.configService.get<string>('MONGODB_HOST');
    const mongoDatabase = this.configService.get<string>('MONGODB_DATABASE');

    return !!(mongoConnectionString || (mongoHost && mongoDatabase));
  }

  /**
   * 📊 Informations de configuration
   */
  getConfigInfo() {
    const dbType = this.getDatabaseType();
    const env = this.configService.get<string>('NODE_ENV', 'development');

    return {
      databaseType: dbType,
      environment: env,
      hasPostgreSQL: this.hasPostgreSQLConfig(),
      hasMongoDB: this.hasMongoDBConfig(),
    };
  }
}
