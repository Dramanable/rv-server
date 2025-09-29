# 🚨 Exception Handling in Clean Architecture

## 📋 Domain Exception Hierarchy

### 🏗️ Exception Structure

```
DomainException (base)
├── ValueObjectException
│   ├── InvalidValueError
│   ├── RequiredValueError
│   ├── ValueTooShortError
│   ├── ValueTooLongError
│   ├── InvalidFormatError
│   ├── ValueOutOfRangeError
│   ├── EmptyArrayError
│   ├── ElementNotFoundError
│   ├── DuplicateElementError
│   ├── DuplicateValueError
│   └── ValueNotFoundError
├── EntityException
│   ├── EntityNotFoundError
│   ├── EntityValidationError
│   └── EntityConflictError
└── BusinessRuleException
    ├── InsufficientPermissionsError
    ├── BusinessLogicError
    └── WorkflowViolationError
```

## 📂 File Locations

### 🎯 Domain Exceptions

```
src/domain/exceptions/
├── domain.exception.ts           # Base DomainException class
├── value-object.exceptions.ts    # All Value Object exceptions
├── entity.exceptions.ts          # Entity-specific exceptions
└── business-rule.exceptions.ts   # Business logic exceptions
```

### 🚀 Application Exceptions

```
src/application/exceptions/
├── application.exception.ts      # Base ApplicationException
├── use-case.exceptions.ts        # Use case specific exceptions
└── validation.exceptions.ts      # Application validation errors
```

## 🔧 Implementation Guidelines

### ✅ Correct Exception Usage

#### **Value Objects**

```typescript
// ✅ CORRECT: Use specific Value Object exceptions
export class Email {
  constructor(private readonly value: string) {
    if (!value?.trim()) {
      throw new RequiredValueError('email');
    }
    if (value.length > 254) {
      throw new ValueTooLongError('email', 254, value.length);
    }
    if (!this.isValidEmailFormat(value)) {
      throw new InvalidFormatError('email', value, 'user@domain.com');
    }
  }
}
```

#### **Entities**

```typescript
// ✅ CORRECT: Use Entity exceptions for business rules
export class User {
  static create(data: CreateUserData): User {
    if (data.email && (await this.emailExists(data.email))) {
      throw new EntityConflictError('User', 'email', data.email);
    }
    // Business rule validation
    if (!this.hasValidRole(data.role)) {
      throw new BusinessRuleException('Invalid role assignment');
    }
  }
}
```

#### **Use Cases**

```typescript
// ✅ CORRECT: Catch domain exceptions and re-throw as application exceptions
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const user = User.create(request);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new ApplicationValidationError(error.message, error);
      }
      throw error;
    }
  }
}
```

### ❌ Common Mistakes to Avoid

```typescript
// ❌ WRONG: Using generic Error class
throw new Error('Invalid email format');

// ❌ WRONG: Using strings instead of specific exceptions
if (!email) throw new Error('Email is required');

// ❌ WRONG: Not providing context
throw new InvalidValueError('email', email); // Missing reason

// ❌ WRONG: Mixing domain and infrastructure concerns
throw new HttpException('User not found', 404); // In domain layer

// ❌ WRONG: Not preserving error chain
catch (error) {
  throw new ApplicationError('Failed to create user'); // Lost original error
}
```

## 🧪 Test Exception Guidelines

### ✅ Correct Test Patterns

```typescript
describe('Email Value Object', () => {
  it('should throw RequiredValueError for empty email', () => {
    expect(() => new Email('')).toThrow(RequiredValueError);
    expect(() => new Email('')).toThrow('email is required');
  });

  it('should throw ValueTooLongError for long email', () => {
    const longEmail = 'a'.repeat(250) + '@domain.com';
    expect(() => new Email(longEmail)).toThrow(ValueTooLongError);
    expect(() => new Email(longEmail)).toThrow(
      'email must be at most 254 characters long',
    );
  });

  it('should throw InvalidFormatError for invalid format', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidFormatError);
    expect(() => new Email('invalid-email')).toThrow(
      'Invalid email format: invalid-email (expected: user@domain.com)',
    );
  });
});
```

### 🎯 Exception Testing Best Practices

1. **Test Exception Type**: Always verify the specific exception class
2. **Test Exception Message**: Verify the exact error message format
3. **Test Exception Context**: Verify that context data is properly set
4. **Test Error Propagation**: Ensure exceptions bubble up correctly through layers

## 🔄 Exception Flow Through Layers

### 📊 Layer Responsibilities

1. **Domain Layer**:
   - Throws specific domain exceptions
   - Contains business rule validations
   - No HTTP or infrastructure concerns

2. **Application Layer**:
   - Catches domain exceptions
   - Transforms to application exceptions
   - Orchestrates use case flows

3. **Infrastructure Layer**:
   - Catches application exceptions
   - Maps to HTTP status codes
   - Formats API responses

4. **Presentation Layer**:
   - Handles HTTP-specific errors
   - Returns properly formatted responses
   - Logs errors appropriately

## 🎨 Exception Response Format

### 🚀 API Error Response Structure

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email must be at most 254 characters long (got 267)",
    "context": {
      "fieldName": "email",
      "maxLength": 254,
      "actualLength": 267
    },
    "timestamp": "2025-09-29T10:30:00Z",
    "path": "/api/users",
    "requestId": "uuid-here"
  }
}
```

## 🔍 Exception Debugging

### 📝 Logging Best Practices

```typescript
// ✅ CORRECT: Log with full context
logger.error('Domain validation failed', {
  exception: error.constructor.name,
  message: error.message,
  context: error.context,
  stackTrace: process.env.NODE_ENV === 'development' ? error.stack : undefined,
});
```

## 🚨 Security Considerations

### 🛡️ Error Message Security

- **Never expose internal implementation details**
- **Don't leak sensitive data in error messages**
- **Use generic messages for authentication failures**
- **Log detailed errors internally, return sanitized messages externally**

### ✅ Secure Exception Handling

```typescript
// ✅ CORRECT: Sanitized external message
try {
  await this.authenticateUser(credentials);
} catch (error) {
  // Log detailed error internally
  logger.error('Authentication failed', { error, userId: credentials.userId });

  // Return generic message externally
  throw new AuthenticationError('Invalid credentials');
}
```

---

**🎯 Remember**: Exceptions are part of your domain language. Use them to express business rules clearly and consistently across all layers of your Clean Architecture.
