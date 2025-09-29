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

## 🚨 CRITICAL RULE: NO GENERIC EXCEPTIONS IN CLEAN ARCHITECTURE

### ❌ ABSOLUTE PROHIBITION: Generic Error Usage

**NEVER use `throw new Error()` in any layer of Clean Architecture:**

- ❌ **Domain Layer**: No `throw new Error('message')`
- ❌ **Application Layer**: No `throw new Error('message')`
- ❌ **Infrastructure Layer**: No `throw new Error('message')`
- ❌ **Presentation Layer**: No `throw new Error('message')`

### 🎯 MANDATORY: Domain-Specific Exceptions

**ALWAYS create specialized exception classes:**

```typescript
// ✅ CORRECT - Domain-specific exceptions
// src/domain/exceptions/money.exceptions.ts
export class MoneyValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'MoneyValidationError';
  }
}

export class CurrencyMismatchError extends MoneyValidationError {
  constructor(currency1: string, currency2: string) {
    super(
      `Cannot perform operation with different currencies: ${currency1} and ${currency2}`,
      'CURRENCY_MISMATCH',
      { currency1, currency2 },
    );
  }
}

export class NegativeAmountError extends MoneyValidationError {
  constructor(amount: number) {
    super(
      `Amount cannot be negative: ${amount}`,
      'NEGATIVE_AMOUNT',
      { amount },
    );
  }
}
```

### 🔧 IMPLEMENTATION PATTERN FOR VALUE OBJECTS

```typescript
// ✅ CORRECT - Value Object with domain exceptions
export class Money {
  private validateAmount(amount: number): void {
    if (amount < 0) {
      throw new NegativeAmountError(amount);
    }

    if (!Number.isFinite(amount)) {
      throw new MoneyValidationError(
        'Amount must be a finite number',
        'INVALID_AMOUNT_FORMAT',
        { amount },
      );
    }

    if (Number((amount % 1).toFixed(2)) !== Number(amount % 1)) {
      throw new MoneyValidationError(
        'Amount cannot have more than 2 decimal places',
        'INVALID_DECIMAL_PRECISION',
        { amount },
      );
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### 🏗️ EXCEPTION HIERARCHY BY LAYER

#### **Domain Layer Exceptions**
```
src/domain/exceptions/
├── domain.exception.ts          # Base domain exception
├── user.exceptions.ts           # User-specific exceptions
├── money.exceptions.ts          # Money-specific exceptions
├── appointment.exceptions.ts    # Appointment-specific exceptions
└── business.exceptions.ts       # Business-specific exceptions
```

#### **Application Layer Exceptions**
```
src/application/exceptions/
├── application.exception.ts     # Base application exception
├── validation.exceptions.ts     # Input validation exceptions
├── authorization.exceptions.ts  # Permission exceptions
└── use-case.exceptions.ts       # Use case specific exceptions
```

### 🎯 EXCEPTION NAMING CONVENTIONS

- **Domain Exceptions**: `{Entity}ValidationError`, `{Entity}BusinessRuleError`
- **Application Exceptions**: `{UseCase}ValidationError`, `InsufficientPermissionsError`
- **Infrastructure Exceptions**: `DatabaseConnectionError`, `ExternalServiceError`

### 📋 MANDATORY EXCEPTION PROPERTIES

**Every custom exception MUST have:**

```typescript
export class CustomDomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,           // ⚠️ MANDATORY
    public readonly context?: Record<string, unknown>, // ⚠️ MANDATORY
    public readonly timestamp: Date = new Date(),      // ⚠️ MANDATORY
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### 🚨 VIOLATION DETECTION COMMANDS

```bash
# Detect generic Error usage (ZERO tolerance)
grep -r "throw new Error" src/
# EXPECTED RESULT: No matches (0 lines)

# Detect generic Error imports
grep -r "import.*Error" src/ | grep -v "custom\\|domain\\|application"
# EXPECTED RESULT: Only custom exception imports

# Verify custom exception usage
grep -r "throw new.*Error" src/ | grep -v "throw new Error"
# EXPECTED RESULT: Only custom exception throws
```

### ✅ BENEFITS OF DOMAIN EXCEPTIONS

1. **🎯 Explicit Error Context**: Each exception carries relevant business context
2. **🔍 Better Debugging**: Precise error location and cause identification
3. **📊 Error Analytics**: Categorized error tracking and monitoring
4. **🌐 I18n Support**: Structured error codes for internationalization
5. **🔒 Security**: No internal system details leaked through generic errors
6. **🧪 Testability**: Specific exception testing in unit tests

### 🚫 ZERO TOLERANCE POLICY

**Any `throw new Error()` usage is considered a CRITICAL architectural violation requiring immediate correction.**

This architecture ensures **framework independence**, **testability**, and **maintainability**!
