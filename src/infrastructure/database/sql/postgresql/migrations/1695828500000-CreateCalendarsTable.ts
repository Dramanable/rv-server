import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCalendarsTable1695828500000 implements MigrationInterface {
  name = 'CreateCalendarsTable1695828500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'calendars',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['BUSINESS', 'PERSONAL', 'SHARED', 'RESOURCE'],
            default: "'BUSINESS'",
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'],
            default: "'ACTIVE'",
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            default: "'Europe/Paris'",
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '7',
            default: "'#007bff'",
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'availability',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_calendars_business_id" ON "calendars" ("business_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_calendars_name" ON "calendars" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_calendars_type" ON "calendars" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_calendars_status" ON "calendars" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_calendars_created_at" ON "calendars" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_calendars_owner_id" ON "calendars" ("owner_id")`,
    );

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "calendars"
      ADD CONSTRAINT "FK_calendars_business_id"
      FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE
    `);

    // Add constraint for unique default calendar per business
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_calendars_business_default"
      ON "calendars" ("business_id")
      WHERE "is_default" = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('calendars');
  }
}
