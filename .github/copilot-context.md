# 🤖 Copilot Instructions - Clean Architecture + NestJS

## 🎯 Project Context
This is an **enterprise-grade Clean Architecture application** built with NestJS and TypeScript, following strict TDD methodology.

## 🏗️ Architecture Overview
- **Domain Layer**: Pure business logic (entities, value objects, business rules)
- **Application Layer**: Use cases, ports/interfaces, DTOs
- **Infrastructure Layer**: Database, external APIs, configurations
- **Presentation Layer**: Controllers, middlewares, validation
- **Shared Layer**: Cross-cutting concerns (AppContext, types, constants)

## 🎯 Key Patterns & Conventions

### 🏢 Entity Pattern
```typescript
export class User {
  private constructor(/*...*/) {}
  
  static create(email: Email, name: string, role: UserRole): User {
    // Business validation here
    return new User(/*...*/);
  }
  
  // Business methods only
  hasPermission(permission: Permission): boolean {
    return this.role.hasPermission(permission);
  }
}
```

### 💼 Use Case Pattern
```typescript
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const context = AppContextFactory.create()
      .operation('CreateUser')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(this.i18n.t('operations.user.creation_attempt'), context);
    
    // 1. Authorization check
    // 2. Business validation  
    // 3. Execute operation
    // 4. Log success/failure
  }
}
```

### 🔗 AppContext Pattern (for tracing)
```typescript
// Always use AppContext for operations
const context = AppContextFactory.create()
  .operation('OperationName')
  .requestingUser(userId, role)
  .targetUser(targetId)
  .clientInfo(ip, userAgent, deviceId)
  .build();

this.logger.info('Operation started', context);
```

### 🧪 Test Pattern (TDD)
```typescript
describe('UseCase', () => {
  let useCase: UseCase;
  let mockRepository: MockRepository;
  let mockLogger: MockLogger;

  beforeEach(() => {
    // Setup mocks
    mockRepository = new MockRepository();
    mockLogger = new MockLogger();
    useCase = new UseCase(mockRepository, mockLogger);
  });

  it('should succeed when valid conditions', async () => {
    // Arrange - Setup test data
    const request = Factory.createValidRequest();
    mockRepository.mockSuccess();

    // Act - Execute operation
    const result = await useCase.execute(request);

    // Assert - Verify expectations
    expect(result).toBeDefined();
    expect(mockRepository.wasCalled()).toBe(true);
  });
});
```

## 🎯 Code Generation Guidelines

### ✅ Always Include
- **AppContext** for all operations
- **Logging** with i18n messages and context
- **Permission checks** using RBAC
- **Error handling** with typed exceptions
- **TDD tests** with arrange/act/assert
- **I18n** for all user-facing messages

### ❌ Never Do
- Business logic in Infrastructure layer
- Direct database access in Use Cases
- Hardcoded strings (use i18n)
- Operations without permission checks
- Tests without proper mocks
- Circular dependencies between layers

## 🔐 Security Requirements
- All operations must check permissions via `user.hasPermission()`
- Use `AppContext` for audit trails
- Validate all inputs at Use Case level
- Log security events with proper context

## 🌍 I18n (Hybrid System)
```typescript
// Domain messages (business rules) - in shared/
'errors.user.not_found': 'User not found'

// Operational messages (technical) - in infrastructure/
'operations.user.creation_attempt': 'User creation attempt'
```

## 🧪 Testing Standards
- **TDD**: Write tests first, then implementation
- **108 tests passing** - maintain this standard
- Use **Factory pattern** for test data
- Mock all dependencies
- Test both success and failure scenarios

## 📋 File Naming Conventions
- Entities: `*.entity.ts` + `*.entity.spec.ts`
- Use Cases: `*.use-case.ts` + `*.use-case.spec.ts`
- Value Objects: `*.vo.ts` + `*.vo.spec.ts`
- Mocks: `*.mock.ts` in `tests/unit/mocks/`

## 🎯 When Generating Code

1. **Follow existing patterns** exactly
2. **Include AppContext** for tracing
3. **Add comprehensive tests** 
4. **Use i18n** for all messages
5. **Implement RBAC** permissions
6. **Add proper error handling**
7. **Include JSDoc** documentation
8. **Follow TypeScript strict mode**

## 💡 Key Project Features
- **Hybrid I18n** system (domain vs operational messages)
- **AppContext** for distributed tracing
- **RBAC** with granular permissions
- **Secure token management** (separate ACCESS/REFRESH secrets)
- **TDD** with 108 passing tests
- **Clean Architecture** with dependency inversion

This is a **production-ready enterprise application** - maintain these standards!
