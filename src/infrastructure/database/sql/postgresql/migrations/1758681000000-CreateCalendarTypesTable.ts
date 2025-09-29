import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCalendarTypesTable1758681000000
  implements MigrationInterface
{
  name = 'CreateCalendarTypesTable1758681000000';

  /**
   * PLAN DE MIGRATION SÉCURISÉ
   *
   * 🎯 OBJECTIF : Créer la table calendar_types pour remplacer l'enum CalendarType
   *
   * 📊 DONNÉES EXISTANTES :
   * - Aucune table calendar_types n'existe actuellement
   * - Conversion de l'enum CalendarType vers entité configurable
   * - Données par défaut seront insérées après création de la table
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Vérification existence table avant création
   * - Contraintes appropriées avec validation
   * - Index pour optimiser les performances
   * - Support multitenancy avec business_id
   *
   * ⚠️ RISQUES IDENTIFIÉS :
   * - Aucun risque majeur (nouvelle table)
   * - Compatibilité avec données existantes préservée
   *
   * ✅ TESTS EFFECTUÉS :
   * - Migration testée en développement
   * - Rollback vérifié et fonctionnel
   * - Performance acceptable
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

    // ✅ CORRECT - Vérifier que la table n'existe pas déjà
    const tableExists = await queryRunner.hasTable(`${schema}.calendar_types`);

    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'calendar_types',
          schema: schema,
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
              comment: 'Unique identifier for calendar type',
            },
            {
              name: 'business_id',
              type: 'uuid',
              isNullable: false,
              comment: 'Business that owns this calendar type',
            },
            {
              name: 'name',
              type: 'varchar',
              length: '100',
              isNullable: false,
              comment: 'Display name of the calendar type',
            },
            {
              name: 'code',
              type: 'varchar',
              length: '50',
              isNullable: false,
              comment:
                'Unique code identifier (uppercase, alphanumeric with underscores)',
            },
            {
              name: 'description',
              type: 'text',
              isNullable: false,
              comment: 'Detailed description of the calendar type',
            },
            {
              name: 'icon',
              type: 'varchar',
              length: '10',
              isNullable: false,
              comment: 'Unicode emoji icon for visual representation',
            },
            {
              name: 'color',
              type: 'varchar',
              length: '7',
              isNullable: false,
              comment: 'Hex color code for calendar display',
            },
            {
              name: 'is_built_in',
              type: 'boolean',
              default: false,
              isNullable: false,
              comment:
                'Whether this is a system built-in type (cannot be modified)',
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
              isNullable: false,
              comment: 'Whether this calendar type is active and available',
            },
            {
              name: 'sort_order',
              type: 'integer',
              default: 0,
              isNullable: false,
              comment: 'Display order for sorting calendar types',
            },
            // ⚠️ TRAÇABILITÉ OBLIGATOIRE
            {
              name: 'created_by',
              type: 'uuid',
              isNullable: false,
              comment: 'UUID of user who created this calendar type',
            },
            {
              name: 'updated_by',
              type: 'uuid',
              isNullable: false,
              comment: 'UUID of user who last updated this calendar type',
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
          indices: [
            // Index pour recherche par business
            {
              name: 'IDX_calendar_types_business_id',
              columnNames: ['business_id'],
            },
            // Index pour recherche par code (unique par business)
            {
              name: 'IDX_calendar_types_business_code',
              columnNames: ['business_id', 'code'],
            },
            // Index pour tri par ordre d'affichage
            {
              name: 'IDX_calendar_types_sort_order',
              columnNames: ['business_id', 'sort_order'],
            },
            // Index pour filtrage actifs
            {
              name: 'IDX_calendar_types_active',
              columnNames: ['business_id', 'is_active'],
            },
          ],
          uniques: [
            // Le code doit être unique par business
            {
              name: 'UQ_calendar_types_business_code',
              columnNames: ['business_id', 'code'],
            },
          ],
          foreignKeys: [
            {
              name: 'FK_calendar_types_business_id',
              columnNames: ['business_id'],
              referencedTableName: 'businesses',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
              onUpdate: 'CASCADE',
            },
            {
              name: 'FK_calendar_types_created_by',
              columnNames: ['created_by'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'RESTRICT',
              onUpdate: 'CASCADE',
            },
            {
              name: 'FK_calendar_types_updated_by',
              columnNames: ['updated_by'],
              referencedTableName: 'users',
              referencedColumnNames: ['id'],
              onDelete: 'RESTRICT',
              onUpdate: 'CASCADE',
            },
          ],
          checks: [
            // Validation du format du code
            {
              name: 'CHK_calendar_types_code_format',
              expression: "code ~ '^[A-Z][A-Z0-9_]*$'",
            },
            // Validation du format couleur hex
            {
              name: 'CHK_calendar_types_color_format',
              expression: "color ~ '^#[0-9A-Fa-f]{6}$'",
            },
            // Validation longueur minimum du nom
            {
              name: 'CHK_calendar_types_name_length',
              expression: 'LENGTH(TRIM(name)) >= 1',
            },
            // Validation longueur minimum de la description
            {
              name: 'CHK_calendar_types_description_length',
              expression: 'LENGTH(TRIM(description)) >= 1',
            },
            // Validation sort_order positif
            {
              name: 'CHK_calendar_types_sort_order_positive',
              expression: 'sort_order >= 0',
            },
          ],
        }),
        true, // ifNotExists
      );

      console.log(
        `✅ Table "${schema}.calendar_types" created successfully with all constraints and indexes`,
      );
    } else {
      console.log(
        `ℹ️ Table "${schema}.calendar_types" already exists, skipping creation`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Vérifier l'existence avant suppression
    const tableExists = await queryRunner.hasTable(`${schema}.calendar_types`);

    if (tableExists) {
      // ⚠️ ATTENTION - Sauvegarder les données avant suppression
      const hasData = await queryRunner.query(`
        SELECT COUNT(*) as count FROM "${schema}"."calendar_types"
      `);

      if (hasData[0]?.count > 0) {
        console.log(
          `⚠️ WARNING: Dropping table "${schema}.calendar_types" with ${hasData[0].count} records`,
        );

        // Créer une table de sauvegarde
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "${schema}"."calendar_types_backup_${Date.now()}" AS
          SELECT * FROM "${schema}"."calendar_types"
        `);
      }

      await queryRunner.dropTable(`${schema}.calendar_types`);
      console.log(`✅ Table "${schema}.calendar_types" dropped successfully`);
    } else {
      console.log(
        `ℹ️ Table "${schema}.calendar_types" does not exist, skipping drop`,
      );
    }
  }
}
