# 🎯 Import Aliases & Project Standards

## 🚨 CRITICAL RULE: EXCLUSIVE USE OF TYPESCRIPT ALIASES#### **🔍 VIOLATION DETECTION**

````bash
# Check for forbidden relative imports (host)
grep -r "\.\./\.\./\.\." src/
# EXPECTED RESULT: No results (0 lines)

# Check for short relative imports forbidden (host)
grep -r "import.*\.\./" src/
# EXPECTED RESULT: No results (0 lines)

# Verify correct alias usage (host)
grep -r "import.*@domain\|@application\|@infrastructure\|@presentation\|@shared" src/ | head -10
# EXPECTED RESULT: Many imports with aliases
```LUTE PROHIBITION**: Using relative paths in imports. ALWAYS use TypeScript aliases configured in `tsconfig.json`.

## ✅ MANDATORY CONFIGURED ALIASES

```typescript
// ✅ MANDATORY - ALWAYS use defined aliases
import { User } from '@domain/entities/user.entity';
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { TypeOrmUserRepository } from '@infrastructure/database/sql/postgresql/repositories/typeorm-user.repository';
import { UserController } from '@presentation/controllers/user.controller';
import { Logger } from '@application/ports/logger.port';
import { validateId } from '@shared/utils/validation.utils';

// ❌ STRICTLY FORBIDDEN - Relative paths
import { User } from '../../../domain/entities/user.entity';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';
import { Logger } from '../ports/logger.port';
import { validateId } from '../../../../shared/utils/validation.utils';
````

## 📋 COMPLETE ALIAS MAPPING

```typescript
// tsconfig.json configuration - REFERENCE
"paths": {
  "@domain/*": ["src/domain/*"],
  "@application/*": ["src/application/*"],
  "@infrastructure/*": ["src/infrastructure/*"],
  "@presentation/*": ["src/presentation/*"],
  "@shared/*": ["src/shared/*"]
}
```

## 🎯 CONCRETE EXAMPLES BY LAYER

```typescript
// 🏛️ DOMAIN LAYER
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { IUserRepository } from '@domain/repositories/user.repository';
import { UserValidationError } from '@domain/exceptions/user.exceptions';
import { UserService } from '@domain/services/user.service';

// 🏗️ APPLICATION LAYER
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IAuditService } from '@application/ports/audit.port';
import { UserCacheService } from '@application/services/user-cache.service';

// 🔧 INFRASTRUCTURE LAYER
import { TypeOrmUserRepository } from '@infrastructure/database/sql/postgresql/repositories/typeorm-user.repository';
import { UserOrmEntity } from '@infrastructure/database/sql/postgresql/entities/user-orm.entity';
import { UserOrmMapper } from '@infrastructure/mappers/user-orm.mapper';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisService } from '@infrastructure/cache/redis.service';

// 🎨 PRESENTATION LAYER
import { UserController } from '@presentation/controllers/user.controller';
import { CreateUserDto } from '@presentation/dtos/users/create-user.dto';
import { UserMapper } from '@presentation/mappers/user.mapper';
import { JwtAuthGuard } from '@presentation/security/auth.guard';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';

// 🔗 SHARED LAYER
import { UserRole } from '@shared/enums/user-role.enum';
import { generateId } from '@shared/utils/id.utils';
import { validateEmail } from '@shared/utils/validation.utils';
import { BusinessConstants } from '@shared/constants/business.constants';
import { ApiResponse } from '@shared/types/api.types';
```

## 🚫 STRICTLY FORBIDDEN VIOLATIONS

- ❌ **NEVER** `../../../domain/entities/user.entity`
- ❌ **NEVER** `../../application/use-cases/users/create-user.use-case`
- ❌ **NEVER** `./repositories/typeorm-user.repository`
- ❌ **NEVER** relative paths in ANY import
- ❌ **NEVER** mix aliases and relative paths in same file

## ✅ ADVANTAGES OF ALIASES

1. **🧹 Readability**: Cleaner and more understandable code
2. **🔧 Maintainability**: Easier refactoring
3. **🚀 Performance**: Optimized import resolution
4. **📁 Organization**: Clear project structure
5. **🧪 Testability**: Simplified mocking and stubbing
6. **👥 Collaboration**: Respected team standards

## 🔍 VIOLATION DETECTION

```bash
# Check forbidden relative imports
grep -r "\.\./\.\./\.\." src/
# EXPECTED: No results (0 lines)

# Check short relative imports (forbidden)
grep -r "import.*\.\./" src/
# EXPECTED: No results (0 lines)

# Check correct alias usage
grep -r "import.*@domain\|@application\|@infrastructure\|@presentation\|@shared" src/ | head -10
# EXPECTED: Many imports with aliases
```

#### **📋 MANDATORY CHECKLIST BEFORE COMMIT**

- [ ] ✅ **All imports use aliases** `@domain/*`, `@application/*`, etc.
- [ ] ✅ **No relative paths** `../` in imports
- [ ] ✅ **Tests pass** with new imports (host: `npm test`)
- [ ] ✅ **Build compiles** without module resolution errors (host: `npm run build`)
- [ ] ✅ **ESLint/TypeScript** report no import errors (host: `npm run lint`)
- [ ] ✅ **IDE recognizes** all imports correctly
- [ ] ✅ **Auto-complete** works with aliases
- [ ] ✅ **Refactoring safe**: renaming preserved

## 📚 SEMANTIC COMMITS - MANDATORY

### 🎯 Conventional Commits with Commitlint

**✅ MANDATORY FORMAT**

```
🎯 type(scope): description

body (optional)

footer (optional)
```

### 🏷️ AUTHORIZED COMMIT TYPES

- 🎉 **feat**: New functionality
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
- 🚨 **hotfix**: Emergency production fix

### 📋 Valid Commit Examples

```bash
🎉 feat(auth): add JWT refresh token rotation
🐛 fix(user): resolve email validation edge case
📚 docs(api): update authentication endpoints documentation
♻️ refactor(repo): extract common repository patterns
✅ test(login): add comprehensive login use case tests
🔧 chore(deps): update NestJS to latest version
🔐 security(jwt): implement secure token storage
```

### ❌ FORBIDDEN COMMITS

```bash
# Too vague
fix: bug fix
update code
improvements

# Unauthorized type
hack: quick fix
temp: temporary solution
```

## 🚨 HUSKY & COMMIT QUALITY ENFORCEMENT

### 🎯 Pre-commit Hooks with Husky

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

### 🔧 Husky Hook Configuration

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged for code formatting and linting
npx lint-staged

# Run tests to ensure nothing is broken
npm test

echo "✅ Pre-commit checks successful!"
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validating commit message..."
npx --no -- commitlint --edit $1
echo "✅ Valid commit message!"
```

### 📋 Commit Workflow

1. **Code Modifications**: Make your changes
2. **Automatic Formatting**: Husky runs ESLint + Prettier on staged files
3. **Test Validation**: All tests must pass
4. **Commit Message Validation**: Must follow conventional commit format
5. **Commit Success**: Only if all checks pass

### 🚫 Blocked Actions

Husky will prevent commits if:

- ESLint errors exist
- Tests fail
- Commit message doesn't follow convention
- Code is not properly formatted

This guarantees **100% code quality** and **consistent commit history**!

## 🛠️ RECOMMENDED IDE CONFIGURATION

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.suggest.includeAutomaticOptionalChainCompletions": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript"],
  "typescript.preferences.organizeImports": true
}
```

## 🚨 CONSEQUENCES FOR NON-COMPLIANCE

Non-compliance with this rule results in:

- **Automatic commit rejection** by Husky
- **CI/CD blocking**
- **Mandatory review** and immediate refactoring
- **Additional training** on TypeScript best practices

**This rule guarantees professional, maintainable code that respects TypeScript standards!**
