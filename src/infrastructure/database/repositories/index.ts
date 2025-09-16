/**
 * 🗄️ Repository Index
 * 
 * Point d'entrée centralisé pour tous les repositories
 * Simplifie les imports et l'organisation du code
 */

import type { DatabaseType, RepositoryType } from './types';

// 🏭 Factory Pattern
export { RepositoryFactory, RepositoryConfigHelper } from './repository.factory';
export type { DatabaseType, RepositoryType } from './types';

// Note: In-Memory repositories removed - production architecture uses only SQL and NoSQL

// 🐘 SQL Repositories (TypeORM)
export { TypeOrmUserRepository } from './sql/typeorm-user.repository';
export { TypeOrmBusinessRepository } from './sql/typeorm-business.repository';
export { TypeOrmCalendarRepository } from './sql/typeorm-calendar.repository';

// Note: Repository interfaces imported above to avoid circular dependencies

/**
 * 🎯 Repository Types Union
 * Utile pour les types génériques et factory patterns
 */
// Import repository interface types properly
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';

export type AnyRepository = 
  | UserRepository
  | BusinessRepository
  | CalendarRepository;
  // | AppointmentRepository; // TODO: Ajouter quand AppointmentRepository sera implémenté

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
  // Développement - SQL uniquement
  development: {
    user: 'sql' as DatabaseType,
    business: 'sql' as DatabaseType,
    calendar: 'sql' as DatabaseType,
    appointment: 'sql' as DatabaseType,
  },
  
  // Test - SQL uniquement
  test: {
    user: 'sql' as DatabaseType,
    business: 'sql' as DatabaseType,
    calendar: 'sql' as DatabaseType,
    appointment: 'sql' as DatabaseType,
  },
  
  // Staging - SQL uniquement
  staging: {
    user: 'sql' as DatabaseType,
    business: 'sql' as DatabaseType,
    calendar: 'sql' as DatabaseType,
    appointment: 'sql' as DatabaseType,
  },
  
  // Production - SQL uniquement
  production: {
    user: 'sql' as DatabaseType,
    business: 'sql' as DatabaseType,
    calendar: 'sql' as DatabaseType,
    appointment: 'sql' as DatabaseType,
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
