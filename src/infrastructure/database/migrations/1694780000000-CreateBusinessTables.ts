import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

/**
 * 🏢 Business Management Tables Migration
 * 
 * Creates core business entities tables with proper relationships,
 * indexes for performance, and multi-tenant support
 */
export class CreateBusinessTables1694780000000 implements MigrationInterface {
  name = 'CreateBusinessTables1694780000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create businesses table
    await queryRunner.createTable(
      new Table({
        name: 'businesses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'business_type',
            type: 'enum',
            enum: [
              'MEDICAL_CLINIC',
              'DENTAL_OFFICE', 
              'LAW_FIRM',
              'BEAUTY_SALON',
              'THERAPY_CENTER',
              'VETERINARY_CLINIC',
              'CONSULTING_FIRM',
              'WELLNESS_CENTER',
              'FITNESS_CENTER',
              'EDUCATIONAL_CENTER'
            ],
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    // 2. Create business_addresses table
    await queryRunner.createTable(
      new Table({
        name: 'business_addresses',
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
            length: '100',
            isNullable: false,
          },
          {
            name: 'street',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // 3. Create services table
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
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'duration_minutes',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'base_price_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'base_price_currency',
            type: 'varchar',
            length: '3',
            default: "'EUR'",
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'requirements',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'booking_advance_hours',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'cancellation_hours',
            type: 'integer',
            default: 24,
            isNullable: false,
          },
          {
            name: 'max_participants',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // 4. Create staff table
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
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'staff_role',
            type: 'enum',
            enum: [
              'LOCATION_MANAGER',
              'DEPARTMENT_HEAD',
              'SENIOR_PRACTITIONER',
              'PRACTITIONER',
              'JUNIOR_PRACTITIONER',
              'RECEPTIONIST',
              'ASSISTANT',
              'SCHEDULER'
            ],
            isNullable: false,
          },
          {
            name: 'hire_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'employee_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'department',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'specializations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hourly_rate_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'hourly_rate_currency',
            type: 'varchar',
            length: '3',
            default: "'EUR'",
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // 5. Create calendars table
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
            name: 'address_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'calendar_type',
            type: 'enum',
            enum: ['BUSINESS', 'STAFF', 'RESOURCE', 'FACILITY'],
            default: "'BUSINESS'",
            isNullable: false,
          },
          {
            name: 'time_zone',
            type: 'varchar',
            length: '50',
            default: "'UTC'",
            isNullable: false,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'settings',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['address_id'],
            referencedTableName: 'business_addresses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['owner_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // 6. Create working_hours table
    await queryRunner.createTable(
      new Table({
        name: 'working_hours',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'calendar_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'day_of_week',
            type: 'integer',
            isNullable: false,
            comment: '0=Sunday, 1=Monday, ... 6=Saturday',
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'break_start_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'break_end_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['calendar_id'],
            referencedTableName: 'calendars',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // 7. Create appointments table
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
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
            name: 'service_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'staff_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'client_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'calendar_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'internal_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'price_currency',
            type: 'varchar',
            length: '3',
            default: "'EUR'",
            isNullable: true,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'cancelled_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancelled_by_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'cancellation_reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: 'businesses',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['service_id'],
            referencedTableName: 'services',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['staff_id'],
            referencedTableName: 'staff',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['client_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['calendar_id'],
            referencedTableName: 'calendars',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['created_by_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            columnNames: ['cancelled_by_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // 8. Create indexes for performance
    await queryRunner.createIndex('businesses', new Index('idx_businesses_email', ['email']));
    await queryRunner.createIndex('businesses', new Index('idx_businesses_name', ['name']));
    await queryRunner.createIndex('businesses', new Index('idx_businesses_type', ['business_type']));
    await queryRunner.createIndex('businesses', new Index('idx_businesses_active', ['is_active']));

    await queryRunner.createIndex('business_addresses', new Index('idx_business_addresses_business_id', ['business_id']));
    await queryRunner.createIndex('business_addresses', new Index('idx_business_addresses_primary', ['business_id', 'is_primary']));

    await queryRunner.createIndex('services', new Index('idx_services_business_id', ['business_id']));
    await queryRunner.createIndex('services', new Index('idx_services_active', ['business_id', 'is_active']));
    await queryRunner.createIndex('services', new Index('idx_services_category', ['business_id', 'category']));

    await queryRunner.createIndex('staff', new Index('idx_staff_business_id', ['business_id']));
    await queryRunner.createIndex('staff', new Index('idx_staff_user_id', ['user_id']));
    await queryRunner.createIndex('staff', new Index('idx_staff_role', ['business_id', 'staff_role']));
    await queryRunner.createIndex('staff', new Index('idx_staff_active', ['business_id', 'is_active']));

    await queryRunner.createIndex('calendars', new Index('idx_calendars_business_id', ['business_id']));
    await queryRunner.createIndex('calendars', new Index('idx_calendars_owner_id', ['owner_id']));
    await queryRunner.createIndex('calendars', new Index('idx_calendars_type', ['business_id', 'calendar_type']));

    await queryRunner.createIndex('working_hours', new Index('idx_working_hours_calendar_id', ['calendar_id']));
    await queryRunner.createIndex('working_hours', new Index('idx_working_hours_day', ['calendar_id', 'day_of_week']));

    await queryRunner.createIndex('appointments', new Index('idx_appointments_business_id', ['business_id']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_client_id', ['client_id']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_staff_id', ['staff_id']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_service_id', ['service_id']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_calendar_id', ['calendar_id']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_time_range', ['start_time', 'end_time']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_status', ['business_id', 'status']));
    await queryRunner.createIndex('appointments', new Index('idx_appointments_date', ['business_id', 'start_time']));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('appointments', 'idx_appointments_date');
    await queryRunner.dropIndex('appointments', 'idx_appointments_status');
    await queryRunner.dropIndex('appointments', 'idx_appointments_time_range');
    await queryRunner.dropIndex('appointments', 'idx_appointments_calendar_id');
    await queryRunner.dropIndex('appointments', 'idx_appointments_service_id');
    await queryRunner.dropIndex('appointments', 'idx_appointments_staff_id');
    await queryRunner.dropIndex('appointments', 'idx_appointments_client_id');
    await queryRunner.dropIndex('appointments', 'idx_appointments_business_id');

    await queryRunner.dropIndex('working_hours', 'idx_working_hours_day');
    await queryRunner.dropIndex('working_hours', 'idx_working_hours_calendar_id');

    await queryRunner.dropIndex('calendars', 'idx_calendars_type');
    await queryRunner.dropIndex('calendars', 'idx_calendars_owner_id');
    await queryRunner.dropIndex('calendars', 'idx_calendars_business_id');

    await queryRunner.dropIndex('staff', 'idx_staff_active');
    await queryRunner.dropIndex('staff', 'idx_staff_role');
    await queryRunner.dropIndex('staff', 'idx_staff_user_id');
    await queryRunner.dropIndex('staff', 'idx_staff_business_id');

    await queryRunner.dropIndex('services', 'idx_services_category');
    await queryRunner.dropIndex('services', 'idx_services_active');
    await queryRunner.dropIndex('services', 'idx_services_business_id');

    await queryRunner.dropIndex('business_addresses', 'idx_business_addresses_primary');
    await queryRunner.dropIndex('business_addresses', 'idx_business_addresses_business_id');

    await queryRunner.dropIndex('businesses', 'idx_businesses_active');
    await queryRunner.dropIndex('businesses', 'idx_businesses_type');
    await queryRunner.dropIndex('businesses', 'idx_businesses_name');
    await queryRunner.dropIndex('businesses', 'idx_businesses_email');

    // Drop tables in reverse dependency order
    await queryRunner.dropTable('appointments');
    await queryRunner.dropTable('working_hours');
    await queryRunner.dropTable('calendars');
    await queryRunner.dropTable('staff');
    await queryRunner.dropTable('services');
    await queryRunner.dropTable('business_addresses');
    await queryRunner.dropTable('businesses');
  }
}
