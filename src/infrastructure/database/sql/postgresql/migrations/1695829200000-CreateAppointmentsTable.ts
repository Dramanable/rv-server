import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAppointmentsTable1695829200000
  implements MigrationInterface
{
  name = 'CreateAppointmentsTable1695829200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create appointments table
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'calendar_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'service_id',
            type: 'uuid',
            isNullable: false,
          },
          // Time slot information
          {
            name: 'start_time',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          // Client information
          {
            name: 'client_first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'client_last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'client_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'client_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'client_date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'client_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_new_client',
            type: 'boolean',
            default: false,
          },
          // Appointment details
          {
            name: 'type',
            type: 'enum',
            enum: [
              'CONSULTATION',
              'TREATMENT',
              'FOLLOWUP',
              'EMERGENCY',
              'GROUP',
              'ONLINE',
            ],
            default: "'CONSULTATION'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'REQUESTED',
              'CONFIRMED',
              'CANCELLED',
              'NO_SHOW',
              'COMPLETED',
              'IN_PROGRESS',
              'RESCHEDULED',
            ],
            default: "'REQUESTED'",
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          // Staff assignment
          {
            name: 'assigned_staff_id',
            type: 'uuid',
            isNullable: true,
          },
          // Pricing information
          {
            name: 'base_price_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'base_price_currency',
            type: 'char',
            length: '3',
            default: "'EUR'",
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'total_currency',
            type: 'char',
            length: '3',
            default: "'EUR'",
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['PENDING', 'PAID', 'PARTIAL', 'REFUNDED'],
            default: "'PENDING'",
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          // JSON columns for flexible data
          {
            name: 'discounts',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'taxes',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'reminders',
            type: 'jsonb',
            isNullable: true,
          },
          // Metadata
          {
            name: 'source',
            type: 'enum',
            enum: ['ONLINE', 'PHONE', 'WALK_IN', 'ADMIN'],
            default: "'ONLINE'",
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'inet',
            isNullable: true,
          },
          {
            name: 'referral_source',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'custom_fields',
            type: 'jsonb',
            isNullable: true,
          },
          // Recurring pattern
          {
            name: 'parent_appointment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'recurring_pattern',
            type: 'jsonb',
            isNullable: true,
          },
          // Timestamps
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'idx_appointments_business_calendar',
        columnNames: ['business_id', 'calendar_id'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'idx_appointments_time_slot',
        columnNames: ['calendar_id', 'start_time', 'end_time'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'idx_appointments_client_email',
        columnNames: ['client_email'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'idx_appointments_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'idx_appointments_start_time',
        columnNames: ['start_time'],
      }),
    );

    await queryRunner.createIndex(
      'appointments',
      new TableIndex({
        name: 'idx_appointments_assigned_staff',
        columnNames: ['assigned_staff_id'],
      }),
    );

    // Note: Foreign key constraints will be added in a separate migration
    // after all referenced tables are created

    // Create trigger for updating updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_appointments_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_appointments_updated_at
        BEFORE UPDATE ON appointments
        FOR EACH ROW
        EXECUTE FUNCTION update_appointments_updated_at();
    `);

    console.log(
      '✅ Appointments table created successfully with indexes and triggers',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON appointments;',
    );
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS update_appointments_updated_at();',
    );

    // Drop foreign keys
    await queryRunner.dropForeignKey(
      'appointments',
      'fk_appointments_business',
    );
    await queryRunner.dropForeignKey(
      'appointments',
      'fk_appointments_calendar',
    );
    await queryRunner.dropForeignKey('appointments', 'fk_appointments_service');
    await queryRunner.dropForeignKey('appointments', 'fk_appointments_staff');
    await queryRunner.dropForeignKey('appointments', 'fk_appointments_parent');

    // Drop indexes
    await queryRunner.dropIndex(
      'appointments',
      'idx_appointments_business_calendar',
    );
    await queryRunner.dropIndex('appointments', 'idx_appointments_time_slot');
    await queryRunner.dropIndex(
      'appointments',
      'idx_appointments_client_email',
    );
    await queryRunner.dropIndex('appointments', 'idx_appointments_status');
    await queryRunner.dropIndex('appointments', 'idx_appointments_start_time');
    await queryRunner.dropIndex(
      'appointments',
      'idx_appointments_assigned_staff',
    );

    // Drop table
    await queryRunner.dropTable('appointments');

    console.log(
      '✅ Appointments table and related objects dropped successfully',
    );
  }
}
