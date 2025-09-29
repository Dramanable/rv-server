import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * 🗄️ MIGRATION : CREATE PROFESSIONALS TABLE
 *
 * 🎯 OBJECTIF : Créer la table professionals pour la gestion des professionnels
 *
 * 📊 DONNÉES EXISTANTES :
 * - Nouvelle table, aucune donnée existante à considérer
 * - Table 'businesses' doit exister pour la contrainte FK
 *
 * 🛡️ MESURES DE SÉCURITÉ :
 * - Vérification existence table avant création
 * - Contraintes FK appropriées avec CASCADE
 * - Index optimisés pour performance
 * - Colonnes audit/traçabilité obligatoires
 *
 * ⚠️ RISQUES IDENTIFIÉS :
 * - Aucun risque majeur - nouvelle table
 * - Dépendance sur table 'businesses' existante
 *
 * ✅ TESTS EFFECTUÉS :
 * - Migration testée sur environnement développement
 * - Rollback vérifié et fonctionnel
 * - Performance acceptable (instantané)
 */
export class CreateProfessionalsTable1727164800000
  implements MigrationInterface
{
  name = 'CreateProfessionalsTable1727164800000';

  /**
   * ✅ OBLIGATOIRE : Récupérer le schéma depuis l'environnement
   */
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new DatabaseSchemaError(schema, 'Invalid schema name format');
    }

    return schema;
  }

  /**
   * ✅ Vérifier si une table existe
   */
  private async tableExists(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = $2
      ) as exists
    `,
      [schemaName, tableName],
    );

    return result[0]?.exists || false;
  }

  /**
   * ✅ Migration UP - Créer la table professionals
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier si la table existe déjà
    const exists = await this.tableExists(queryRunner, schema, 'professionals');
    if (exists) {
      console.log(
        `Table "${schema}"."professionals" already exists, skipping creation`,
      );
      return;
    }

    // Vérifier que la table businesses existe (dépendance)
    const businessExists = await this.tableExists(
      queryRunner,
      schema,
      'businesses',
    );
    if (!businessExists) {
      throw new DatabaseSchemaError(
        `Dependency table "${schema}"."businesses" does not exist`,
        'TABLE_DEPENDENCY_NOT_EXISTS',
      );
    }

    console.log(`Creating table "${schema}"."professionals"...`);

    // Créer la table professionals
    await queryRunner.createTable(
      new Table({
        name: `${schema}.professionals`,
        columns: [
          // ✅ Clé primaire UUID
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            comment: 'Professional unique identifier',
          },

          // ✅ Référence vers l'entreprise (FK obligatoire)
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Reference to business entity',
          },

          // ✅ Données personnelles
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Professional first name',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Professional last name',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
            comment: 'Professional email address (unique)',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'Professional phone number',
          },

          // ✅ Données professionnelles
          {
            name: 'specialization',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'Professional specialization/expertise',
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
            comment: 'Professional biography/description',
          },
          {
            name: 'profile_image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'URL to professional profile image',
          },

          // ✅ Statut et activation
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
            comment: 'Whether the professional is active',
          },

          // ⚠️ TRAÇABILITÉ OBLIGATOIRE selon Copilot instructions
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who created this professional',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who last updated this professional',
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
      true, // ifNotExists
    );

    // ✅ Index pour performances optimisées
    await queryRunner.query(`
      CREATE INDEX "IDX_professionals_business_id" ON "${schema}"."professionals" ("business_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professionals_email" ON "${schema}"."professionals" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professionals_is_active" ON "${schema}"."professionals" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professionals_specialization" ON "${schema}"."professionals" ("specialization")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professionals_created_at" ON "${schema}"."professionals" ("created_at")
    `);

    // ✅ Contrainte de clé étrangère vers businesses
    await queryRunner.query(`
      ALTER TABLE "${schema}"."professionals"
      ADD CONSTRAINT "FK_professionals_business_id"
      FOREIGN KEY ("business_id") REFERENCES "${schema}"."businesses" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    console.log(
      `✅ Table "${schema}"."professionals" created successfully with indexes and constraints`,
    );
  }

  /**
   * ✅ Migration DOWN - Supprimer la table professionals
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    console.log(`Dropping table "${schema}"."professionals"...`);

    // Vérifier si la table existe avant suppression
    const exists = await this.tableExists(queryRunner, schema, 'professionals');
    if (!exists) {
      console.log(
        `Table "${schema}"."professionals" does not exist, skipping drop`,
      );
      return;
    }

    // ⚠️ ATTENTION : Sauvegarder les données critiques si nécessaire
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."professionals"
    `);

    if (dataCount[0]?.count > 0) {
      console.log(
        `⚠️  WARNING: Dropping table with ${dataCount[0].count} professionals!`,
      );

      // Optionnel : Créer une sauvegarde
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "${schema}"."professionals_backup_${Date.now()}" AS
        SELECT * FROM "${schema}"."professionals"
      `);
    }

    // Supprimer la table (les FK et index sont supprimés automatiquement)
    await queryRunner.dropTable(`${schema}.professionals`, true, true, true);

    console.log(`✅ Table "${schema}"."professionals" dropped successfully`);
  }
}
