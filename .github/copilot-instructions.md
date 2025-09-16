# 🤖 GitHub Copilot Instructions pour Clean Architecture + NestJS

## 🎯 **Context du Projet**

Vous travaillez sur une **application enterprise NestJS** implémentant la **Clean Architecture de Robert C. Martin (Uncle Bob)** avec une approche **TDD rigoureuse**, les **principes SOLID**, et les **meilleures pratiques TypeScript** strictes. L'application est **production-ready** avec sécurité, i18n, et patterns enterprise.

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
- ✅ **MongoDB integration** pour refresh tokens et métadonnées
- ✅ **Code quality** avec ESLint + Prettier configurés

### 📈 **Indicateurs de Succès**

- Tests continuent de passer après modifications (202/202 ✅)
- Aucune dépendance circulaire introduite
- Logging et audit trail présents sur toutes les opérations
- Configuration externalisée (JWT secrets, expiration)
- Messages i18n utilisés dans tous les Use Cases
- Permissions vérifiées et exceptions spécifiques
- Environnement Docker complètement fonctionnel
- Pipeline de qualité de code opérationnel

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

### 🎯 **Typage Explicite - ZERO `any`**

```typescript
// ✅ GOOD - Types explicites pour APIs publiques
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

## 🔐 **Système d'Authentification Implémenté**

### ✅ **Use Cases Complets (TDD)**

- **LoginUseCase** : Authentification avec JWT + refresh token
- **RefreshTokenUseCase** : Rotation sécurisée des tokens
- **LogoutUseCase** : Déconnexion gracieuse (single/all devices)

### ✅ **Infrastructure Services**

- **JwtTokenService** : Génération/vérification JWT sécurisée
- **BcryptPasswordService** : Hachage mots de passe (12 rounds)
- **TypeOrmRefreshTokenRepository** : Persistence tokens avec métadonnées

### ✅ **Exceptions Applicatives**

- **InvalidCredentialsError** : Identifiants incorrects
- **InvalidRefreshTokenError** : Token refresh invalide
- **TokenExpiredError** : Token expiré
- **UserNotFoundError** : Utilisateur inexistant
- **TokenRepositoryError** : Erreur technique repository

### ✅ **Sécurité Enterprise**

- Cookies **HttpOnly** (anti-XSS)
- **Rotation automatique** des refresh tokens
- **Audit logging** complet avec contexte
- **Device tracking** (IP, User-Agent)
- **Graceful error handling** (logout réussit toujours)

## 🧪 **Approche TDD Établie**

### 🔄 **Cycle RED-GREEN-REFACTOR**

1. **RED** : Écrire un test qui échoue
2. **GREEN** : Implémenter le minimum pour faire passer le test
3. **REFACTOR** : Améliorer le code sans casser les tests

### 🎯 **Standards de Tests (UNIQUEMENT UNITAIRES)**

```typescript
// ✅ Structure de test standardisée
describe('FeatureName', () => {
  describe('Success Cases', () => {
    it('should [action] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when [invalid condition]', () => {
      // Test des règles métier
    });
  });
});
```

## 🏢 **Patterns Implémentés**

### 🔧 **Repository Pattern**

```typescript
// Port (Application Layer)
export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Implémentation (Infrastructure Layer)
export class TypeOrmUserRepository implements IUserRepository {
  // Implémentation technique
}
```

### 🎯 **Use Case Pattern**

```typescript
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. Validation
    // 2. Business Logic
    // 3. Persistence
    // 4. Logging/Audit
  }
}
```

### 🔗 **AppContext Pattern**

```typescript
const context = AppContextFactory.create()
  .operation('CreateUser')
  .requestingUser('admin-123', 'ADMIN')
  .clientInfo('192.168.1.1', 'Mobile App')
  .build();
```

## 🌍 **Système I18n HYBRIDE**

### 📋 **Séparation des Messages**

- **Messages DOMAINE** → `shared/i18n/` (règles métier)
- **Messages OPÉRATIONNELS** → `infrastructure/i18n/` (technique)

### 🎯 **Catégories Établies**

```typescript
// Domaine (business rules)
'errors.user.not_found';
'errors.auth.insufficient_permissions';

// Opérationnel (technical)
'operations.user.creation_attempt';
'success.user.created';
'audit.user.created';
```

## 🔐 **Sécurité Enterprise**

### 🛡️ **Authentification**

- ✅ JWT avec secrets séparés (ACCESS ≠ REFRESH)
- ✅ RefreshToken hachés en base avec bcrypt
- ✅ Device tracking et révocation automatique
- ✅ Protection contre timing attacks

### 📊 **RBAC (Role-Based Access Control)**

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Tous droits
  MANAGER = 'MANAGER', // Gestion équipe
  USER = 'USER', // Droits de base
}
```

### 📋 **Audit Trail**

- ✅ AppContext avec correlationId unique
- ✅ Logging structuré avec métadonnées
- ✅ Traçage complet des opérations sensibles

## ⚙️ **Configuration Enterprise**

### 🔧 **Variables d'Environnement**

```bash
# Tokens (durées configurables)
ACCESS_TOKEN_EXPIRATION=900          # 15min prod
REFRESH_TOKEN_EXPIRATION_DAYS=7      # 7 jours prod

# Secrets (obligatoires, min 32 chars, différents)
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Sécurité
BCRYPT_ROUNDS=12                     # Plus élevé en prod
```

## 🎯 **Patterns de Développement SOLID + TypeScript**

### 🏢 **Pattern Entity (Domain)**

```typescript
// ✅ GOOD - Entity avec SOLID et type safety
export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _name: string,
    private readonly _role: UserRole,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  // Factory method - SRP pour la création
  static create(email: Email, name: string, role: UserRole): User {
    if (!name?.trim()) {
      throw new InvalidUserNameError('Name cannot be empty');
    }

    return new User(
      generateId(),
      email,
      name.trim(),
      role,
      new Date(),
      new Date(),
    );
  }

  // Business logic pure - SRP pour les règles métier
  hasPermission(permission: Permission): boolean {
    return this.role.hasPermission(permission);
  }

  canActOn(targetUser: User): boolean {
    if (this.role === UserRole.SUPER_ADMIN) return true;
    if (this.role === UserRole.MANAGER)
      return targetUser.role === UserRole.USER;
    return this.id === targetUser.id;
  }

  // Getters read-only - LSP respecté
  get id(): string {
    return this._id;
  }
  get email(): Email {
    return this._email;
  }
  get name(): string {
    return this._name;
  }
  get role(): UserRole {
    return this._role;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
```

### 💼 **Pattern Use Case (Application)**

```typescript
// ✅ GOOD - Use Case avec SOLID complet
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // DIP - Interface
    private readonly logger: ILogger, // DIP - Interface
    private readonly i18n: II18nService, // DIP - Interface
    private readonly eventBus: IEventBus, // DIP - Interface
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. Context pour traceabilité
    const context: AppContext = AppContextFactory.create()
      .operation('CreateUser')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.user.creation_attempt'),
      context as Record<string, unknown>,
    );

    try {
      // 2. Autorisation - SRP pour sécurité
      await this.validatePermissions(request, context);

      // 3. Validation métier - SRP pour règles
      await this.validateBusinessRules(request, context);

      // 4. Création entity - SRP pour logique métier
      const email = Email.create(request.email);
      const user = User.create(email, request.name, request.role);

      // 5. Persistance - DIP via interface
      const savedUser = await this.userRepository.save(user);

      // 6. Événements - OCP pour extensions futures
      await this.eventBus.publish(new UserCreatedEvent(savedUser, context));

      // 7. Réponse typée
      const response: CreateUserResponse = {
        id: savedUser.id,
        email: savedUser.email.value,
        name: savedUser.name,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      };

      this.logger.info(this.i18n.t('operations.user.creation_success'), {
        ...context,
        userId: savedUser.id,
      } as Record<string, unknown>);

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.creation_failed'),
        error as Error,
        context as Record<string, unknown>,
      );
      throw error;
    }
  }

  // SRP - Méthode dédiée à la validation des permissions
  private async validatePermissions(
    request: CreateUserRequest,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(
      request.requestingUserId,
    );
    if (!requestingUser) {
      throw new UnauthorizedError('Requesting user not found');
    }

    if (!requestingUser.hasPermission(Permission.CREATE_USER)) {
      throw new ForbiddenError('Insufficient permissions to create user');
    }
  }

  // SRP - Méthode dédiée aux règles métier
  private async validateBusinessRules(
    request: CreateUserRequest,
    context: AppContext,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(
      Email.create(request.email),
    );

    if (existingUser) {
      throw new EmailAlreadyExistsError('Email already registered');
    }
  }
}
```

### 🔧 **Pattern Repository (Infrastructure)**

```typescript
// ✅ GOOD - Repository avec ISP et DIP
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    private readonly ormRepository: Repository<UserEntity>, // DIP
    private readonly mapper: IUserMapper, // DIP - ISP
    private readonly logger: ILogger, // DIP
    private readonly i18n: II18nService, // DIP
  ) {}

  async save(user: User): Promise<User> {
    const context = { operation: 'UserRepository.save', userId: user.id };

    this.logger.debug(this.i18n.t('infrastructure.user.save_attempt'), context);

    try {
      const entity = this.mapper.toEntity(user);
      const savedEntity = await this.ormRepository.save(entity);
      const savedUser = this.mapper.toDomain(savedEntity);

      this.logger.debug(
        this.i18n.t('infrastructure.user.save_success'),
        context,
      );

      return savedUser;
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.user.save_failed'),
        error as Error,
        context,
      );
      throw new RepositoryError('Failed to save user', error as Error);
    }
  }

  async findById(id: string): Promise<User | null> {
    if (!id?.trim()) return null;

    try {
      const entity = await this.ormRepository.findOne({ where: { id } });
      return entity ? this.mapper.toDomain(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.user.find_failed'),
        error as Error,
        { operation: 'UserRepository.findById', userId: id },
      );
      throw new RepositoryError('Failed to find user', error as Error);
    }
  }
}
```

### 🧪 **Pattern Test TDD avec Types**

```typescript
// ✅ GOOD - Tests TDD avec type safety complet
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockI18n: jest.Mocked<II18nService>;
  let mockEventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    // Mocks typés avec jest.Mocked
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<ILogger>;

    mockI18n = {
      t: jest.fn().mockReturnValue('Mocked message'),
    } as jest.Mocked<II18nService>;

    mockEventBus = {
      publish: jest.fn(),
    } as jest.Mocked<IEventBus>;

    useCase = new CreateUserUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
      mockEventBus,
    );
  });

  describe('Successful Operations', () => {
    it('should create user when valid request provided', async () => {
      // Arrange - Données typées
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        requestingUserId: 'admin-123',
      };

      const requestingUser = User.create(
        Email.create('admin@example.com'),
        'Admin User',
        UserRole.SUPER_ADMIN,
      );

      const expectedUser = User.create(
        Email.create(request.email),
        request.name,
        request.role,
      );

      // Setup mocks avec types
      mockRepository.findById.mockResolvedValue(requestingUser);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(expectedUser);
      mockEventBus.publish.mockResolvedValue();

      // Act
      const result: CreateUserResponse = await useCase.execute(request);

      // Assert - Types garantis
      expect(result).toEqual({
        id: expectedUser.id,
        email: request.email,
        name: request.name,
        role: request.role,
        createdAt: expectedUser.createdAt,
      });

      // Verify interactions
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.objectContaining({ value: request.email }),
          name: request.name,
          role: request.role,
        }),
      );

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.any(UserCreatedEvent),
      );
    });
  });

  describe('Authorization Failures', () => {
    it('should reject when requesting user not found', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        requestingUserId: 'invalid-user',
      };

      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(UnauthorizedError);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
```

## 🎯 **Guidelines pour Suggestions**

## 🎯 **Guidelines pour Suggestions**

### ✅ **DO - Obligations SOLID + TypeScript**

#### **🏗️ Architecture & SOLID**

- ✅ **SRP**: Chaque classe/méthode a UNE seule responsabilité
- ✅ **OCP**: Utiliser interfaces pour extensibilité (jamais de modifications)
- ✅ **LSP**: Sous-types substituables sans surprise comportementale
- ✅ **ISP**: Interfaces spécifiques, jamais de fat interfaces
- ✅ **DIP**: Dépendre d'abstractions (interfaces), jamais d'implémentations

#### **🔧 TypeScript Strict**

- ✅ **ZERO `any`**: Utiliser generics, unions, interfaces strictes
- ✅ **Types explicites**: Tous les returns types des méthodes publiques
- ✅ **Null safety**: Gestion explicite de null/undefined
- ✅ **Readonly**: Propriétés immutables où approprié
- ✅ **Error handling**: Types d'erreurs spécifiques + Result patterns

#### **🎯 Clean Architecture**

- ✅ **Respecter les couches**: Domain → Application → Infrastructure → Presentation
- ✅ **Dependency Inversion**: Toujours via interfaces
- ✅ **Use Cases**: Pattern avec AppContext + validation + logging
- ✅ **TDD First**: Tests AVANT implémentation (maintenir 202 tests ✅)

#### **🔐 Enterprise Standards**

- ✅ **RBAC**: Validation permissions sur toutes opérations
- ✅ **Audit Trail**: AppContext + logging sur toutes opérations
- ✅ **I18n**: Messages typés (domain vs operational)
- ✅ **Error Management**: Exceptions typées + proper handling

### ❌ **DON'T - Interdictions ABSOLUES**

#### **🚫 Type Safety**

- ❌ **JAMAIS `any`** - Utiliser `unknown` ou types appropriés
- ❌ **Pas de types implicites** sur APIs publiques
- ❌ **Pas de mutations** sur propriétés publiques des entities
- ❌ **Pas d'assertions de type** non sécurisées

#### **🚫 SOLID Violations**

- ❌ **Classes à responsabilités multiples** (SRP violation)
- ❌ **Modification de code existant** pour nouvelles features (OCP violation)
- ❌ **Sous-types qui changent le comportement** (LSP violation)
- ❌ **Fat interfaces** avec méthodes non utilisées (ISP violation)
- ❌ **Dépendances vers implémentations** (DIP violation)

#### **🚫 Architecture**

- ❌ **Business logic** dans Infrastructure layer
- ❌ **Direct database access** depuis Use Cases
- ❌ **Dépendances circulaires** entre couches
- ❌ **Hardcoded strings** (toujours i18n)
- ❌ **Operations sans permissions** check
- ❌ **Tests sans mocks typés**

### 🎯 **Patterns Obligatoires**

#### **💼 Use Case Pattern (SOLID Compliant)**

```typescript
// ✅ OBLIGATOIRE - Structure Use Case complète
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // DIP - Interface only
    private readonly logger: ILogger, // DIP - Interface only
    private readonly i18n: II18nService, // DIP - Interface only
    private readonly eventBus: IEventBus, // DIP - Interface only
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. AppContext OBLIGATOIRE
    const context: AppContext = AppContextFactory.create()
      .operation('CreateUser')
      .requestingUser(request.requestingUserId)
      .build();

    // 2. Logging initial OBLIGATOIRE
    this.logger.info(
      this.i18n.t('operations.user.creation_attempt'),
      context as Record<string, unknown>,
    );

    try {
      // 3. Authorization OBLIGATOIRE - SRP dedicated method
      await this.validatePermissions(request, context);

      // 4. Business rules OBLIGATOIRE - SRP dedicated method
      await this.validateBusinessRules(request, context);

      // 5. Entity creation - Pure domain logic
      const email = Email.create(request.email);
      const user = User.create(email, request.name, request.role);

      // 6. Persistence via interface - DIP
      const savedUser = await this.userRepository.save(user);

      // 7. Events for extensibility - OCP
      await this.eventBus.publish(new UserCreatedEvent(savedUser, context));

      // 8. Typed response OBLIGATOIRE
      const response: CreateUserResponse = {
        id: savedUser.id,
        email: savedUser.email.value,
        name: savedUser.name,
        role: savedUser.role,
        createdAt: savedUser.createdAt,
      };

      // 9. Success logging OBLIGATOIRE
      this.logger.info(this.i18n.t('operations.user.creation_success'), {
        ...context,
        userId: savedUser.id,
      } as Record<string, unknown>);

      return response;
    } catch (error) {
      // 10. Error logging OBLIGATOIRE
      this.logger.error(
        this.i18n.t('operations.user.creation_failed'),
        error as Error,
        context as Record<string, unknown>,
      );
      throw error;
    }
  }

  // SRP - Single method for permissions
  private async validatePermissions(
    request: CreateUserRequest,
    context: AppContext,
  ): Promise<void> {
    // Implementation...
  }

  // SRP - Single method for business rules
  private async validateBusinessRules(
    request: CreateUserRequest,
    context: AppContext,
  ): Promise<void> {
    // Implementation...
  }
}
```

#### **🏢 Entity Pattern (Domain)**

```typescript
// ✅ OBLIGATOIRE - Entity immutable avec factory
export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _name: string,
    private readonly _role: UserRole,
    private readonly _createdAt: Date,
  ) {}

  // Factory method - SRP pour création
  static create(email: Email, name: string, role: UserRole): User {
    // Validation business rules
    if (!name?.trim()) {
      throw new InvalidUserNameError('Name cannot be empty');
    }

    return new User(generateId(), email, name.trim(), role, new Date());
  }

  // Business methods - SRP pour règles métier
  hasPermission(permission: Permission): boolean {
    return this.role.hasPermission(permission);
  }

  // Read-only getters - LSP compliance
  get id(): string {
    return this._id;
  }
  get email(): Email {
    return this._email;
  }
  get name(): string {
    return this._name;
  }
  get role(): UserRole {
    return this._role;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
```

#### **🧪 Test Pattern (TDD + Types)**

```typescript
// ✅ OBLIGATOIRE - Tests typés avec mocks corrects
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockI18n: jest.Mocked<II18nService>;
  let mockEventBus: jest.Mocked<IEventBus>;

  beforeEach(() => {
    // Mocks typed OBLIGATOIRE
    mockRepository = createMockUserRepository();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();
    mockEventBus = createMockEventBus();

    useCase = new CreateUserUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
      mockEventBus,
    );
  });

  it('should create user when valid request', async () => {
    // Arrange - Typed data OBLIGATOIRE
    const request: CreateUserRequest = {
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.USER,
      requestingUserId: 'admin-123',
    };

    // Setup mocks with types
    mockRepository.findById.mockResolvedValue(adminUser);
    mockRepository.save.mockResolvedValue(expectedUser);

    // Act
    const result: CreateUserResponse = await useCase.execute(request);

    // Assert - Type safety guaranteed
    expect(result).toEqual(expectedResponse);
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(User));
  });
});
```

### 🎯 **Patterns de Code Préférés**

#### **Use Case Structure**

```typescript
export class [Operation]UseCase {
  constructor(
    private readonly repository: I[Entity]Repository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: [Operation]Request): Promise<[Operation]Response> {
    const context = AppContextFactory.create()
      .operation('[Operation]')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.[entity].[operation]_attempt'),
      context
    );

    try {
      // 1. Validation des permissions
      // 2. Validation des règles métier
      // 3. Logique principale
      // 4. Persistence
      // 5. Logging de succès
      // 6. Audit trail
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.failed'),
        error,
        context
      );
      throw error;
    }
  }
}
```

#### **Entity avec Business Rules**

```typescript
export class [Entity] {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    // ...autres propriétés
  ) {}

  static create(
    email: Email,
    // ...autres paramètres
  ): [Entity] {
    // Validation des règles métier
    if (!email.isValid()) {
      throw new InvalidEmailError();
    }

    return new [Entity](
      generateId(),
      email,
      // ...
    );
  }

  // Méthodes métier
  public canPerform(action: string): boolean {
    // Logique de permissions
  }
}
```

#### **Tests Structure**

```typescript
describe('[FeatureName]', () => {
  let useCase: [Feature]UseCase;
  let mockRepository: jest.Mocked<I[Entity]Repository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      // ... autres méthodes
    } as jest.Mocked<I[Entity]Repository>;

    useCase = new [Feature]UseCase(mockRepository, mockLogger, mockI18n);
  });

  describe('Successful Operations', () => {
    it('should [action] when [valid condition]', async () => {
      // Arrange
      const request = { /* valid data */ };
      mockRepository.findById.mockResolvedValue(validResult);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockRepository.findById).toHaveBeenCalledWith(expectedParams);
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when [business rule violated]', async () => {
      // Test des règles métier
    });
  });

  describe('Authorization Rules', () => {
    it('should reject when [permission denied]', async () => {
      // Test des autorisations
    });
  });
});
```

## 📊 **Métriques de Qualité**

### 🎯 **Objectifs Maintenus**

- ✅ **108 tests** passants (maintenir 100%)
- ✅ **Clean Architecture** respectée
- ✅ **SOLID principles** appliqués
- ✅ **Security first** approach
- ✅ **Enterprise patterns** utilisés

### 📈 **Indicateurs de Succès**

- Tests continuent de passer après modifications
- Aucune dépendance circulaire introduite
- Logging et audit trail présents
- Configuration externalisée
- Messages i18n utilisés
- Permissions vérifiées

## 🚀 **Contexte Technique**

### 🔧 **Stack Technique**

- **Runtime** : Node.js + TypeScript
- **Framework** : NestJS
- **Testing** : Jest avec TDD strict
- **Architecture** : Clean Architecture 4 layers
- **Security** : JWT + RBAC + Audit
- **I18n** : Système HYBRIDE innovant

## 📊 **Métriques de Qualité OBLIGATOIRES**

### 🎯 **Standards à Maintenir**

#### **✅ Type Safety (100%)**

- **Zero `any` types** - Utiliser `unknown` ou types appropriés
- **Explicit return types** sur toutes méthodes publiques
- **Strict TypeScript** config avec toutes options strictes activées
- **Null safety** avec gestion explicite null/undefined

#### **✅ Test Coverage (Maintenir 202 tests ✅)**

- **TDD obligatoire** - Tests AVANT implémentation
- **Unit tests** pour toute logique métier
- **Integration tests** pour Use Cases
- **Type-safe mocks** avec `jest.Mocked<T>`

#### **✅ SOLID Compliance (100%)**

- **SRP**: Une responsabilité par classe/méthode
- **OCP**: Extension via interfaces, pas de modification
- **LSP**: Substitution sans surprise comportementale
- **ISP**: Interfaces spécifiques, jamais fat interfaces
- **DIP**: Dépendances vers abstractions uniquement

#### **✅ Architecture Quality**

- **Dependency Inversion** strict entre couches
- **Clean separation** Domain/Application/Infrastructure/Presentation
- **No circular dependencies** vérifiées
- **Interface-based design** obligatoire

#### **✅ Code Quality**

- **ESLint**: 0 erreurs, warnings minimaux
- **Prettier**: Formatage automatique appliqué
- **Documentation**: JSDoc sur APIs publiques
- **Error handling**: Types d'erreurs spécifiques

### 🚨 **Détection de Non-Conformité**

#### **🔴 Violations CRITIQUES (Jamais accepter)**

```typescript
// ❌ VIOLATION TYPE SAFETY
function process(data: any): any {} // INTERDIT

// ❌ VIOLATION SRP
class UserService {
  createUser() {}
  sendEmail() {} // Responsabilité multiple
  generateReport() {} // Responsabilité multiple
}

// ❌ VIOLATION DIP
class UseCase {
  constructor(
    private repo: TypeOrmRepository, // Dépendance concrète INTERDITE
  ) {}
}

// ❌ VIOLATION OCP
class PaymentProcessor {
  process(type: string) {
    if (type === 'credit') {
      // Modification requise pour nouveau type INTERDIT
    }
  }
}
```

#### **✅ Correction OBLIGATOIRE**

```typescript
// ✅ TYPE SAFETY CORRECT
function process<T>(data: T): ProcessResult<T> {}

// ✅ SRP CORRECT
class UserService {
  createUser() {} // Une seule responsabilité
}
class EmailService {
  sendEmail() {} // Service séparé
}

// ✅ DIP CORRECT
class UseCase {
  constructor(
    private readonly repo: IUserRepository, // Interface obligatoire
  ) {}
}

// ✅ OCP CORRECT
interface IPaymentProcessor {
  process(payment: Payment): Promise<PaymentResult>;
}
class PaymentService {
  constructor(private processors: Map<PaymentType, IPaymentProcessor>) {}

  async process(payment: Payment): Promise<PaymentResult> {
    const processor = this.processors.get(payment.type);
    return processor.process(payment); // Extension sans modification
  }
}
```

### 🎯 **Checklist Génération de Code**

#### **📋 AVANT de générer du code**

- [ ] **Architecture**: Identifier la couche correcte (Domain/Application/Infrastructure/Presentation)
- [ ] **SOLID**: Vérifier respect des 5 principes
- [ ] **Types**: Définir interfaces et types stricts
- [ ] **Dependencies**: Identifier abstractions nécessaires
- [ ] **Tests**: Planifier structure TDD

#### **📋 PENDANT la génération**

- [ ] **SRP**: Une responsabilité par classe/méthode
- [ ] **Interfaces**: Utiliser abstractions pour toutes dépendances
- [ ] **Types explicites**: Return types sur méthodes publiques
- [ ] **Error handling**: Types d'erreurs spécifiques
- [ ] **Logging**: AppContext + i18n messages

#### **📋 APRÈS génération**

- [ ] **Tests**: Créer tests TDD avec mocks typés
- [ ] **ESLint**: Vérifier 0 erreurs
- [ ] **Type check**: Compilation TypeScript sans erreurs
- [ ] **Architecture**: Respect des couches
- [ ] **Documentation**: JSDoc sur APIs publiques

## 🔧 **Pipeline de Qualité de Code**

### 📋 **Processus Pre-Commit**

#### **🎯 Ordre des Opérations**

1. **Format** : `npm run format` (Prettier pour formatage uniforme)
2. **Lint** : `npm run lint` (ESLint pour quality gates)
3. **Test** : `npm test` (Jest pour validation fonctionnelle)
4. **Build** : `npm run build` (TypeScript pour validation types)

#### **🚀 Commandes Disponibles**

```bash
# Formatage et organisation des imports
npm run format

# Linting avec auto-fix des erreurs
npm run lint

# Tests complets (202 tests)
npm test

# Test en mode watch
npm run test:watch

# Compilation TypeScript
npm run build

# Type checking uniquement
npm run type-check

# Tous les checks en une fois
npm run check-all
```

#### **⚙️ Configuration Qualité**

- **Prettier** : Formatage uniforme avec configuration standardisée
- **ESLint** : 566 warnings détectés, zéro erreur tolérée
- **TypeScript** : Mode strict avec règles de sécurité renforcées
- **Jest** : 202 tests TDD avec couverture complète

### 📈 **Métriques Actuelles**

- ✅ **Tests**: 202/202 passants (30 suites)
- ⚠️ **ESLint**: 566 warnings (principalement types `any`)
- ✅ **Format**: Code uniformément formaté
- ✅ **Types**: Compilation TypeScript réussie

### 🎯 **Objectifs d'Amélioration**

- 🔄 **Réduire warnings ESLint** : Éliminer progressivement les types `any`
- 🔄 **Type Safety** : Renforcer la sécurité des types
- 🔄 **Documentation** : Ajouter JSDoc sur APIs publiques
- 🔄 **Coverage** : Maintenir couverture de tests élevée
- [ ] **Documentation**: JSDoc sur APIs publiques

### 📈 **Métriques Actuelles**

- ✅ **Tests**: 202 tests passants (30 suites)
- ✅ **Architecture**: Clean Architecture respectée
- ✅ **SOLID**: Principes appliqués dans Use Cases existants
- ✅ **Type Safety**: Configuration TypeScript stricte
- ✅ **Security**: RBAC + JWT + Audit trail
- ✅ **I18n**: Système hybride opérationnel

### 📋 **Commandes Utiles**

```bash
npm test                    # Tous les tests (maintenir 202 ✅)
npm run test:watch         # Tests en mode watch
npm run test:coverage      # Rapport de couverture
npm run lint               # Linting (0 erreurs obligatoire)
npm run format             # Formatage Prettier
npm run build              # Build production (0 erreurs TS)
npm run type-check         # Vérification types uniquement
```

---

**🎯 Utilisez ces instructions pour générer du code qui respecte RIGOUREUSEMENT les principes SOLID de Robert C. Martin, les meilleures pratiques TypeScript strictes, et l'architecture Clean établie dans ce projet enterprise de niveau production !**

**🔴 RAPPEL CRITIQUE**: Tout code généré DOIT respecter les 5 principes SOLID, avoir une type safety à 100% (ZERO `any`), et maintenir les 202 tests passants. Aucune exception n'est tolérée sur ces standards fondamentaux.\*\*
