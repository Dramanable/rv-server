# 🧪 Structure des Tests - Clean Architecture

Cette structure organise les tests selon les principes de Clean Architecture et sépare clairement les tests unitaires des tests d'intégration.

## 📁 Organisation des Tests

```
src/__tests__/
├── unit/                           # 🧪 Tests Unitaires (rapides, avec mocks)
│   ├── domain/                     # Tests du domaine métier
│   │   ├── entities/               # Tests des entités
│   │   ├── value-objects/          # Tests des value objects
│   │   └── services/               # Tests des services de domaine
│   ├── application/                # Tests de la couche application
│   │   ├── services/               # Tests des services applicatifs
│   │   └── use-cases/              # Tests des cas d'usage
│   ├── infrastructure/             # Tests d'infrastructure (mockés)
│   │   ├── services/               # Tests des adaptateurs
│   │   ├── security/               # Tests de sécurité
│   │   ├── logging/                # Tests de logging
│   │   ├── database/               # Tests de configuration BD
│   │   └── cache/                  # Tests de cache (mockés)
│   ├── presentation/               # Tests de présentation
│   └── shared/                     # Tests des utilitaires partagés
│
├── integration/                    # 🏗️ Tests d'Intégration (avec vraies dépendances)
│   ├── application/                # Tests d'intégration applicatifs
│   ├── infrastructure/             # Tests avec vraies BD/Redis
│   └── presentation/               # Tests E2E controllers
│
└── setup/                          # 🔧 Configuration des tests
    ├── unit-setup.ts               # Setup pour tests unitaires
    ├── integration-setup.ts        # Setup pour tests d'intégration
    ├── global-integration-setup.ts # Setup global intégration
    └── global-integration-teardown.ts
```

## 🎯 Types de Tests

### 🧪 Tests Unitaires (`npm run test:unit`)

- **Objectif** : Tests rapides avec mocks complets
- **Durée** : < 5 secondes par test
- **Dépendances** : Aucune (tout est mocké)
- **Utilisation** : Développement local, CI rapide
- **Coverage** : Domain (95%), Application (90%), Infrastructure (80%)

**Caractéristiques :**
- Mocks de Redis, PostgreSQL, services externes
- Tests déterministes et isolés
- Exécution parallèle possible
- Idéal pour TDD

### 🏗️ Tests d'Intégration (`npm run test:integration`)

- **Objectif** : Tests avec vraies dépendances
- **Durée** : < 30 secondes par test
- **Dépendances** : Redis, PostgreSQL (Docker)
- **Utilisation** : GitHub Actions, validation finale
- **Coverage** : Intégration réelle entre composants

**Caractéristiques :**
- Connexions réelles aux services
- Tests séquentiels (éviter conflits BD)
- Nettoyage automatique entre tests
- Validation end-to-end

## 🚀 Commandes Disponibles

### Tests Unitaires
```bash
npm run test:unit              # Lancer tous les tests unitaires
npm run test:unit:watch        # Mode watch pour développement
npm run test:unit:coverage     # Avec coverage
npm run test                   # Alias pour test:unit
npm run test:tdd               # Mode TDD (watch + verbose)
```

### Tests d'Intégration
```bash
npm run test:integration       # Lancer tests d'intégration
npm run test:integration:watch # Mode watch intégration
npm run test:integration:coverage # Avec coverage

# ⚠️ Nécessite Docker Compose :
docker compose up -d postgres redis
```

### Tests Complets
```bash
npm run test:all               # Unitaires + Intégration
npm run test:ci                # Pour CI (unitaires only)
npm run test:ci:integration    # Pour CI avec intégration
```

## 🔧 Configuration

### Tests Unitaires (`jest.unit.config.js`)
- Mocks globaux automatiques
- Timeouts courts (5s)
- Exécution parallèle
- Coverage élevé requis

### Tests d'Intégration (`jest.integration.config.js`)
- Vraies connexions services
- Timeouts longs (30s)
- Exécution séquentielle
- Setup/teardown automatique

## 📋 Bonnes Pratiques

### 🧪 Tests Unitaires
```typescript
// ✅ Test unitaire avec mocks
describe('UserService - Unit', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = createMock<UserRepository>();
    userService = new UserService(mockRepository);
  });

  it('should create user with valid data', async () => {
    // Given
    const userData = { email: 'test@example.com' };
    mockRepository.save.mockResolvedValue(userData);

    // When
    const result = await userService.createUser(userData);

    // Then
    expect(result).toEqual(userData);
    expect(mockRepository.save).toHaveBeenCalledWith(userData);
  });
});
```

### 🏗️ Tests d'Intégration
```typescript
// ✅ Test d'intégration avec vraies dépendances
describe('UserCacheService - Integration', () => {
  let cacheService: UserCacheService;

  beforeEach(async () => {
    // Utilise la vraie connexion Redis configurée
    cacheService = app.get(UserCacheService);
  });

  it('should store and retrieve user from Redis', async () => {
    // Given
    const user = { id: '123', name: 'John' };

    // When
    await cacheService.storeUser(user);
    const retrieved = await cacheService.getUser('123');

    // Then
    expect(retrieved).toEqual(user);
    expect('user:123').toBeInRedis(); // Matcher personnalisé
  });
});
```

## 🎨 Matchers Personnalisés

### Tests Unitaires
- `toBeUuid()` : Vérifier format UUID
- `toBeValidEmail()` : Vérifier format email

### Tests d'Intégration
- `toBeInRedis(value?)` : Vérifier clé/valeur Redis

## 🐳 Docker pour Tests d'Intégration

```yaml
# docker-compose.test.yml
services:
  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    
  postgres-test:
    image: postgres:16-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
```

## 🔄 Migration des Tests Existants

Les tests ont été automatiquement réorganisés :
- Tests de value objects → `unit/domain/value-objects/`
- Tests d'entités → `unit/domain/entities/`
- Tests de services → `unit/application/services/`
- Tests d'infrastructure → `unit/infrastructure/`
- Tests d'intégration → `integration/`

## 📊 Coverage et Qualité

### Seuils de Coverage
- **Domain** : 95% (logique métier critique)
- **Application** : 90% (business logic)
- **Infrastructure** : 80% (adaptateurs)
- **Global** : 80%

### Workflow CI/CD
```yaml
# GitHub Actions exemple
- name: Unit Tests
  run: npm run test:ci
  
- name: Integration Tests (avec services)
  run: |
    docker compose up -d postgres redis
    npm run test:ci:integration
    docker compose down
```

Cette structure garantit des tests rapides pour le développement local et des tests complets pour la validation en CI/CD.
