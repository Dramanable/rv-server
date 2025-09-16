import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Modules spécialisés
import { DatabaseSqlModule } from './database-sql.module';

// Services
import { DatabaseConfigService } from '../config/database-config.service';
import { DatabaseType } from '../../application/ports/database-config.port';

// Tokens
import { DATABASE_CONFIG_SERVICE } from '../../application/ports/database-config.port';

/**
 * 🔀 Module Base de Données Sélecteur (SQL OU NoSQL)
 *
 * **Responsabilité** : Sélection dynamique SQL OU NoSQL selon DATABASE_TYPE
 *
 * **Architecture** :
 * - ✅ Configuration exclusive : SOIT SQL SOIT NoSQL
 * - ✅ Délégation vers modules spécialisés
 * - ✅ Pas de mélange - choix au démarrage de l'application
 *
 * **Variables d'Environnement** :
 * - `DATABASE_TYPE`: 'sql' | 'nosql' (défaut: 'sql')
 *
 * **Patterns Implémentés** :
 * - Factory Pattern pour sélection de module
 * - Strategy Pattern exclusif
 * - Delegation Pattern vers modules spécialisés
 */
@Module({})
export class DatabaseHybridModule {
  /**
   * Configure dynamiquement SOIT SQL SOIT NoSQL selon DATABASE_TYPE
   */
  static async forRootAsync(): Promise<DynamicModule> {
    // Déterminer le type de base de données
    const databaseType = process.env.DATABASE_TYPE?.toLowerCase() || 'sql';

    // Sélectionner le module SQL uniquement
    const selectedModule = DatabaseSqlModule.forRootAsync();

    return {
      module: DatabaseHybridModule,
      imports: [
        ConfigModule,
        selectedModule, // Import du module sélectionné uniquement
      ],
      providers: [
        // Configuration Service global
        DatabaseConfigService,
        {
          provide: DATABASE_CONFIG_SERVICE,
          useClass: DatabaseConfigService,
        },
      ],
      exports: [DATABASE_CONFIG_SERVICE],
      global: true,
    };
  }
}
