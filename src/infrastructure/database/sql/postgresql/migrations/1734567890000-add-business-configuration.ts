/**
 * 🏗️ Migration: Add Business Configuration Support
 *
 * Database migration to add configuration fields to Business entity
 * Supporting dynamic timezone, currency, locale, and business rules
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBusinessConfiguration1734567890000
  implements MigrationInterface
{
  name = 'AddBusinessConfiguration1734567890000';

  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name format: ${schema}`);
    }
    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Add configuration columns to business table
    await queryRunner.query(`
      ALTER TABLE "${schema}"."businesses" 
      ADD COLUMN "configuration_timezone" VARCHAR(50) DEFAULT 'Europe/Paris',
      ADD COLUMN "configuration_currency" VARCHAR(3) DEFAULT 'EUR',
      ADD COLUMN "configuration_locale" VARCHAR(10) DEFAULT 'fr-FR',
      ADD COLUMN "configuration_first_day_of_week" SMALLINT DEFAULT 1,
      ADD COLUMN "configuration_business_week_days" INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
      ADD COLUMN "configuration_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);

    // Add constraints for business configuration (PostgreSQL CHECK compatible)
    await queryRunner.query(`
      ALTER TABLE "${schema}"."businesses"
      ADD CONSTRAINT "CHK_business_config_timezone" 
      CHECK ("configuration_timezone" ~ '^[A-Za-z_]+/[A-Za-z_/]+$'),
      
      ADD CONSTRAINT "CHK_business_config_currency" 
      CHECK (LENGTH("configuration_currency") = 3 AND "configuration_currency" ~ '^[A-Z]{3}$'),
      
      ADD CONSTRAINT "CHK_business_config_locale" 
      CHECK ("configuration_locale" ~ '^[a-z]{2}-[A-Z]{2}$'),
      
      ADD CONSTRAINT "CHK_business_config_first_day_week" 
      CHECK ("configuration_first_day_of_week" >= 0 AND "configuration_first_day_of_week" <= 6),
      
      ADD CONSTRAINT "CHK_business_config_week_days_length" 
      CHECK (
        array_length("configuration_business_week_days", 1) > 0 AND
        array_length("configuration_business_week_days", 1) <= 7
      )
    `);

    // Create index for configuration queries
    await queryRunner.query(`
      CREATE INDEX "IDX_business_configuration_timezone" 
      ON "${schema}"."businesses" ("configuration_timezone");
      
      CREATE INDEX "IDX_business_configuration_currency" 
      ON "${schema}"."businesses" ("configuration_currency");
    `);

    // Update existing businesses with default configuration
    await queryRunner.query(`
      UPDATE "${schema}"."businesses" 
      SET 
        "configuration_timezone" = 'Europe/Paris',
        "configuration_currency" = 'EUR',
        "configuration_locale" = 'fr-FR',
        "configuration_first_day_of_week" = 1,
        "configuration_business_week_days" = ARRAY[1,2,3,4,5],
        "configuration_updated_at" = NOW()
      WHERE "configuration_timezone" IS NULL
    `);

    // Make configuration fields non-nullable after setting defaults
    await queryRunner.query(`
      ALTER TABLE "${schema}"."businesses" 
      ALTER COLUMN "configuration_timezone" SET NOT NULL,
      ALTER COLUMN "configuration_currency" SET NOT NULL,
      ALTER COLUMN "configuration_locale" SET NOT NULL,
      ALTER COLUMN "configuration_first_day_of_week" SET NOT NULL,
      ALTER COLUMN "configuration_business_week_days" SET NOT NULL,
      ALTER COLUMN "configuration_updated_at" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."IDX_business_configuration_currency";
      DROP INDEX IF EXISTS "${schema}"."IDX_business_configuration_timezone";
    `);

    // Drop constraints
    await queryRunner.query(`
      ALTER TABLE "${schema}"."businesses"
      DROP CONSTRAINT IF EXISTS "CHK_business_config_week_days_length",
      DROP CONSTRAINT IF EXISTS "CHK_business_config_first_day_week",
      DROP CONSTRAINT IF EXISTS "CHK_business_config_locale",
      DROP CONSTRAINT IF EXISTS "CHK_business_config_currency",
      DROP CONSTRAINT IF EXISTS "CHK_business_config_timezone"
    `);

    // Drop configuration columns
    await queryRunner.query(`
      ALTER TABLE "${schema}"."businesses" 
      DROP COLUMN IF EXISTS "configuration_updated_at",
      DROP COLUMN IF EXISTS "configuration_business_week_days",
      DROP COLUMN IF EXISTS "configuration_first_day_of_week",
      DROP COLUMN IF EXISTS "configuration_locale",
      DROP COLUMN IF EXISTS "configuration_currency",
      DROP COLUMN IF EXISTS "configuration_timezone"
    `);
  }
}
