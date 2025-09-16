/**
 * 🗄️ Repository Index
 * 
 * Point d'entrée centralisé pour tous les repositories
 * Simplifie les imports et l'organisation du code
 */

// 🏭 Factory Pattern
export { RepositoryFactory, RepositoryConfigHelper } from './repository.factory';
export type { DatabaseType, RepositoryType } from './repository.factory';

// Note: In-Memory repositories removed - production architecture uses only SQL and NoSQL

// 🐘 SQL Repositories (TypeORM)
export { TypeOrmUserRepository } from './sql/typeorm-user.repository';
export { TypeOrmBusinessRepository } from './sql/typeorm-business.repository';
export { TypeOrmCalendarRepository } from './sql/typeorm-calendar.repository';

// 🍃 NoSQL Repositories (MongoDB)
export { MongoUserRepository } from './nosql/mongo-user.repository';
export { MongoBusinessRepository } from './nosql/mongo-business.repository';
export { MongoCalendarRepository } from './nosql/mongo-calendar.repository';

// 📋 Repository Interfaces (re-export pour convenience)
export type { UserRepository } from '../../../domain/repositories/user.repository.interface';
export type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
export type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
export type { AppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';

/**
 * 🎯 Repository Types Union
 * Utile pour les types génériques et factory patterns
 */
export type AnyRepository = 
  | UserRepository
  | BusinessRepository
  | CalendarRepository
  | AppointmentRepository;

/**
 * 📊 Repository Metadata
 * Informations utiles pour monitoring et debugging
 */
export interface RepositoryMetadata {
  readonly name: string;
  readonly type: DatabaseType;
  readonly entity: string;
  readonly features: string[];
  readonly performance: {
    readonly avgQueryTime?: number;
    readonly totalQueries?: number;
    readonly lastQuery?: Date;
  };
}

/**
 * 🔧 Repository Configuration Map
 * Définit quelle implémentation utiliser par défaut
 */
export const DEFAULT_REPOSITORY_IMPLEMENTATIONS = {
  // Développement - SQL pour données cohérentes
  development: {
    user: 'sql' as DatabaseType,
    business: 'sql' as DatabaseType,
    calendar: 'sql' as DatabaseType,
    appointment: 'sql' as DatabaseType,
  },
  
  // Test - SQL pour reproductibilité
  test: {
    user: 'sql' as DatabaseType,
    business: 'sql' as DatabaseType,
    calendar: 'sql' as DatabaseType,
    appointment: 'sql' as DatabaseType,
  },
  
  // Staging - Réplique de production
  staging: {
    user: 'sql' as DatabaseType,        // Données critiques en SQL
    business: 'sql' as DatabaseType,    // Relations complexes en SQL
    calendar: 'nosql' as DatabaseType,  // Flexibilité horaires en NoSQL
    appointment: 'nosql' as DatabaseType, // Volume élevé en NoSQL
  },
  
  // Production - Architecture hybride optimisée
  production: {
    user: 'sql' as DatabaseType,        // Données critiques en SQL
    business: 'sql' as DatabaseType,    // Relations complexes en SQL
    calendar: 'nosql' as DatabaseType,  // Flexibilité horaires en NoSQL
    appointment: 'nosql' as DatabaseType, // Volume élevé en NoSQL
  },
} as const;

/**
 * 📈 Repository Performance Metrics
 */
export interface RepositoryMetrics {
  readonly queries: {
    readonly total: number;
    readonly successful: number;
    readonly failed: number;
    readonly avgDuration: number;
  };
  readonly operations: {
    readonly create: number;
    readonly read: number;
    readonly update: number;
    readonly delete: number;
  };
  readonly errors: {
    readonly connectionErrors: number;
    readonly queryErrors: number;
    readonly validationErrors: number;
  };
}

/**
 * 🛠️ Repository Health Check
 */
export interface RepositoryHealthStatus {
  readonly isHealthy: boolean;
  readonly lastCheck: Date;
  readonly latency: number;
  readonly errors: string[];
  readonly metadata: {
    readonly type: DatabaseType;
    readonly version?: string;
    readonly connectionPool?: {
      active: number;
      idle: number;
      total: number;
    };
  };
}

/**
 * 🎮 Repository Manager Interface
 * Interface pour gérer dynamiquement les repositories
 */
export interface RepositoryManager {
  /**
   * Obtenir un repository par type
   */
  getRepository<T extends AnyRepository>(type: RepositoryType): T;
  
  /**
   * Changer le type de base de données pour un repository
   */
  switchDatabase(repositoryType: RepositoryType, dbType: DatabaseType): Promise<void>;
  
  /**
   * Vérifier la santé de tous les repositories
   */
  healthCheck(): Promise<Record<RepositoryType, RepositoryHealthStatus>>;
  
  /**
   * Obtenir les métriques de performance
   */
  getMetrics(): Promise<Record<RepositoryType, RepositoryMetrics>>;
  
  /**
   * Nettoyer les ressources (connexions, cache, etc.)
   */
  cleanup(): Promise<void>;
}
