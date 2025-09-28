# 💎 Code Quality & TypeScript Standards

## 🚨 CRITICAL RULE: ZERO ANY TOLERANCE

### 🎯 TypeScript Strict Configuration - MANDATORY

````typescript
// tsconfig.json - Strict mode MANDATORY
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitTh### ⚡ **Quick Pre-Commit #### **Via Terminal**
```bash
# Organize imports for all TypeScript files (host)
find src -name "*.ts" -exec npx tsc --noEmit --organizeImports {} \;

# Or use ESLint plugin (host)
npm run lint -- --fix-type suggestion
```**

```bash
# Complete pre-commit script (recommended on host)
npm run format && npm run lint -- --fix && npm test && git add .

# Final verification before commit (host)
npm run lint && npm test
```,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
````

### 🎯 ZERO `any` - PREFER `unknown`

**🔴 ABSOLUTE PROHIBITIONS**

- **`any`**: Usage strictly forbidden except documented exceptional cases
- **`as any`**: Dangerous casting forbidden
- **`any[]`**: Untyped arrays forbidden
- **`Record<string, any>`**: Untyped objects forbidden
- **`function(param: any)`**: Untyped parameters forbidden

**🟢 RECOMMENDED ALTERNATIVES**

- **`unknown`**: For uncertain types requiring type guards
- **`object`**: For generic objects
- **`Record<string, unknown>`**: For objects with dynamic keys
- **Generics `<T>`**: For parameterized types
- **Union types**: For known limited values
- **Type guards**: For runtime type validation

### ✅ Explicit Typing - Public APIs & `unknown` for Uncertain Types

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

// ❌ STRICTLY FORBIDDEN - Usage of any
export function processData(data: any): any {
  // NEVER! Use unknown instead
  return data;
}

// ✅ EXCELLENT - Use unknown instead of any
export function processData(data: unknown): unknown {
  // Type guard MANDATORY with unknown
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  throw new Error('Invalid data type');
}

// ✅ BETTER - Specific types with generics
export function processData<T>(data: T): T {
  return data;
}

// ✅ RECOMMENDED PATTERN - Type guards with unknown
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

// ✅ RECOMMENDED PATTERN - Safe parsing with unknown
export function parseUserFromRequest(req: unknown): User {
  if (!isValidUser(req)) {
    throw new ValidationError('Invalid user data structure');
  }
  return req; // TypeScript now knows this is a User
}

// ✅ RECOMMENDED PATTERN - Typed API Responses
export interface SafeApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T;
  readonly errors?: readonly string[];
  readonly meta?: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}
```

## 🎯 Null-Safe & Error Management

```typescript
// ✅ GOOD - Explicit null management
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

// ✅ GOOD - Result pattern for error management
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

## 🔍 ESLint Configuration - NON-DISABLEABLE RULES

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

## 🎯 Prettier Standardized Configuration

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

## 🚨 CRITICAL ESLINT ERRORS - IMMEDIATE PRIORITY

### 1️⃣ MAXIMUM PRIORITY: @typescript-eslint/no-unsafe-\*\*\*

**❌ CRITICAL PROBLEM**: Intensive usage of `any` throughout codebase causing type safety violations.

```typescript
// ❌ MAJOR VIOLATIONS DETECTED in:
// - src/presentation/controllers/*.controller.ts
// - src/presentation/dtos/*.dto.ts
// - src/presentation/filters/*.filter.ts
// - src/presentation/security/*.ts
// - src/shared/utils/*.ts

// Example common violation in controllers:
// ❌ FORBIDDEN - Untyped property access
const requestingUser = req.user; // any type!
const userId = requestingUser.id; // Unsafe member access

// ✅ CORRECT - Strict typing mandatory
const requestingUser = req.user as AuthenticatedUser;
const userId: string = requestingUser.id;

// OR BETTER - Typed interface
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
```

### 2️⃣ HIGH PRIORITY: @typescript-eslint/require-await

**❌ PROBLEM**: Methods marked `async` without using `await`.

```typescript
// ❌ VIOLATIONS DETECTED in:
// - business.controller.ts:468 - async delete() without await
// - calendar.controller.ts:330 - async update() without await
// - calendar.controller.ts:379 - async delete() without await

// ❌ FORBIDDEN - async without await
async delete(id: string): Promise<void> {
  // No await in this method
  this.businessService.delete(id);
}

// ✅ CORRECT - Add await OR remove async
async delete(id: string): Promise<void> {
  await this.businessService.delete(id);
}

// OR
delete(id: string): Promise<void> {
  return this.businessService.delete(id);
}
```

## 🚨 ABSOLUTE PROHIBITION: NEVER COMMIT WITH ESLINT ERRORS

### ❌ ABSOLUTE PROHIBITION

**It is STRICTLY FORBIDDEN to commit code with ESLint errors or failing tests.**

This rule is **NON-NEGOTIABLE** to maintain:

- **Constant code quality**
- **Project stability**
- **Long-term maintainability**
- **Team consistency**

### 🔧 MANDATORY Pre-Commit Workflow

#### **1️⃣ Format + Organize Imports**

```bash
# Format code with Prettier (host)
npm run format

# Automatically reorganize TypeScript imports (host)
npx tsc --organizeImports src/**/*.ts
# OR use VS Code action "Organize Imports" (Shift+Alt+O)
```

#### **2️⃣ Lint with Auto-Fix**

```bash
# Run ESLint with auto-fix (host)
npm run lint -- --fix

# Verify NO errors remain (host)
npm run lint
```

#### **3️⃣ Test Verification**

```bash
# Ensure ALL tests pass (host)
npm test

# Specific unit test verification (host)
npm run test:unit

# Optional: Check coverage (host)
npm run test:cov
```

#### **4️⃣ Semantic Commit**

```bash
# Commit with conformant semantic message
git add .
git commit -m "🎉 feat(scope): clear and concise description"
```

## ⚡ Quick Pre-Commit Commands

```bash
# Complete pre-commit script (recommended)
npm run format && npm run lint -- --fix && npm test && git add .

# Final verification before commit
npm run lint && npm test
```

## 🎯 TypeScript Import Organization

### Automatic with VS Code

- **Shortcut**: `Shift + Alt + O`
- **Command Palette**: `> TypeScript: Organize Imports`
- **On save**: Configure `"editor.codeActionsOnSave": {"source.organizeImports": true}`

### Via Terminal

```bash
# Organize imports for all TypeScript files
find src -name "*.ts" -exec npx tsc --noEmit --organizeImports {} \;

# Or use ESLint plugin
npm run lint -- --fix-type suggestion
```

## 📋 MANDATORY Pre-Commit Checklist

- [ ] ✅ **Format**: Code formatted with Prettier
- [ ] ✅ **Imports**: Imports automatically reorganized
- [ ] ✅ **Lint**: No ESLint errors (0 errors, warnings acceptable)
- [ ] ✅ **Tests**: All tests pass (0 failed)
- [ ] ✅ **Build**: TypeScript compilation successful
- [ ] ✅ **Message**: Conformant semantic commit

## 💡 Recommended IDE Configuration

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

**This rule guarantees professional-quality code and smooth team collaboration!**
