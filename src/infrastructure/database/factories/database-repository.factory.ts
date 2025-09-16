/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * 🏭 Database Repository Factory
 *
 * Factory pattern pour créer des repositories selon le type de base de données
 */

import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { DatabaseType } from '../config/database-config.service';

// Abstract Factory Interface
export interface DatabaseRepositoryFactory {
  createUserRepository(): UserRepository;
  createRefreshTokenRepository(): RefreshTokenRepository;
}

// SQL Factory (TypeORM)
@Injectable()
export class SqlRepositoryFactory implements DatabaseRepositoryFactory {
  createUserRepository(): UserRepository {
    // Lazy loading pour éviter les dépendances circulaires
    const module = require('../repositories/sql/typeorm-user.repository') as {
      TypeOrmUserRepository: new () => UserRepository;
    };
    return new module.TypeOrmUserRepository();
  }

  createRefreshTokenRepository(): RefreshTokenRepository {
    const module =
      require('../repositories/sql/refresh-token.repository.impl') as {
        TypeOrmRefreshTokenRepository: new () => RefreshTokenRepository;
      };
    return new module.TypeOrmRefreshTokenRepository();
  }
}

// MongoDB Factory (Mongoose)
@Injectable()
export class MongoRepositoryFactory implements DatabaseRepositoryFactory {
  createUserRepository(): UserRepository {
    const module = require('../repositories/nosql/mongo-user.repository') as {
      MongoUserRepository: new () => UserRepository;
    };
    return new module.MongoUserRepository();
  }

  createRefreshTokenRepository(): RefreshTokenRepository {
    const module =
      require('../repositories/mongo/refresh-token.repository.impl') as {
        MongoRefreshTokenRepository: new () => RefreshTokenRepository;
      };
    return new module.MongoRefreshTokenRepository();
  }
}

// Factory Provider
@Injectable()
export class DatabaseRepositoryFactoryProvider {
  constructor(private readonly databaseType: DatabaseType) {}

  static create(databaseType: DatabaseType): DatabaseRepositoryFactory {
    switch (databaseType) {
      case 'postgresql':
      case 'mysql':
      case 'sqlite':
        return new SqlRepositoryFactory();

      case 'mongodb':
        return new MongoRepositoryFactory();

      default:
        throw new Error(`Unsupported database type: ${String(databaseType)}`);
    }
  }
}

// Token pour l'injection de dépendance
export const DATABASE_REPOSITORY_FACTORY = Symbol(
  'DATABASE_REPOSITORY_FACTORY',
);

// Provider configuré dynamiquement
export const databaseRepositoryFactoryProvider = {
  provide: DATABASE_REPOSITORY_FACTORY,
  useFactory: (databaseType: DatabaseType) => {
    return DatabaseRepositoryFactoryProvider.create(databaseType);
  },
  inject: ['DATABASE_TYPE'], // Will be provided by configuration
};
