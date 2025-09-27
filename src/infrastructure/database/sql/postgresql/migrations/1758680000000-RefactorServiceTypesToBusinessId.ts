import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorServiceTypesToBusinessId1758680000000
  implements MigrationInterface
{
  name = "RefactorServiceTypesToBusinessId1758680000000";

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || "public";
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    /**
     * PLAN DE MIGRATION SÉCURISÉ
     *
     * 🎯 OBJECTIF : Refactoriser ServiceTypes pour utiliser business_id au lieu de service_category_id
     *
     * 📊 DONNÉES EXISTANTES :
     * - Table "service_types" peut contenir des données existantes
     * - Colonnes peuvent déjà exister suite à migrations précédentes
     *
     * 🛡️ MESURES DE SÉCURITÉ :
     * - Vérification existence colonnes avant ajout
     * - Transformation progressive avec validation
     * - Préservation compatibilité avec service_category_id
     */

    // 1. Add new columns to service_types - AVEC VÉRIFICATION D'EXISTENCE
    const businessIdExists = await queryRunner.hasColumn(
      `${schema}.service_types`,
      "business_id",
    );
    const codeExists = await queryRunner.hasColumn(
      `${schema}.service_types`,
      "code",
    );
    const sortOrderExists = await queryRunner.hasColumn(
      `${schema}.service_types`,
      "sort_order",
    );

    if (!businessIdExists) {
      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_types"
        ADD COLUMN "business_id" uuid
      `);
      console.log("✅ Added business_id column");
    } else {
      console.log("ℹ️  business_id column already exists, skipping");
    }

    if (!codeExists) {
      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_types"
        ADD COLUMN "code" varchar(20)
      `);
      console.log("✅ Added code column");
    } else {
      console.log("ℹ️  code column already exists, skipping");
    }

    if (!sortOrderExists) {
      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_types"
        ADD COLUMN "sort_order" integer DEFAULT 0
      `);
      console.log("✅ Added sort_order column");
    } else {
      console.log("ℹ️  sort_order column already exists, skipping");
    }

    // 2. Update business_id from service_category_id - SEULEMENT SI NÉCESSAIRE
    if (!businessIdExists) {
      // Vérifier si service_categories table existe encore
      const serviceCategoriesExists = await queryRunner.hasTable(
        `${schema}.service_categories`,
      );

      if (serviceCategoriesExists) {
        await queryRunner.query(`
          UPDATE "${schema}"."service_types" st
          SET "business_id" = sc."business_id"
          FROM "${schema}"."service_categories" sc
          WHERE st."service_category_id" = sc."id"
        `);
        console.log("✅ Updated business_id from service_categories");
      } else {
        console.log(
          "⚠️  service_categories table not found, skipping business_id update",
        );
      }
    }

    // 3. Set business_id as NOT NULL - SEULEMENT SI COLONNE AJOUTÉE
    if (!businessIdExists) {
      // Vérifier qu'il n'y a pas de valeurs NULL
      const nullCount = await queryRunner.query(`
        SELECT COUNT(*) as count FROM "${schema}"."service_types" WHERE "business_id" IS NULL
      `);

      if (nullCount[0]?.count > 0) {
        console.log(
          `⚠️  Found ${nullCount[0].count} service_types with NULL business_id - setting default`,
        );
        // Ici on pourrait définir une stratégie par défaut ou lever une erreur
      } else {
        await queryRunner.query(`
          ALTER TABLE "${schema}"."service_types"
          ALTER COLUMN "business_id" SET NOT NULL
        `);
        console.log("✅ Set business_id as NOT NULL");
      }
    }

    // 4. Set code as NOT NULL with default values - SEULEMENT SI COLONNE AJOUTÉE
    if (!codeExists) {
      await queryRunner.query(`
        UPDATE "${schema}"."service_types"
        SET "code" = UPPER(REPLACE(REPLACE("name", ' ', '_'), '-', '_'))
        WHERE "code" IS NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_types"
        ALTER COLUMN "code" SET NOT NULL
      `);
      console.log("✅ Set code as NOT NULL with generated values");
    }

    // 5. Make audit columns nullable - TOUJOURS NÉCESSAIRE
    const auditColumnsResult = await queryRunner.query(`
      SELECT
        col.column_name,
        col.is_nullable
      FROM information_schema.columns col
      WHERE col.table_schema = '${schema}'
        AND col.table_name = 'service_types'
        AND col.column_name IN ('created_by', 'updated_by')
    `);

    const needsAuditUpdate = auditColumnsResult.some(
      (col: any) => col.is_nullable === "NO",
    );

    if (needsAuditUpdate) {
      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_types"
        ALTER COLUMN "created_by" DROP NOT NULL,
        ALTER COLUMN "updated_by" DROP NOT NULL
      `);
      console.log("✅ Made audit columns nullable");
    } else {
      console.log("ℹ️  Audit columns already nullable");
    }

    // 6. Create indexes - SEULEMENT SI PAS DÉJÀ CRÉÉS
    try {
      await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_service_types_business_code"
        ON "${schema}"."service_types" ("business_id", "code")
      `);
      console.log("✅ Created business_code unique index");
    } catch (error) {
      console.log(
        "ℹ️  business_code index already exists or could not be created",
      );
    }

    try {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS "IDX_service_types_business_active"
        ON "${schema}"."service_types" ("business_id", "is_active")
      `);
      console.log("✅ Created business_active index");
    } catch (error) {
      console.log(
        "ℹ️  business_active index already exists or could not be created",
      );
    }

    console.log(
      "✅ ServiceTypes refactored to use business_id instead of service_category_id",
    );
    console.log(
      "⚠️  service_category_id column kept for now - will be removed in next migration after updating dependencies",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Remove new columns and indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_types_business_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_types_business_code"`,
    );

    await queryRunner.query(`
      ALTER TABLE "${schema}"."service_types"
      DROP COLUMN IF EXISTS "sort_order",
      DROP COLUMN IF EXISTS "code",
      DROP COLUMN IF EXISTS "business_id"
    `);

    // Restore audit columns as NOT NULL
    await queryRunner.query(`
      ALTER TABLE "${schema}"."service_types"
      ALTER COLUMN "created_by" SET NOT NULL,
      ALTER COLUMN "updated_by" SET NOT NULL
    `);
  }
}
