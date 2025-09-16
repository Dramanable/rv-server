import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Modules spécialisés
import { DatabaseSqlModule } from './database-sql.module';
import { DatabaseNoSqlModule } from './database-nosql.module';

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
    
    // Sélectionner le module approprié
    const selectedModule = databaseType === 'sql' 
      ? DatabaseSqlModule.forRootAsync()
      : DatabaseNoSqlModule.forRootAsync();

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
      exports: [
        DATABASE_CONFIG_SERVICE,
      ],
      global: true,
    };
  }
@Module({})
export class DatabaseHybridModule {
  /**
   * Configure le module avec support SQL et NoSQL selon l'environnement
   */
  static forRootAsync(): DynamicModule {
    return {
      module: DatabaseHybridModule,
      imports: [ConfigModule],
      providers: [
        // Configuration Service
        DatabaseConfigService,
        {
          provide: DATABASE_CONFIG_SERVICE,
          useClass: DatabaseConfigService,
        },

        // Factory pour sélectionner le bon repository selon DATABASE_TYPE
        {
          provide: BUSINESS_REPOSITORY,
          useFactory: async (
            configService: ConfigService,
            databaseConfigService: DatabaseConfigService,
          ) => {
            const databaseType = databaseConfigService.getDatabaseType();

            if (databaseType === DatabaseType.SQL) {
              // Configuration SQL uniquement
              const { TypeOrmModule } = await import('@nestjs/typeorm');
              const { DataSource } = await import('typeorm');
              
              // Créer la connexion TypeORM
              const dataSource = new DataSource({
                type: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 5432),
                username: configService.get('DB_USER', 'postgres'),
                password: configService.get('DB_PASS', 'password'),
                database: configService.get('DB_NAME', 'rvproject'),
                entities: [BusinessEntity],
                synchronize: configService.get('NODE_ENV') === 'development',
                logging: configService.get('NODE_ENV') === 'development',
              });

              await dataSource.initialize();
              
              const repository = dataSource.getRepository(BusinessEntity);
              const mapper = new BusinessSqlMapper();
              
              return new BusinessSqlRepository(repository as any, mapper);
              
            } else {
              // Configuration NoSQL uniquement
              const { connect, model } = await import('mongoose');
              
              // Créer la connexion MongoDB
              const connection = await connect(
                configService.get('MONGODB_URI', 'mongodb://localhost:27017/rvproject')
              );
              
              const businessModel = model(BusinessMongo.name, BusinessSchema);
              const mapper = new BusinessNoSqlMapper();
              
              return new BusinessNoSqlRepository(businessModel as any, mapper);
            }
          },
          inject: [ConfigService, DATABASE_CONFIG_SERVICE],
        },

        // Mappers (toujours disponibles)
        BusinessSqlMapper,
        BusinessNoSqlMapper,
      ],
      exports: [
        DATABASE_CONFIG_SERVICE,
        BUSINESS_REPOSITORY,
        BusinessSqlMapper,
        BusinessNoSqlMapper,
      ],
      global: true,
    };
  }

  /**
   * Configure le module pour les tests avec base en mémoire
   */
  static forTesting(): DynamicModule {
    return {
      module: DatabaseHybridModule,
      providers: [
        // Mock services pour les tests
        {
          provide: DATABASE_CONFIG_SERVICE,
          useValue: {
            getDatabaseType: () => 'sql',
            isSqlMode: () => true,
            isNoSqlMode: () => false,
          },
        },
      ],
      exports: [DATABASE_CONFIG_SERVICE],
    };
  }
}
