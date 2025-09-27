import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1727033400000
  implements MigrationInterface
{
  name = "CreateNotificationsTable1727033400000";

  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || "public";

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name: ${schema}`);
    }

    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // 1. Créer les enums pour notifications
    await queryRunner.query(`
      CREATE TYPE "${schema}"."notification_channel_enum" AS ENUM(
        'EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "${schema}"."notification_priority_enum" AS ENUM(
        'LOW', 'NORMAL', 'HIGH', 'URGENT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "${schema}"."notification_status_enum" AS ENUM(
        'PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED'
      )
    `);

    // 2. Créer la table notifications
    await queryRunner.query(`
      CREATE TABLE "${schema}"."notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipient_id" uuid NOT NULL,
        "recipient_email" varchar(255),
        "recipient_phone" varchar(20),
        "channel" "${schema}"."notification_channel_enum" NOT NULL,
        "priority" "${schema}"."notification_priority_enum" NOT NULL DEFAULT 'NORMAL',
        "status" "${schema}"."notification_status_enum" NOT NULL DEFAULT 'PENDING',
        "subject" varchar(255),
        "content" text NOT NULL,
        "metadata" jsonb,
        "template_id" varchar(100),
        "template_data" jsonb,
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "delivered_at" TIMESTAMP WITH TIME ZONE,
        "failed_at" TIMESTAMP WITH TIME ZONE,
        "failure_reason" text,
        "retry_count" integer NOT NULL DEFAULT 0,
        "max_retries" integer NOT NULL DEFAULT 3,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )
    `);

    // 3. Créer les index pour performance
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient_id"
      ON "${schema}"."notifications" ("recipient_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_channel"
      ON "${schema}"."notifications" ("channel")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_status"
      ON "${schema}"."notifications" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_priority"
      ON "${schema}"."notifications" ("priority")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_scheduled_at"
      ON "${schema}"."notifications" ("scheduled_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at"
      ON "${schema}"."notifications" ("created_at")
    `);

    // 4. Index composé pour les notifications en attente
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_pending_schedule"
      ON "${schema}"."notifications" ("status", "scheduled_at")
      WHERE "status" = 'PENDING'
    `);

    // 5. Trigger pour updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_notifications_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_notifications_updated_at
        BEFORE UPDATE ON "${schema}"."notifications"
        FOR EACH ROW
        EXECUTE FUNCTION update_notifications_updated_at();
    `);

    console.log(
      "✅ Notifications table created successfully with indexes and triggers",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // 1. Supprimer le trigger et la fonction
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON "${schema}"."notifications"`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_notifications_updated_at()`,
    );

    // 2. Supprimer la table
    await queryRunner.query(`DROP TABLE IF EXISTS "${schema}"."notifications"`);

    // 3. Supprimer les enums
    await queryRunner.query(
      `DROP TYPE IF EXISTS "${schema}"."notification_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "${schema}"."notification_priority_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "${schema}"."notification_channel_enum"`,
    );
  }
}
