import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateProspectsTable1703760000000 implements MigrationInterface {
  name = 'CreateProspectsTable1703760000000';

  // 🎯 OBLIGATOIRE : Récupérer le schéma depuis l'environnement
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name: ${schema}`);
    }

    return schema;
  }

  /**
   * PLAN DE MIGRATION SÉCURISÉ
   *
   * 🎯 OBJECTIF : Créer la table prospects pour le système de prospection commerciale
   *
   * 📊 DONNÉES EXISTANTES : Nouvelle table, aucune donnée existante
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Vérification que la table n'existe pas déjà
   * - Schéma dynamique depuis variables d'environnement
   * - Index optimisés pour les requêtes fréquentes
   * - Contraintes de base de données appropriées
   * - Support UUID pour sécurité et performances
   *
   * ⚠️ RISQUES IDENTIFIÉS :
   * - Aucun risque majeur (nouvelle table)
   * - Potentiel conflit si la table existe déjà
   *
   * ✅ TESTS EFFECTUÉS :
   * - Migration testée sur base de développement
   * - Rollback vérifié et fonctionnel
   * - Index vérifié pour performance
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier que la table n'existe pas déjà
    const tableExists = await queryRunner.hasTable(`${schema}.prospects`);
    if (tableExists) {
      console.log(
        `Table "${schema}".prospects already exists, skipping creation`,
      );
      return;
    }

    // Créer la table prospects
    await queryRunner.createTable(
      new Table({
        name: `${schema}.prospects`,
        columns: [
          // 🆔 Primary Key
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            comment: 'Unique identifier for prospect',
          },

          // 🏢 Business Information
          {
            name: 'business_name',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Name of prospect business',
          },
          {
            name: 'contact_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Primary contact person name',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Contact email address',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'Contact phone number',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Business description or notes',
          },

          // 💼 Business Metrics
          {
            name: 'business_size',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'SMALL'",
            comment: 'Business size: SMALL, MEDIUM, LARGE, ENTERPRISE',
          },
          {
            name: 'estimated_staff_count',
            type: 'integer',
            isNullable: false,
            default: '1',
            comment: 'Estimated number of staff',
          },
          {
            name: 'estimated_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            default: '0.00',
            comment: 'Estimated deal value',
          },
          {
            name: 'estimated_value_currency',
            type: 'varchar',
            length: '3',
            isNullable: false,
            default: "'EUR'",
            comment: 'Currency for estimated value',
          },

          // 📊 Status and Workflow
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            isNullable: false,
            default: "'LEAD'",
            comment: 'Prospect status in sales pipeline',
          },
          {
            name: 'source',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'How prospect was acquired',
          },
          {
            name: 'assigned_sales_rep',
            type: 'uuid',
            isNullable: true,
            comment: 'UUID of assigned sales representative',
          },
          {
            name: 'last_contact_date',
            type: 'timestamp',
            isNullable: true,
            comment: 'Date of last contact with prospect',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Sales notes and communication history',
          },

          // 🎯 Pricing and Conversion
          {
            name: 'pricing_proposal',
            type: 'jsonb',
            isNullable: true,
            comment: 'Proposed pricing structure as JSON',
          },
          {
            name: 'proposed_monthly_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Proposed monthly subscription price',
          },
          {
            name: 'proposed_currency',
            type: 'varchar',
            length: '3',
            isNullable: true,
            comment: 'Currency for proposed price',
          },
          {
            name: 'expected_closing_date',
            type: 'timestamp',
            isNullable: true,
            comment: 'Expected deal closing date',
          },
          {
            name: 'priority_score',
            type: 'integer',
            isNullable: false,
            default: '0',
            comment: 'Priority score (0-100) for prospect ranking',
          },

          // 🔍 Tracking and Analytics
          {
            name: 'interaction_count',
            type: 'integer',
            isNullable: false,
            default: '0',
            comment: 'Number of interactions with prospect',
          },
          {
            name: 'first_contact_date',
            type: 'timestamp',
            isNullable: true,
            comment: 'Date of first contact with prospect',
          },
          {
            name: 'tags',
            type: 'jsonb',
            isNullable: true,
            comment: 'Tags associated with prospect as JSON array',
          },
          {
            name: 'custom_fields',
            type: 'jsonb',
            isNullable: true,
            comment: 'Custom fields and metadata as JSON',
          },

          // 🛡️ Audit Trail (Required by Copilot instructions)
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who created this prospect',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who last updated this prospect',
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

          // 🏷️ Soft Delete Support
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Soft delete timestamp',
          },
          {
            name: 'deleted_by',
            type: 'uuid',
            isNullable: true,
            comment: 'UUID of user who deleted this prospect',
          },
          {
            name: 'deletion_reason',
            type: 'text',
            isNullable: true,
            comment: 'Reason for deletion',
          },
        ],
      }),
      true,
    );

    // Créer les index pour performance
    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_status" ON "${schema}"."prospects" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_assigned_sales_rep" ON "${schema}"."prospects" ("assigned_sales_rep")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_business_size" ON "${schema}"."prospects" ("business_size")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_source" ON "${schema}"."prospects" ("source")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_created_at" ON "${schema}"."prospects" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_business_name" ON "${schema}"."prospects" ("business_name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_email" ON "${schema}"."prospects" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_estimated_staff_count" ON "${schema}"."prospects" ("estimated_staff_count")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_estimated_value" ON "${schema}"."prospects" ("estimated_value")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prospects_priority_score" ON "${schema}"."prospects" ("priority_score")
    `);

    console.log(
      `✅ Table "${schema}".prospects created successfully with all indexes`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier que la table existe avant suppression
    const tableExists = await queryRunner.hasTable(`${schema}.prospects`);
    if (!tableExists) {
      console.log(
        `Table "${schema}".prospects does not exist, skipping deletion`,
      );
      return;
    }

    // Supprimer la table (les index sont supprimés automatiquement)
    await queryRunner.dropTable(`${schema}.prospects`);

    console.log(`✅ Table "${schema}".prospects dropped successfully`);
  }
}
