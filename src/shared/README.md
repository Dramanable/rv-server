# 🎯 Système de Tokens et Providers Centralisés

## 📋 Vue d'ensemble

Ce système fournit une approche centralisée pour gérer les tokens d'injection de dépendances et les providers dans notre architecture Clean.

## 🏗️ Structure

```
src/shared/
├── constants/
│   └── injection-tokens.ts       # 🔑 Tous les tokens centralisés
├── providers/
│   └── providers.factory.ts      # 🏭 Factory pour créer les providers
├── examples/
│   └── tokens-usage.example.ts   # 📚 Exemples d'utilisation
└── index.ts                      # 📦 Exports centralisés
```

## 🔑 Tokens Disponibles

### Application Layer

```typescript
TOKENS.CREATE_USER_USE_CASE; // Use case création utilisateur
TOKENS.GET_USER_USE_CASE; // Use case récupération utilisateur
TOKENS.LOGGER; // Service de logging
TOKENS.I18N_SERVICE; // Service d'internationalisation
TOKENS.CONFIG_SERVICE; // Service de configuration
```

### Domain Layer

```typescript
TOKENS.USER_REPOSITORY; // Repository utilisateur
TOKENS.EMAIL_SERVICE; // Service email (domaine)
```

### Infrastructure Layer

```typescript
TOKENS.DATABASE_TYPE; // Type de base de données
TOKENS.USER_MAPPER; // Mapper utilisateur
TOKENS.PINO_LOGGER; // Logger Pino spécifique
```

## 🏭 Providers Factory

### Méthodes de base

```typescript
// Créer un provider de classe
ProvidersFactory.createClassProvider(token, implementationClass);

// Créer un provider de valeur
ProvidersFactory.createValueProvider(token, value);

// Créer un provider avec factory
ProvidersFactory.createFactoryProvider(token, factory, dependencies);
```

### Providers spécialisés

```typescript
// Application
ApplicationProviders.createLogger(LoggerClass);
ApplicationProviders.createI18nService(I18nClass);
ApplicationProviders.createConfigService(ConfigClass);

// Domain
DomainProviders.createUserRepository(RepoClass);

// Infrastructure
InfrastructureProviders.createDatabaseType('postgresql');
InfrastructureProviders.createUserMapper(MapperClass);
InfrastructureProviders.createPinoLogger(PinoClass);

// Auto-injection
AutoInjectProviders.createUseCase(token, UseCaseClass);
AutoInjectProviders.createRepository(token, RepoClass);
```

## 📖 Exemples d'utilisation

### 1. Dans un Use Case

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY) private userRepository: IUserRepository,
    @Inject(TOKENS.LOGGER) private logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) private i18n: I18nService,
  ) {}
}
```

### 2. Dans un Module

```typescript
@Module({
  providers: [
    ApplicationProviders.createLogger(PinoLogger),
    DomainProviders.createUserRepository(TypeOrmUserRepository),
    InfrastructureProviders.createDatabaseType('postgresql'),

    // Auto-injection pour Use Cases
    AutoInjectProviders.createUseCase(
      TOKENS.CREATE_USER_USE_CASE,
      CreateUserUseCase,
    ),
  ],
  exports: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER],
})
export class MyModule {}
```

### 3. Dans un Controller

```typescript
@Controller('users')
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE)
    private createUserUseCase: CreateUserUseCase,
    @Inject(TOKENS.LOGGER)
    private logger: Logger,
  ) {}
}
```

## 🎯 Avantages

### ✅ Centralisation

- **Un seul endroit** pour tous les tokens
- **Réutilisation facile** dans tous les modules
- **Maintenance simplifiée** des dépendances

### ✅ Type Safety

- **Validation TypeScript** des tokens
- **Auto-complétion** intelligente
- **Détection d'erreurs** à la compilation

### ✅ Clean Architecture

- **Respect des principes** SOLID
- **Inversion de dépendances** correcte
- **Testabilité** maximale

### ✅ Flexibilité

- **Changement d'implémentation** facile
- **Configuration par environnement**
- **Mocking** simple pour les tests

## 🔄 Migration des modules existants

### Avant (ancien système)

```typescript
@Module({
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'LOGGER',
      useClass: PinoLogger,
    },
  ],
})
```

### Après (nouveau système)

```typescript
@Module({
  providers: [
    DomainProviders.createUserRepository(TypeOrmUserRepository),
    ApplicationProviders.createLogger(PinoLogger),
  ],
})
```

## 🧪 Tests

### Mocking avec tokens

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    const mockModule = Test.createTestingModule({
      providers: [
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: createMockRepository(),
        },
        {
          provide: TOKENS.LOGGER,
          useValue: createMockLogger(),
        },
        CreateUserUseCase,
      ],
    });

    useCase = mockModule.get<CreateUserUseCase>(CreateUserUseCase);
    mockRepository = mockModule.get(TOKENS.USER_REPOSITORY);
  });
});
```

## 🚀 Import et Usage

```typescript
// Import tout depuis shared
import {
  TOKENS,
  ProvidersFactory,
  ApplicationProviders,
  DomainProviders,
  InfrastructureProviders
} from '../shared';

// Utilisation directe
@Inject(TOKENS.USER_REPOSITORY)
ApplicationProviders.createLogger(MyLogger)
```

## 📊 Performance

- **Pas d'impact** sur les performances runtime
- **Optimisation** à la compilation TypeScript
- **Lazy loading** des dépendances conservé
- **Injection normale** NestJS

## 🔧 Configuration

Les tokens supportent différents types de configuration :

```typescript
// Valeur simple
InfrastructureProviders.createDatabaseType('postgresql');

// Factory complexe
ProvidersFactory.createFactoryProvider(
  'COMPLEX_SERVICE',
  (config: ConfigService, logger: Logger) => {
    return new ComplexService(config.get('API_KEY'), logger);
  },
  [TOKENS.CONFIG_SERVICE, TOKENS.LOGGER],
);
```

---

**🎯 Ce système améliore significativement la maintenabilité et la réutilisabilité du code tout en respectant parfaitement les principes Clean Architecture !**
