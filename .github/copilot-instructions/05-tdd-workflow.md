# 🚨 TDD Development Workflow

## 🏗️ MANDATORY ORDERED LAYER DEVELOPMENT

### 🎯 NON-NEGOTIABLE DEVELOPMENT ORDER

**⚠️ FUNDAMENTAL RULE**: For ANY creation, modification, or deletion of functionality, you MUST start from the Domain layer, then Application, then Infrastructure (including migrations), and FINALLY Presentation.

**🚨 MAJOR ARCHITECTURAL VIOLATION**: Starting with Controllers/DTOs (Presentation) without completing Infrastructure constitutes a severe Clean Architecture violation and is **STRICTLY FORBIDDEN**.

**🎯 MANDATORY WORKFLOW - NO EXCEPTIONS**:

1. **DOMAIN** (Entities, Value Objects, Business Services, Exceptions)
2. **APPLICATION** (Use Cases, Ports/Interfaces, Application Services)
3. **INFRASTRUCTURE** (Repositories, ORM, TypeORM Migrations, Technical Services)
4. **PRESENTATION** (Controllers, DTOs, Mappers, Validation)

This rule applies to:

- ✅ **Creation** of new features
- ✅ **Modification** of existing features
- ✅ **Deletion** of features
- ✅ **Architectural refactoring**
- ✅ **Adding properties** to entities
- ✅ **Changing business logic**

## 🔄 TDD Process per Layer - MANDATORY

**🚨 CRITICAL RULE**: Whether creating, modifying, or deleting functionality, ALWAYS respect this order:

1. **🔴 RED**: Write failing test for functionality in appropriate layer
2. **🟢 GREEN**: Write minimal code to make test pass
3. **🔵 REFACTOR**: Improve code while keeping tests green
4. **✅ VALIDATE**: Verify layer compiles and all tests pass
5. **➡️ NEXT LAYER**: Move to next layer ONLY if previous is complete

## 📝 Concrete Use Case Workflows

### 🆕 Creating New Functionality

```bash
1️⃣ DOMAIN       : Entity + Value Objects + Exceptions + Repository Interface + Tests
2️⃣ APPLICATION  : Use Cases + Validation + Ports + Tests
3️⃣ INFRASTRUCTURE: ORM Entity + Repository + TypeORM Migration + Tests
4️⃣ PRESENTATION : Controllers + DTOs + Validation + Swagger + Tests
```

### 🔧 Modifying Existing Functionality

```bash
1️⃣ DOMAIN       : Entity modification + business validation + updated tests
2️⃣ APPLICATION  : Use case modification + new validations + tests
3️⃣ INFRASTRUCTURE: TypeORM Migration + ORM modification + repositories + tests
4️⃣ PRESENTATION : DTO modification + controllers + validation + tests
```

### 🗑️ Removing Functionality

```bash
1️⃣ DOMAIN       : Mark deprecated + deletion validation + tests
2️⃣ APPLICATION  : Use case removal + dependency management + tests
3️⃣ INFRASTRUCTURE: Cleanup migration + ORM removal + tests
4️⃣ PRESENTATION : Endpoint removal + DTOs + documentation
```

## ⚠️ Critical Non-Negotiable Rules

- ❌ **NEVER** develop multiple features simultaneously
- ❌ **NEVER** proceed to next layer if previous has failing tests
- ❌ **NEVER** write code without prior test (strict TDD)
- ❌ **NEVER** ignore compilation errors in a layer
- ❌ **NEVER** start with Presentation without complete Infrastructure
- ❌ **NEVER** modify entity without appropriate TypeORM migration
- ❌ **NEVER** create/modify/delete without following Domain → Application → Infrastructure → Presentation order
- ✅ **ALWAYS** one feature at a time (e.g., CreateUser → UpdateUser → DeleteUser)
- ✅ **ALWAYS** complete one layer entirely before next
- ✅ **ALWAYS** write tests BEFORE code (strict TDD)
- ✅ **ALWAYS** validate compilation after each modification
- ✅ **ALWAYS** execute and test migrations before Presentation layer

## 📋 Detailed Workflow per Layer

### 🏗️ Concrete Example: "Create Business" Feature

#### **Step 1️⃣: DOMAIN** (Mandatory First)

```bash
# 1. Create Business entity tests
touch src/domain/entities/business.entity.spec.ts
# 2. Write failing tests (RED)
# 3. Create Business entity (GREEN)
# 4. Refactor if necessary (REFACTOR)
# 5. Validate: npm test -- business.entity.spec.ts
```

#### **Step 2️⃣: APPLICATION** (Only after Domain completed)

```bash
# 1. Create use case tests
touch src/application/use-cases/business/create-business.use-case.spec.ts
# 2. Write failing tests (RED)
# 3. Create CreateBusinessUseCase (GREEN)
# 4. Create BusinessRepository interface in domain/repositories/
# 5. Refactor if necessary (REFACTOR)
# 6. Validate: npm test -- create-business.use-case.spec.ts
```

#### **Step 3️⃣: INFRASTRUCTURE** (Only after Application completed - ⚠️ MANDATORY BEFORE PRESENTATION)

```bash
# 1. Create repository tests
touch src/infrastructure/database/repositories/typeorm-business.repository.spec.ts
# 2. Write failing tests (RED)
# 3. ⚠️ CRITICAL: Create TypeORM Migration MANDATORY FIRST
touch src/infrastructure/database/sql/postgresql/migrations/{timestamp}-Create{Entity}Table.ts
# 4. 🚨 MANDATORY STEP: TEST MIGRATION BEFORE ANY CODE
npm run migration:run        # Apply migration (host or docker)
npm run migration:revert     # Verify rollback (host or docker)
npm run migration:run        # Re-apply (host or docker)
# 5. ⚠️ CRITICAL: VALIDATE MIGRATION WORKS WITHOUT ERRORS
# If errors → STOP and fix migration before continuing
# 6. Create BusinessOrmEntity (GREEN)
# 7. Create/Update static Mappers in /infrastructure/mappers/ (GREEN)
# 8. Create TypeOrmBusinessRepository implementing BusinessRepository (GREEN)
# 9. Configure dependency injection in TypeOrmRepositoriesModule (GREEN)
# 10. Refactor if necessary (REFACTOR)
# 11. Validate: npm test -- typeorm-business.repository.spec.ts
```

## 🚨 CRITICAL RULE: VALIDATED MIGRATION BEFORE PRESENTATION

**⚠️ NON-NEGOTIABLE RULE**: **NEVER** proceed to Presentation layer without validating migrations work perfectly.

**MANDATORY MIGRATION WORKFLOW:**

```bash
# 1️⃣ CREATE migration
touch src/infrastructure/database/sql/postgresql/migrations/{timestamp}-Create{Entity}Table.ts

# 2️⃣ TEST (host or docker)
npm run migration:run

# 3️⃣ VERIFY rollback
npm run migration:revert

# 4️⃣ RE-APPLY for final validation
npm run migration:run

# 5️⃣ VERIFY created tables
docker compose exec postgres psql -U rvproject_user -d rvproject_app -c "\\dt rvproject_schema.*;"

# 6️⃣ ONLY IF SUCCESS → Continue to ORM Entity and Repository
```

**🚨 IF MIGRATION ERRORS:**

- **STOP** development immediately
- **FIX** migration before any other action
- **RE-TEST** until complete success
- **NEVER** ignore migration errors

#### **Step 4️⃣: PRESENTATION** (Only after Infrastructure completed)

```bash
# 1. Create controller tests
touch src/presentation/controllers/business.controller.spec.ts
# 2. Write failing tests (RED)
# 3. Create validation DTOs (GREEN)
# 4. Create BusinessController (GREEN)
# 5. Configure validation and Swagger documentation (GREEN)
# 6. Refactor if necessary (REFACTOR)
# 7. Validate: npm test -- business.controller.spec.ts
# 8. E2E integration test: npm run test:e2e -- business
```

## ✅ Mandatory Validation Checkpoints

**At end of each layer, MANDATORY verification:**

### 🔍 Domain Checkpoint

```bash
# Domain unit tests (host)
npm test -- --testPathPattern=domain/ --coverage
# TypeScript compilation (host)
npm run build
# Linting without errors (host)
npm run lint
# EXPECTED: 100% passing tests, 0 compilation errors, 0 lint errors
```

### 🔍 Application Checkpoint

```bash
# Application + Domain unit tests (host)
npm test -- --testPathPattern="(domain|application)/" --coverage
# Interface verification (ports)
# EXPECTED: Coverage > 80%, all interfaces defined, 0 errors
```

### 🔍 Infrastructure Checkpoint

```bash
# Infrastructure + previous layers unit tests (host)
npm test -- --testPathPattern="(domain|application|infrastructure)/" --coverage
# Database integration tests (host)
npm run test:integration
# EXPECTED: DB connection OK, functional repositories, configured DI
```

### 🔍 Presentation Checkpoint

```bash
# Complete tests + E2E (host)
npm test
npm run test:e2e
# Application startup test (host)
npm run start:dev
# EXPECTED: Application starts, endpoints respond, Swagger documentation
```

## 🚨 Common Violations to Avoid

- **Starting with controller** → ❌ Clean Architecture violation
- **Creating ORM entity before Domain entity** → ❌ Dependency violation
- **Writing code without tests** → ❌ TDD violation
- **Proceeding to Infrastructure with failing Application tests** → ❌ Workflow violation
- **⚠️ CRITICAL: Creating Controller/DTOs without tested TypeORM migration** → ❌ Missing Infrastructure violation
- **🚨 NEW: Proceeding to Presentation without testing migration:run/revert** → ❌ DB security violation

## 🚨 Early Violation Detection

```bash
# Detect violations with these commands:
# Check for relative imports (forbidden)
grep -r "\.\./\.\./\.\." src/
# EXPECTED: No results (0 lines)

# Check for circular dependencies
npx madge --circular src/
# EXPECTED: No circular dependencies found

# Check for tests per layer
find src/ -name "*.spec.ts" | head -20
# EXPECTED: Tests present in each layer
```

## 🔄 Violation Correction

If violation detected:

1. **STOP** development immediately
2. **ROLLBACK** to last passing tests
3. **ANALYZE** violation cause
4. **RESTART** from last validated layer
5. **APPLY** strict TDD workflow

This workflow ensures **reduced errors**, **efficient development**, and **guaranteed architectural quality**!
