# 🧪 Testing Strategy & Best Practices

#### **🎯 TDD Cycle Red-Green-Refactor**

**For EACH functionality, follow this cycle in EACH layer:**

1. **🔴 RED Phase**:

   ```bash
   # Write failing test BEFORE code (host)
   npm test -- some.spec.ts
   # EXPECTED RESULT: Test fails (RED)
   ```

2. **🟢 GREEN Phase**:
   ```bash
   # Writ#### **🚨 MANDATORY RULES - NON-NEGOTIABLE**
   ```

- ❌ **NEVER** write code without a prior test (strict TDD)
- ❌ **NEVER** skip tests (.skip or .todo)
- ❌ **NEVER** commit with failing tests
- ✅ **ALWAYS** tests BEFORE code (RED-GREEN-REFACTOR)
- ✅ **ALWAYS** one test = one responsibility
- ✅ **ALWAYS** readable and maintainable tests
- ✅ **ALWAYS** mocks for external dependencies

### **📋 Mandatory Pre-Commit Testing Checklist**

- [ ] ✅ **All tests pass**: `npm test` returns 0 failed tests
- [ ] ✅ **Build compiles**: `npm run build` successful
- [ ] ✅ **Lint clean**: `npm run lint` returns 0 errors
- [ ] ✅ **Coverage maintained**: Core business logic >90% coverage code to pass test (host)
      npm test -- some.spec.ts

  # EXPECTED RESULT: Test passes (GREEN)

  ```

  ```

3. **🔵 REFACTOR Phase**:
   ```bash
   # Improve code while keeping tests green (host)
   npm test -- some.spec.ts
   npm run lint
   # EXPECTED RESULT: Tests pass + code quality
   ```

## 📋 Test Structure by Layer

### Domain Layer Tests

```typescript
// ✅ Entity tests with business rules
describe('User Entity', () => {
  it('should create user with valid data', () => {
    // Test valid creation
  });

  it('should throw error with invalid email', () => {
    // Test business validation
  });
});

// ✅ Value Object tests
describe('Email Value Object', () => {
  it('should validate email format', () => {
    // Test format validation
  });
});
```

### Application Layer Tests

```typescript
// ✅ Use Case tests with mocks
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    useCase = new CreateUserUseCase(mockUserRepo);
  });

  it('should create user successfully', async () => {
    // Test nominal case
  });
});
```

### Infrastructure Layer Tests

```typescript
// ✅ Integration tests with database
describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createTestConnection();
    repository = new TypeOrmUserRepository(connection);
  });

  it('should save user to database', async () => {
    // Test real persistence
  });
});
```

### Presentation Layer Tests

```typescript
// ✅ Complete E2E tests
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

## 🎯 Minimum Test Coverage

- **Domain**: 95%+ coverage mandatory
- **Application**: 90%+ coverage mandatory
- **Infrastructure**: 80%+ coverage acceptable
- **Presentation**: 85%+ coverage with E2E

## 📋 Standardized API Testing Pattern

```typescript
// ✅ MANDATORY - Integration test structure for each resource
describe('{Resource}Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup application and authentication
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
      // Verify results match filter
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
          // Other expected properties
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
        // Valid data for creation
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
        .send({}) // Missing data
        .expect(400);

      expect(response.body.error.code).toBe('{RESOURCE}_INVALID_DATA');
    });
  });

  describe('PUT /api/v1/{resources}/:id', () => {
    it('should update resource with valid data', async () => {
      const updateDto = {
        // Update data
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

      // Verify resource is deleted
      await request(app.getHttpServer())
        .get('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

## 🎯 Test Data Factories

```typescript
// ✅ MANDATORY - Test data factory for each resource
export class {Resource}TestDataFactory {
  static createValid{Resource}Data(): Create{Resource}Dto {
    return {
      // Valid minimal data
    };
  }

  static createInvalid{Resource}Data(): Partial<Create{Resource}Dto> {
    return {
      // Invalid data for validation tests
    };
  }

  static createUpdate{Resource}Data(): Update{Resource}Dto {
    return {
      // Update data
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

## 📊 API Test Coverage Metrics

```typescript
// ✅ MANDATORY - API test coverage checklist
const API_TEST_COVERAGE_CHECKLIST = {
  // Complete CRUD endpoints
  'POST /list': ['success', 'pagination', 'filters', 'auth', 'permissions'],
  'GET /:id': ['success', 'not_found', 'auth', 'permissions'],
  'POST /': ['success', 'validation', 'auth', 'permissions', 'duplicates'],
  'PUT /:id': ['success', 'validation', 'not_found', 'auth', 'permissions'],
  'DELETE /:id': ['success', 'not_found', 'auth', 'permissions', 'constraints'],

  // Mandatory error cases
  error_handling: ['400', '401', '403', '404', '409', '422', '500'],

  // Business validations
  business_rules: ['required_fields', 'format_validation', 'constraints'],

  // Security
  security: ['authentication', 'authorization', 'input_sanitization'],
} as const;
```

## ⚠️ NON-NEGOTIABLE TDD RULES

- ❌ **ZERO code without prior test**
- ❌ **ZERO ignored tests** (.skip or .todo)
- ❌ **ZERO commits with failing tests**
- ✅ **Tests BEFORE code** (RED-GREEN-REFACTOR)
- ✅ **One test = one responsibility**
- ✅ **Readable and maintainable tests**
- ✅ **Mocks for external dependencies**

## 🔧 Test Commands

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test watch mode
npm run test:watch

# Specific test file
npm test -- user.entity.spec.ts

# Test pattern
npm test -- --testNamePattern="should create user"
```

## 🚫 Testing Prohibitions

- ❌ **NEVER** test without isolated test data
- ❌ **NEVER** ignore permission/security tests
- ❌ **NEVER** forget boundary validation tests
- ❌ **NEVER** test without data cleanup
- ❌ **NEVER** use production data in tests

## 💡 Test Best Practices

### Mock Creation

```typescript
// ✅ GOOD - Typed mocks
const mockUserRepository: jest.Mocked<IUserRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
};
```

### Assertion Patterns

```typescript
// ✅ GOOD - Specific assertions
expect(result).toEqual(expectedResult);
expect(mockRepository.save).toHaveBeenCalledWith(expectedUser);
expect(mockRepository.save).toHaveBeenCalledTimes(1);

// ✅ GOOD - Error testing
await expect(useCase.execute(invalidRequest)).rejects.toThrow(
  UserValidationError,
);
```

### Test Organization

```typescript
// ✅ GOOD - Clear test structure
describe('CreateUserUseCase', () => {
  describe('when valid data is provided', () => {
    it('should create user successfully', () => {
      // Test implementation
    });
  });

  describe('when invalid email is provided', () => {
    it('should throw EmailValidationError', () => {
      // Test implementation
    });
  });
});
```

**This testing strategy ensures comprehensive coverage and reliable code quality!**
