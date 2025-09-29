import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppointmentForeignKeys1695830000000
  implements MigrationInterface
{
  name = 'AddAppointmentForeignKeys1695830000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraints for appointments table
    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_business_id"
      FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_calendar_id"
      FOREIGN KEY ("calendar_id") REFERENCES "calendars"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_service_id"
      FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_assigned_staff_id"
      FOREIGN KEY ("assigned_staff_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "FK_appointments_parent_appointment_id"
      FOREIGN KEY ("parent_appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL
    `);

    // Add some additional useful constraints
    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "CHK_appointments_valid_time_range"
      CHECK ("end_time" > "start_time")
    `);

    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD CONSTRAINT "CHK_appointments_positive_amounts"
      CHECK ("base_price_amount" >= 0 AND "total_amount" >= 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop constraints
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "CHK_appointments_positive_amounts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "CHK_appointments_valid_time_range"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_parent_appointment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_assigned_staff_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_service_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_calendar_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_appointments_business_id"`,
    );
  }
}
