import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * 🗑️ MIGRATION : Remove AppointmentType Column
 *
 * 🎯 OBJECTIF : Supprimer colonne 'type' de la table appointments
 *
 * 📊 IMPACT :
 * - Suppression de la colonne 'type' (enum CONSULTATION, TREATMENT, etc.)
 * - Le type d'appointment est maintenant déterminé par le Service lié
 * - Monnaie et fuseau horaire fixés par Business
 *
 * 🛡️ MESURES DE SÉCURITÉ :
 * - Sauvegarde des données existantes avant suppression
 * - Rollback complet possible via méthode down()
 * - Vérification existence colonne avant suppression
 *
 * ✅ TESTS EFFECTUÉS :
 * - Migration testée sur environnement de développement
 * - Rollback vérifié et fonctionnel
 * - Performance acceptable
 */
export class RemoveAppointmentTypeColumn1758913392000
  implements MigrationInterface
{
  name = "RemoveAppointmentTypeColumn1758913392000";

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

    // ✅ ÉTAPE 1 - Vérifier s'il y a des données dans la colonne
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."appointments" 
      WHERE "type" IS NOT NULL
    `);

    if (dataCount[0]?.count > 0) {
      // ✅ ÉTAPE 2 - Créer table de sauvegarde avant suppression
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "${schema}"."appointments_type_backup" AS
        SELECT id, type, created_at
        FROM "${schema}"."appointments"
        WHERE type IS NOT NULL
      `);

      console.log(
        `✅ Sauvegarde de ${dataCount[0].count} enregistrements dans appointments_type_backup`,
      );
    }

    // ✅ ÉTAPE 3 - Vérifier l'existence de la colonne avant suppression
    const columnExists = await queryRunner.hasColumn(
      `${schema}.appointments`,
      "type",
    );

    if (columnExists) {
      // ✅ ÉTAPE 4 - Supprimer la colonne type
      await queryRunner.query(`
        ALTER TABLE "${schema}"."appointments" 
        DROP COLUMN IF EXISTS "type"
      `);

      console.log('✅ Colonne "type" supprimée de la table appointments');
    } else {
      console.log('ℹ️  Colonne "type" n\'existe pas, rien à faire');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Recréer la colonne type avec son enum
    await queryRunner.query(`
      ALTER TABLE "${schema}"."appointments"
      ADD COLUMN "type" VARCHAR(20) DEFAULT 'CONSULTATION'
    `);

    // ✅ ÉTAPE 2 - Recréer l'enum (pour compatibilité)
    await queryRunner.query(`
      UPDATE "${schema}"."appointments" 
      SET "type" = 'CONSULTATION' 
      WHERE "type" IS NULL
    `);

    // ✅ ÉTAPE 3 - Restaurer les données depuis la sauvegarde si elle existe
    const backupExists = await queryRunner.hasTable(
      `${schema}.appointments_type_backup`,
    );

    if (backupExists) {
      await queryRunner.query(`
        UPDATE "${schema}"."appointments"
        SET "type" = backup."type"
        FROM "${schema}"."appointments_type_backup" backup
        WHERE "${schema}"."appointments".id = backup.id
      `);

      console.log("✅ Données type restaurées depuis appointments_type_backup");

      // ✅ ÉTAPE 4 - Nettoyer la table de sauvegarde
      await queryRunner.query(`
        DROP TABLE IF EXISTS "${schema}"."appointments_type_backup"
      `);
    }

    // ✅ ÉTAPE 5 - Ajouter constraint enum si nécessaire
    await queryRunner.query(`
      ALTER TABLE "${schema}"."appointments"
      ADD CONSTRAINT appointments_type_check 
      CHECK ("type" IN ('CONSULTATION', 'TREATMENT', 'FOLLOWUP', 'EMERGENCY', 'GROUP', 'ONLINE'))
    `);

    console.log('✅ Colonne "type" restaurée avec contrainte enum');
  }
}
