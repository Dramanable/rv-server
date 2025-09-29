import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStaffTable1695828000000 implements MigrationInterface {
  name = 'CreateStaffTable1695828000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'staff',
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
            name: 'profile',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: [
              'MANAGER',
              'SENIOR_PRACTITIONER',
              'PRACTITIONER',
              'JUNIOR_PRACTITIONER',
              'ASSISTANT',
              'RECEPTIONIST',
              'SUPPORT_STAFF',
              'ADMIN',
            ],
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'availability',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'],
            default: "'ACTIVE'",
          },
          {
            name: 'hire_date',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'calendar_integration',
            type: 'jsonb',
            isNullable: true,
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
      `CREATE INDEX "IDX_staff_business_id" ON "staff" ("business_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_role" ON "staff" ("role")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_status" ON "staff" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_email" ON "staff" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_staff_created_at" ON "staff" ("created_at")`,
    );

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "staff"
      ADD CONSTRAINT "FK_staff_business_id"
      FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE
    `);

    // Add unique constraint on email per business
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_staff_business_email" ON "staff" ("business_id", "email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('staff');
  }
}
