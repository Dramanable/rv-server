# 🏛️ Clean Architecture Implementation

## 📚 Uncle Bob's Clean Architecture Fundamentals

**Reference**: [The Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### 🎯 Core Objectives

The Clean Architecture produces systems that are:

1. **🔧 Framework Independent** - Architecture doesn't depend on frameworks. Use frameworks as tools, not system constraints.
2. **🧪 Testable** - Business rules can be tested without UI, Database, Web Server, or external elements.
3. **🎨 UI Independent** - UI can change easily without changing the system core.
4. **🗄️ Database Independent** - Swap Oracle, SQL Server for Mongo, CouchDB, etc. Business rules aren't bound to database.
5. **🌐 External Agency Independent** - Business rules know nothing about the outside world.

## 🔄 The Dependency Rule - FUNDAMENTAL

> **"Source code dependencies can only point inwards"**

**❌ FORBIDDEN**: Nothing in an inner circle can know anything about an outer circle
**❌ FORBIDDEN**: Names from outer circles cannot be mentioned in inner circle code

## 🏗️ Layer Structure & Responsibilities

### 🏛️ Domain Layer (Center)

```
src/domain/
├── entities/          # Pure business entities
├── value-objects/     # Immutable value objects
├── services/          # Domain business services
├── repositories/      # Repository interfaces (ports)
└── exceptions/        # Business-specific exceptions
```

**✅ Characteristics**:

- **ZERO external dependencies** (no NestJS, no ORM, no frameworks)
- **Pure TypeScript** with strict types
- **Business logic only**
- **Testable in isolation**

### 💼 Application Layer

```
src/application/
├── services/          # Application services (PREFER over use-cases)
├── ports/             # Interfaces for infrastructure
├── use-cases/         # Use cases (only if necessary)
└── exceptions/        # Application exceptions
```

**✅ Characteristics**:

- **PREFER Services** over complex Use Cases
- **Depends ONLY** on Domain layer
- **ZERO dependencies** on Infrastructure or Presentation
- **Simple orchestration** of entities and domain services
- **Defines ports** (interfaces) for infrastructure

### 🔧 Infrastructure Layer

```
src/infrastructure/
├── database/          # Concrete repositories, ORM, migrations
├── services/          # Technical services (JWT, Email, etc.)
├── config/            # Configuration
└── security/          # Technical security
```

**✅ Characteristics**:

- **Implements ports** defined in Application
- **Can use NestJS** and other frameworks
- **No business logic**
- **Adapters** to external world

### 🎨 Presentation Layer (Outer)

```
src/presentation/
├── controllers/       # HTTP controllers
├── dtos/              # Data transfer objects
├── decorators/        # NestJS decorators
└── mappers/           # DTO ↔ Domain conversion
```

**✅ Characteristics**:

- **Orchestrates** Application Services (NOT complex Use Cases)
- **Input validation** with class-validator
- **Output serialization**
- **Complete Swagger documentation**
- **i18n support** for error messages

## 🚨 CRITICAL RULE: NO FRAMEWORK IN DOMAIN/APPLICATION

### ❌ Absolute Violations

**NEVER in Domain/Application layers:**

- `import { Injectable, Inject } from '@nestjs/common'`
- `@Injectable()` decorator
- `@Inject()` decorator
- Any `@nestjs/*` package imports
- Any reference to NestJS injection tokens

### ✅ Correct Approach

```typescript
// ❌ FORBIDDEN - Clean Architecture violation
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject('USER_REPOSITORY') private userRepo: IUserRepository) {}
}

// ✅ CORRECT - Clean Architecture respected
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}
}
```

## 🏗️ Separation of Responsibilities

- **Domain/Application**: Pure business logic, no framework
- **Infrastructure**: Technical implementations with NestJS
- **Presentation**: NestJS controllers that orchestrate Use Cases

## 🔗 Dependency Injection Pattern

NestJS injection happens ONLY in **Presentation/Infrastructure**:

```typescript
// In presentation/controllers/*.controller.ts
@Controller()
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}
}
```

## 🎯 SOLID Principles Integration

### 🔹 Single Responsibility Principle (SRP)

**One class, one reason to change**

```typescript
// ✅ GOOD - Single responsibility
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Only handles user creation
  }
}
```

### 🔹 Open/Closed Principle (OCP)

**Open for extension, closed for modification**

```typescript
// ✅ GOOD - Extension via interfaces
export interface INotificationService {
  send(message: string, recipient: string): Promise<void>;
}

export class EmailNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Email implementation
  }
}

export class SmsNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // SMS implementation - extension without modification
  }
}
```

### 🔹 Liskov Substitution Principle (LSP)

**Subtypes must be substitutable for their base types**

### 🔹 Interface Segregation Principle (ISP)

**Clients shouldn't depend on interfaces they don't use**

### 🔹 Dependency Inversion Principle (DIP)

**Depend on abstractions, not concretions**

```typescript
// ✅ GOOD - Depends on abstractions
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface
    private readonly logger: ILogger, // Interface
    private readonly eventBus: IEventBus, // Interface
  ) {}
}
```

## 📋 Layer Responsibility Matrix

| Layer              | Framework Usage | Dependency Injection | Decorators | External Libraries              |
| ------------------ | --------------- | -------------------- | ---------- | ------------------------------- |
| **Domain**         | ❌ NEVER        | ❌ NEVER             | ❌ NEVER   | ❌ Only pure (lodash, date-fns) |
| **Application**    | ❌ NEVER        | ❌ NEVER             | ❌ NEVER   | ❌ Only pure (lodash, date-fns) |
| **Infrastructure** | ✅ YES          | ✅ YES               | ✅ YES     | ✅ YES                          |
| **Presentation**   | ✅ YES          | ✅ YES               | ✅ YES     | ✅ YES                          |

## 🚨 Violation Detection

Detect violations with:

```bash
# Check for NestJS imports in Domain/Application
grep -r "@nestjs" src/domain/ src/application/

# Check for framework decorators in Domain/Application
grep -r "@Injectable\\|@Entity\\|@Column\\|@Repository" src/domain/ src/application/

# Check for ORM imports in Domain/Application
grep -r "typeorm\\|mongoose\\|prisma" src/domain/ src/application/
```

**Any results indicate Clean Architecture violations that must be fixed immediately!**

## 🎯 Port & Adapter Pattern for External Services

**All external services (Email, SMS, etc.) MUST be ports/adapters:**

- **Port** (Interface) in `/application/ports/`
- **Adapter** (Implementation) in `/infrastructure/services/`
- **Examples**: EmailPort → GmailAdapter, SmsPort → TwilioAdapter

## 🔄 Crossing Boundaries Pattern

### Dependency Inversion in Practice

- **Problem**: Use case needs to call presenter, but can't (violates Dependency Rule)
- **Solution**: Use case calls interface in inner circle
- **Implementation**: Presenter in outer circle implements interface
- **Technique**: Dynamic polymorphism to create dependencies opposing control flow

### Data Crossing Boundaries

- **Format**: Simple, isolated data structures
- **Allowed**: Basic structs, DTOs, function arguments
- **❌ FORBIDDEN**: Passing Entities or Database rows across boundaries
- **❌ FORBIDDEN**: Data structures with dependencies violating Dependency Rule
- **✅ RULE**: Data always in format most convenient for inner circle

This architecture ensures **framework independence**, **testability**, and **maintainability**!
