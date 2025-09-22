`````instructions
````instructions
# 🤖 GitHub Copilot Instructions pour Clean Architecture + NestJS

## 🎯 **Context du Projet**

Vous travaillez sur une **application enterprise NestJS** implémentant la **Clean Architecture de Robert C. Martin (Uncle Bob)** avec une approche **TDD rigoureuse**, les **principes SOLID**, et les **meilleures pratiques TypeScript** strictes. L'application est **production-ready** avec sécurité, i18n, et patterns enterprise.

## 🐳 **ENVIRONNEMENT DOCKER PRINCIPAL**

### 📋 **RÈGLE CRITIQUE : APPLICATION TOUJOURS SUR DOCKER**

L'application **TOURNE EXCLUSIVEMENT SUR DOCKER** avec Docker Compose pour assurer :

- **🎯 Consistance d'environnement** : Même stack partout (dev, staging, prod)
- **🗄️ Base de données intégrée** : PostgreSQL + Redis dans containers
- **🔧 Hot reload activé** : Développement fluide avec volumes montés
- **⚙️ Configuration simplifiée** : Variables d'environnement centralisées
- **🚀 Déploiement reproductible** : Infrastructure as Code

### **🔧 Commandes Docker Obligatoires**

```bash
# 🐳 Démarrer TOUS les services (App + DB + Redis)
make start
# OU
docker-compose up -d

# 📊 Démarrer SEULEMENT les bases de données
make start-db

# 🛑 Arrêter tous les services
make stop

# 🔄 Redémarrer les services
make restart

# 📝 Voir les logs
make logs

# 🧹 Nettoyer volumes et images
make clean
```

### **📦 Services Docker Configurés**

- **🎨 NestJS App** : Port 3000, hot reload, debugging
- **🐘 PostgreSQL 15** : Port 5432, volume persistant, health checks
- **🍃 MongoDB 7** : Port 27017, réplication configurée
- **🔴 Redis** : Port 6379, cache utilisateur et sessions
- **🔧 pgAdmin 4** : Port 5050, interface web DB management

### **⚠️ INTERDICTIONS DÉVELOPPEMENT LOCAL**

- ❌ **JAMAIS** `npm run start:dev` directement sur la machine host
- ❌ **JAMAIS** installer PostgreSQL/Redis localement
- ❌ **JAMAIS** modifier les ports sans mettre à jour docker-compose.yml
- ✅ **TOUJOURS** utiliser Docker pour développement, tests, débogage

## 🚀 **NODE.JS 24 - NOUVELLES FONCTIONNALITÉS À EXPLOITER**

### 📋 **Environnement Technique Requis**

- **Node.js Version** : `24.0.0` minimum (LTS recommandé)
- **Documentation officielle** : https://nodejs.org/en/blog/release/v24.0.0
- **TypeScript** : `5.5+` pour compatibilité maximale avec Node 24

### ⚡ **Nouvelles Fonctionnalités Node.js 24 à Utiliser**

#### **1. 🔧 Enhanced WebStreams Support**

```typescript
// ✅ NOUVEAU - WebStreams natives optimisées
export class DataProcessor {
  async processLargeDataset(data: ReadableStream<Uint8Array>): Promise<void> {
    const transformer = new TransformStream({
      transform(chunk, controller) {
        // Processing logique métier
        const processed = this.transformChunk(chunk);
        controller.enqueue(processed);
      }
    });

    await data
      .pipeThrough(transformer)
      .pipeTo(new WritableStream({
        write(chunk) {
          // Optimisé par Node 24
          this.saveToDatabase(chunk);
        }
      }));
  }
}
```

#### **2. 🚀 Improved V8 Performance (v12.4)**

```typescript
// ✅ NOUVEAU - Optimisations automatiques V8 pour:
export class PerformanceOptimizedService {
  // Object spread operations - 15% plus rapide
  private mergeConfigurations(base: Config, override: Partial<Config>): Config {
    return { ...base, ...override }; // Optimisé par V8 12.4
  }

  // Array operations - 20% plus rapide
  private processLargeArrays<T>(items: T[]): T[] {
    return items
      .filter(this.isValid)
      .map(this.transform)
      .sort(this.compare); // Tri vectorisé optimisé
  }

  // String template literals - Améliorés
  private generateReport(data: ReportData): string {
    return `
      📊 Report Generated: ${new Date().toISOString()}
      📈 Total Items: ${data.items.length}
      🎯 Success Rate: ${(data.successRate * 100).toFixed(2)}%
    `; // Optimisation template string V8 12.4
  }
}
```

#### **3. 🛡️ Enhanced Security Features**

```typescript
// ✅ NOUVEAU - Politique de sécurité renforcée
export class SecureConfigService {
  constructor() {
    // Node 24 - Enhanced permission model
    if (process.permission?.has('fs.read', './config/')) {
      this.loadSecureConfig();
    }
  }

  // NOUVEAU - crypto.webcrypto optimisé
  async generateSecureHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // WebCrypto API natif optimisé Node 24
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
```

#### **4. 📦 Built-in Test Runner Amélioré**

```typescript
// ✅ NOUVEAU - Node.js native test runner enhanced
// package.json scripts
{
  "scripts": {
    "test:node": "node --test **/*.test.js",
    "test:node-watch": "node --test --watch **/*.test.js",
    "test:coverage": "node --test --experimental-test-coverage **/*.test.js"
  }
}

// Tests avec Node native runner
import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('UserService Tests', () => {
  it('should create user successfully', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User'
    });

    // Node 24 - Améliorations assert
    assert.strictEqual(user.email, 'test@example.com');
    assert.ok(user.id);
  });
});
```

#### **5. 🌍 ESM & Import Attributes**

```typescript
// ✅ NOUVEAU - Import attributes pour JSON
import config from './config.json' with { type: 'json' };
import packageInfo from '../package.json' with { type: 'json' };

// ✅ NOUVEAU - Dynamic imports améliorés
export class DynamicModuleLoader {
  async loadPlugin(pluginName: string): Promise<any> {
    // Node 24 - Résolution ESM optimisée
    const module = await import(`./plugins/${pluginName}.js`);
    return module.default;
  }

  // Top-level await dans ESM
  private config = await this.loadConfiguration();
}
```

#### **6. 🔍 Enhanced Debugging & Diagnostics**

```typescript
// ✅ NOUVEAU - Diagnostics intégrés améliorés
export class DiagnosticsService {
  getSystemDiagnostics(): SystemDiagnostics {
    return {
      // Node 24 - Métriques étendues
      memory: process.memoryUsage.rss(),
      heap: process.memoryUsage(),

      // NOUVEAU - Resource usage details
      resourceUsage: process.resourceUsage(),

      // NOUVEAU - Enhanced performance marks
      performanceMarks: performance.getEntriesByType('mark'),

      // Node 24 - Network diagnostics
      networkInterfaces: require('os').networkInterfaces()
    };
  }

  // NOUVEAU - Performance observer API amélioré
  observePerformance(): void {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.logger.debug(`Performance: ${entry.name} took ${entry.duration}ms`);
      });
    });

    obs.observe({ entryTypes: ['function', 'http', 'dns'] });
  }
}
```

### 📋 **Checklist Node.js 24 Migration**

- [ ] **Version Check** : `node --version` >= 24.0.0
- [ ] **ESM Migration** : Convertir vers `"type": "module"` si nécessaire
- [ ] **Import Attributes** : Utiliser `with { type: 'json' }` pour JSON
- [ ] **WebStreams** : Migrer vers WebStreams API natif
- [ ] **Test Runner** : Évaluer l'utilisation du test runner natif
- [ ] **Performance** : Profiter des optimisations V8 12.4
- [ ] **Security** : Implémenter les nouvelles fonctionnalités crypto
- [ ] **Diagnostics** : Intégrer les nouveaux outils de monitoring

### 🚨 **Patterns Spécifiques Node.js 24**

#### **Gestion Mémoire Optimisée**
```typescript
// ✅ Node 24 - Weak references optimisées
export class CacheService {
  private cache = new WeakMap(); // Optimisé pour GC
  private registry = new FinalizationRegistry((key) => {
    this.logger.debug(`Cache entry ${key} garbage collected`);
  });
}
```

#### **Worker Threads Améliorés**
```typescript
// ✅ Node 24 - Worker threads performance
import { Worker, isMainThread, parentPort } from 'worker_threads';

export class ComputeService {
  async heavyComputation(data: any[]): Promise<any[]> {
    if (data.length > 1000) {
      // Node 24 - Optimized worker spawning
      return this.processInWorker(data);
    }
    return this.processInMain(data);
  }
}
```

### 🎯 **Recommandations Architecture avec Node.js 24**

1. **ESM First** : Privilégier les modules ES natifs
2. **WebStreams** : Utiliser pour le traitement de gros volumes
3. **Native Test Runner** : Pour les tests unitaires simples
4. **Enhanced Crypto** : Pour la sécurité renforcée
5. **Performance Monitoring** : Exploiter les nouveaux outils de diagnostic
6. **Worker Threads** : Pour les calculs intensifs

## 🏗️ **MÉTHODOLOGIE DE DÉVELOPPEMENT EN COUCHES ORDONNÉES**

### 🎯 **ORDRE OBLIGATOIRE DE DÉVELOPPEMENT - TDD STRICT**

**⚠️ RÈGLE FONDAMENTALE : Le workflow part TOUJOURS de la couche Domain, puis Application, puis Infrastructure et à la fin Presentation en mode Test Driven Development.**

**Pour éviter les erreurs de dépendances et garantir une architecture cohérente, TOUJOURS développer dans cet ordre strict avec TDD :**

### 🔄 **Processus TDD par Couche - OBLIGATOIRE** :
1. **🔴 RED** : Écrire le test qui échoue pour la fonctionnalité
2. **🟢 GREEN** : Écrire le code minimal qui fait passer le test
3. **🔵 REFACTOR** : Améliorer le code en gardant les tests verts
4. **✅ VALIDATE** : Vérifier que la couche compile et tous ses tests passent
5. **➡️ NEXT LAYER** : Passer à la couche suivante UNIQUEMENT si la précédente est terminée

### ⚠️ **RÈGLES CRITIQUES NON-NÉGOCIABLES**
- ❌ **JAMAIS** développer plusieurs fonctionnalités simultanément
- ❌ **JAMAIS** passer à la couche suivante si la précédente a des tests qui échouent
- ❌ **JAMAIS** écrire du code sans test préalable (TDD strict)
- ❌ **JAMAIS** ignorer les erreurs de compilation d'une couche
- ✅ **TOUJOURS** une seule fonctionnalité à la fois (ex: CreateUser → UpdateUser → DeleteUser)
- ✅ **TOUJOURS** finir complètement une couche avant de passer à la suivante
- ✅ **TOUJOURS** écrire les tests AVANT le code (TDD strict)
- ✅ **TOUJOURS** valider la compilation après chaque modification

### 📋 **WORKFLOW DÉTAILLÉ PAR COUCHE**

#### **🏗️ Exemple Concret : Fonctionnalité "Create Business"**

**Étape 1️⃣ : DOMAIN** (Obligatoire en premier)
```bash
# 1. Créer les tests d'entité Business
touch src/domain/entities/business.entity.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer l'entité Business (GREEN)
# 4. Refactorer si nécessaire (REFACTOR)
# 5. Valider : npm test -- business.entity.spec.ts
```

**Étape 2️⃣ : APPLICATION** (Seulement après Domain terminé)
```bash
# 1. Créer les tests de use case
touch src/application/use-cases/business/create-business.use-case.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer le use case CreateBusinessUseCase (GREEN)
# 4. Créer l'interface BusinessRepository dans domain/repositories/
# 5. Refactorer si nécessaire (REFACTOR)
# 6. Valider : npm test -- create-business.use-case.spec.ts
```

**Étape 3️⃣ : INFRASTRUCTURE** (Seulement après Application terminé)
```bash
# 1. Créer les tests de repository
touch src/infrastructure/database/repositories/typeorm-business.repository.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer l'entité ORM BusinessOrmEntity (GREEN)
# 4. Créer TypeOrmBusinessRepository qui implémente BusinessRepository (GREEN)
# 5. Configurer l'injection de dépendances (GREEN)
# 6. Refactorer si nécessaire (REFACTOR)
# 7. Valider : npm test -- typeorm-business.repository.spec.ts
```

**Étape 4️⃣ : PRESENTATION** (Seulement après Infrastructure terminé)
```bash
# 1. Créer les tests de controller
touch src/presentation/controllers/business.controller.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer les DTOs de validation (GREEN)
# 4. Créer BusinessController (GREEN)
# 5. Configurer la validation et la documentation Swagger (GREEN)
# 6. Refactorer si nécessaire (REFACTOR)
# 7. Valider : npm test -- business.controller.spec.ts
# 8. Test d'intégration E2E : npm run test:e2e -- business
```

### 🚨 **VIOLATIONS COURANTES À ÉVITER**
- **Commencer par le controller** → ❌ Violation de Clean Architecture
- **Créer l'entité ORM avant l'entité Domain** → ❌ Violation de dépendance
- **Écrire du code sans test** → ❌ Violation de TDD
- **Passer à Infrastructure avec des tests Application qui échouent** → ❌ Violation de workflow

#### **1️⃣ DOMAIN (Couche Métier) - EN PREMIER**
```
src/domain/
├── entities/          # Entités métier pures
├── value-objects/     # Objets valeur immutables
├── services/          # Services métier (règles complexes)
├── repositories/      # Interfaces repositories (ports)
└── exceptions/        # Exceptions métier spécifiques
```
**✅ Caractéristiques** :
- **ZÉRO dépendance externe** (pas de NestJS, pas d'ORM, pas de framework)
- **Pure TypeScript** avec types stricts
- **Logique métier uniquement**
- **Testable en isolation**

#### **2️⃣ APPLICATION (Cas d'Usage) - EN SECOND**
```
src/application/
├── services/          # Services applicatifs (PRÉFÉRER aux use-cases)
├── ports/             # Interfaces pour l'infrastructure
├── use-cases/         # Cases d'utilisation (seulement si nécessaire)
└── exceptions/        # Exceptions applicatives
```
**✅ Caractéristiques** :
- **PRÉFÉRER les Services** aux Use Cases complexes
- **Dépend UNIQUEMENT** de la couche Domain
- **ZÉRO dépendance** vers Infrastructure ou Presentation
- **Orchestration simple** des entités et services métier
- **Définit les ports** (interfaces) pour l'infrastructure
- **Logique d'application claire** et testable

#### **3️⃣ INFRASTRUCTURE (Technique) - EN TROISIÈME**
```
src/infrastructure/
├── database/          # Repositories concrets, ORM, migrations
├── services/          # Services techniques (JWT, Email, etc.)
├── config/            # Configuration
└── security/          # Sécurité technique
```
**✅ Caractéristiques** :
- **Implémente les ports** définis dans Application
- **Peut utiliser NestJS** et autres frameworks
- **Aucune logique métier**
- **Adaptateurs** vers le monde externe

#### **4️⃣ PRESENTATION (Interface) - EN DERNIER**
```
src/presentation/
├── controllers/       # Contrôleurs HTTP
├── dtos/              # Objets de transfert
├── decorators/        # Décorateurs NestJS
└── mappers/           # Conversion DTO ↔ Domain
```
**✅ Caractéristiques** :
- **Orchestration** des Services Application (PAS d'Use Cases complexes)
- **Validation** des entrées avec class-validator
- **Sérialisation** des sorties
- **Documentation Swagger** complète et détaillée
- **Support i18n** pour messages d'erreur
- **Interface utilisateur** (REST, GraphQL, etc.)

### 📧 **RÈGLE PORTS & ADAPTERS pour Services Externes**
**Tous les services externes (Email, SMS, etc.) DOIVENT être des ports/adapters :**
- **Port** (Interface) dans `/application/ports/`
- **Adapter** (Implémentation) dans `/infrastructure/services/`
- **Exemples** : EmailPort → GmailAdapter, SmsPort → TwilioAdapter

### 🗄️ **RÈGLE OBLIGATOIRE : MIGRATIONS TYPEORM POUR NOUVELLES ENTITÉS**
**Pour chaque nouvelle entité créée dans la couche infrastructure, créer SYSTÉMATIQUEMENT :**
- **Migration TypeORM** dans `/src/infrastructure/database/sql/postgresql/migrations/`
- **Nom du fichier** : `{timestamp}-{ActionEntityTable}.ts` (ex: `1695829200000-CreateAppointmentsTable.ts`)
- **Contenu** : Utiliser l'API TypeORM 0.3+ avec `QueryRunner`
- **Validation** : Tester la migration avant de commiter

#### **🛠️ Template Obligatoire pour Migration TypeORM**

```typescript
import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class Create{Entity}Table{Timestamp} implements MigrationInterface {
  name = 'Create{Entity}Table{Timestamp}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '{entity_name}s',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          // Autres colonnes...
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Index et Foreign Keys si nécessaire
    await queryRunner.createIndex('{entity_name}s', new Index('{entity_name}_idx', ['column']));

    // Foreign Keys
    await queryRunner.createForeignKey('{entity_name}s', new ForeignKey({
      columnNames: ['foreign_column_id'],
      referencedTableName: 'referenced_table',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('{entity_name}s');
  }
}
```

#### **📋 Checklist Migration Obligatoire**
- [ ] ✅ **Nom du fichier** respecte le format `{timestamp}-{Action}{Entity}Table.ts`
- [ ] ✅ **UUID par défaut** avec `uuid_generate_v4()`
- [ ] ✅ **created_at/updated_at** avec defaults appropriés
- [ ] ✅ **Index** sur les colonnes fréquemment utilisées
- [ ] ✅ **Foreign Keys** avec contraintes appropriées (`CASCADE`, `RESTRICT`)
- [ ] ✅ **Méthode down()** pour rollback complet
- [ ] ✅ **Test migration** avec `npm run migration:run` et `npm run migration:revert`

### 🚀 **AVANTAGES DE CETTE APPROCHE**

#### **✅ Réduction des Erreurs**
- **Pas de dépendances circulaires** : chaque couche ne dépend que des précédentes
- **Compilation incrémentale** : chaque couche compile avant de passer à la suivante
- **Détection précoce** des violations architecturales

#### **✅ Développement Efficace**
- **Focus progressif** : une préoccupation à la fois
- **Tests ciblés** : chaque couche testable indépendamment
- **Refactoring sûr** : modifications isolées par couche

#### **✅ Qualité Architecturale**
- **Respect automatique** des principes Clean Architecture
- **Séparation claire** des responsabilités
- **Évolutivité** et maintenabilité garanties

### ✅ **CHECKPOINTS DE VALIDATION OBLIGATOIRES**

**À chaque fin de couche, vérifier OBLIGATOIREMENT :**

#### **🔍 Checkpoint Domain**
```bash
# Tests unitaires Domain
npm test -- --testPathPattern=domain/ --coverage
# Compilation TypeScript
npm run build
# Linting sans erreur
npm run lint
# RÉSULTAT ATTENDU : 100% tests passants, 0 erreur compilation, 0 erreur lint
```

#### **🔍 Checkpoint Application**
```bash
# Tests unitaires Application + Domain
npm test -- --testPathPattern="(domain|application)/" --coverage
# Vérification des interfaces (ports)
# RÉSULTAT ATTENDU : Coverage > 80%, toutes les interfaces définies, 0 erreur
```

#### **� Checkpoint Infrastructure**
```bash
# Tests unitaires Infrastructure + couches précédentes
npm test -- --testPathPattern="(domain|application|infrastructure)/" --coverage
# Tests d'intégration base de données
npm run test:integration
# RÉSULTAT ATTENDU : Connexion DB OK, repositories fonctionnels, DI configuré
```

#### **🔍 Checkpoint Presentation**
```bash
# Tests complets + E2E
npm test
npm run test:e2e
# Test de démarrage application
npm run start:dev
# RÉSULTAT ATTENDU : Application démarre, endpoints répondent, documentation Swagger
```

### �📋 **WORKFLOW PRATIQUE - EXEMPLE CONCRET**

```typescript
// 1️⃣ DOMAIN - Créer d'abord l'entité (avec test RED-GREEN-REFACTOR)
export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _name: string,
  ) {}

  static create(email: Email, name: string): User {
    // Validation métier
    return new User(generateId(), email, name);
  }
}

// 2️⃣ APPLICATION - Puis le use case
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface définie ici
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Orchestration métier
  }
}

// 3️⃣ INFRASTRUCTURE - Ensuite l'implémentation
export class TypeOrmUserRepository implements IUserRepository {
  // Implémentation technique
}

// 4️⃣ PRESENTATION - Enfin le contrôleur
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // Interface utilisateur
  }
}
```

### ⚠️ **INTERDICTIONS ABSOLUES - WORKFLOW TDD**

#### **❌ Ne JAMAIS faire** :
- **Commencer par les contrôleurs** (Presentation) → ❌ Violation Clean Architecture
- **Développer plusieurs couches simultanément** → ❌ Violation TDD
- **Écrire du code sans test** → ❌ Violation TDD strict
- **Passer à la couche suivante avec des tests qui échouent** → ❌ Violation workflow
- **Écrire de la logique métier dans Infrastructure** → ❌ Violation séparation
- **Utiliser NestJS dans Domain/Application** → ❌ Violation indépendance framework
- **Créer des dépendances vers les couches supérieures** → ❌ Violation Dependency Rule
- **Ignorer les erreurs de compilation/lint** → ❌ Violation qualité code

#### **✅ TOUJOURS faire - WORKFLOW OBLIGATOIRE** :
- **Respecter l'ordre strict** : Domain → Application → Infrastructure → Presentation
- **TDD à chaque étape** : RED → GREEN → REFACTOR → VALIDATE
- **Tester chaque couche complètement** avant de passer à la suivante
- **Valider compilation + lint** à chaque modification
- **Documenter les interfaces (ports)** dans Application
- **Une fonctionnalité à la fois** jusqu'à completion E2E
- **Checkpoints de validation** obligatoires entre couches

#### **🚨 DÉTECTION PRÉCOCE DES VIOLATIONS**

```bash
# Vérifier les imports interdits dans Domain/Application
grep -r "@nestjs\|typeorm\|express" src/domain/ src/application/
# RÉSULTAT ATTENDU : Aucun résultat (0 ligne)

# Vérifier les dépendances circulaires
npx madge --circular src/
# RÉSULTAT ATTENDU : No circular dependencies found

# Vérifier la structure des tests par couche
find src/ -name "*.spec.ts" | head -20
# RÉSULTAT ATTENDU : Tests présents dans chaque couche
```

#### **🔄 CORRECTION DES VIOLATIONS**

Si une violation est détectée :
1. **STOP** le développement immédiatement
2. **ROLLBACK** aux derniers tests passants
3. **ANALYSER** la cause de la violation
4. **REPRENDRE** depuis la dernière couche validée
5. **APPLIQUER** le workflow TDD strict

### 🧪 **TEST-DRIVEN DEVELOPMENT (TDD) - PRATIQUES OBLIGATOIRES**

#### **🎯 Cycle TDD Red-Green-Refactor**

**Pour CHAQUE fonctionnalité, suivre ce cycle dans CHAQUE couche :**

1. **🔴 RED Phase** :
   ```bash
   # Écrire le test qui échoue AVANT le code
   npm test -- some.spec.ts
   # RÉSULTAT ATTENDU : Test fails (RED)
   ```

2. **🟢 GREEN Phase** :
   ```bash
   # Écrire le code minimal qui fait passer le test
   npm test -- some.spec.ts
   # RÉSULTAT ATTENDU : Test passes (GREEN)
   ```

3. **🔵 REFACTOR Phase** :
   ```bash
   # Améliorer le code en gardant les tests verts
   npm test -- some.spec.ts
   npm run lint
   # RÉSULTAT ATTENDU : Tests pass + code quality
   ```

#### **📋 Structure de Tests par Couche**

**Domain Layer Tests** :
```typescript
// ✅ Tests d'entités avec règles métier
describe('User Entity', () => {
  it('should create user with valid data', () => {
    // Test de création valide
  });

  it('should throw error with invalid email', () => {
    // Test de validation métier
  });
});

// ✅ Tests de Value Objects
describe('Email Value Object', () => {
  it('should validate email format', () => {
    // Test de validation format
  });
});
```

**Application Layer Tests** :
```typescript
// ✅ Tests de Use Cases avec mocks
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    useCase = new CreateUserUseCase(mockUserRepo);
  });

  it('should create user successfully', async () => {
    // Test du cas nominal
  });
});
```

**Infrastructure Layer Tests** :
```typescript
// ✅ Tests d'intégration avec base de données
describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createTestConnection();
    repository = new TypeOrmUserRepository(connection);
  });

  it('should save user to database', async () => {
    // Test de persistence réelle
  });
});
```

**Presentation Layer Tests** :
```typescript
// ✅ Tests E2E complets
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(validUserDto)
      .expect(201);
  });
});
```

#### **🎯 Couverture de Tests Minimale**

- **Domain** : 95%+ coverage obligatoire
- **Application** : 90%+ coverage obligatoire
- **Infrastructure** : 80%+ coverage acceptable
- **Presentation** : 85%+ coverage avec E2E

#### **⚠️ RÈGLES TDD NON-NÉGOCIABLES**

- ❌ **ZÉRO code sans test préalable**
- ❌ **ZÉRO test ignoré (.skip ou .todo)**
- ❌ **ZÉRO commit avec tests qui échouent**
- ✅ **Tests AVANT le code (RED-GREEN-REFACTOR)**
- ✅ **Un test = une responsabilité**
- ✅ **Tests lisibles et maintenables**
- ✅ **Mocks pour les dépendances externes**

## 🏛️ **Clean Architecture - Principes Fondamentaux d'Uncle Bob**

### 📚 **Référence Officielle**

**Source** : [The Clean Architecture par Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### 🎯 **Objectifs de la Clean Architecture**

La Clean Architecture produit des systèmes qui sont :

1. **🔧 Independent of Frameworks** - L'architecture ne dépend pas de l'existence de frameworks. Vous utilisez les frameworks comme des outils, plutôt que de contraindre votre système dans leurs limitations.

2. **🧪 Testable** - Les règles métier peuvent être testées sans UI, Database, Web Server, ou tout autre élément externe.

3. **🎨 Independent of UI** - L'UI peut changer facilement, sans changer le reste du système. Une Web UI peut être remplacée par une console UI sans changer les règles métier.

4. **🗄️ Independent of Database** - Vous pouvez échanger Oracle ou SQL Server pour Mongo, BigTable, CouchDB, ou autre chose. Vos règles métier ne sont pas liées à la base de données.

5. **🌐 Independent of any external agency** - Vos règles métier ne savent simplement rien du monde extérieur.

### 🔄 **The Dependency Rule - RÈGLE FONDAMENTALE**

> **"Source code dependencies can only point inwards"**

![Clean Architecture Circles](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

**Les cercles concentriques représentent différentes zones du logiciel :**

- Plus vous allez vers l'intérieur, plus le niveau du logiciel est élevé
- Les cercles extérieurs sont des mécanismes
- Les cercles intérieurs sont des politiques

**❌ INTERDIT** : Rien dans un cercle intérieur ne peut connaître quoi que ce soit d'un cercle extérieur
**❌ INTERDIT** : Le nom de quelque chose déclaré dans un cercle extérieur ne doit pas être mentionné par le code dans un cercle intérieur

## 🚨 **RÈGLE CRITIQUE - AUCUNE DÉPENDANCE NESTJS DANS DOMAIN/APPLICATION**

### ❌ **VIOLATIONS ABSOLUMENT INTERDITES**

Les couches **Domain** et **Application** NE DOIVENT JAMAIS contenir :
- `import { Injectable, Inject } from '@nestjs/common'`
- `@Injectable()` decorator
- `@Inject()` decorator
- Aucun import de `@nestjs/*` packages
- Aucune référence aux tokens d'injection NestJS

### ✅ **APPROCHE CORRECTE**

```typescript
// ❌ INTERDIT - Violation de Clean Architecture
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPOSITORY') private userRepo: IUserRepository
  ) {}
}

// ✅ CORRECT - Clean Architecture respectée
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}
}
```

### 🏗️ **Séparation des Responsabilités**

- **Domain/Application** : Logic métier pure, sans framework
- **Infrastructure** : Implémentations techniques avec NestJS
- **Presentation** : Controllers NestJS qui orchestrent les Use Cases

### 🔗 **Injection de Dépendances**

L'injection NestJS se fait UNIQUEMENT dans la couche **Presentation/Infrastructure** :
```typescript
// Dans presentation/controllers/*.controller.ts
@Controller()
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase
  ) {}
}
```

**Cette règle est NON-NÉGOCIABLE pour maintenir les principes de Clean Architecture !**

## 🗺️ **MAPPERS - PATTERN OBLIGATOIRE POUR CONVERSION DE DONNÉES**

### 🎯 **RÈGLE CRITIQUE : ZÉRO LOGIQUE DE MAPPING DANS LES ENTITÉS ORM**

**❌ VIOLATION ARCHITECTURALE MAJEURE :**
Les entités ORM (TypeORM, Prisma, etc.) NE DOIVENT JAMAIS contenir de logique de conversion vers les entités Domain. Cette responsabilité appartient exclusivement aux Mappers dédiés dans `/infrastructure/mappers/`.

### 🚫 **INTERDICTIONS ABSOLUES**

```typescript
// ❌ STRICTEMENT INTERDIT - Logique métier dans l'entité ORM
@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ❌ JAMAIS de méthode toDomainEntity() dans l'entité ORM
  toDomainEntity(): User {
    const email = Email.create(this.email);
    return User.create(email, this.name); // VIOLATION !
  }

  // ❌ JAMAIS d'imports domaine dans les entités ORM
  // import { User } from '../../../domain/entities/user.entity';
}
```

### ✅ **PATTERN CORRECT : MAPPERS DÉDIÉS**

```typescript
// ✅ EXCELLENT - Mapper dédié dans /infrastructure/mappers/
export class UserOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domain.getId().getValue();
    ormEntity.email = domain.getEmail().getValue();
    ormEntity.name = domain.getName();
    ormEntity.role = domain.getRole();
    ormEntity.created_at = domain.getCreatedAt();
    ormEntity.updated_at = domain.getUpdatedAt();
    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: UserOrmEntity): User {
    const email = Email.create(orm.email);
    const userId = UserId.fromString(orm.id);

    return User.reconstruct({
      id: userId,
      email: email,
      name: orm.name,
      role: orm.role,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  /**
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(ormEntities: UserOrmEntity[]): User[] {
    return ormEntities.map(orm => this.toDomainEntity(orm));
  }
}
```

### 📁 **STRUCTURE OBLIGATOIRE DES MAPPERS**

```
src/infrastructure/mappers/
├── orm-mappers.ts           # Export centralisé de tous les mappers
├── user-orm.mapper.ts       # Mapper User : Domain ↔ ORM
├── business-orm.mapper.ts   # Mapper Business : Domain ↔ ORM
├── service-orm.mapper.ts    # Mapper Service : Domain ↔ ORM
└── staff-orm.mapper.ts      # Mapper Staff : Domain ↔ ORM
```

### 🔄 **RESPONSABILITÉS DES MAPPERS**

#### **1️⃣ Conversion Domain → ORM (Persistence)**
```typescript
// Pour les opérations CREATE et UPDATE
static toOrmEntity(domain: DomainEntity): OrmEntity {
  // Conversion des Value Objects vers types primitifs
  // Gestion des relations et foreign keys
  // Préparation pour persistence en base
}
```

#### **2️⃣ Conversion ORM → Domain (Reconstruction)**
```typescript
// Pour les opérations READ et hydratation
static toDomainEntity(orm: OrmEntity): DomainEntity {
  // Reconstruction des Value Objects depuis primitifs
  // Validation et création des entités Domain
  // Préservation de l'intégrité métier
}
```

#### **3️⃣ Conversion Batch (Collections)**
```typescript
// Pour les opérations sur collections
static toDomainEntities(ormList: OrmEntity[]): DomainEntity[] {
  return ormList.map(orm => this.toDomainEntity(orm));
}

static toOrmEntities(domainList: DomainEntity[]): OrmEntity[] {
  return domainList.map(domain => this.toOrmEntity(domain));
}
```

### 🏗️ **UTILISATION DANS LES REPOSITORIES**

```typescript
// ✅ EXCELLENT - Usage correct des mappers dans Repository
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    // 1. Conversion Domain → ORM via Mapper
    const ormEntity = UserOrmMapper.toOrmEntity(user);

    // 2. Persistence en base
    const savedOrm = await this.repository.save(ormEntity);

    // 3. Conversion ORM → Domain via Mapper
    return UserOrmMapper.toDomainEntity(savedOrm);
  }

  async findById(id: UserId): Promise<User | null> {
    // 1. Requête ORM
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() }
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain via Mapper
    return UserOrmMapper.toDomainEntity(ormEntity);
  }

  async findAll(criteria: UserCriteria): Promise<User[]> {
    // 1. Requête ORM avec critères
    const ormEntities = await this.repository.find(/* critères */);

    // 2. Conversion batch via Mapper
    return UserOrmMapper.toDomainEntities(ormEntities);
  }
}
```

### 🚨 **ERREURS COURANTES À ÉVITER**

#### **❌ Import Domain dans Entité ORM**
```typescript
// VIOLATION - Ne jamais importer Domain dans ORM
import { User } from '../../../domain/entities/user.entity'; // INTERDIT !

@Entity('users')
export class UserOrmEntity {
  // Cette entité ne doit connaître QUE TypeORM
}
```

#### **❌ Logique Métier dans Mapper**
```typescript
// VIOLATION - Mapper ne doit contenir QUE de la conversion
static toDomainEntity(orm: UserOrmEntity): User {
  const email = Email.create(orm.email);

  // ❌ INTERDIT - Pas de logique métier dans mapper
  if (email.getValue().includes('admin')) {
    user.grantAdminRights(); // VIOLATION !
  }

  return user;
}
```

#### **❌ Conversion Directe sans Mapper**
```typescript
// VIOLATION - Toujours passer par le mapper
async save(user: User): Promise<User> {
  // ❌ INTERDIT - Conversion manuelle
  const ormEntity = new UserOrmEntity();
  ormEntity.email = user.getEmail().getValue(); // VIOLATION !

  // ✅ CORRECT - Utiliser le mapper
  const ormEntity = UserOrmMapper.toOrmEntity(user);
}
```

### 📋 **CHECKLIST MAPPERS OBLIGATOIRE**

- [ ] ✅ **Zéro méthode de mapping dans entités ORM**
- [ ] ✅ **Mappers dédiés dans `/infrastructure/mappers/`**
- [ ] ✅ **Méthodes statiques `toOrmEntity()` et `toDomainEntity()`**
- [ ] ✅ **Support des collections avec `toDomainEntities()`**
- [ ] ✅ **Aucun import Domain dans entités ORM**
- [ ] ✅ **Aucune logique métier dans mappers**
- [ ] ✅ **Validation par les tests unitaires des mappers**
- [ ] ✅ **Export centralisé dans `orm-mappers.ts`**

### 🎯 **TESTS UNITAIRES MAPPERS OBLIGATOIRES**

```typescript
// ✅ Tests complets pour chaque mapper
describe('UserOrmMapper', () => {
  describe('toDomainEntity', () => {
    it('should convert ORM entity to Domain entity', () => {
      // Given
      const ormEntity = createValidUserOrmEntity();

      // When
      const domainEntity = UserOrmMapper.toDomainEntity(ormEntity);

      // Then
      expect(domainEntity).toBeInstanceOf(User);
      expect(domainEntity.getEmail().getValue()).toBe(ormEntity.email);
    });

    it('should handle null values correctly', () => {
      // Test des cas limites et valeurs nulles
    });
  });

  describe('toOrmEntity', () => {
    it('should convert Domain entity to ORM entity', () => {
      // Test de la conversion inverse
    });
  });

  describe('toDomainEntities', () => {
    it('should convert array of ORM entities', () => {
      // Test des collections
    });
  });
});
```

**Cette séparation stricte garantit une architecture propre, maintenable et respectueuse des principes de Clean Architecture !**

### 💎 **VALUE OBJECTS - BONNES PRATIQUES DANS LES MAPPERS**

#### **🎯 RÈGLE IMPORTANTE : RECONSTRUCTION CORRECTE DES VALUE OBJECTS**

Les Value Objects doivent être correctement reconstruits dans les mappers en utilisant les bonnes méthodes factory :

```typescript
// ✅ EXCELLENT - Reconstruction correcte des Value Objects
export class UserOrmMapper {
  static toDomainEntity(orm: UserOrmEntity): User {
    // ✅ Utilisation des méthodes factory appropriées
    const userId = UserId.fromString(orm.id);
    const email = Email.create(orm.email); // Pour validation
    const phone = orm.phone ? Phone.create(orm.phone) : undefined;

    return User.reconstruct({
      id: userId,
      email: email,
      name: orm.name,
      phone: phone,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  static toOrmEntity(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();

    // ✅ Extraction des valeurs primitives
    orm.id = domain.getId().getValue();
    orm.email = domain.getEmail().getValue();
    orm.name = domain.getName();
    orm.phone = domain.getPhone()?.getValue();
    orm.created_at = domain.getCreatedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }
}
```

#### **🚨 ERREURS COURANTES AVEC VALUE OBJECTS**

```typescript
// ❌ INTERDIT - Construction directe sans validation
const email = new Email(orm.email); // VIOLATION !

// ✅ CORRECT - Utilisation de la méthode factory
const email = Email.create(orm.email); // Validation automatique

// ❌ INTERDIT - Reconstruction incorrecte d'ID
const userId = new UserId(orm.id); // VIOLATION !

// ✅ CORRECT - Méthode factory appropriée
const userId = UserId.fromString(orm.id); // Type-safe

// ❌ INTERDIT - Gestion incorrecte des nullable
const phone = Phone.create(orm.phone); // Peut planter si null !

// ✅ CORRECT - Gestion sécurisée des nullable
const phone = orm.phone ? Phone.create(orm.phone) : undefined;
```

#### **📋 MAPPING PATTERNS PAR TYPE DE VALUE OBJECT**

```typescript
// 🆔 ID Value Objects
const userId = UserId.fromString(orm.user_id);
const businessId = BusinessId.fromString(orm.business_id);
const serviceId = ServiceId.fromString(orm.service_id);

// 📧 Email (avec validation)
const email = Email.create(orm.email);

// 📱 Phone (nullable)
const phone = orm.phone ? Phone.create(orm.phone) : undefined;

// 💰 Money (complexe)
const price = Money.create(orm.price_amount, orm.price_currency);

// 🌐 URL (avec validation)
const profileImage = orm.profile_image_url
  ? FileUrl.create(orm.profile_image_url)
  : undefined;

// 📅 Dates (primitives)
const createdAt = orm.created_at; // Date directe
const updatedAt = orm.updated_at; // Date directe
```

#### **✅ TEMPLATE MAPPER STANDARD**

```typescript
export class {Entity}OrmMapper {
  static toDomainEntity(orm: {Entity}OrmEntity): {Entity} {
    // 1. Reconstruction des Value Objects avec validation
    const id = {Entity}Id.fromString(orm.id);
    const email = Email.create(orm.email);
    const phone = orm.phone ? Phone.create(orm.phone) : undefined;

    // 2. Reconstruction de l'entité Domain
    return {Entity}.reconstruct({
      id,
      email,
      phone,
      // Autres propriétés...
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  static toOrmEntity(domain: {Entity}): {Entity}OrmEntity {
    const orm = new {Entity}OrmEntity();

    // 1. Extraction des valeurs primitives
    orm.id = domain.getId().getValue();
    orm.email = domain.getEmail().getValue();
    orm.phone = domain.getPhone()?.getValue();

    // 2. Dates et primitives directes
    orm.created_at = domain.getCreatedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }

  static toDomainEntities(ormList: {Entity}OrmEntity[]): {Entity}[] {
    return ormList.map(orm => this.toDomainEntity(orm));
  }
}
```

### 🏗️ **Les 4 Couches Principales**

#### 1. 🏛️ **Entities (Entités)**

- **Rôle** : Encapsulent les règles métier de l'enterprise
- **Contenu** : Objets avec méthodes OU structures de données + fonctions
- **Stabilité** : Les moins susceptibles de changer lors de changements externes
- **Exemple** : Pas affectées par les changements de navigation, sécurité, ou UI

#### 2. 💼 **Use Cases (Cas d'Usage)**

- **Rôle** : Contiennent les règles métier spécifiques à l'application
- **Contenu** : Orchestrent le flux de données vers/depuis les entités
- **Isolation** : Isolées des préoccupations externes (DB, UI, frameworks)
- **Impact** : Affectées uniquement par les changements d'opérations applicatives

#### 3. 🔌 **Interface Adapters (Adaptateurs d'Interface)**

- **Rôle** : Ensemble d'adaptateurs qui convertissent les données
- **Contenu** : MVC, Presenters, Views, Controllers, Repository implementations
- **Conversion** : Du format le plus pratique pour use cases/entities vers le format externe
- **Exemple** : Tout le SQL doit être restreint à cette couche

#### 4. 🔧 **Frameworks and Drivers (Frameworks et Pilotes)**

- **Rôle** : Couche la plus externe composée de frameworks et outils
- **Contenu** : Database, Web Framework, outils externes
- **Code** : Principalement du code de "glue" qui communique vers l'intérieur
- **Détails** : Où tous les détails vont (Web, Database sont des détails)

### 🚪 **Crossing Boundaries (Franchissement des Frontières)**

#### 🔄 **Dependency Inversion Principle**

- **Problème** : Use case doit appeler presenter, mais ne peut pas (violation de Dependency Rule)
- **Solution** : Use case appelle une interface dans le cercle intérieur
- **Implémentation** : Presenter dans cercle extérieur implémente l'interface
- **Technique** : Polymorphisme dynamique pour créer des dépendances qui s'opposent au flux de contrôle

#### 📦 **Data Crossing Boundaries**

- **Format** : Structures de données simples et isolées
- **Types autorisés** : Structs basiques, Data Transfer Objects, arguments de fonctions
- **❌ INTERDIT** : Passer des Entities ou Database rows à travers les frontières
- **❌ INTERDIT** : Structures de données avec dépendances violant la Dependency Rule
- **✅ RÈGLE** : Données toujours dans le format le plus pratique pour le cercle intérieur

## 📝 **Commits Sémantiques OBLIGATOIRES**

### 🎯 **Conventional Commits avec Commitlint**

Ce projet utilise **[Commitlint](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)** pour garantir des commits sémantiques et conventionnels standardisés.

#### **✅ Format OBLIGATOIRE**

```
🎯 type(scope): description

body (optionnel)

footer (optionnel)
```

#### **🏷️ Types de Commits AUTORISÉS**

- 🎉 **feat**: Nouvelle fonctionnalité
- 🐛 **fix**: Correction de bug
- 📚 **docs**: Documentation
- 💄 **style**: Formatage, point-virgules, etc. (pas de changement de code)
- ♻️ **refactor**: Refactoring (ni feature ni fix)
- ⚡ **perf**: Amélioration des performances
- ✅ **test**: Ajout/modification de tests
- 🔧 **chore**: Tâches de maintenance, outils, etc.
- 🚀 **ci**: Configuration CI/CD
- ⏪ **revert**: Annulation d'un commit précédent
- 🔐 **security**: Corrections de sécurité
- 🌐 **i18n**: Internationalisation
- ♿ **a11y**: Accessibilité
- 🚨 **hotfix**: Correction urgente en production

#### **📋 Exemples de Commits Valides**

```bash
🎉 feat(auth): add JWT refresh token rotation
🐛 fix(user): resolve email validation edge case
📚 docs(api): update authentication endpoints documentation
♻️ refactor(repo): extract common repository patterns
✅ test(login): add comprehensive login use case tests
🔧 chore(deps): update NestJS to latest version
🔐 security(jwt): implement secure token storage
```

#### **❌ Commits INTERDITS**

```bash
# Trop vague
fix: bug fix
update code
improvements

# Type non autorisé
hack: quick fix
temp: temporary solution
```

#### **🎯 Règles Commitlint Configurées**

```javascript
// .commitlintrc.js
{
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      '🎉 feat', '🐛 fix', '📚 docs', '💄 style',
      '♻️ refactor', '⚡ perf', '✅ test', '🔧 chore',
      '🚀 ci', '⏪ revert', '🔐 security', '🌐 i18n',
      '♿ a11y', '🚨 hotfix'
    ]],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 100]
  }
}
```

**🚀 NOUVEAUTÉ : Environnement Docker Complet**

### � **Docker Environment Production-Ready**

- ✅ **Docker Compose** multi-services avec hot reload
- ✅ **PostgreSQL 15** avec volume persistant et health checks
- ✅ **MongoDB 7** pour stockage NoSQL avec réplication
- ✅ **pgAdmin 4** interface web pour gestion PostgreSQL (localhost:5050)
- ✅ **NestJS** containerisé avec debug ports et volumes
- ✅ **Makefile** complet avec commandes Docker simplifiées

#### **🔧 Commandes Docker Disponibles**

```bash
make start          # Démarrer tous les services Docker
make stop           # Arrêter tous les services
make build          # Construire les images Docker
make logs           # Voir les logs de tous les services
make test           # Lancer les tests dans le container
make clean          # Nettoyer volumes et images
make restart        # Redémarrer les services
make status         # Statut des services
```

### 📊 **Métriques de Qualité Améliorées**

### 🎯 **Objectifs Maintenus et Améliorés**

- ✅ **202 tests** passants (30 suites de tests complètes) - **UPGRADE de 24 tests**
- ✅ **Clean Architecture** respectée dans tous les composants
- ✅ **SOLID principles** appliqués rigoureusement
- ✅ **Security first** approach avec cookies HttpOnly
- ✅ **Enterprise patterns** utilisés (logging, audit, i18n)
- ✅ **Docker environment** pour développement isolé
- ✅ **ESLint errors ELIMINATED** - De 18 erreurs bloquantes à 0 🎯✨
- ✅ **Node.js 24 Ready** - Architecture compatible nouvelles fonctionnalités
- ✅ **Code quality** avec ESLint + Prettier configurés strictement

### 📈 **Indicateurs de Succès - MISE À JOUR FINALE**

- Tests continuent de passer après modifications (198/198 ✅)
- **🎯 ZÉRO ERREUR ESLINT BLOQUANTE** - 100% des erreurs critiques éliminées
- **Promise.all corrections** - Méthodes synchrones converties en Promises
- **Regex patterns optimized** - Échappements inutiles supprimés (no-useless-escape)
- **Enum comparisons fixed** - Type safety renforcé (no-unsafe-enum-comparison)
- **Case declarations wrapped** - Blocs correctement structurés (no-case-declarations)
- **Template expressions secured** - Types never correctement gérés
- Aucune dépendance circulaire introduite
- Logging et audit trail présents sur toutes les opérations
- Configuration externalisée (JWT secrets, expiration)
- Messages i18n utilisés dans tous les Use Cases
- Permissions vérifiées et exceptions spécifiques
- Environnement Docker complètement fonctionnel
- **Pipeline de qualité ESLint** opérationnel sans erreurs bloquantes

## 🏗️ **Architecture Établie**

### 📁 **Structure des Couches**

```
src/
├── domain/           # 🏢 Règles métier pures (entities, value objects)
├── application/      # 💼 Use cases + ports + exceptions applicatives
├── infrastructure/   # 🔧 Implémentations techniques (repos, services)
├── presentation/     # 🎨 Controllers HTTP + DTOs
└── shared/           # 🔗 Cross-cutting concerns
```

### 🎯 **Principes à Respecter**

- ✅ **Dependency Inversion** : Couches supérieures ne dépendent jamais des inférieures
- ✅ **Single Responsibility** : Chaque classe a une seule responsabilité
- ✅ **TDD First** : Tests avant implémentation (**24 tests auth + autres**)
- ✅ **Clean Code** : Nommage expressif, fonctions courtes, commentaires utiles
- ✅ **Enterprise Security** : Authentification, autorizations, audit trail
- ✅ **SOLID Principles** : Application rigoureuse des 5 principes de Robert C. Martin
- ✅ **TypeScript Strict** : Type safety à 100%, zéro tolérance pour `any`

## 🎯 **Principes SOLID de Robert C. Martin**

### 🔹 **S** - Single Responsibility Principle (SRP)

**Une classe, une seule raison de changer**

```typescript
// ✅ GOOD - Une seule responsabilité
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Gère uniquement la création d'utilisateur
  }
}

// ❌ BAD - Multiples responsabilités
export class UserService {
  createUser() {} // Création utilisateur
  sendEmail() {} // Envoi email
  validateData() {} // Validation données
}
```

### 🔹 **O** - Open/Closed Principle (OCP)

**Ouvert à l'extension, fermé à la modification**

```typescript
// ✅ GOOD - Extension via interfaces
export interface INotificationService {
  send(message: string, recipient: string): Promise<void>;
}

export class EmailNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Implémentation email
  }
}

export class SmsNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Implémentation SMS - extension sans modification
  }
}
```

### 🔹 **L** - Liskov Substitution Principle (LSP)

**Les sous-types doivent être substituables à leurs types de base**

```typescript
// ✅ GOOD - Substitution correcte
export abstract class Repository<T> {
  abstract save(entity: T): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
}

export class UserRepository extends Repository<User> {
  async save(user: User): Promise<User> {
    // Respecte le contrat - retourne toujours un User
    return this.persistenceAdapter.save(user);
  }

  async findById(id: string): Promise<User | null> {
    // Respecte le contrat - retourne User ou null
    return this.persistenceAdapter.findById(id);
  }
}
```

### 🔹 **I** - Interface Segregation Principle (ISP)

**Les clients ne doivent pas dépendre d'interfaces qu'ils n'utilisent pas**

```typescript
// ✅ GOOD - Interfaces ségrégées
export interface IUserReader {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface IUserWriter {
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IUserCounter {
  count(): Promise<number>;
  countByRole(role: UserRole): Promise<number>;
}

// ❌ BAD - Fat interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  exportToJson(): Promise<string>; // Non utilisé par tous
  generateReport(): Promise<Buffer>; // Non utilisé par tous
}
```

### 🔹 **D** - Dependency Inversion Principle (DIP)

**Dépendre des abstractions, pas des implémentations**

```typescript
// ✅ GOOD - Dépend des abstractions
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface
    private readonly logger: ILogger, // Interface
    private readonly eventBus: IEventBus, // Interface
  ) {}
}

// ❌ BAD - Dépend des implémentations
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: TypeOrmUserRepository, // Classe concrète
    private readonly logger: ConsoleLogger, // Classe concrète
    private readonly eventBus: InMemoryEventBus, // Classe concrète
  ) {}
}
```

## 🔧 **Meilleures Pratiques TypeScript**

### 🎯 **Configuration Stricte Obligatoire**

```typescript
// tsconfig.json - Mode strict OBLIGATOIRE
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 🎯 **Typage Explicite - ZERO `any` - PRÉFÉRER `unknown`**

```typescript
// ✅ GOOD - Types explicites pour APIs publiques et unknown pour types incertains
export interface CreateUserRequest {
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly requestingUserId: string;
}

export interface CreateUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

// ✅ GOOD - Contraintes génériques
export interface Repository<T extends Entity> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
}

// ✅ GOOD - Union types pour valeurs contrôlées
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql';
export type Environment = 'development' | 'staging' | 'production';

// ❌ STRICTEMENT INTERDIT - Usage de any
export function processData(data: any): any {
  // JAMAIS ! Utilise unknown à la place
  return data;
}

// ✅ EXCELLENT - Utiliser unknown au lieu de any
export function processData(data: unknown): unknown {
  // Type guard OBLIGATOIRE avec unknown
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  throw new Error('Invalid data type');
}

// ✅ MEILLEUR - Types spécifiques avec générique
export function processData<T>(data: T): T {
  return data;
}

// ✅ PATTERN RECOMMANDÉ - Type guards avec unknown
function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    typeof (data as { id: unknown }).id === 'string' &&
    typeof (data as { email: unknown }).email === 'string'
  );
}

// ✅ PATTERN RECOMMANDÉ - Parsing sécurisé avec unknown
export function parseUserFromRequest(req: unknown): User {
  if (!isValidUser(req)) {
    throw new ValidationError('Invalid user data structure');
  }
  return req; // TypeScript sait maintenant que c'est un User
}

// ✅ PATTERN RECOMMANDÉ - API Responses typées
export interface SafeApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T;
  readonly errors?: readonly string[];
  readonly meta?: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}

// ❌ ANTI-PATTERNS À ÉVITER
// Ne jamais utiliser : as any, any[], Array<any>, Record<string, any>
// Ne jamais typer les paramètres de requête comme any
// Ne jamais retourner any depuis une fonction publique
```

### 🚨 **RÈGLES STRICTES DE TYPAGE**

#### **🔴 INTERDICTIONS ABSOLUES**

- **`any`** : Usage strictement interdit sauf cas exceptionnels documentés
- **`as any`** : Casting dangereux interdit
- **`any[]`** : Tableaux non typés interdits
- **`Record<string, any>`** : Objets non typés interdits
- **`function(param: any)`** : Paramètres non typés interdits

#### **🟢 ALTERNATIVES RECOMMANDÉES**

- **`unknown`** : Pour types incertains nécessitant type guards
- **`object`** : Pour objets génériques
- **`Record<string, unknown>`** : Pour objets avec clés dynamiques
- **Generics `<T>`** : Pour types paramétrés
- **Union types** : Pour valeurs connues limitées
- **Type guards** : Pour validation runtime des types

### 🎯 **Gestion Null-Safe & Erreurs**

```typescript
// ✅ GOOD - Gestion explicite des null
export class UserService {
  async findUserById(id: string): Promise<User | null> {
    const userData = await this.repository.findById(id);
    return userData ? User.fromData(userData) : null;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserNotFoundError(`User with id ${id} not found`);
    }
    return user;
  }
}

// ✅ GOOD - Result pattern pour gestion d'erreurs
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export async function safeOperation<T>(
  operation: () => Promise<T>,
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## 🔍 **ESLint & Formatage - Règles CRITIQUES**

### 🎯 **Règles NON DÉSACTIVABLES**

```typescript
// eslint.config.mjs
export default [
  {
    rules: {
      // Type Safety - CRITIQUE
      '@typescript-eslint/no-any': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Qualité Code - CRITIQUE
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-inferrable-types': 'off', // Préférer explicite

      // Bonnes Pratiques - CRITIQUE
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
];
```

### 🎯 **Configuration Prettier Standardisée**

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 🚨 **ERREURS ESLINT COURANTES À ÉVITER**

### ❌ **Erreurs Promise.all avec méthodes synchrones**

```typescript
// ❌ INTERDIT - Promise.all avec des valeurs non-Promise
const [dbCheck, memoryInfo, systemInfo] = await Promise.all([
  this.checkDatabaseStatus(),  // OK - méthode async
  this.getMemoryInfo(),       // ❌ ERREUR - méthode synchrone
  this.getSystemInfo(),       // ❌ ERREUR - méthode synchrone
]);

// ✅ CORRECT - Toutes les méthodes retournent des Promises
private getMemoryInfo(): Promise<MemoryInfo> {
  const memUsage = process.memoryUsage();
  return Promise.resolve({
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
  });
}

private getSystemInfo(): Promise<SystemInfo> {
  return Promise.resolve({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpuUsage: process.cpuUsage(),
    pid: process.pid,
  });
}
```

### ❌ **Échappements inutiles dans les expressions régulières**

```typescript
// ❌ INTERDIT - Échappements inutiles
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;  // \-, \(, \) sont inutiles

// ✅ CORRECT - Échappements minimaux requis
const phoneRegex = /^\+?[\d\s-()]{10,}$/;     // Plus propre et correct
```

### ❌ **Méthodes async sans await**

```typescript
// ❌ INTERDIT - async sans await
async generateTokens(userId: string): Promise<TokenPair> {
  // Pas d'await dans cette méthode
  return {
    accessToken: this.createAccessToken(userId),
    refreshToken: this.createRefreshToken(userId)
  };
}

// ✅ CORRECT - Enlever async ou utiliser Promise.resolve
generateTokens(userId: string): Promise<TokenPair> {
  return Promise.resolve({
    accessToken: this.createAccessToken(userId),
    refreshToken: this.createRefreshToken(userId)
  });
}

// OU si vraiment besoin d'async
async generateTokens(userId: string): Promise<TokenPair> {
  const accessToken = await this.createAccessToken(userId);
  const refreshToken = await this.createRefreshToken(userId);
  return { accessToken, refreshToken };
}
```

### ❌ **Variables inutilisées (no-unused-vars)**

```typescript
// ❌ INTERDIT - Variables/imports non utilisés
import { Email, User, Permission } from '../domain/entities';  // Permission non utilisé

export class CreateUserUseCase {
  execute(request: CreateUserRequest, context: AppContext): Promise<User> {
    // context n'est jamais utilisé dans cette méthode
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}

// ✅ CORRECT - Supprimer les imports/variables inutilisés
import { Email, User } from '../domain/entities';

export class CreateUserUseCase {
  execute(request: CreateUserRequest): Promise<User> {
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}

// ✅ CORRECT - Préfixer avec underscore si requis par interface
export class CreateUserUseCase {
  execute(request: CreateUserRequest, _context: AppContext): Promise<User> {
    // _context indique explicitement que le paramètre n'est pas utilisé
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}
```

### 🎯 **Règles de Correction ESLint**

#### **1. @typescript-eslint/await-thenable**
- **Problème** : Promise.all utilisé avec des valeurs non-Promise
- **Solution** : Convertir les méthodes synchrones pour retourner des Promises avec `Promise.resolve()`

#### **2. no-useless-escape**
- **Problème** : Échappements inutiles dans les regex (\\-, \\(, \\))
- **Solution** : Enlever les backslashes inutiles : `[\d\s-()]` au lieu de `[\d\s\-\(\)]`

#### **3. @typescript-eslint/require-await**
- **Problème** : Méthodes marquées `async` sans utilisation d'`await`
- **Solution** : Enlever `async` et utiliser `Promise.resolve()` OU ajouter de vrais appels `await`

#### **4. @typescript-eslint/no-unused-vars**
- **Problème** : Variables, imports ou paramètres déclarés mais jamais utilisés
- **Solution** : Supprimer ou préfixer avec `_` (ex: `_context`, `_error`)

#### **5. @typescript-eslint/unbound-method**
- **Problème** : Référencer des méthodes sans lier `this` dans les tests
- **Solution** : Utiliser des arrow functions ou lier explicitement `this`

```typescript
// ❌ VIOLATION dans les tests
expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);

// ✅ CORRECT dans les tests
expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
// Utiliser jest.Mocked<T> pour éviter ce problème
```

### 📋 **Checklist de Vérification ESLint**

Avant de commiter, TOUJOURS vérifier :

- [ ] **Promise.all** : Toutes les valeurs sont des Promises
- [ ] **Regex** : Échappements minimaux requis uniquement
- [ ] **Async/await** : Méthodes async utilisent vraiment await
- [ ] **Variables** : Tous les imports/variables sont utilisés
- [ ] **Tests** : Mocks correctement typés avec `jest.Mocked<T>`

### 🔧 **Commandes de Correction**

```bash
# Vérifier les erreurs ESLint
npm run lint

# Corriger automatiquement ce qui peut l'être
npm run lint -- --fix

# Compiler pour vérifier les erreurs TypeScript
npm run build

# Lancer tous les tests
npm test
```

## 🚨 **CRITIQUE : COUCHES DOMAIN & APPLICATION LIBRES DE FRAMEWORKS**

### 🎯 **RÈGLE ABSOLUE : ZÉRO Dépendance Framework dans la Logique Métier**

**Les couches Domain et Application DOIVENT rester complètement libres de toute dépendance de framework. C'est un principe fondamental de la Clean Architecture qui garantit :**

- **Indépendance des Frameworks** : Les règles métier ne sont pas couplées à un framework spécifique
- **Testabilité** : La logique métier pure peut être testée en isolation
- **Portabilité** : La logique centrale peut être déplacée entre différents frameworks
- **Maintenabilité** : Les changements de frameworks n'affectent pas les règles métier

## 🔍 **STANDARDISATION API - RECHERCHE & FILTRAGE PAGINÉS OBLIGATOIRES**

### 🎯 **RÈGLE CRITIQUE : TOUTES LES RESSOURCES DOIVENT AVOIR UNE API DE RECHERCHE COHÉRENTE**

**Chaque ressource (User, BusinessSector, Business, etc.) DOIT respecter le même pattern de recherche et filtrage paginés pour garantir une expérience développeur cohérente.**

#### **📋 Pattern Obligatoire : POST /api/v1/{resource}/list**

```typescript
// ✅ CORRECT - Pattern standardisé pour TOUTES les ressources
@Post('list')
@ApiOperation({
  summary: 'List {ResourceName}s with advanced search and pagination',
  description: 'Provides comprehensive search, filtering, and pagination for {ResourceName}s'
})
@ApiResponse({ type: List{ResourceName}ResponseDto })
@UseGuards(JwtAuthGuard)
async list(
  @Body() dto: List{ResourceName}sDto,
  @GetUser() user: User,
): Promise<List{ResourceName}ResponseDto> {
  // Implémentation avec use case
}
```

#### **🔧 Structure DTO Standardisée**

```typescript
// ✅ OBLIGATOIRE - Chaque ressource doit avoir cette structure de base
export class List{ResourceName}sDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({ enum: ['{field1}', '{field2}', 'createdAt'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['{field1}', '{field2}', 'createdAt'])
  readonly sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Search term for text fields' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string;

  // ✅ Filtres spécifiques à la ressource
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  // Autres filtres spécifiques...
}
```

#### **📊 Response DTO Standardisée**

```typescript
// ✅ OBLIGATOIRE - Métadonnées de pagination cohérentes
export class List{ResourceName}ResponseDto {
  @ApiProperty({ type: [{ResourceName}Dto] })
  readonly data: {ResourceName}Dto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 47,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPrevPage: false
    }
  })
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}
```

#### **🎯 Use Case Pattern Standardisé**

```typescript
// ✅ OBLIGATOIRE - Chaque ressource doit avoir un use case de liste
export interface List{ResourceName}sRequest {
  readonly requestingUserId: string;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly search?: string;
    readonly isActive?: boolean;
    // Filtres spécifiques...
  };
}

export interface List{ResourceName}sResponse {
  readonly data: {ResourceName}[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class List{ResourceName}sUseCase {
  async execute(request: List{ResourceName}sRequest): Promise<List{ResourceName}sResponse> {
    // 1. Validation des permissions
    // 2. Application des filtres
    // 3. Pagination
    // 4. Tri
    // 5. Mapping vers response
  }
}
```

#### **📋 Checklist Obligatoire pour Chaque Ressource**

- [ ] **Endpoint POST /api/v1/{resource}/list** implémenté
- [ ] **DTO de requête** avec pagination, tri, recherche, filtres
- [ ] **DTO de réponse** avec metadata pagination cohérente
- [ ] **Use Case dédié** pour la logique de recherche
- [ ] **Repository method findAll()** avec support filtres avancés
- [ ] **Mapper** pour conversion DTO ↔ Domain ↔ Response
- [ ] **Tests unitaires** complets pour use case et controller
- [ ] **Documentation Swagger** détaillée avec exemples
- [ ] **Validation des permissions** basée sur les rôles utilisateur
- [ ] **Gestion d'erreurs** avec messages i18n appropriés

#### **🚫 INTERDICTIONS**

- ❌ **JAMAIS** d'endpoint GET simple sans filtrage avancé
- ❌ **JAMAIS** de pagination sans métadonnées complètes
- ❌ **JAMAIS** de recherche sans validation de permissions
- ❌ **JAMAIS** de tri sans validation des champs autorisés
- ❌ **JAMAIS** de limite de pagination > 100 éléments

#### **✅ Ressources Déjà Conformes**

- **Users** : ✅ POST /api/v1/users/list avec recherche, filtrage, pagination
- **BusinessSectors** : 🔄 À mettre à jour selon ce standard

#### **📝 TODO : Mise à Jour des Ressources Existantes**

1. **BusinessSectors** : Remplacer l'endpoint simple par le pattern standardisé
2. **Businesses** : Implémenter le pattern dès la création
3. **Services** : Implémenter le pattern dès la création
4. **Appointments** : Implémenter le pattern dès la création

**Cette standardisation garantit une API cohérente, performante et facilement utilisable par les développeurs frontend !**

### 🛣️ **CONVENTIONS D'ENDPOINTS REST STANDARDISÉES**

#### **📋 Pattern Obligatoire pour TOUTES les Ressources**

```typescript
// ✅ STRUCTURE ENDPOINT STANDARDISÉE
@Controller('api/v1/{resources}') // Toujours au pluriel
export class {Resource}Controller {

  // 🔍 RECHERCHE & LISTE (POST pour filtres complexes)
  @Post('list') // ✅ OBLIGATOIRE pour toutes les ressources
  async list(@Body() dto: List{Resource}sDto): Promise<List{Resource}ResponseDto>

  // 📄 RÉCUPÉRATION PAR ID
  @Get(':id') // ✅ Standard REST
  async findById(@Param('id') id: string): Promise<{Resource}Dto>

  // ➕ CRÉATION
  @Post() // ✅ Standard REST
  async create(@Body() dto: Create{Resource}Dto): Promise<Create{Resource}ResponseDto>

  // ✏️ MISE À JOUR
  @Put(':id') // ✅ Standard REST
  async update(@Param('id') id: string, @Body() dto: Update{Resource}Dto): Promise<Update{Resource}ResponseDto>

  // 🗑️ SUPPRESSION
  @Delete(':id') // ✅ Standard REST
  async delete(@Param('id') id: string): Promise<Delete{Resource}ResponseDto>

  // 📊 STATISTIQUES/MÉTRIQUES (optionnel)
  @Get('stats')
  async getStats(): Promise<{Resource}StatsDto>
}
```

#### **🎯 Exemples Concrets d'URLs**

```bash
# ✅ CORRECT - Endpoints standardisés
POST   /api/v1/users/list          # Recherche utilisateurs paginée
GET    /api/v1/users/123           # Récupérer utilisateur par ID
POST   /api/v1/users               # Créer utilisateur
PUT    /api/v1/users/123           # Mettre à jour utilisateur
DELETE /api/v1/users/123           # Supprimer utilisateur
GET    /api/v1/users/stats         # Statistiques utilisateurs

POST   /api/v1/business-sectors/list    # Recherche secteurs paginée
GET    /api/v1/business-sectors/456     # Récupérer secteur par ID
POST   /api/v1/business-sectors         # Créer secteur
PUT    /api/v1/business-sectors/456     # Mettre à jour secteur
DELETE /api/v1/business-sectors/456     # Supprimer secteur

POST   /api/v1/businesses/list          # Recherche entreprises paginée
POST   /api/v1/appointments/list        # Recherche rendez-vous paginée
POST   /api/v1/services/list            # Recherche services paginée
```

#### **❌ ANTI-PATTERNS À ÉVITER**

```bash
# ❌ INTERDIT - Endpoints non standardisés
GET    /api/v1/users/all           # Pas de filtrage avancé
GET    /api/v1/users/search        # Limité, utiliser POST /list
POST   /api/v1/users/filter        # Utiliser POST /list
GET    /api/v1/users/paginated     # Utiliser POST /list
POST   /api/v1/users/find          # Utiliser POST /list

# ❌ INTERDIT - URLs mal formées
GET    /api/v1/user/123            # Singulier interdit
GET    /api/v1/Users/123           # Casse incorrecte
GET    /api/v1/businessSector/123  # camelCase interdit, utiliser kebab-case
```

#### **📝 Règles de Nommage**

1. **Ressources** : Toujours au **pluriel** et en **kebab-case**
   - ✅ `/users`, `/business-sectors`, `/appointments`
   - ❌ `/user`, `/businessSectors`, `/Users`

2. **Actions** : Verbes HTTP standard + suffixes conventionnels
   - ✅ `POST /list` pour recherche avancée
   - ✅ `GET /stats` pour statistiques
   - ❌ `GET /getAll`, `POST /search`

3. **Paramètres** : ID en paramètre de route, filtres complexes en body
   - ✅ `GET /users/123`, `POST /users/list`
   - ❌ `GET /users?id=123`

**Cette standardisation assure une API REST cohérente et prévisible pour tous les développeurs !**

### 🚨 **GESTION D'ERREURS API STANDARDISÉE**

#### **📋 Format de Réponse d'Erreur Obligatoire**

```typescript
// ✅ OBLIGATOIRE - Format d'erreur standardisé pour toutes les ressources
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;           // Code d'erreur technique
    readonly message: string;        // Message utilisateur (i18n)
    readonly details?: string;       // Détails techniques (dev only)
    readonly field?: string;         // Champ en erreur (validation)
    readonly timestamp: string;      // ISO timestamp
    readonly path: string;           // Endpoint appelé
    readonly correlationId: string;  // ID pour tracing
  };
}

// ✅ OBLIGATOIRE - Format de réponse succès standardisé
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
```

#### **🎯 Codes d'Erreur Standardisés par Ressource**

```typescript
// ✅ OBLIGATOIRE - Chaque ressource doit définir ses codes d'erreur
export enum {Resource}ErrorCodes {
  // Erreurs génériques (4xx)
  NOT_FOUND = '{RESOURCE}_NOT_FOUND',
  INVALID_DATA = '{RESOURCE}_INVALID_DATA',
  DUPLICATE_ENTRY = '{RESOURCE}_DUPLICATE_ENTRY',
  PERMISSION_DENIED = '{RESOURCE}_PERMISSION_DENIED',

  // Erreurs métier spécifiques
  CANNOT_DELETE_REFERENCED = '{RESOURCE}_CANNOT_DELETE_REFERENCED',
  STATUS_TRANSITION_INVALID = '{RESOURCE}_STATUS_TRANSITION_INVALID',

  // Erreurs système (5xx)
  REPOSITORY_ERROR = '{RESOURCE}_REPOSITORY_ERROR',
  EXTERNAL_SERVICE_ERROR = '{RESOURCE}_EXTERNAL_SERVICE_ERROR',
}

// Exemple concret pour BusinessSector
export enum BusinessSectorErrorCodes {
  NOT_FOUND = 'BUSINESS_SECTOR_NOT_FOUND',
  INVALID_DATA = 'BUSINESS_SECTOR_INVALID_DATA',
  DUPLICATE_CODE = 'BUSINESS_SECTOR_DUPLICATE_CODE',
  PERMISSION_DENIED = 'BUSINESS_SECTOR_PERMISSION_DENIED',
  CANNOT_DELETE_REFERENCED = 'BUSINESS_SECTOR_CANNOT_DELETE_REFERENCED',
  REPOSITORY_ERROR = 'BUSINESS_SECTOR_REPOSITORY_ERROR',
}
```

#### **📊 Codes de Statut HTTP Standardisés**

```typescript
// ✅ OBLIGATOIRE - Mapping cohérent des erreurs métier vers HTTP
export const ERROR_HTTP_STATUS_MAP = {
  // 400 - Bad Request
  INVALID_DATA: 400,
  VALIDATION_ERROR: 400,
  BUSINESS_RULE_VIOLATION: 400,

  // 401 - Unauthorized
  AUTHENTICATION_REQUIRED: 401,
  INVALID_CREDENTIALS: 401,
  TOKEN_EXPIRED: 401,

  // 403 - Forbidden
  PERMISSION_DENIED: 403,
  INSUFFICIENT_PERMISSIONS: 403,

  // 404 - Not Found
  NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,

  // 409 - Conflict
  DUPLICATE_ENTRY: 409,
  RESOURCE_ALREADY_EXISTS: 409,
  CONCURRENT_MODIFICATION: 409,

  // 422 - Unprocessable Entity
  CANNOT_DELETE_REFERENCED: 422,
  STATUS_TRANSITION_INVALID: 422,

  // 500 - Internal Server Error
  REPOSITORY_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 500,
  UNKNOWN_ERROR: 500,
} as const;
```

#### **🔧 Exception Filter Global**

```typescript
// ✅ OBLIGATOIRE - Gestionnaire d'erreurs global pour cohérence
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: this.getI18nMessage(exception),
        details: this.getErrorDetails(exception),
        field: this.getFieldName(exception),
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
      },
    };

    const statusCode = this.getHttpStatus(exception);
    response.status(statusCode).json(errorResponse);
  }
}
```

#### **📝 Messages d'Erreur Internationalisés**

```typescript
// ✅ OBLIGATOIRE - Messages i18n pour toutes les erreurs
// src/shared/i18n/en/errors.json
{
  "BUSINESS_SECTOR_NOT_FOUND": "Business sector not found",
  "BUSINESS_SECTOR_DUPLICATE_CODE": "A business sector with this code already exists",
  "BUSINESS_SECTOR_PERMISSION_DENIED": "You don't have permission to manage business sectors",
  "BUSINESS_SECTOR_CANNOT_DELETE_REFERENCED": "Cannot delete business sector: it is referenced by existing businesses"
}

// src/shared/i18n/fr/errors.json
{
  "BUSINESS_SECTOR_NOT_FOUND": "Secteur d'activité introuvable",
  "BUSINESS_SECTOR_DUPLICATE_CODE": "Un secteur d'activité avec ce code existe déjà",
  "BUSINESS_SECTOR_PERMISSION_DENIED": "Vous n'avez pas l'autorisation de gérer les secteurs d'activité",
  "BUSINESS_SECTOR_CANNOT_DELETE_REFERENCED": "Impossible de supprimer le secteur : il est référencé par des entreprises existantes"
}
```

#### **🚫 INTERDICTIONS - Gestion d'Erreurs**

- ❌ **JAMAIS** renvoyer des stack traces en production
- ❌ **JAMAIS** exposer des détails internes de la base de données
- ❌ **JAMAIS** utiliser des messages d'erreur génériques ("Internal Error")
- ❌ **JAMAIS** oublier la corrélation ID pour le debugging
- ❌ **JAMAIS** renvoyer des codes HTTP incohérents

**Cette standardisation garantit une gestion d'erreurs cohérente et debuggable sur toute l'API !**

### 🧪 **TESTS D'INTÉGRATION API STANDARDISÉS**

#### **📋 Pattern de Tests Obligatoire pour Chaque Ressource**

```typescript
// ✅ OBLIGATOIRE - Structure de tests d'intégration pour chaque ressource
describe('{Resource}Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup application et authentification
  });

  describe('POST /api/v1/{resources}/list', () => {
    it('should return paginated list with default parameters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        meta: {
          currentPage: 1,
          totalPages: expect.any(Number),
          totalItems: expect.any(Number),
          itemsPerPage: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: false,
        },
      });
    });

    it('should apply search filters correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          search: 'test search term',
          isActive: true,
          page: 1,
          limit: 5,
        })
        .expect(200);

      expect(response.body.meta.itemsPerPage).toBe(5);
      // Vérifier que les résultats correspondent au filtre
    });

    it('should enforce pagination limits', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ limit: 150 }) // > 100
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/v1/{resources}/:id', () => {
    it('should return resource by ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: 'valid-uuid',
          // Autres propriétés attendues
        },
      });
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/{resources}/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: '{RESOURCE}_NOT_FOUND',
          message: expect.any(String),
        },
      });
    });
  });

  describe('POST /api/v1/{resources}', () => {
    it('should create resource with valid data', async () => {
      const createDto = {
        // Données valides pour création
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          ...createDto,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Données manquantes
        .expect(400);

      expect(response.body.error.code).toBe('{RESOURCE}_INVALID_DATA');
    });
  });

  describe('PUT /api/v1/{resources}/:id', () => {
    it('should update resource with valid data', async () => {
      const updateDto = {
        // Données de mise à jour
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toMatchObject(updateDto);
    });
  });

  describe('DELETE /api/v1/{resources}/:id', () => {
    it('should delete resource successfully', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Vérifier que la ressource est supprimée
      await request(app.getHttpServer())
        .get('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

#### **🎯 Données de Test Standardisées**

```typescript
// ✅ OBLIGATOIRE - Factory de données de test pour chaque ressource
export class {Resource}TestDataFactory {
  static createValid{Resource}Data(): Create{Resource}Dto {
    return {
      // Données valides minimales
    };
  }

  static createInvalid{Resource}Data(): Partial<Create{Resource}Dto> {
    return {
      // Données invalides pour tests de validation
    };
  }

  static createUpdate{Resource}Data(): Update{Resource}Dto {
    return {
      // Données de mise à jour
    };
  }

  static createList{Resource}Filters(): List{Resource}sDto {
    return {
      search: 'test',
      isActive: true,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
  }
}
```

#### **📊 Métriques de Couverture Obligatoires**

```typescript
// ✅ OBLIGATOIRE - Checklist de couverture des tests API
const API_TEST_COVERAGE_CHECKLIST = {
  // Endpoints CRUD complets
  'POST /list': ['success', 'pagination', 'filters', 'auth', 'permissions'],
  'GET /:id': ['success', 'not_found', 'auth', 'permissions'],
  'POST /': ['success', 'validation', 'auth', 'permissions', 'duplicates'],
  'PUT /:id': ['success', 'validation', 'not_found', 'auth', 'permissions'],
  'DELETE /:id': ['success', 'not_found', 'auth', 'permissions', 'constraints'],

  // Cas d'erreur obligatoires
  error_handling: ['400', '401', '403', '404', '409', '422', '500'],

  // Validations métier
  business_rules: ['required_fields', 'format_validation', 'constraints'],

  // Sécurité
  security: ['authentication', 'authorization', 'input_sanitization'],
} as const;
```

#### **🚫 INTERDICTIONS - Tests API**

- ❌ **JAMAIS** tester sans données de test isolées
- ❌ **JAMAIS** ignorer les tests de permissions/sécurité
- ❌ **JAMAIS** oublier les tests de validation des limites
- ❌ **JAMAIS** tester sans cleanup des données
- ❌ **JAMAIS** utiliser des données de production dans les tests

**Cette standardisation garantit une couverture de tests complète et cohérente pour toutes les APIs !**

### ❌ **STRICTEMENT INTERDIT dans Domain/Application**

```typescript
// ❌ JAMAIS importer des dépendances de framework dans Domain/Application
import { Injectable, Inject } from '@nestjs/common';        // INTERDIT
import { Repository } from 'typeorm';                       // INTERDIT
import { Request, Response } from 'express';                // INTERDIT
import { GraphQLResolveInfo } from 'graphql';              // INTERDIT
import { JwtService } from '@nestjs/jwt';                   // INTERDIT
import { ConfigService } from '@nestjs/config';            // INTERDIT

// ❌ JAMAIS utiliser des décorateurs de framework dans Domain/Application
@Injectable()  // INTERDIT dans Domain/Application
@Entity()      // INTERDIT dans Domain/Application
@Column()      // INTERDIT dans Domain/Application
```

### ✅ **CORRECT : TypeScript Pur dans Domain/Application**

```typescript
// ✅ Couche Domain - Logique métier pure
export class User {
  private constructor(
    private readonly id: string,
    private readonly email: Email,
    private readonly name: string,
  ) {}

  static create(email: Email, name: string): User {
    // Validation métier pure - aucune dépendance framework
    if (!name || name.trim().length < 2) {
      throw new DomainError('User name must be at least 2 characters');
    }
    return new User(generateId(), email, name);
  }
}

// ✅ Couche Application - Orchestration des cas d'usage
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,  // Interface uniquement
    private readonly logger: ILogger,                  // Interface uniquement
    private readonly eventBus: IEventBus,             // Interface uniquement
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Logique d'orchestration pure - aucune dépendance framework
    const email = Email.create(request.email);
    const user = User.create(email, request.name);

    const savedUser = await this.userRepository.save(user);
    await this.eventBus.publish(new UserCreatedEvent(savedUser));

    return CreateUserResponse.fromUser(savedUser);
  }
}
```

### 🏗️ **Architecture d'Injection de Dépendances Appropriée**

L'injection de dépendances spécifique aux frameworks ne doit avoir lieu que dans les couches **Infrastructure** et **Presentation** :

```typescript
// ✅ Couche Infrastructure - Implémentations framework
@Injectable()  // OK ici - Couche Infrastructure
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)  // OK ici - Couche Infrastructure
    private readonly repository: Repository<UserEntity>,
  ) {}
}

// ✅ Couche Presentation - Contrôleurs avec intégration framework
@Controller('users')  // OK ici - Couche Presentation
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE)  // OK ici - Couche Presentation
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}
}

// ✅ Couche Infrastructure - Configuration des modules
@Module({  // OK ici - Couche Infrastructure
  providers: [
    {
      provide: TOKENS.CREATE_USER_USE_CASE,
      useFactory: (userRepo, logger, eventBus) =>
        new CreateUserUseCase(userRepo, logger, eventBus),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.EVENT_BUS],
    },
  ],
})
export class ApplicationModule {}
```

### 📋 **Matrice de Responsabilités par Couche**

| Couche | Usage Framework | Injection Dépendances | Décorateurs | Bibliothèques Externes |
|-------|----------------|----------------------|------------|------------------------|
| **Domain** | ❌ JAMAIS | ❌ JAMAIS | ❌ JAMAIS | ❌ Seulement si pur (lodash, date-fns) |
| **Application** | ❌ JAMAIS | ❌ JAMAIS | ❌ JAMAIS | ❌ Seulement si pur (lodash, date-fns) |
| **Infrastructure** | ✅ OUI | ✅ OUI | ✅ OUI | ✅ OUI |
| **Presentation** | ✅ OUI | ✅ OUI | ✅ OUI | ✅ OUI |

### 🚨 **Détection des Violations**

Pour détecter les violations, vérifiez régulièrement :

```bash
# Vérifier les imports NestJS dans Domain/Application
grep -r "@nestjs" src/domain/ src/application/

# Vérifier les décorateurs de framework dans Domain/Application
grep -r "@Injectable\|@Entity\|@Column\|@Repository" src/domain/ src/application/

# Vérifier les imports ORM dans Domain/Application
grep -r "typeorm\|mongoose\|prisma" src/domain/ src/application/
```

**Tout résultat de ces commandes indique une violation de Clean Architecture qui doit être corrigée immédiatement !**

## 🔗 **Husky & Application des Commits Sémantiques**

### 🎯 **Hooks de Pré-commit avec Husky**

Husky applique automatiquement la qualité du code et les standards de commit :

```json
// package.json - Configuration Husky
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint --edit $1"
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 🔧 **Configuration des Hooks Husky**

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Exécution des vérifications de pré-commit..."

# Exécuter lint-staged pour le formatage et le linting du code
npx lint-staged

# Lancer les tests pour s'assurer que rien n'est cassé
npm test

echo "✅ Vérifications de pré-commit réussies !"
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validation du message de commit..."
npx --no -- commitlint --edit $1
echo "✅ Message de commit valide !"
```

### 📋 **Workflow de Commit**

1. **Modifications du Code** : Faire vos changements
2. **Formatage Automatique** : Husky exécute ESLint + Prettier sur les fichiers stagés
3. **Validation des Tests** : Tous les tests doivent passer
4. **Validation du Message de Commit** : Doit suivre le format de commit conventionnel
5. **Succès du Commit** : Seulement si toutes les vérifications passent

### 🚫 **Actions Bloquées**

Husky empêchera les commits si :
- Des erreurs ESLint existent
- Les tests échouent
- Le message de commit ne suit pas la convention
- Le code n'est pas correctement formaté

Cela garantit **100% de qualité du code** et **un historique de commits cohérent** !

## 🚨 **RÈGLE CRITIQUE : JAMAIS COMMITER AVEC DES ERREURS ESLINT**

### ❌ **INTERDICTION ABSOLUE**

**Il est STRICTEMENT INTERDIT de commiter du code avec des erreurs ESLint ou des tests qui échouent.**

Cette règle est **NON-NÉGOCIABLE** pour maintenir :
- **Qualité du code** constante
- **Stabilité** du projet
- **Maintenabilité** à long terme
- **Cohérence** de l'équipe

### 🔧 **Workflow de Commit OBLIGATOIRE**

#### **1️⃣ Format + Reorganize Imports**
```bash
# Formatter le code avec Prettier
npm run format

# Réorganiser automatiquement les imports TypeScript
npx tsc --organizeImports src/**/*.ts
# OU utiliser l'action VS Code "Organize Imports" (Shift+Alt+O)
```

#### **2️⃣ Lint avec Correction Automatique**
```bash
# Lancer ESLint avec correction automatique
npm run lint -- --fix

# Vérifier qu'il n'y a AUCUNE erreur restante
npm run lint
```

#### **3️⃣ Vérification des Tests**
```bash
# S'assurer que TOUS les tests passent
npm test

# Vérification spécifique des tests unitaires
npm run test:unit

# Optionnel : Vérifier la coverage
npm run test:cov
```

#### **4️⃣ Commit Sémantique**
```bash
# Commit avec message sémantique conforme
git add .
git commit -m "🎉 feat(scope): description claire et concise"
```

### ⚡ **Commandes Rapides Pré-Commit**

```bash
# Script complet de pré-commit (recommandé)
npm run format && npm run lint -- --fix && npm test && git add .

# Vérification finale avant commit
npm run lint && npm test
```

### 🎯 **Organiser les Imports TypeScript**

#### **Automatique avec VS Code**
- **Raccourci** : `Shift + Alt + O`
- **Command Palette** : `> TypeScript: Organize Imports`
- **Au sauvegarde** : Configurer `"editor.codeActionsOnSave": {"source.organizeImports": true}`

#### **Via Terminal**
```bash
# Organiser les imports pour tous les fichiers TypeScript
find src -name "*.ts" -exec npx tsc --noEmit --organizeImports {} \;

# Ou utiliser un plugin ESLint
npm run lint -- --fix-type suggestion
```

### 📋 **Checklist Pré-Commit OBLIGATOIRE**

- [ ] ✅ **Format** : Code formaté avec Prettier
- [ ] ✅ **Imports** : Imports réorganisés automatiquement
- [ ] ✅ **Lint** : Aucune erreur ESLint (0 errors, warnings acceptables)
- [ ] ✅ **Tests** : Tous les tests passent (0 failed)
- [ ] ✅ **Build** : Compilation TypeScript réussie
- [ ] ✅ **Message** : Commit sémantique conforme

### 🚨 **Sanctions pour Non-Respect**

Le non-respect de ces règles entraîne :
- **Rejet automatique** du commit par Husky
- **Blocage de la CI/CD**
- **Demande de correction immédiate**
- **Review obligatoire** pour violations répétées

### 💡 **Configuration IDE Recommandée**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript"],
  "typescript.preferences.organizeImports": true
}
```

**Cette règle garantit un code de qualité professionnelle et une collaboration d'équipe fluide !**
`````
