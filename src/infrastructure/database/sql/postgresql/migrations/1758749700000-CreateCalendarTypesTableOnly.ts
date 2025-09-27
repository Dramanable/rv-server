import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * ✅ MIGRATION SIMPLE - Créer UNIQUEMENT la table calendar_types
 *
 * 🎯 OBJECTIF : Créer la table calendar_types pour l'entité CalendarType
 *
 * 📊 DONNÉES EXISTANTES : Table n'existe pas encore
 *
 * 🛡️ MESURES DE SÉCURITÉ :
 * - Migration simple, une seule responsabilité
 * - Vérification d'existence de table
 * - Schema dynamique depuis variables d'environnement
 * - Rollback complet possible
 */
export class CreateCalendarTypesTableOnly1758749700000
  implements MigrationInterface
{
  name = "CreateCalendarTypesTableOnly1758749700000";

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

    // ✅ Vérifier si la table existe déjà
    const tableExists = await queryRunner.hasTable(`${schema}.calendar_types`);

    if (!tableExists) {
      // ✅ Créer la table calendar_types
      await queryRunner.query(`
        CREATE TABLE "${schema}"."calendar_types" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "business_id" uuid NOT NULL,
          "name" character varying(100) NOT NULL,
          "code" character varying(20) NOT NULL,
          "description" text,
          "settings" jsonb NOT NULL DEFAULT '{}',
          "is_active" boolean NOT NULL DEFAULT true,
          "created_by" uuid NOT NULL,
          "updated_by" uuid NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_calendar_types_id" PRIMARY KEY ("id")
        )
      `);

      // ✅ Créer l'index unique business_id + code
      await queryRunner.query(`
        CREATE UNIQUE INDEX "UQ_calendar_types_business_code"
        ON "${schema}"."calendar_types" ("business_id", "code")
      `);

      // ✅ Créer index business_id
      await queryRunner.query(`
        CREATE INDEX "IDX_calendar_types_business_id"
        ON "${schema}"."calendar_types" ("business_id")
      `);

      // ✅ Créer index is_active
      await queryRunner.query(`
        CREATE INDEX "IDX_calendar_types_is_active"
        ON "${schema}"."calendar_types" ("is_active")
      `);

      // ✅ Ajouter foreign key vers businesses (si la table existe)
      const businessesTableExists = await queryRunner.hasTable(
        `${schema}.businesses`,
      );
      if (businessesTableExists) {
        await queryRunner.query(`
          ALTER TABLE "${schema}"."calendar_types"
          ADD CONSTRAINT "FK_calendar_types_business_id"
          FOREIGN KEY ("business_id") REFERENCES "${schema}"."businesses"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
      }

      console.log(
        `✅ Table calendar_types créée avec succès dans le schéma ${schema}`,
      );
    } else {
      console.log(
        `⚠️ Table calendar_types existe déjà dans le schéma ${schema}`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ Vérifier si la table existe
    const tableExists = await queryRunner.hasTable(`${schema}.calendar_types`);

    if (tableExists) {
      // ✅ Supprimer la table complètement (cascade supprime les contraintes)
      await queryRunner.query(
        `DROP TABLE IF EXISTS "${schema}"."calendar_types" CASCADE`,
      );

      console.log(
        `✅ Table calendar_types supprimée avec succès du schéma ${schema}`,
      );
    } else {
      console.log(
        `⚠️ Table calendar_types n'existe pas dans le schéma ${schema}`,
      );
    }
  }
}
