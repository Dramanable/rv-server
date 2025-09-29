import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidInputError } from '@infrastructure/exceptions/infrastructure.exceptions';
import {
  DatabaseType,
  IDatabaseConfigService,
} from '../../application/ports/database-config.port';

/**
 * 🔧 Service de Configuration de Base de Données
 *
 * **Responsabilité** : Détermine le type de base de données à utiliser (SQL/NoSQL)
 *
 * **Fonctionnalités** :
 * - ✅ Configuration via variables d'environnement
 * - ✅ Support runtime switching (SQL ↔ NoSQL)
 * - ✅ Validation de configuration
 * - ✅ Helpers de vérification de mode
 *
 * **Variables d'Environnement** :
 * - `DATABASE_TYPE`: 'sql' | 'nosql' (défaut: 'sql')
 *
 * @example
 * ```typescript
 * // .env
 * DATABASE_TYPE=nosql
 *
 * // Usage
 * if (databaseConfig.isSqlMode()) {
 *   // Utiliser TypeORM
 * } else {
 *   // Utiliser Mongoose
 * }
 * ```
 */
@Injectable()
export class DatabaseConfigService implements IDatabaseConfigService {
  private readonly databaseType: DatabaseType;

  constructor(private readonly configService: ConfigService) {
    const dbType = this.configService
      .get<string>('DATABASE_TYPE', 'sql')
      .toLowerCase();

    if (!Object.values(DatabaseType).includes(dbType as DatabaseType)) {
      throw new InvalidInputError(
        'configuration',
        `Invalid DATABASE_TYPE: ${dbType}. Must be one of: ${Object.values(DatabaseType).join(', ')}`,
      );
    }

    this.databaseType = dbType as DatabaseType;
  }

  /**
   * Retourne le type de base de données configuré
   */
  getDatabaseType(): DatabaseType {
    return this.databaseType;
  }

  /**
   * Vérifie si le mode SQL (TypeORM) est activé
   */
  isSqlMode(): boolean {
    return this.databaseType === DatabaseType.SQL;
  }

  /**
   * Vérifie si le mode NoSQL (Mongoose) est activé
   */
  isNoSqlMode(): boolean {
    return this.databaseType === DatabaseType.NOSQL;
  }

  /**
   * Retourne les informations de configuration pour le debugging
   */
  getConfigInfo(): {
    databaseType: DatabaseType;
    isSqlMode: boolean;
    isNoSqlMode: boolean;
  } {
    return {
      databaseType: this.databaseType,
      isSqlMode: this.isSqlMode(),
      isNoSqlMode: this.isNoSqlMode(),
    };
  }
}
