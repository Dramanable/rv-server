# 🏛️ Clean Architecture - Règles de Dépendances

## 📋 Principe Fondamental

> **"Les couches Domain et Application ne doivent JAMAIS dépendre de frameworks externes"**
>
> _Robert C. Martin (Uncle Bob) - Clean Architecture_

## 🎯 Règles de Dépendances par Couche

### 1️⃣ **DOMAIN** (Entités Métier)

```
src/domain/
├── entities/          # Entités métier pures
├── value-objects/     # Objets valeur immutables
├── services/          # Services métier
├── repositories/      # Interfaces repositories (ports)
└── exceptions/        # Exceptions métier
```

**✅ AUTORISÉ :**

- TypeScript pur
- Lodash, date-fns (utilitaires purs)
- Autres entités du domain

**❌ INTERDIT :**

- `@nestjs/*` imports
- `@Injectable`, `@Inject` décorateurs
- TypeORM, Mongoose, Prisma
- Express, Fastify
- Tout framework externe

### 2️⃣ **APPLICATION** (Cas d'Usage)

```
src/application/
├── use-cases/         # Cases d'utilisation
├── services/          # Services applicatifs
├── ports/             # Interfaces (ports) pour infrastructure
└── exceptions/        # Exceptions applicatives
```

**✅ AUTORISÉ :**

- TypeScript pur
- Entités du domain
- Interfaces (ports) définies dans application
- Lodash, date-fns (utilitaires purs)

**❌ INTERDIT :**

- `@nestjs/*` imports
- `@Injectable`, `@Inject` décorateurs
- TypeORM, Mongoose, Prisma
- Express, Fastify
- Tout framework externe

### 3️⃣ **INFRASTRUCTURE** (Technique)

```
src/infrastructure/
├── database/          # Repositories concrets, ORM
├── services/          # Services techniques
├── modules/           # Modules NestJS (DI)
└── config/            # Configuration
```

**✅ AUTORISÉ :**

- Tout framework (`@nestjs/*`, TypeORM, etc.)
- Implémentation des ports de Application
- Configuration et injection de dépendances

### 4️⃣ **PRESENTATION** (Interface)

```
src/presentation/
├── controllers/       # Contrôleurs HTTP
├── dtos/              # Objets de transfert
├── security/          # Guards, pipes
└── mappers/           # Conversion DTO ↔ Domain
```

**✅ AUTORISÉ :**

- Tout framework (`@nestjs/*`, Express, etc.)
- Orchestration des Use Cases
- Validation, sérialisation

## 🔍 Vérification Automatique

### Script Intégré

```bash
# Vérifier la Clean Architecture
npm run check:clean-arch

# Vérification complète
npm run check:all
```

### Détection des Violations

Le script détecte automatiquement :

- ✅ Imports `@nestjs/*` dans Domain/Application
- ✅ Décorateurs `@Injectable`, `@Inject`, `@Module`
- ✅ Références textuelles inappropriées

### Hook Pré-Commit

Les violations bloquent automatiquement les commits :

```bash
git commit -m "feat: nouvelle fonctionnalité"
# → Vérification Clean Architecture automatique
# → Échec si violations détectées
```

## 🚨 Violations Courantes

### ❌ Import Framework dans Domain

```typescript
// ❌ INTERDIT dans src/domain/
import { Injectable } from '@nestjs/common';

@Injectable()
export class User {
  // VIOLATION !
}
```

### ❌ Import Framework dans Application

```typescript
// ❌ INTERDIT dans src/application/
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPO') private repo: any, // VIOLATION !
  ) {}
}
```

### ✅ Approche Correcte

```typescript
// ✅ CORRECT dans src/application/
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface
    private readonly logger: Logger, // Interface
    private readonly i18n: I18nService, // Interface
  ) {}
}
```

## 🏗️ Architecture d'Injection

### Infrastructure Module (✅ Correct)

```typescript
// src/infrastructure/modules/use-cases.module.ts
@Module({
  providers: [
    {
      provide: TOKENS.CREATE_USER_USE_CASE,
      useFactory: (repo, logger, i18n) =>
        new CreateUserUseCase(repo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
  ],
})
export class UseCasesModule {}
```

### Controller (✅ Correct)

```typescript
// src/presentation/controllers/user.controller.ts
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase, // Pure class
  ) {}
}
```

## 🎯 Bénéfices

### 🔧 Indépendance des Frameworks

- Logique métier portable entre frameworks
- Pas de couplage technique dans les règles business

### 🧪 Testabilité Maximale

- Tests unitaires purs sans mocks complexes
- Isolation complète des dépendances externes

### 🚀 Évolutivité

- Changement de framework sans impact métier
- Architecture évolutive et maintenable

### 🛡️ Robustesse

- Séparation claire des responsabilités
- Respect des principes SOLID

## 📚 Références

- [The Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Dependency Rule](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html#the-dependency-rule)

---

**💡 Règle d'Or : Si vous hésitez, demandez-vous "Cette classe pourrait-elle fonctionner sans NestJS ?" Si la réponse est non, elle n'appartient pas à Domain/Application.**
