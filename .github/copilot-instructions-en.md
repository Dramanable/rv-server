# 🤖 GitHub Copilot Instructions for Clean Architecture + NestJS

## 🎯 **Project Context**

You are working on an **enterprise NestJS application** implementing **Robert C. Martin's Clean Architecture (Uncle Bob)** with a **rigorous TDD approach**, **SOLID principles**, and strict **TypeScript best practices**. The application is **production-ready** with security, i18n, and enterprise patterns.

## 🚀 **NODE.JS 24 - NEW FEATURES TO LEVERAGE**

### 📋 **Required Technical Environment**

- **Node.js Version**: `24.0.0` minimum (LTS recommended)
- **Official documentation**: https://nodejs.org/en/blog/release/v24.0.0
- **TypeScript**: `5.5+` for maximum Node 24 compatibility

### ⚡ **New Node.js 24 Features to Use**

#### **1. 🔧 Enhanced WebStreams Support**

```typescript
// ✅ NEW - Optimized native WebStreams
export class DataProcessor {
  async processLargeDataset(data: ReadableStream<Uint8Array>): Promise<void> {
    const transformer = new TransformStream({
      transform(chunk, controller) {
        // Business logic processing
        const processed = this.transformChunk(chunk);
        controller.enqueue(processed);
      },
    });

    await data.pipeThrough(transformer).pipeTo(
      new WritableStream({
        write(chunk) {
          // Optimized by Node 24
          this.saveToDatabase(chunk);
        },
      }),
    );
  }
}
```

#### **2. 🚀 Improved V8 Performance (v12.4)**

```typescript
// ✅ NEW - Automatic V8 optimizations for:
export class PerformanceOptimizedService {
  // Object spread operations - 15% faster
  private mergeConfigurations(base: Config, override: Partial<Config>): Config {
    return { ...base, ...override }; // Optimized by V8 12.4
  }

  // Array operations - 20% faster
  private processLargeArrays<T>(items: T[]): T[] {
    return items.filter(this.isValid).map(this.transform).sort(this.compare); // Optimized vectorized sort
  }

  // String template literals - Enhanced
  private generateReport(data: ReportData): string {
    return `
      📊 Report Generated: ${new Date().toISOString()}
      📈 Total Items: ${data.items.length}
      🎯 Success Rate: ${(data.successRate * 100).toFixed(2)}%
    `; // V8 12.4 template string optimization
  }
}
```

#### **3. 🛡️ Enhanced Security Features**

```typescript
// ✅ NEW - Enhanced security policy
export class SecureConfigService {
  constructor() {
    // Node 24 - Enhanced permission model
    if (process.permission?.has('fs.read', './config/')) {
      this.loadSecureConfig();
    }
  }

  // NEW - Optimized crypto.webcrypto
  async generateSecureHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Native WebCrypto API optimized Node 24
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
```

#### **4. 📦 Enhanced Built-in Test Runner**

```typescript
// ✅ NEW - Enhanced Node.js native test runner
// package.json scripts
{
  "scripts": {
    "test:node": "node --test **/*.test.js",
    "test:node-watch": "node --test --watch **/*.test.js",
    "test:coverage": "node --test --experimental-test-coverage **/*.test.js"
  }
}

// Tests with Node native runner
import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('UserService Tests', () => {
  it('should create user successfully', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User'
    });

    // Node 24 - Enhanced assert
    assert.strictEqual(user.email, 'test@example.com');
    assert.ok(user.id);
  });
});
```

#### **5. 🌍 ESM & Import Attributes**

```typescript
// ✅ NEW - Import attributes for JSON
import config from './config.json' with { type: 'json' };
import packageInfo from '../package.json' with { type: 'json' };

// ✅ NEW - Enhanced dynamic imports
export class DynamicModuleLoader {
  async loadPlugin(pluginName: string): Promise<unknown> {
    // Node 24 - Optimized ESM resolution
    const module = await import(`./plugins/${pluginName}.js`);
    return module.default;
  }

  // Top-level await in ESM
  private config = await this.loadConfiguration();
}
```

#### **6. 🔍 Enhanced Debugging & Diagnostics**

```typescript
// ✅ NEW - Enhanced integrated diagnostics
export class DiagnosticsService {
  getSystemDiagnostics(): SystemDiagnostics {
    return {
      // Node 24 - Extended metrics
      memory: process.memoryUsage.rss(),
      heap: process.memoryUsage(),

      // NEW - Resource usage details
      resourceUsage: process.resourceUsage(),

      // NEW - Enhanced performance marks
      performanceMarks: performance.getEntriesByType('mark'),

      // Node 24 - Network diagnostics
      networkInterfaces: require('os').networkInterfaces(),
    };
  }

  // NEW - Enhanced Performance Observer API
  observePerformance(): void {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.logger.debug(
          `Performance: ${entry.name} took ${entry.duration}ms`,
        );
      });
    });

    obs.observe({ entryTypes: ['function', 'http', 'dns'] });
  }
}
```

### 📋 **Node.js 24 Migration Checklist**

- [ ] **Version Check**: `node --version` >= 24.0.0
- [ ] **ESM Migration**: Convert to `"type": "module"` if needed
- [ ] **Import Attributes**: Use `with { type: 'json' }` for JSON
- [ ] **WebStreams**: Migrate to native WebStreams API
- [ ] **Test Runner**: Evaluate native test runner usage
- [ ] **Performance**: Leverage V8 12.4 optimizations
- [ ] **Security**: Implement new crypto features
- [ ] **Diagnostics**: Integrate new monitoring tools

### 🚨 **Node.js 24 Specific Patterns**

#### **Optimized Memory Management**

```typescript
// ✅ Node 24 - Optimized weak references
export class CacheService {
  private cache = new WeakMap(); // Optimized for GC
  private registry = new FinalizationRegistry((key) => {
    this.logger.debug(`Cache entry ${key} garbage collected`);
  });
}
```

#### **Enhanced Worker Threads**

```typescript
// ✅ Node 24 - Worker threads performance
import { Worker, isMainThread, parentPort } from 'worker_threads';

export class ComputeService {
  async heavyComputation(data: unknown[]): Promise<unknown[]> {
    if (data.length > 1000) {
      // Node 24 - Optimized worker spawning
      return this.processInWorker(data);
    }
    return this.processInMain(data);
  }
}
```

### 🎯 **Architecture Recommendations with Node.js 24**

1. **ESM First**: Prioritize native ES modules
2. **WebStreams**: Use for high-volume processing
3. **Native Test Runner**: For simple unit tests
4. **Enhanced Crypto**: For reinforced security
5. **Performance Monitoring**: Leverage new diagnostic tools
6. **Worker Threads**: For intensive computations

## 🏗️ **ORDERED LAYER DEVELOPMENT METHODOLOGY**

### 🎯 **MANDATORY DEVELOPMENT ORDER**

**To avoid dependency errors and ensure coherent architecture, ALWAYS develop in this strict order:**

#### **1️⃣ DOMAIN (Business Layer) - FIRST**

```
src/domain/
├── entities/          # Pure business entities
├── value-objects/     # Immutable value objects
├── services/          # Business services (complex rules)
├── repositories/      # Repository interfaces (ports)
└── exceptions/        # Business-specific exceptions
```

**✅ Characteristics**:

- **ZERO external dependencies** (no NestJS, no ORM, no framework)
- **Pure TypeScript** with strict types
- **Business logic only**
- **Testable in isolation**

#### **2️⃣ APPLICATION (Use Cases) - SECOND**

```
src/application/
├── use-cases/         # Use cases (orchestration)
├── ports/             # Interfaces for infrastructure
├── services/          # Application services
└── exceptions/        # Application exceptions
```

**✅ Characteristics**:

- **Depends ONLY** on Domain layer
- **ZERO dependency** on Infrastructure or Presentation
- **Orchestration** of entities and business services
- **Defines ports** (interfaces) for infrastructure

#### **3️⃣ INFRASTRUCTURE (Technical) - THIRD**

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

#### **4️⃣ PRESENTATION (Interface) - LAST**

```
src/presentation/
├── controllers/       # HTTP controllers
├── dtos/              # Data transfer objects
├── decorators/        # NestJS decorators
└── mappers/           # DTO ↔ Domain conversion
```

**✅ Characteristics**:

- **Use Cases orchestration**
- **Input validation**
- **Output serialization**
- **User interface** (REST, GraphQL, etc.)

### 🚀 **ADVANTAGES OF THIS APPROACH**

#### **✅ Error Reduction**

- **No circular dependencies**: each layer only depends on previous ones
- **Incremental compilation**: each layer compiles before moving to next
- **Early detection** of architectural violations

#### **✅ Efficient Development**

- **Progressive focus**: one concern at a time
- **Targeted tests**: each layer testable independently
- **Safe refactoring**: changes isolated by layer

#### **✅ Architectural Quality**

- **Automatic respect** for Clean Architecture principles
- **Clear separation** of concerns
- **Guaranteed** evolutivity and maintainability

### 📋 **PRACTICAL WORKFLOW**

```typescript
// 1️⃣ DOMAIN - Create entity first
export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _name: string,
  ) {}

  static create(email: Email, name: string): User {
    // Business validation
    return new User(generateId(), email, name);
  }
}

// 2️⃣ APPLICATION - Then use case
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface defined here
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Business orchestration
  }
}

// 3️⃣ INFRASTRUCTURE - Then implementation
export class TypeOrmUserRepository implements IUserRepository {
  // Technical implementation
}

// 4️⃣ PRESENTATION - Finally controller
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // User interface
  }
}
```

### ⚠️ **ABSOLUTE PROHIBITIONS**

#### **❌ NEVER do**:

- Start with controllers (Presentation)
- Write business logic in Infrastructure
- Use NestJS in Domain/Application
- Create dependencies towards upper layers

#### **✅ ALWAYS do**:

- Respect order Domain → Application → Infrastructure → Presentation
- Test each layer before moving to next
- Validate compilation at each step
- Document interfaces (ports) in Application

## 🏛️ **Clean Architecture - Uncle Bob's Fundamental Principles**

### 📚 **Official Reference**

**Source**: [The Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### 🎯 **Clean Architecture Goals**

Clean Architecture produces systems that are:

1. **🔧 Independent of Frameworks** - Architecture doesn't depend on framework existence. You use frameworks as tools, rather than constraining your system into their limitations.

2. **🧪 Testable** - Business rules can be tested without UI, Database, Web Server, or any other external element.

3. **🎨 Independent of UI** - UI can change easily, without changing the rest of the system. A Web UI could be replaced by a console UI without changing business rules.

4. **🗄️ Independent of Database** - You can swap out Oracle or SQL Server for Mongo, BigTable, CouchDB, or something else. Your business rules are not bound to the database.

5. **🌐 Independent of any external agency** - Your business rules simply don't know anything about the outside world.

### 🔄 **The Dependency Rule - FUNDAMENTAL RULE**

> **"Source code dependencies can only point inwards"**

![Clean Architecture Circles](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

**The concentric circles represent different areas of software:**

- The farther in you go, the higher level the software becomes
- The outer circles are mechanisms
- The inner circles are policies

**❌ FORBIDDEN**: Nothing in an inner circle can know anything about an outer circle
**❌ FORBIDDEN**: The name of something declared in an outer circle must not be mentioned by code in an inner circle

## 🚨 **CRITICAL RULE - NO NESTJS DEPENDENCIES IN DOMAIN/APPLICATION**

### ❌ **ABSOLUTELY FORBIDDEN VIOLATIONS**

**Domain** and **Application** layers MUST NEVER contain:

- `import { Injectable, Inject } from '@nestjs/common'`
- `@Injectable()` decorator
- `@Inject()` decorator
- Any import from `@nestjs/*` packages
- Any reference to NestJS injection tokens

### ✅ **CORRECT APPROACH**

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

### 🏗️ **Separation of Concerns**

- **Domain/Application**: Pure business logic, no framework
- **Infrastructure**: Technical implementations with NestJS
- **Presentation**: NestJS controllers that orchestrate Use Cases

### 🔗 **Dependency Injection**

NestJS injection happens ONLY in **Presentation/Infrastructure** layers:

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

**This rule is NON-NEGOTIABLE to maintain Clean Architecture principles!**

### 🏗️ **The 4 Main Layers**

#### 1. 🏛️ **Entities**

- **Role**: Encapsulate enterprise business rules
- **Content**: Objects with methods OR data structures + functions
- **Stability**: Least likely to change when something external changes
- **Example**: Not affected by page navigation, security, or UI changes

#### 2. 💼 **Use Cases**

- **Role**: Contains application-specific business rules
- **Content**: Orchestrate data flow to/from entities
- **Isolation**: Isolated from external concerns (DB, UI, frameworks)
- **Impact**: Only affected by changes to application operations

#### 3. 🔌 **Interface Adapters**

- **Role**: Set of adapters that convert data
- **Content**: MVC, Presenters, Views, Controllers, Repository implementations
- **Conversion**: From most convenient format for use cases/entities to external format
- **Example**: All SQL should be restricted to this layer

#### 4. 🔧 **Frameworks and Drivers**

- **Role**: Outermost layer composed of frameworks and tools
- **Content**: Database, Web Framework, external tools
- **Code**: Mainly "glue" code that communicates inward
- **Details**: Where all details go (Web, Database are details)

### 🚪 **Crossing Boundaries**

#### 🔄 **Dependency Inversion Principle**

- **Problem**: Use case must call presenter, but cannot (Dependency Rule violation)
- **Solution**: Use case calls interface in inner circle
- **Implementation**: Presenter in outer circle implements interface
- **Technique**: Dynamic polymorphism to create dependencies opposing control flow

#### 📦 **Data Crossing Boundaries**

- **Format**: Simple, isolated data structures
- **Allowed types**: Basic structs, Data Transfer Objects, function arguments
- **❌ FORBIDDEN**: Pass Entities or Database rows across boundaries
- **❌ FORBIDDEN**: Data structures with dependencies violating Dependency Rule
- **✅ RULE**: Data always in most convenient format for inner circle

## 📝 **MANDATORY Semantic Commits**

### 🎯 **Conventional Commits with Commitlint**

This project uses **[Commitlint](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)** to ensure standardized conventional semantic commits.

#### **✅ MANDATORY Format**

```
🎯 type(scope): description

body (optional)

footer (optional)
```

#### **🏷️ ALLOWED Commit Types**

- 🎉 **feat**: New feature
- 🐛 **fix**: Bug fix
- 📚 **docs**: Documentation
- 💄 **style**: Formatting, semicolons, etc. (no code change)
- ♻️ **refactor**: Refactoring (neither feature nor fix)
- ⚡ **perf**: Performance improvement
- ✅ **test**: Adding/modifying tests
- 🔧 **chore**: Maintenance tasks, tools, etc.
- 🚀 **ci**: CI/CD configuration
- ⏪ **revert**: Reverting previous commit
- 🔐 **security**: Security fixes
- 🌐 **i18n**: Internationalization
- ♿ **a11y**: Accessibility
- 🚨 **hotfix**: Urgent production fix

#### **📋 Valid Commit Examples**

```bash
🎉 feat(auth): add JWT refresh token rotation
🐛 fix(user): resolve email validation edge case
📚 docs(api): update authentication endpoints documentation
♻️ refactor(repo): extract common repository patterns
✅ test(login): add comprehensive login use case tests
🔧 chore(deps): update NestJS to latest version
🔐 security(jwt): implement secure token storage
```

#### **❌ FORBIDDEN Commits**

```bash
# Too vague
fix: bug fix
update code
improvements

# Non-allowed type
hack: quick fix
temp: temporary solution
```

#### **🎯 Configured Commitlint Rules**

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

**🚀 NEW: Complete Docker Environment**

### 🐳 **Production-Ready Docker Environment**

- ✅ **Docker Compose** multi-services with hot reload
- ✅ **PostgreSQL 15** with persistent volume and health checks
- ✅ **MongoDB 7** for NoSQL storage with replication
- ✅ **pgAdmin 4** web interface for PostgreSQL management (localhost:5050)
- ✅ **NestJS** containerized with debug ports and volumes
- ✅ **Complete Makefile** with simplified Docker commands

#### **🔧 Available Docker Commands**

```bash
make start          # Start all Docker services
make stop           # Stop all services
make build          # Build Docker images
make logs           # View all services logs
make test           # Run tests in container
make clean          # Clean volumes and images
make restart        # Restart services
make status         # Services status
```

### 📊 **Enhanced Quality Metrics**

### 🎯 **Maintained and Enhanced Goals**

- ✅ **198 tests** passing (22 complete test suites) - **UPGRADED from 24 tests**
- ✅ **Clean Architecture** respected in all components
- ✅ **SOLID principles** rigorously applied
- ✅ **Security first** approach with HttpOnly cookies
- ✅ **Enterprise patterns** used (logging, audit, i18n)
- ✅ **Docker environment** for isolated development
- ✅ **ESLint errors ELIMINATED** - From 18 blocking errors to 0 🎯✨
- ✅ **Node.js 24 Ready** - Architecture compatible with new features
- ✅ **Code quality** with strictly configured ESLint + Prettier

### 📈 **Success Indicators - FINAL UPDATE**

- Tests continue to pass after modifications (198/198 ✅)
- **🎯 ZERO BLOCKING ESLINT ERRORS** - 100% of critical errors eliminated
- **Promise.all corrections** - Synchronous methods converted to Promises
- **Regex patterns optimized** - Unnecessary escapes removed (no-useless-escape)
- **Enum comparisons fixed** - Enhanced type safety (no-unsafe-enum-comparison)
- **Case declarations wrapped** - Properly structured blocks (no-case-declarations)
- **Template expressions secured** - Never types properly handled
- No circular dependencies introduced
- Logging and audit trail present on all operations
- Externalized configuration (JWT secrets, expiration)
- i18n messages used in all Use Cases
- Verified permissions and specific exceptions
- Fully functional Docker environment
- **ESLint quality pipeline** operational without blocking errors

## 🏗️ **Established Architecture**

### 📁 **Layer Structure**

```
src/
├── domain/           # 🏢 Pure business rules (entities, value objects)
├── application/      # 💼 Use cases + ports + application exceptions
├── infrastructure/   # 🔧 Technical implementations (repos, services)
├── presentation/     # 🎨 HTTP Controllers + DTOs
└── shared/           # 🔗 Cross-cutting concerns
```

### 🎯 **Principles to Respect**

- ✅ **Dependency Inversion**: Upper layers never depend on lower ones
- ✅ **Single Responsibility**: Each class has single responsibility
- ✅ **TDD First**: Tests before implementation (**198 auth tests + others**)
- ✅ **Clean Code**: Expressive naming, short functions, useful comments
- ✅ **Enterprise Security**: Authentication, authorization, audit trail
- ✅ **SOLID Principles**: Rigorous application of Robert C. Martin's 5 principles
- ✅ **TypeScript Strict**: 100% type safety, zero tolerance for `any`

## 🎯 **SOLID Principles by Robert C. Martin**

### 🔹 **S** - Single Responsibility Principle (SRP)

**One class, one reason to change**

```typescript
// ✅ GOOD - Single responsibility
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Handles only user creation
  }
}

// ❌ BAD - Multiple responsibilities
export class UserService {
  createUser() {} // User creation
  sendEmail() {} // Email sending
  validateData() {} // Data validation
}
```

### 🔹 **O** - Open/Closed Principle (OCP)

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

### 🔹 **L** - Liskov Substitution Principle (LSP)

**Subtypes must be substitutable for their base types**

```typescript
// ✅ GOOD - Correct substitution
export abstract class Repository<T> {
  abstract save(entity: T): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
}

export class UserRepository extends Repository<User> {
  async save(user: User): Promise<User> {
    // Respects contract - always returns User
    return this.persistenceAdapter.save(user);
  }

  async findById(id: string): Promise<User | null> {
    // Respects contract - returns User or null
    return this.persistenceAdapter.findById(id);
  }
}
```

### 🔹 **I** - Interface Segregation Principle (ISP)

**Clients should not depend on interfaces they don't use**

```typescript
// ✅ GOOD - Segregated interfaces
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
  exportToJson(): Promise<string>; // Not used by everyone
  generateReport(): Promise<Buffer>; // Not used by everyone
}
```

### 🔹 **D** - Dependency Inversion Principle (DIP)

**Depend on abstractions, not implementations**

```typescript
// ✅ GOOD - Depends on abstractions
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface
    private readonly logger: ILogger, // Interface
    private readonly eventBus: IEventBus, // Interface
  ) {}
}

// ❌ BAD - Depends on implementations
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: TypeOrmUserRepository, // Concrete class
    private readonly logger: ConsoleLogger, // Concrete class
    private readonly eventBus: InMemoryEventBus, // Concrete class
  ) {}
}
```

## 🔧 **TypeScript Best Practices**

### 🎯 **MANDATORY Strict Configuration**

```typescript
// tsconfig.json - Strict mode MANDATORY
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

### 🎯 **Explicit Typing - ZERO `any` - USE `unknown`**

```typescript
// ✅ GOOD - Explicit types for public APIs and unknown for uncertain types
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

// ✅ GOOD - Generic constraints
export interface Repository<T extends Entity> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
}

// ✅ GOOD - Union types for controlled values
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql';
export type Environment = 'development' | 'staging' | 'production';

// ❌ FORBIDDEN - Usage of any
export function processData(data: any): any {
  // NEVER!
  return data;
}

// ✅ GOOD - Use unknown instead of any
export function processData<T>(data: unknown): T {
  // Type guard or assertion needed
  if (typeof data === 'object' && data !== null) {
    return data as T;
  }
  throw new Error('Invalid data type');
}

// ✅ GOOD - Type-safe generic
export function processData<T>(data: T): T {
  return data;
}
```

### 🎯 **Null-Safe & Error Handling**

```typescript
// ✅ GOOD - Explicit null handling
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

// ✅ GOOD - Result pattern for error handling
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

## 🔍 **ESLint & Formatting - CRITICAL Rules**

### 🎯 **NON-DISABLEABLE Rules**

```typescript
// eslint.config.mjs
export default [
  {
    rules: {
      // Type Safety - CRITICAL
      '@typescript-eslint/no-any': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Code Quality - CRITICAL
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-inferrable-types': 'off', // Prefer explicit

      // Best Practices - CRITICAL
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
];
```

### 🎯 **Standardized Prettier Configuration**

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

## 🚨 **COMMON ESLint ERRORS TO AVOID**

### ❌ **Promise.all errors with synchronous methods**

```typescript
// ❌ FORBIDDEN - Promise.all with non-Promise values
const [dbCheck, memoryInfo, systemInfo] = await Promise.all([
  this.checkDatabaseStatus(),  // OK - async method
  this.getMemoryInfo(),       // ❌ ERROR - synchronous method
  this.getSystemInfo(),       // ❌ ERROR - synchronous method
]);

// ✅ CORRECT - All methods return Promises
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

### ❌ **Unnecessary escapes in regular expressions**

```typescript
// ❌ FORBIDDEN - Unnecessary escapes
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/; // \-, \(, \) are unnecessary

// ✅ CORRECT - Minimal required escapes
const phoneRegex = /^\+?[\d\s-()]{10,}$/; // Cleaner and correct
```

### ❌ **async methods without await**

```typescript
// ❌ FORBIDDEN - async without await
async generateTokens(userId: string): Promise<TokenPair> {
  // No await in this method
  return {
    accessToken: this.createAccessToken(userId),
    refreshToken: this.createRefreshToken(userId)
  };
}

// ✅ CORRECT - Remove async or use Promise.resolve
generateTokens(userId: string): Promise<TokenPair> {
  return Promise.resolve({
    accessToken: this.createAccessToken(userId),
    refreshToken: this.createRefreshToken(userId)
  });
}

// OR if really need async
async generateTokens(userId: string): Promise<TokenPair> {
  const accessToken = await this.createAccessToken(userId);
  const refreshToken = await this.createRefreshToken(userId);
  return { accessToken, refreshToken };
}
```

### ❌ **Unused variables (no-unused-vars)**

```typescript
// ❌ FORBIDDEN - Unused variables/imports
import { Email, User, Permission } from '../domain/entities'; // Permission not used

export class CreateUserUseCase {
  execute(request: CreateUserRequest, context: AppContext): Promise<User> {
    // context is never used in this method
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}

// ✅ CORRECT - Remove unused imports/variables
import { Email, User } from '../domain/entities';

export class CreateUserUseCase {
  execute(request: CreateUserRequest): Promise<User> {
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}

// ✅ CORRECT - Prefix with underscore if required by interface
export class CreateUserUseCase {
  execute(request: CreateUserRequest, _context: AppContext): Promise<User> {
    // _context explicitly indicates parameter is not used
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}
```

### 🎯 **ESLint Correction Rules**

#### **1. @typescript-eslint/await-thenable**

- **Problem**: Promise.all used with non-Promise values
- **Solution**: Convert synchronous methods to return Promises with `Promise.resolve()`

#### **2. no-useless-escape**

- **Problem**: Unnecessary escapes in regex (\\-, \\(, \\))
- **Solution**: Remove unnecessary backslashes: `[\d\s-()]` instead of `[\d\s\-\(\)]`

#### **3. @typescript-eslint/require-await**

- **Problem**: Methods marked `async` without using `await`
- **Solution**: Remove `async` and use `Promise.resolve()` OR add real `await` calls

#### **4. @typescript-eslint/no-unused-vars**

- **Problem**: Variables, imports or parameters declared but never used
- **Solution**: Remove or prefix with `_` (ex: `_context`, `_error`)

#### **5. @typescript-eslint/unbound-method**

- **Problem**: Referencing methods without binding `this` in tests
- **Solution**: Use arrow functions or explicitly bind `this`

```typescript
// ❌ VIOLATION in tests
expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);

// ✅ CORRECT in tests
expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
// Use jest.Mocked<T> to avoid this problem
```

### 📋 **ESLint Verification Checklist**

Before committing, ALWAYS verify:

- [ ] **Promise.all**: All values are Promises
- [ ] **Regex**: Minimal required escapes only
- [ ] **Async/await**: async methods actually use await
- [ ] **Variables**: All imports/variables are used
- [ ] **Tests**: Mocks correctly typed with `jest.Mocked<T>`

### 🔧 **Correction Commands**

```bash
# Check ESLint errors
npm run lint

# Auto-fix what can be fixed
npm run lint -- --fix

# Compile to check TypeScript errors
npm run build

# Run all tests
npm test
```

## 🚨 **CRITICAL: FRAMEWORK-FREE DOMAIN & APPLICATION LAYERS**

### 🎯 **ABSOLUTE RULE: ZERO Framework Dependencies in Business Logic**

**The Domain and Application layers MUST remain completely free of any framework dependencies. This is a fundamental principle of Clean Architecture that ensures:**

- **Framework Independence**: Business rules are not coupled to any specific framework
- **Testability**: Pure business logic can be tested in isolation
- **Portability**: Core logic can be moved between different frameworks
- **Maintainability**: Changes in frameworks don't affect business rules

### ❌ **STRICTLY FORBIDDEN in Domain/Application**

```typescript
// ❌ NEVER import framework dependencies in Domain/Application
import { Injectable, Inject } from '@nestjs/common';        // FORBIDDEN
import { Repository } from 'typeorm';                       // FORBIDDEN
import { Request, Response } from 'express';                // FORBIDDEN
import { GraphQLResolveInfo } from 'graphql';              // FORBIDDEN
import { JwtService } from '@nestjs/jwt';                   // FORBIDDEN
import { ConfigService } from '@nestjs/config';            // FORBIDDEN

// ❌ NEVER use framework decorators in Domain/Application
@Injectable()  // FORBIDDEN in Domain/Application
@Entity()      // FORBIDDEN in Domain/Application
@Column()      // FORBIDDEN in Domain/Application
```

### ✅ **CORRECT: Pure TypeScript in Domain/Application**

```typescript
// ✅ Domain Layer - Pure business logic
export class User {
  private constructor(
    private readonly id: string,
    private readonly email: Email,
    private readonly name: string,
  ) {}

  static create(email: Email, name: string): User {
    // Pure business validation - no framework dependencies
    if (!name || name.trim().length < 2) {
      throw new DomainError('User name must be at least 2 characters');
    }
    return new User(generateId(), email, name);
  }
}

// ✅ Application Layer - Use case orchestration
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface only
    private readonly logger: ILogger, // Interface only
    private readonly eventBus: IEventBus, // Interface only
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Pure orchestration logic - no framework dependencies
    const email = Email.create(request.email);
    const user = User.create(email, request.name);

    const savedUser = await this.userRepository.save(user);
    await this.eventBus.publish(new UserCreatedEvent(savedUser));

    return CreateUserResponse.fromUser(savedUser);
  }
}
```

### 🏗️ **Proper Dependency Injection Architecture**

Framework-specific dependency injection should only happen in the **Infrastructure** and **Presentation** layers:

```typescript
// ✅ Infrastructure Layer - Framework implementations
@Injectable() // OK here - Infrastructure layer
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) // OK here - Infrastructure layer
    private readonly repository: Repository<UserEntity>,
  ) {}
}

// ✅ Presentation Layer - Controllers with framework integration
@Controller('users') // OK here - Presentation layer
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE) // OK here - Presentation layer
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}
}

// ✅ Infrastructure Layer - Module configuration
@Module({
  // OK here - Infrastructure layer
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

### 📋 **Layer Responsibility Matrix**

| Layer              | Framework Usage | Dependency Injection | Decorators | External Libraries                 |
| ------------------ | --------------- | -------------------- | ---------- | ---------------------------------- |
| **Domain**         | ❌ NEVER        | ❌ NEVER             | ❌ NEVER   | ❌ Only if pure (lodash, date-fns) |
| **Application**    | ❌ NEVER        | ❌ NEVER             | ❌ NEVER   | ❌ Only if pure (lodash, date-fns) |
| **Infrastructure** | ✅ YES          | ✅ YES               | ✅ YES     | ✅ YES                             |
| **Presentation**   | ✅ YES          | ✅ YES               | ✅ YES     | ✅ YES                             |

### 🚨 **Violation Detection**

To detect violations, regularly check:

```bash
# Check for NestJS imports in Domain/Application
grep -r "@nestjs" src/domain/ src/application/

# Check for framework decorators in Domain/Application
grep -r "@Injectable\|@Entity\|@Column\|@Repository" src/domain/ src/application/

# Check for ORM imports in Domain/Application
grep -r "typeorm\|mongoose\|prisma" src/domain/ src/application/
```

**Any result from these commands indicates a Clean Architecture violation that must be fixed immediately!**

## 🔗 **Husky & Semantic Commit Enforcement**

### 🎯 **Pre-commit Hooks with Husky**

Husky enforces code quality and commit standards automatically:

```json
// package.json - Husky configuration
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint --edit $1"
  },
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 🔧 **Husky Hooks Configuration**

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged for code formatting and linting
npx lint-staged

# Run tests to ensure nothing is broken
npm test

echo "✅ Pre-commit checks passed!"
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."
npx --no -- commitlint --edit $1
echo "✅ Commit message is valid!"
```

### 📋 **Commit Workflow**

1. **Code Changes**: Make your changes
2. **Automatic Formatting**: Husky runs ESLint + Prettier on staged files
3. **Test Validation**: All tests must pass
4. **Commit Message Validation**: Must follow conventional commit format
5. **Commit Success**: Only if all checks pass

### 🚫 **Blocked Actions**

Husky will prevent commits if:

- ESLint errors exist
- Tests are failing
- Commit message doesn't follow convention
- Code is not properly formatted

This ensures **100% code quality** and **consistent commit history**!
