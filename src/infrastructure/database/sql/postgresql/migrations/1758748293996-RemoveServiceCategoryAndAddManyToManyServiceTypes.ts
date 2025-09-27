import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class RemoveServiceCategoryAndAddManyToManyServiceTypes1758748293996
  implements MigrationInterface
{
  name = "RemoveServiceCategoryAndAddManyToManyServiceTypes1758748293997";

  /**
   * PLAN DE MIGRATION SÉCURISÉ - SERVICE CATEGORY → SERVICE TYPES MANY-TO-MANY
   *
   * 🎯 OBJECTIF : Supprimer la colonne category et implémenter relation many-to-many avec service_types
   *
   * 📊 DONNÉES EXISTANTES :
   * - Table "services" peut contenir des services avec des categories
   * - Chaque service doit être attaché à au moins un ServiceType
   * - Migration de category vers serviceTypeIds
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Sauvegarde des données category dans table temporaire
   * - Création de la table de liaison service_service_types
   * - Mapping automatique category → ServiceType par défaut
   * - Rollback complet possible
   *
   * ⚠️ RISQUES IDENTIFIÉS :
   * - Services sans ServiceType assigné après migration
   * - Index category existants à supprimer
   * - Relations many-to-many nécessitent table de liaison
   *
   * ✅ STRATÉGIE :
   * 1. Sauvegarder les données category existantes
   * 2. Créer table de liaison service_service_types
   * 3. Migrer les données vers la nouvelle relation
   * 4. Supprimer la colonne category et ses index
   */

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || "public";
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Sauvegarder les données existantes de category
    console.log("🔄 Sauvegarde des données category existantes...");
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."services_category_backup" AS
      SELECT id, category, business_id, created_at
      FROM "${schema}"."services"
      WHERE category IS NOT NULL
    `);

    // ✅ ÉTAPE 2 - Créer la table de liaison many-to-many
    console.log("🔄 Création de la table de liaison service_service_types...");
    await queryRunner.createTable(
      new Table({
        name: "service_service_types",
        columns: [
          {
            name: "service_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "service_type_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );

    // ✅ ÉTAPE 3 - Foreign Keys pour intégrité référentielle
    await queryRunner.createForeignKey(
      "service_service_types",
      new TableForeignKey({
        columnNames: ["service_id"],
        referencedTableName: "services",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "service_service_types",
      new TableForeignKey({
        columnNames: ["service_type_id"],
        referencedTableName: "service_types",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    // ✅ ÉTAPE 4 - Index pour optimiser les requêtes many-to-many
    await queryRunner.createIndex(
      "service_service_types",
      new TableIndex({
        name: "IDX_service_service_types_service_id",
        columnNames: ["service_id"],
      }),
    );

    await queryRunner.createIndex(
      "service_service_types",
      new TableIndex({
        name: "IDX_service_service_types_service_type_id",
        columnNames: ["service_type_id"],
      }),
    );

    // ✅ ÉTAPE 5 - Migrer les données existantes vers la relation many-to-many
    // Pour chaque service avec une category, l'associer à un ServiceType par défaut
    console.log(
      "🔄 Migration des données category vers relations many-to-many...",
    );

    // Créer un ServiceType "General" par défaut pour chaque business si nécessaire
    await queryRunner.query(`
      INSERT INTO "${schema}"."service_types" (id, business_id, name, code, description, is_active, created_at, updated_at)
      SELECT
        gen_random_uuid(),
        b.id,
        'General Services',
        'GENERAL',
        'Default service type for migrated services',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM "${schema}"."businesses" b
      WHERE NOT EXISTS (
        SELECT 1 FROM "${schema}"."service_types" st
        WHERE st.business_id = b.id AND st.code = 'GENERAL'
      )
    `);

    // Associer tous les services existants au ServiceType "General" de leur business
    await queryRunner.query(`
      INSERT INTO "${schema}"."service_service_types" (service_id, service_type_id, created_at)
      SELECT
        s.id,
        st.id,
        CURRENT_TIMESTAMP
      FROM "${schema}"."services" s
      JOIN "${schema}"."service_types" st ON st.business_id = s.business_id AND st.code = 'GENERAL'
      WHERE NOT EXISTS (
        SELECT 1 FROM "${schema}"."service_service_types" sst
        WHERE sst.service_id = s.id
      )
    `);

    // ✅ ÉTAPE 6 - Supprimer l'index sur category avant de supprimer la colonne
    console.log("🔄 Suppression de l'index IDX_services_category...");
    const categoryIndexExists = await queryRunner.query(`
      SELECT 1 FROM pg_indexes
      WHERE schemaname = '${schema}'
      AND tablename = 'services'
      AND indexname = 'IDX_services_category'
    `);

    if (categoryIndexExists.length > 0) {
      await queryRunner.query(
        `DROP INDEX IF EXISTS "${schema}"."IDX_services_category"`,
      );
    }

    // ✅ ÉTAPE 7 - Supprimer la colonne category
    console.log("🔄 Suppression de la colonne category...");
    const columnExists = await queryRunner.hasColumn(
      `${schema}.services`,
      "category",
    );

    if (columnExists) {
      await queryRunner.query(
        `ALTER TABLE "${schema}"."services" DROP COLUMN "category"`,
      );
    }

    console.log(
      "✅ Migration terminée avec succès - Service Category → ServiceTypes Many-to-Many",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    console.log("🔄 Rollback - Restauration de la colonne category...");

    // ✅ ÉTAPE 1 - Recréer la colonne category
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "category" VARCHAR(50) DEFAULT 'OTHER'
    `);

    // ✅ ÉTAPE 2 - Restaurer les données depuis la sauvegarde si elle existe
    const backupExists = await queryRunner.hasTable(
      `${schema}.services_category_backup`,
    );

    if (backupExists) {
      await queryRunner.query(`
        UPDATE "${schema}"."services"
        SET "category" = backup."category"
        FROM "${schema}"."services_category_backup" backup
        WHERE "${schema}"."services".id = backup.id
      `);

      // Supprimer la table de sauvegarde
      await queryRunner.query(
        `DROP TABLE IF EXISTS "${schema}"."services_category_backup"`,
      );
    }

    // ✅ ÉTAPE 3 - Recréer l'index sur category
    await queryRunner.query(
      `CREATE INDEX "IDX_services_category" ON "${schema}"."services" ("category")`,
    );

    // ✅ ÉTAPE 4 - Supprimer la table de liaison many-to-many
    await queryRunner.dropTable("service_service_types");

    console.log(
      "✅ Rollback terminé - Category restaurée et relations many-to-many supprimées",
    );
  }
}
