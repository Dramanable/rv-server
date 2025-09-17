`````instructions
````instructions
# 🤖 GitHub Copilot Instructions pour Clean Architecture + NestJS

## 🎯 **Context du Projet**

Vous travaillez sur une **application enterprise NestJS** implémentant la **Clean Architecture de Robert C. Martin (Uncle Bob)** avec une approche **TDD rigoureuse**, les **principes SOLID**, et les **meilleures pratiques TypeScript** strictes. L'application est **production-ready** avec sécurité, i18n, et patterns enterprise.

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

### 🎯 **ORDRE OBLIGATOIRE DE DÉVELOPPEMENT**

**Pour éviter les erreurs de dépendances et garantir une architecture cohérente, TOUJOURS développer dans cet ordre strict :**

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
├── use-cases/         # Cases d'utilisation (orchestration)
├── ports/             # Interfaces pour l'infrastructure
├── services/          # Services applicatifs
└── exceptions/        # Exceptions applicatives
```
**✅ Caractéristiques** :
- **Dépend UNIQUEMENT** de la couche Domain
- **ZÉRO dépendance** vers Infrastructure ou Presentation
- **Orchestration** des entités et services métier
- **Définit les ports** (interfaces) pour l'infrastructure

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
- **Orchestration** des Use Cases
- **Validation** des entrées
- **Sérialisation** des sorties
- **Interface utilisateur** (REST, GraphQL, etc.)

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

### 📋 **WORKFLOW PRATIQUE**

```typescript
// 1️⃣ DOMAIN - Créer d'abord l'entité
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

### ⚠️ **INTERDICTIONS ABSOLUES**

#### **❌ Ne JAMAIS faire** :
- Commencer par les contrôleurs (Presentation)
- Écrire de la logique métier dans Infrastructure
- Utiliser NestJS dans Domain/Application
- Créer des dépendances vers les couches supérieures

#### **✅ TOUJOURS faire** :
- Respecter l'ordre Domain → Application → Infrastructure → Presentation
- Tester chaque couche avant de passer à la suivante
- Valider la compilation à chaque étape
- Documenter les interfaces (ports) dans Application

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

### 🎯 **Typage Explicite - ZERO `any` - UTILISER `unknown`**

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

// ❌ INTERDIT - Usage de any
export function processData(data: any): any {
  // JAMAIS !
  return data;
}

// ✅ GOOD - Utiliser unknown au lieu de any
export function processData<T>(data: unknown): T {
  // Type guard ou assertion nécessaire
  if (typeof data === 'object' && data !== null) {
    return data as T;
  }
  throw new Error('Invalid data type');
}

// ✅ GOOD - Générique typé
export function processData<T>(data: T): T {
  return data;
}
```

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
`````
