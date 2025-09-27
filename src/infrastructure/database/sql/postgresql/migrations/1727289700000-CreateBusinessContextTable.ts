/**
 * 🗄️ MIGRATION TYPEORM - Business Context Table
 *
 * PLAN DE MIGRATION SÉCURISÉ
 *
 * 🎯 OBJECTIF : Créer la table business_contexts pour le système RBAC hiérarchique
 *
 * 📊 DONNÉES EXISTANTES :
 * - Nouvelle table, aucune donnée existante
 * - Pas d'impact sur les tables existantes
 *
 * 🛡️ MESURES DE SÉCURITÉ :
 * - Vérification d'existence avant création
 * - Index optimisés pour requêtes hiérarchiques
 * - Constraints pour maintenir l'intégrité hiérarchique
 * - Support des requêtes récursives avec path
 *
 * ⚠️ RISQUES IDENTIFIÉS :
 * - Aucun (nouvelle table)
 * - Migration réversible complète
 * - Performance validée pour hiérarchies complexes
 *
 * ✅ TESTS EFFECTUÉS :
 * - Migration testée en développement
 * - Rollback vérifié et fonctionnel
 * - Index hiérarchiques optimisés
 */

import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBusinessContextTable1727289700000
  implements MigrationInterface
{
  name = "CreateBusinessContextTable1727289700000";

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
    const tableName = `${schema}.business_contexts`;

    // 🔍 Vérifier que la table n'existe pas déjà
    const tableExists = await queryRunner.hasTable(tableName);
    if (tableExists) {
      console.log(`Table ${tableName} already exists, skipping creation`);
      return;
    }

    // ✅ Créer la table business_contexts
    await queryRunner.createTable(
      new Table({
        name: `${schema}.business_contexts`,
        columns: [
          // 🆔 Identification primaire
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
            comment: "Identifiant unique du contexte métier",
          },

          // 🏢 Identification et hiérarchie
          {
            name: "name",
            type: "varchar",
            length: "200",
            isNullable: false,
            comment: "Nom du contexte (business, location, department)",
          },
          {
            name: "type",
            type: "varchar",
            length: "20",
            isNullable: false,
            comment: "Type de contexte (BUSINESS, LOCATION, DEPARTMENT)",
          },
          {
            name: "business_id",
            type: "uuid",
            isNullable: false,
            comment: "UUID du business racine",
          },
          {
            name: "parent_context_id",
            type: "uuid",
            isNullable: true,
            comment: "UUID du contexte parent (null pour business)",
          },

          // 📝 Métadonnées descriptives
          {
            name: "description",
            type: "text",
            isNullable: true,
            comment: "Description détaillée du contexte",
          },
          {
            name: "code",
            type: "varchar",
            length: "50",
            isNullable: true,
            comment: "Code métier unique (optionnel)",
          },

          // 🎯 Configuration et statut
          {
            name: "is_active",
            type: "boolean",
            isNullable: false,
            default: true,
            comment: "Status actif/inactif du contexte",
          },
          {
            name: "settings",
            type: "jsonb",
            isNullable: true,
            comment: "Configuration flexible en JSON",
          },

          // 📊 Métadonnées hiérarchiques
          {
            name: "level",
            type: "integer",
            isNullable: false,
            default: 0,
            comment:
              "Niveau hiérarchique (0=Business, 1=Location, 2=Department)",
          },
          {
            name: "path",
            type: "text",
            isNullable: true,
            comment: "Chemin hiérarchique pour requêtes rapides",
          },
          {
            name: "display_order",
            type: "integer",
            isNullable: false,
            default: 0,
            comment: "Ordre d'affichage dans les listes",
          },

          // 👥 Audit trail - Traçabilité obligatoire
          {
            name: "created_by",
            type: "uuid",
            isNullable: false,
            comment: "UUID de l'utilisateur créateur",
          },
          {
            name: "updated_by",
            type: "uuid",
            isNullable: false,
            comment: "UUID du dernier utilisateur modificateur",
          },

          // ⏱️ Timestamps automatiques
          {
            name: "created_at",
            type: "timestamp with time zone",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            comment: "Date de création",
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            comment: "Date de dernière modification",
          },

          // 🔄 Versioning et intégrations
          {
            name: "version",
            type: "integer",
            isNullable: false,
            default: 1,
            comment: "Version pour optimistic locking",
          },
          {
            name: "external_id",
            type: "varchar",
            length: "100",
            isNullable: true,
            comment: "ID externe pour intégrations",
          },
          {
            name: "timezone",
            type: "varchar",
            length: "50",
            isNullable: true,
            comment: "Timezone pour locations/departments",
          },
        ],
      }),
      true, // ifNotExists
    );

    // 📊 Index pour les requêtes hiérarchiques et de performance
    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_type_active"
      ON "${schema}"."business_contexts" ("type", "is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_business_type"
      ON "${schema}"."business_contexts" ("business_id", "type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_parent"
      ON "${schema}"."business_contexts" ("parent_context_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_level_order"
      ON "${schema}"."business_contexts" ("level", "display_order")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_path"
      ON "${schema}"."business_contexts" ("path")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_name_search"
      ON "${schema}"."business_contexts" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_contexts_code_unique"
      ON "${schema}"."business_contexts" ("business_id", "code")
      WHERE "code" IS NOT NULL
    `);

    // ✅ Contraintes de validation métier
    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "CHK_business_contexts_valid_type"
      CHECK ("type" IN ('BUSINESS', 'LOCATION', 'DEPARTMENT'))
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "CHK_business_contexts_valid_level"
      CHECK ("level" >= 0 AND "level" <= 2)
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "CHK_business_contexts_name_length"
      CHECK (LENGTH(TRIM("name")) >= 2)
    `);

    // ⚠️ Contraintes de cohérence hiérarchique
    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "CHK_business_contexts_business_root"
      CHECK (("type" = 'BUSINESS' AND "parent_context_id" IS NULL AND "level" = 0)
             OR "type" != 'BUSINESS')
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "CHK_business_contexts_location_parent"
      CHECK (("type" = 'LOCATION' AND "parent_context_id" IS NOT NULL AND "level" = 1)
             OR "type" != 'LOCATION')
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "CHK_business_contexts_department_parent"
      CHECK (("type" = 'DEPARTMENT' AND "parent_context_id" IS NOT NULL AND "level" = 2)
             OR "type" != 'DEPARTMENT')
    `);

    // 🔗 Contrainte de clé étrangère auto-référentielle
    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "FK_business_contexts_parent"
      FOREIGN KEY ("parent_context_id")
      REFERENCES "${schema}"."business_contexts" ("id")
      ON DELETE CASCADE
    `);

    // 🎯 Contraintes d'unicité
    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "UQ_business_contexts_business_name"
      UNIQUE ("business_id", "name", "type")
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."business_contexts"
      ADD CONSTRAINT "UQ_business_contexts_code"
      UNIQUE ("business_id", "code")
      DEFERRABLE INITIALLY DEFERRED
    `);

    // 📝 Commentaires sur la table
    await queryRunner.query(`
      COMMENT ON TABLE "${schema}"."business_contexts" IS
      'Table des contextes métier hiérarchiques (Business > Location > Department) pour RBAC'
    `);

    console.log(
      `✅ Table ${tableName} created successfully with hierarchical constraints and indexes`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();
    const tableName = `${schema}.business_contexts`;

    // 🔍 Vérifier que la table existe avant suppression
    const tableExists = await queryRunner.hasTable(tableName);
    if (!tableExists) {
      console.log(`Table ${tableName} does not exist, skipping deletion`);
      return;
    }

    // ⚠️ SAUVEGARDER les données si elles existent
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."business_contexts"
    `);

    if (dataCount[0]?.count > 0) {
      console.log(
        `⚠️ WARNING: Dropping table with ${dataCount[0].count} records. Consider backup if needed.`,
      );

      // Créer une table de sauvegarde avec structure hiérarchique
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "${schema}"."business_contexts_backup_${Date.now()}" AS
        SELECT *, NOW() as backup_created_at
        FROM "${schema}"."business_contexts"
        ORDER BY "level", "parent_context_id", "display_order"
      `);
    }

    // 🗑️ Supprimer la table (les contraintes FK sont automatiquement supprimées)
    await queryRunner.dropTable(`${schema}.business_contexts`, true);

    console.log(`✅ Table ${tableName} dropped successfully`);
  }
}
