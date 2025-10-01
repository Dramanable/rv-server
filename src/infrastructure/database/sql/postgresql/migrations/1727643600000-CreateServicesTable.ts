/**
 * 📊 MIGRATION - CREATE SERVICES TABLE
 *
 * Migration pour créer la table des services
 * Suit les conventions Clean Architecture
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTable1727643600000 implements MigrationInterface {
  name = 'CreateServicesTable1727643600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create services table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "business_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "description" text,
        "service_type_ids" text,
        "base_price" decimal(10,2),
        "currency" character varying(3) DEFAULT 'EUR',
        "discount_price" decimal(10,2),
        "duration" integer NOT NULL,
        "allow_online_booking" boolean NOT NULL DEFAULT true,
        "requires_approval" boolean NOT NULL DEFAULT false,
        "assigned_staff_ids" text,
        "image_url" character varying(500),
        "status" character varying(50) NOT NULL DEFAULT 'DRAFT',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "PK_services_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    const businessIdIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'services' AND indexname = 'IDX_services_business_id'
    `);
    if (!businessIdIndexExists || businessIdIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_services_business_id" ON "services" ("business_id")`,
      );
    }

    const businessNameUniqueIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'services' AND indexname = 'IDX_services_business_id_name_unique'
    `);
    if (
      !businessNameUniqueIndexExists ||
      businessNameUniqueIndexExists.length === 0
    ) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_services_business_id_name_unique" ON "services" ("business_id", "name")`,
      );
    }

    const statusIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'services' AND indexname = 'IDX_services_status'
    `);
    if (!statusIndexExists || statusIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_services_status" ON "services" ("status")`,
      );
    }

    const createdAtIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'services' AND indexname = 'IDX_services_created_at'
    `);
    if (!createdAtIndexExists || createdAtIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_services_created_at" ON "services" ("created_at")`,
      );
    }

    const basePriceIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'services' AND indexname = 'IDX_services_base_price'
    `);
    if (!basePriceIndexExists || basePriceIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_services_base_price" ON "services" ("base_price")`,
      );
    }

    const durationIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes WHERE tablename = 'services' AND indexname = 'IDX_services_duration'
    `);
    if (!durationIndexExists || durationIndexExists.length === 0) {
      await queryRunner.query(
        `CREATE INDEX "IDX_services_duration" ON "services" ("duration")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_services_duration"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_services_base_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_services_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_services_status"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_services_business_id_name_unique"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_services_business_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "services"`);
  }
}
