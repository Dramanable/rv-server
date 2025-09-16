# 🗄️ Repository Infrastructure Layer

## 📋 Structure des Repositories

Cette architecture sépare clairement les implémentations de repositories selon la technologie de persistence :

### 📁 Structure des Dossiers

```
repositories/
├── README.md                 # 📖 Cette documentation
├── repository.factory.ts     # 🏭 Factory pour basculement SQL/NoSQL
├── index.ts                  # 📊 Point d'entrée centralisé
├── sql/                     # 🐘 Repositories SQL (PostgreSQL, MySQL, etc.)
│   └── typeorm-*.repository.ts
└── nosql/                   # 🍃 Repositories NoSQL (MongoDB, etc.)
    └── mongo-*.repository.ts
```

## 🎯 Principe de Séparation

### 🏭 **Factory Pattern** (Racine)
- **Usage** : Gestion centralisée et basculement SQL/NoSQL
- **Avantages** : Flexibilité, configuration par environnement
- **Fichiers** : `repository.factory.ts`, `index.ts`

### 🐘 **SQL Repositories** (`/sql/`)
- **Technologies** : PostgreSQL, MySQL, SQLite via TypeORM
- **Usage** : Production pour données relationnelles
- **Fichiers** : `typeorm-user.repository.ts`, `typeorm-business.repository.ts`, etc.

### 🍃 **NoSQL Repositories** (`/nosql/`)
- **Technologies** : MongoDB, CouchDB via Mongoose
- **Usage** : Production pour données non-relationnelles
- **Fichiers** : `mongo-user.repository.ts`, `mongo-session.repository.ts`, etc.

## 🔧 Configuration et Injection

### 📦 Module Configuration

```typescript
// Infrastructure Module
@Module({
  providers: [
    // Configuration basée sur l'environnement
    {
      provide: TOKENS.USER_REPOSITORY,
      useFactory: (config: ConfigService) => {
        const dbType = config.get('DATABASE_TYPE');
        
        switch (dbType) {
          case 'postgresql':
          case 'mysql':
            return new TypeOrmUserRepository(/* deps */);
          case 'mongodb':
            return new MongoUserRepository(/* deps */);
          default:
            throw new Error(`Unsupported database type: ${dbType}`);
        }
      },
      inject: [ConfigService],
    },
  ],
})
export class InfrastructureModule {}
```

### 🔄 Switch Dynamique

```typescript
// Service de sélection de repository
@Injectable()
export class RepositoryFactory {
  createUserRepository(): UserRepository {
    const dbType = process.env.DATABASE_TYPE;
    
    switch (dbType) {
      case 'sql':
        return this.typeormUserRepository;
      case 'nosql':
        return this.mongoUserRepository;
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}
```

## 🎯 Avantages de cette Architecture

### ✅ **Séparation des Préoccupations**
- Chaque technologie a son dossier dédié
- Code SQL séparé du code NoSQL
- Pas de mélange des concepts

### ✅ **Flexibilité de Déploiement**
- Basculer entre SQL et NoSQL selon l'environnement
- Tests avec SQL, production avec SQL/NoSQL selon besoins
- Migration progressive possible

### ✅ **Maintenance Facilitée**
- Modifications SQL n'affectent pas NoSQL
- Debug plus simple par technologie
- Spécialisations possibles par équipe

### ✅ **Performance Optimisée**
- Requêtes SQL optimisées pour relationnel
- Requêtes NoSQL optimisées pour documents
- Index spécialisés par technologie

## 🚀 Exemples d'Usage

### 🧪 **Tests Unitaires**
```typescript
describe('CreateUserUseCase', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    // Utilise une base de test SQL pour les tests
    userRepository = new TypeOrmUserRepository(/* test database config */);
  });
});
```

### 🏭 **Production SQL**
```typescript
// Configuration pour PostgreSQL
@Module({
  providers: [
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository, // SQL
    },
  ],
})
```

### 🍃 **Production NoSQL**
```typescript
// Configuration pour MongoDB
@Module({
  providers: [
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: MongoUserRepository, // NoSQL
    },
  ],
})
```

## 🔄 Migration et Cohabitation

### 📊 **Migration Progressive**
- Commencer avec SQL pour développement
- Migrer vers SQL pour données relationnelles
- Ajouter NoSQL pour données spécialisées

### 🏢 **Architecture Hybride**
```typescript
// Différents repositories pour différents besoins
@Injectable()
export class UserService {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY_SQL) 
    private userRepo: TypeOrmUserRepository,    // Données principales
    
    @Inject(TOKENS.SESSION_REPOSITORY_NOSQL) 
    private sessionRepo: MongoSessionRepository, // Sessions/cache
  ) {}
}
```

## 🛠️ Bonnes Pratiques

### ✅ **DO**
- Garder les interfaces communes dans le domaine
- Implémenter toutes les méthodes de l'interface
- Optimiser selon la technologie (agrégation MongoDB, joins SQL)
- Utiliser les types spécifiques (TypeORM entities, Mongoose schemas)

### ❌ **DON'T**
- Mélanger les technologies dans un même repository
- Faire des références croisées entre SQL et NoSQL
- Exposer les détails techniques dans les use cases
- Oublier la gestion d'erreurs spécifique à chaque technologie

## 📈 Métriques et Monitoring

### 📊 **Performance Tracking**
- SQL : Query execution time, index usage
- NoSQL : Aggregation pipeline efficiency, document size
- SQL/NoSQL : Connection pool, query performance

### 🔍 **Health Checks**
- Connexion base de données
- Performance des requêtes critiques
- Performance des requêtes (SQL/NoSQL repos)
