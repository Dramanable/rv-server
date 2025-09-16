/**
 * 🔧 Database Configuration Service - Agnostic
 *
 * Configuration abstraite pour supporter plusieurs types de bases de données
 * Permet de basculer entre SQL (TypeORM) et NoSQL (MongoDB/Mongoose)
 */

import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AppConfigService } from '../../config/app-config.service';

export type DatabaseType = 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  poolSize: number;
  ssl?: boolean | object;
  options?: Record<string, unknown>;
}

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: AppConfigService) {}

  /**
   * 🔧 Configuration TypeORM (pour SQL uniquement)
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const config = this.getDatabaseConfig();

    if (config.type === 'mongodb') {
      throw new Error(
        'TypeORM configuration requested but MongoDB is configured. Use Mongoose instead.',
      );
    }

    const isProduction = this.configService.getEnvironment() === 'production';

    return {
      type: config.type as 'postgres' | 'mysql',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,

      // 🔐 SSL Configuration
      ssl: config.ssl,

      // 📁 Entités par type de DB
      entities: this.getEntitiesPaths(config.type),

      // 🔄 Migrations TypeScript
      ...this.getMigrationConfig(),

      // 🧪 Configuration par environnement
      synchronize: false, // JAMAIS en production !
      logging: !isProduction ? ['query', 'error', 'warn'] : ['error'],
      logger: isProduction ? 'file' : 'debug',

      // 🚀 Pool de connexions optimisé
      poolSize: config.poolSize,
      maxQueryExecutionTime: 5000,

      // 📊 Cache Redis
      cache: this.getCacheConfig(),

      // 🎯 Options avancées
      extra: config.options,
    };
  }

  /**
   * 🗄️ Configuration générique de base de données
   */
  getDatabaseConfig(): DatabaseConfig {
    const dbType = this.configService.getDatabaseType();

    return {
      type: dbType,
      host: this.configService.getDatabaseHost(),
      port: this.configService.getDatabasePort(),
      username: this.configService.getDatabaseUsername(),
      password: this.configService.getDatabasePassword(),
      database: this.configService.getDatabaseName(),
      poolSize: this.configService.getDatabasePoolSize(),
      ssl: this.getSSLConfig(),
      options: this.getDatabaseSpecificOptions(dbType),
    };
  }

  private getSSLConfig(): boolean | object {
    const isProduction = this.configService.getEnvironment() === 'production';

    if (!isProduction) return false;

    return {
      rejectUnauthorized: false, // À configurer selon vos certificats
    };
  }

  private getDatabaseSpecificOptions(
    dbType: DatabaseType,
  ): Record<string, unknown> {
    switch (dbType) {
      case 'postgresql':
        return {
          max: this.configService.getDatabasePoolSize(),
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
          acquireTimeoutMillis: 60000,
        };

      case 'mongodb':
        return {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: this.configService.getDatabasePoolSize(),
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        };

      case 'mysql':
        return {
          charset: 'utf8mb4',
          timezone: '+00:00',
        };

      case 'sqlite':
        return {
          database: process.env.TEST_DATABASE_NAME || 'test_db', // Pour les tests
        };

      default:
        return {};
    }
  }

  private getEntitiesPaths(dbType: DatabaseType): string[] {
    switch (dbType) {
      case 'postgresql':
      case 'mysql':
        return [__dirname + '/../entities/sql/*.entity.{ts,js}'];
      case 'sqlite':
        return [__dirname + '/../entities/sql/*.entity.{ts,js}'];
      default:
        return [];
    }
  }

  /**
   * 🔄 Configuration des migrations (SQL uniquement)
   */
  private getMigrationConfig() {
    const dbType = this.configService.getDatabaseType();

    if (dbType === 'mongodb') {
      return {}; // MongoDB n'utilise pas de migrations TypeORM
    }

    return {
      migrations: [__dirname + '/../migrations/' + dbType + '/*.{ts,js}'],
      migrationsTableName: 'typeorm_migrations',
      migrationsRun: false, // Toujours manuel en production
    };
  }

  /**
   * 📊 Configuration du cache Redis
   */
  private getCacheConfig() {
    return {
      type: 'redis' as const,
      options: {
        host: this.configService.getRedisHost(),
        port: this.configService.getRedisPort(),
        password: this.configService.getRedisPassword(),
      },
      duration: 30000, // 30 secondes
    };
  }
}
