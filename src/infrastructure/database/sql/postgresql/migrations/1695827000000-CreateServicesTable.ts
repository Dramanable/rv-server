// import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateServicesTable1695827000000 implements MigrationInterface {
  name = 'CreateServicesTable1695827000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'services',
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
            name: 'category',
            type: 'enum',
            enum: [
              'CONSULTATION',
              'TREATMENT',
              'PROCEDURE',
              'EXAMINATION',
              'THERAPY',
              'MAINTENANCE',
              'EMERGENCY',
              'FOLLOWUP',
              'OTHER',
            ],
            default: "'OTHER'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
            default: "'DRAFT'",
          },
          {
            name: 'pricing',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'scheduling',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'requirements',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'assigned_staff_ids',
            type: 'jsonb',
            isNullable: false,
            default: "'[]'",
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
      `CREATE INDEX "IDX_services_business_id" ON "services" ("business_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_services_name" ON "services" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_services_category" ON "services" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_services_status" ON "services" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_services_created_at" ON "services" ("created_at")`,
    );

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "services"
      ADD CONSTRAINT "FK_services_business_id"
      FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('services');
  }
}
