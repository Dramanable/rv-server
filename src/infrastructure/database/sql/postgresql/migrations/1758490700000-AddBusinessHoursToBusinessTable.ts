import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessHoursToBusinessTable1758490700000
  implements MigrationInterface
{
  name = "AddBusinessHoursToBusinessTable1758490700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || "public";

    // Ajouter la colonne business_hours avec une structure JSON par défaut
    await queryRunner.query(`
      ALTER TABLE "${schema}"."businesses"
      ADD COLUMN "business_hours" jsonb NOT NULL DEFAULT '{
        "weekly_schedule": {
          "1": {"is_open": true, "time_slots": [{"start_time": "09:00", "end_time": "17:00"}]},
          "2": {"is_open": true, "time_slots": [{"start_time": "09:00", "end_time": "17:00"}]},
          "3": {"is_open": true, "time_slots": [{"start_time": "09:00", "end_time": "17:00"}]},
          "4": {"is_open": true, "time_slots": [{"start_time": "09:00", "end_time": "17:00"}]},
          "5": {"is_open": true, "time_slots": [{"start_time": "09:00", "end_time": "17:00"}]},
          "6": {"is_open": false, "time_slots": []},
          "0": {"is_open": false, "time_slots": []}
        },
        "special_dates": [],
        "timezone": "Europe/Paris"
      }'::jsonb
    `);

    // Créer un index sur business_hours pour les requêtes de recherche
    await queryRunner.query(`
      CREATE INDEX "IDX_business_hours_timezone"
      ON "${schema}"."businesses" USING BTREE (("business_hours"->>'timezone'))
    `);

    // Index pour rechercher les businesses ouverts un jour donné
    await queryRunner.query(`
      CREATE INDEX "IDX_business_hours_weekly_schedule"
      ON "${schema}"."businesses" USING GIN ("business_hours")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || "public";

    // Supprimer les index créés
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_business_hours_weekly_schedule"`,
    );
    await queryRunner.query(
      `DROP INDEX "${schema}"."IDX_business_hours_timezone"`,
    );

    // Supprimer la colonne business_hours
    await queryRunner.query(
      `ALTER TABLE "${schema}"."businesses" DROP COLUMN "business_hours"`,
    );
  }
}
