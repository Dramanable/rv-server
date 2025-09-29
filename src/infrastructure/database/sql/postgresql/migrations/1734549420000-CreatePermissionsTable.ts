import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePermissionsTable1734549420000 implements MigrationInterface {
  name = 'CreatePermissionsTable1734549420000';

  /**
   * PLAN DE MIGRATION SÉCURISÉ
   *
   * 🎯 OBJECTIF : Créer la table permissions pour gérer les permissions système et personnalisées
   *
   * 📊 DONNÉES EXISTANTES :
   * - Nouvelle table, aucune donnée existante
   * - Table sera utilisée pour remplacer l'enum Permission actuel
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Vérification existence table avant création
   * - Index sur name (unique) et category pour performance
   * - Contraintes appropriées pour l'intégrité des données
   * - Rollback complet possible via méthode down()
   *
   * ⚠️ RISQUES IDENTIFIÉS :
   * - Aucun risque majeur, nouvelle table
   * - Performance acceptable (<1 seconde)
   *
   * ✅ TESTS EFFECTUÉS :
   * - Migration testée sur environnement de développement
   * - Rollback vérifié et fonctionnel
   * - Index et contraintes vérifiés
   */

  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new DatabaseSchemaError(schema, 'Invalid schema name format');
    }

    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier si la table existe déjà
    const tableExists = await queryRunner.hasTable(`${schema}.permissions`);

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: `${schema}.permissions`,
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
              comment: 'Unique identifier for the permission',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '100',
              isNullable: false,
              isUnique: true,
              comment: 'Unique permission name (e.g., MANAGE_APPOINTMENTS)',
            },
            {
              name: 'display_name',
              type: 'varchar',
              length: '200',
              isNullable: false,
              comment: 'Human-readable display name for the permission',
            },
            {
              name: 'description',
              type: 'text',
              isNullable: false,
              comment: 'Detailed description of what the permission allows',
            },
            {
              name: 'category',
              type: 'varchar',
              length: '50',
              isNullable: false,
              comment:
                'Category grouping for the permission (e.g., APPOINTMENTS, STAFF)',
            },
            {
              name: 'is_system_permission',
              type: 'boolean',
              default: false,
              isNullable: false,
              comment:
                'Whether this is a system permission that cannot be modified',
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
              isNullable: false,
              comment: 'Whether the permission is currently active',
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              isNullable: false,
              comment: 'Creation timestamp',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
              isNullable: false,
              comment: 'Last update timestamp',
            },
          ],
        }),
        true,
      );

      // Créer les index avec des requêtes SQL brutes pour éviter les problèmes TypeScript
      await queryRunner.query(
        `CREATE INDEX "IDX_permissions_name" ON "${schema}"."permissions" ("name")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_permissions_category" ON "${schema}"."permissions" ("category")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_permissions_is_active" ON "${schema}"."permissions" ("is_active")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_permissions_is_system" ON "${schema}"."permissions" ("is_system_permission")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_permissions_category_active" ON "${schema}"."permissions" ("category", "is_active")`,
      );

      // Insérer les permissions système de base
      await this.insertSystemPermissions(queryRunner, schema);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier si la table existe avant suppression
    const tableExists = await queryRunner.hasTable(`${schema}.permissions`);

    if (tableExists) {
      // Supprimer les index d'abord (pour éviter les erreurs)
      await queryRunner.query(
        `DROP INDEX IF EXISTS "${schema}"."IDX_permissions_name"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "${schema}"."IDX_permissions_category"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "${schema}"."IDX_permissions_is_active"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "${schema}"."IDX_permissions_is_system"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "${schema}"."IDX_permissions_category_active"`,
      );

      // Supprimer la table
      await queryRunner.dropTable(`${schema}.permissions`);
    }
  }

  /**
   * Insère les permissions système de base
   */
  private async insertSystemPermissions(
    queryRunner: QueryRunner,
    schema: string,
  ): Promise<void> {
    const systemPermissions = [
      // Business Management
      {
        name: 'MANAGE_BUSINESSES',
        displayName: 'Gérer les entreprises',
        description: 'Permet de créer, modifier et supprimer les entreprises',
        category: 'BUSINESS',
      },
      {
        name: 'READ_BUSINESS',
        displayName: 'Consulter les entreprises',
        description: 'Permet de consulter les informations des entreprises',
        category: 'BUSINESS',
      },
      {
        name: 'LIST_BUSINESSES',
        displayName: 'Lister les entreprises',
        description: 'Permet de lister et rechercher les entreprises',
        category: 'BUSINESS',
      },

      // Staff Management
      {
        name: 'MANAGE_STAFF',
        displayName: 'Gérer le personnel',
        description:
          'Permet de créer, modifier et supprimer les membres du personnel',
        category: 'STAFF',
      },
      {
        name: 'READ_STAFF',
        displayName: 'Consulter le personnel',
        description: 'Permet de consulter les informations du personnel',
        category: 'STAFF',
      },
      {
        name: 'LIST_STAFF',
        displayName: 'Lister le personnel',
        description: 'Permet de lister et rechercher les membres du personnel',
        category: 'STAFF',
      },

      // Service Management
      {
        name: 'MANAGE_SERVICES',
        displayName: 'Gérer les services',
        description: 'Permet de créer, modifier et supprimer les services',
        category: 'SERVICES',
      },
      {
        name: 'READ_SERVICES',
        displayName: 'Consulter les services',
        description: 'Permet de consulter les informations des services',
        category: 'SERVICES',
      },
      {
        name: 'LIST_SERVICES',
        displayName: 'Lister les services',
        description: 'Permet de lister et rechercher les services',
        category: 'SERVICES',
      },

      // Appointment Management
      {
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de créer, modifier et annuler les rendez-vous',
        category: 'APPOINTMENTS',
      },
      {
        name: 'READ_APPOINTMENTS',
        displayName: 'Consulter les rendez-vous',
        description: 'Permet de consulter les informations des rendez-vous',
        category: 'APPOINTMENTS',
      },
      {
        name: 'LIST_APPOINTMENTS',
        displayName: 'Lister les rendez-vous',
        description: 'Permet de lister et rechercher les rendez-vous',
        category: 'APPOINTMENTS',
      },

      // User Management
      {
        name: 'MANAGE_USERS',
        displayName: 'Gérer les utilisateurs',
        description: 'Permet de créer, modifier et supprimer les utilisateurs',
        category: 'USERS',
      },
      {
        name: 'READ_USERS',
        displayName: 'Consulter les utilisateurs',
        description: 'Permet de consulter les informations des utilisateurs',
        category: 'USERS',
      },
      {
        name: 'LIST_USERS',
        displayName: 'Lister les utilisateurs',
        description: 'Permet de lister et rechercher les utilisateurs',
        category: 'USERS',
      },

      // System Administration
      {
        name: 'SYSTEM_ADMIN',
        displayName: 'Administration Système',
        description: 'Accès complet à toutes les fonctionnalités du système',
        category: 'SYSTEM',
      },
    ];

    for (const permission of systemPermissions) {
      await queryRunner.query(`
        INSERT INTO "${schema}"."permissions" (
          name, display_name, description, category, is_system_permission, is_active
        ) VALUES (
          '${permission.name}',
          '${permission.displayName}',
          '${permission.description}',
          '${permission.category}',
          true,
          true
        )
      `);
    }
  }
}
