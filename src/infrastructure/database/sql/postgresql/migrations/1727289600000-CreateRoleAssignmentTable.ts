/**
 * 🗄️ MIGRATION TYPEORM - Role Assignment Table
 *
 * PLAN DE MIGRATION SÉCURISÉ
 *
 * 🎯 OBJECTIF : Créer la table role_assignments pour le système RBAC
 *
 * 📊 DONNÉES EXISTANTES :
 * - Nouvelle table, aucune donnée existante
 * - Pas d'impact sur les tables existantes
 *
 * 🛡️ MESURES DE SÉCURITÉ :
 * - Vérification d'existence avant création
 * - Index optimisés pour les requêtes fréquentes
 * - Constraints appropriées pour l'intégrité
 * - Support UUID natif PostgreSQL
 *
 * ⚠️ RISQUES IDENTIFIÉS :
 * - Aucun (nouvelle table)
 * - Migration réversible complète
 *
 * ✅ TESTS EFFECTUÉS :
 * - Migration testée en développement
 * - Rollback vérifié et fonctionnel
 * - Performance des index validée
 */

import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoleAssignmentTable1727289600000
  implements MigrationInterface
{
  name = "CreateRoleAssignmentTable1727289600000";

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
    const tableName = `${schema}.role_assignments`;

    // 🔍 Vérifier que la table n'existe pas déjà
    const tableExists = await queryRunner.hasTable(tableName);
    if (tableExists) {
      console.log(`Table ${tableName} already exists, skipping creation`);
      return;
    }

    // ✅ Créer la table role_assignments
    await queryRunner.createTable(
      new Table({
        name: `${schema}.role_assignments`,
        columns: [
          // 🆔 Identification primaire
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
            comment: "Identifiant unique de l'assignation de rôle",
          },

          // 👤 Assignation utilisateur et rôle
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
            comment: "UUID de l'utilisateur assigné",
          },
          {
            name: "role",
            type: "varchar",
            length: "50",
            isNullable: false,
            comment: "Rôle assigné (enum UserRole)",
          },

          // 🏢 Contexte métier hiérarchique
          {
            name: "business_id",
            type: "uuid",
            isNullable: false,
            comment: "UUID du business (niveau racine)",
          },
          {
            name: "location_id",
            type: "uuid",
            isNullable: true,
            comment: "UUID de la location (niveau intermédiaire)",
          },
          {
            name: "department_id",
            type: "uuid",
            isNullable: true,
            comment: "UUID du département (niveau feuille)",
          },
          {
            name: "assignment_scope",
            type: "varchar",
            length: "20",
            isNullable: false,
            comment:
              "Étendue de l'assignation (BUSINESS, LOCATION, DEPARTMENT)",
          },

          // ⏰ Gestion temporelle
          {
            name: "assigned_at",
            type: "timestamp with time zone",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
            comment: "Date d'assignation du rôle",
          },
          {
            name: "expires_at",
            type: "timestamp with time zone",
            isNullable: true,
            comment: "Date d'expiration (nullable = permanent)",
          },
          {
            name: "is_active",
            type: "boolean",
            isNullable: false,
            default: true,
            comment: "Status actif/inactif de l'assignation",
          },

          // 📝 Métadonnées business
          {
            name: "notes",
            type: "text",
            isNullable: true,
            comment: "Notes sur l'assignation",
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
            comment: "Métadonnées flexibles en JSON",
          },

          // 👥 Audit trail - Traçabilité obligatoire
          {
            name: "assigned_by",
            type: "uuid",
            isNullable: false,
            comment: "UUID de l'utilisateur qui a fait l'assignation",
          },
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

          // 🔄 Versioning et métadonnées techniques
          {
            name: "version",
            type: "integer",
            isNullable: false,
            default: 1,
            comment: "Version pour optimistic locking",
          },
          {
            name: "assignment_source",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'MANUAL'",
            comment: "Source de l'assignation (MANUAL, AUTOMATED, IMPORTED)",
          },
          {
            name: "priority_level",
            type: "integer",
            isNullable: false,
            default: 0,
            comment: "Niveau de priorité pour résolution des conflits",
          },
        ],
      }),
      true, // ifNotExists
    );

    // 📊 Index pour les requêtes fréquentes
    await queryRunner.query(`
      CREATE INDEX "IDX_role_assignments_user_business"
      ON "${schema}"."role_assignments" ("user_id", "business_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_assignments_user_business_location"
      ON "${schema}"."role_assignments" ("user_id", "business_id", "location_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_assignments_user_business_location_dept"
      ON "${schema}"."role_assignments" ("user_id", "business_id", "location_id", "department_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_assignments_role_business"
      ON "${schema}"."role_assignments" ("role", "business_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_assignments_active_expires"
      ON "${schema}"."role_assignments" ("is_active", "expires_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_role_assignments_scope"
      ON "${schema}"."role_assignments" ("assignment_scope")
    `);

    // ✅ Contraintes de validation métier
    await queryRunner.query(`
      ALTER TABLE "${schema}"."role_assignments"
      ADD CONSTRAINT "CHK_role_assignments_valid_role"
      CHECK ("role" IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'USER'))
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."role_assignments"
      ADD CONSTRAINT "CHK_role_assignments_valid_scope"
      CHECK ("assignment_scope" IN ('BUSINESS', 'LOCATION', 'DEPARTMENT'))
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."role_assignments"
      ADD CONSTRAINT "CHK_role_assignments_valid_source"
      CHECK ("assignment_source" IN ('MANUAL', 'AUTOMATED', 'IMPORTED', 'INHERITED'))
    `);

    // ⚠️ Contraintes de cohérence hiérarchique
    await queryRunner.query(`
      ALTER TABLE "${schema}"."role_assignments"
      ADD CONSTRAINT "CHK_role_assignments_dept_requires_location"
      CHECK ("department_id" IS NULL OR "location_id" IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."role_assignments"
      ADD CONSTRAINT "CHK_role_assignments_scope_consistency"
      CHECK (
        ("assignment_scope" = 'BUSINESS' AND "location_id" IS NULL AND "department_id" IS NULL) OR
        ("assignment_scope" = 'LOCATION' AND "location_id" IS NOT NULL AND "department_id" IS NULL) OR
        ("assignment_scope" = 'DEPARTMENT' AND "location_id" IS NOT NULL AND "department_id" IS NOT NULL)
      )
    `);

    // 📝 Commentaires sur la table
    await queryRunner.query(`
      COMMENT ON TABLE "${schema}"."role_assignments" IS
      'Table des assignations de rôles RBAC avec contexte hiérarchique métier'
    `);

    console.log(
      `✅ Table ${tableName} created successfully with all indexes and constraints`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();
    const tableName = `${schema}.role_assignments`;

    // 🔍 Vérifier que la table existe avant suppression
    const tableExists = await queryRunner.hasTable(tableName);
    if (!tableExists) {
      console.log(`Table ${tableName} does not exist, skipping deletion`);
      return;
    }

    // ⚠️ SAUVEGARDER les données si elles existent (optionnel mais recommandé)
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."role_assignments"
    `);

    if (dataCount[0]?.count > 0) {
      console.log(
        `⚠️ WARNING: Dropping table with ${dataCount[0].count} records. Consider backup if needed.`,
      );

      // Créer une table de sauvegarde (optionnel)
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "${schema}"."role_assignments_backup_${Date.now()}" AS
        SELECT * FROM "${schema}"."role_assignments"
      `);
    }

    // 🗑️ Supprimer la table (les index et contraintes sont supprimés automatiquement)
    await queryRunner.dropTable(`${schema}.role_assignments`, true);

    console.log(`✅ Table ${tableName} dropped successfully`);
  }
}
