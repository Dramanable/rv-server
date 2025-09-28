# 🗄️ Database Migrations & Schema Management

## 🚨 CRITICAL RULE: PRESERVE EXISTING DATA

### 🎯 NON-NEGOTIABLE FUNDAMENTAL: SAFETY-FIRST MIGRATIONS

**⚠️ CRITICAL RULE**: Every TypeORM migration MUST preserve existing database data integrity. This rule is **NON-NEGOTIABLE** to prevent data corruption and production failures.

**ALWAYS ask before each migration:**

1. **Is there existing data** in this table?
2. **How to preserve** data integrity?
3. **Are added constraints** compatible with existing data?
4. **Do removed columns** contain critical data?

## 🔧 Environment Schema Configuration

### 🎯 MANDATORY RULE: DYNAMIC SCHEMA FROM ENVIRONMENT

**⚠️ NON-NEGOTIABLE**: In all TypeORM migrations, schema name MUST be retrieved from environment variables to ensure portability across environments (development, staging, production).

#### ✅ MANDATORY PATTERN FOR TYPEORM MIGRATIONS

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlexiblePricingToServices{Timestamp} implements MigrationInterface {
  name = 'AddFlexiblePricingToServices{Timestamp}';

  // 🎯 MANDATORY: Get schema from environment
  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT: Use dynamic schema
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "pricing_config" jsonb DEFAULT '{"type":"FIXED","visibility":"PUBLIC","basePrice":{"amount":0,"currency":"EUR"},"rules":[]}'::jsonb
    `);

    // ✅ CORRECT: Index with dynamic schema
    await queryRunner.query(`
      CREATE INDEX "IDX_services_pricing_type"
      ON "${schema}"."services" USING GIN (("pricing_config"->>'type'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT: Rollback with dynamic schema
    await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."IDX_services_pricing_type"`);
    await queryRunner.query(`ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "pricing_config"`);
  }
}
```

#### ❌ STRICTLY FORBIDDEN ANTI-PATTERNS

```typescript
// ❌ FORBIDDEN: Hardcoded schema
await queryRunner.query(`ALTER TABLE "public"."services" ADD COLUMN...`);

// ❌ FORBIDDEN: No environment management
await queryRunner.query(`ALTER TABLE services ADD COLUMN...`); // No schema at all

// ❌ FORBIDDEN: Non-configurable schema
const schema = 'public'; // Fixed value
```

## 📋 Migration Patterns by Type

### 🆕 ADDING COLUMN - Default Value Management

```typescript
// ✅ MANDATORY - Nullable column or with default value
export class AddPricingConfigToServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Check existence before adding
    const columnExists = await queryRunner.hasColumn(
      `${schema}.services`,
      'pricing_config',
    );

    if (!columnExists) {
      // ✅ CORRECT - Column with DEFAULT for existing data
      await queryRunner.query(`
        ALTER TABLE "${schema}"."services"
        ADD COLUMN "pricing_config" jsonb
        DEFAULT '{"type":"FIXED","basePrice":{"amount":0,"currency":"EUR"}}'::jsonb
      `);

      // ✅ CORRECT - Update existing data if necessary
      await queryRunner.query(`
        UPDATE "${schema}"."services"
        SET "pricing_config" = '{"type":"FIXED","basePrice":{"amount":50,"currency":"EUR"}}'::jsonb
        WHERE "pricing_config" IS NULL AND "is_active" = true
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Check before removal
    const columnExists = await queryRunner.hasColumn(
      `${schema}.services`,
      'pricing_config',
    );

    if (columnExists) {
      // ⚠️ ATTENTION - Backup critical data before removal
      await queryRunner.query(`
        -- Optional: Backup data to temporary table
        CREATE TABLE IF NOT EXISTS "${schema}"."services_pricing_backup" AS
        SELECT id, pricing_config FROM "${schema}"."services"
        WHERE pricing_config IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "pricing_config"
      `);
    }
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

### 🔧 MODIFYING COLUMN - Type and Constraint Management

```typescript
// ✅ MANDATORY - Safe data transformation
export class UpdateStatusEnumInServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ STEP 1 - Verify existing data
    const existingData = await queryRunner.query(`
      SELECT DISTINCT status FROM "${schema}"."services"
    `);

    console.log('Existing statuses before migration:', existingData);

    // ✅ STEP 2 - Add temporary column with new type
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "status_new" VARCHAR(20)
    `);

    // ✅ STEP 3 - Migrate data with appropriate mapping
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "status_new" = CASE
        WHEN status = 'active' THEN 'ACTIVE'
        WHEN status = 'inactive' THEN 'INACTIVE'
        WHEN status = 'draft' THEN 'DRAFT'
        ELSE 'DRAFT' -- Default value for unknown data
      END
    `);

    // ✅ STEP 4 - Remove old column and rename
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" DROP COLUMN "status"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      RENAME COLUMN "status_new" TO "status"
    `);

    // ✅ STEP 5 - Add constraints after transformation
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ALTER COLUMN "status" SET NOT NULL
    `);
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

### 🗑️ REMOVING COLUMN - Mandatory Backup

```typescript
// ✅ MANDATORY - Backup before removal
export class RemoveDeprecatedColumnsFromServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ STEP 1 - Check if data exists in column
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."services"
      WHERE "deprecated_field" IS NOT NULL
    `);

    if (dataCount[0]?.count > 0) {
      // ✅ STEP 2 - Create backup table
      await queryRunner.query(`
        CREATE TABLE "${schema}"."services_deprecated_backup" AS
        SELECT id, deprecated_field, created_at
        FROM "${schema}"."services"
        WHERE deprecated_field IS NOT NULL
      `);

      console.log(
        `Backed up ${dataCount[0].count} records in services_deprecated_backup`,
      );
    }

    // ✅ STEP 3 - Remove column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "deprecated_field"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ STEP 1 - Recreate column
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "deprecated_field" VARCHAR(255)
    `);

    // ✅ STEP 2 - Restore data from backup
    const backupExists = await queryRunner.hasTable(
      `${schema}.services_deprecated_backup`,
    );

    if (backupExists) {
      await queryRunner.query(`
        UPDATE "${schema}"."services"
        SET "deprecated_field" = backup."deprecated_field"
        FROM "${schema}"."services_deprecated_backup" backup
        WHERE "${schema}"."services".id = backup.id
      `);
    }
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

## 🚨 MANDATORY WORKFLOW BEFORE EACH MIGRATION

### 1️⃣ Existing Data Audit (MANDATORY)

```bash
# ✅ MANDATORY - Connect to database and analyze data
docker compose exec postgres psql -U rvproject_user -d rvproject_app

-- Verify current structure
\dt+ rvproject_schema.*

-- Analyze data in affected table
SELECT COUNT(*), column_name FROM table_name GROUP BY column_name;
SELECT DISTINCT column_name FROM table_name;
SELECT * FROM table_name LIMIT 10;
```

### 2️⃣ Secure Migration Plan

```typescript
// ✅ MANDATORY - Document plan in migration
export class ExampleMigration implements MigrationInterface {
  name = 'ExampleMigration';

  /**
   * SECURE MIGRATION PLAN
   *
   * 🎯 OBJECTIVE: [Describe migration objective]
   *
   * 📊 EXISTING DATA:
   * - Table "services" contains 150 records
   * - Column "status": 120 'active', 25 'inactive', 5 'draft'
   * - No NULL values in "status"
   *
   * 🛡️ SECURITY MEASURES:
   * - Check column existence before modification
   * - Backup critical data in temporary table
   * - Progressive transformation with explicit mapping
   * - Complete rollback possible via down() method
   *
   * ⚠️ IDENTIFIED RISKS:
   * - Data loss if incorrect mapping
   * - NOT NULL constraints on existing data
   * - Execution time on large tables
   *
   * ✅ TESTS PERFORMED:
   * - Migration tested on development database copy
   * - Rollback verified and functional
   * - Acceptable performance (<5 seconds)
   */
}
```

### 3️⃣ Mandatory Development Testing

```bash
# ✅ MANDATORY WORKFLOW - Test migration on host
# 1. Backup current database
docker compose exec postgres pg_dump -U rvproject_user rvproject_app > backup_pre_migration.sql

# 2. Apply migration (HOST)
npm run migration:run

# 3. Verify data after migration
docker compose exec postgres psql -U rvproject_user -d rvproject_app -c "SELECT COUNT(*) FROM rvproject_schema.services;"

# 4. Test rollback (HOST)
npm run migration:revert

# 5. Verify data is restored
docker compose exec postgres psql -U rvproject_user -d rvproject_app -c "SELECT COUNT(*) FROM rvproject_schema.services;"

# 6. Re-apply if rollback test succeeds (HOST)
npm run migration:run
```

## 🚨 CRITICAL WORKFLOW: MIGRATION EXECUTION ON HOST

### ⚠️ **MANDATORY WORKFLOW**: All migrations executed on host

All migrations must be executed on the host for consistency and environment compatibility:

```bash
# ✅ MANDATORY - Execute migrations on host
npm run migration:run

# ✅ MANDATORY - Rollback migrations on host
npm run migration:revert

# ✅ MANDATORY - Generate migration on host
npm run migration:generate -- -n NameOfMigration

# ✅ MANDATORY - Manual migration creation on host
npm run migration:create -- -n NameOfMigration

# ✅ MANDATORY - Check migration status on host
npm run migration:show
```

## ❌ ABSOLUTE PROHIBITIONS - DESTRUCTIVE MIGRATIONS

- ❌ **NEVER** `DROP COLUMN` without data backup
- ❌ **NEVER** `ALTER COLUMN ... NOT NULL` without verifying existing data
- ❌ **NEVER** `DROP TABLE` without complete data export
- ❌ **NEVER** migrate without tested rollback plan
- ❌ **NEVER** destructive type transformation
- ❌ **NEVER** migrate without prior data verification
- ❌ **NEVER** ignore constraint warnings

## 🎯 MANDATORY CHECKLIST FOR EACH MIGRATION

- [ ] ✅ **Existing data analysis** performed
- [ ] ✅ **Migration plan** documented in file
- [ ] ✅ **Existence checks** before modifications
- [ ] ✅ **Appropriate default values** for new columns
- [ ] ✅ **Automatic backup** of critical data
- [ ] ✅ **Progressive transformation** for type modifications
- [ ] ✅ **Complete and tested down() method**
- [ ] ✅ **Migration/rollback tests** in development
- [ ] ✅ **Acceptable performance** on large datasets
- [ ] ✅ **Documented identified risks** and mitigations

## 📊 Concrete Examples by Use Case

### Case 1: Required column on populated table

```sql
-- ❌ FORBIDDEN - Will cause errors on existing data
ALTER TABLE services ADD COLUMN required_field VARCHAR(50) NOT NULL;

-- ✅ CORRECT - 3-step progression
-- Step 1: Add nullable column with default
ALTER TABLE services ADD COLUMN required_field VARCHAR(50) DEFAULT 'DEFAULT_VALUE';

-- Step 2: Update existing data
UPDATE services SET required_field = 'APPROPRIATE_VALUE' WHERE required_field IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE services ALTER COLUMN required_field SET NOT NULL;
```

### Case 2: Type change with existing data

```sql
-- ❌ FORBIDDEN - Guaranteed data loss
ALTER TABLE services ALTER COLUMN price TYPE INTEGER;

-- ✅ CORRECT - Temporary column and migration
ALTER TABLE services ADD COLUMN price_new INTEGER;
UPDATE services SET price_new = CAST(price AS INTEGER) WHERE price ~ '^[0-9]+$';
UPDATE services SET price_new = 0 WHERE price_new IS NULL; -- Safe default
ALTER TABLE services DROP COLUMN price;
ALTER TABLE services RENAME COLUMN price_new TO price;
```

## 📋 Required Environment Variables

```bash
# .env files mandatory
DB_SCHEMA=public                    # Development
DB_SCHEMA=rvproject_schema          # Development with dedicated schema
DB_SCHEMA=rvproject_staging         # Staging
DB_SCHEMA=rvproject_prod           # Production
```

## 🚨 Consequences for Non-Compliance

Non-compliance with this rule results in:

- **Immediate blocking** of production migration
- **Potential corruption** of critical data
- **Emergency rollback** and complete investigation
- **Mandatory review** of all future migrations
- **Additional training** on best practices

**This rule is CRITICAL for data security and integrity!**
