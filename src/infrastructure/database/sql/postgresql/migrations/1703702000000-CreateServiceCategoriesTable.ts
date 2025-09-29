import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateServiceCategoriesTable1703702000000
  implements MigrationInterface
{
  name = 'CreateServiceCategoriesTable1703702000000';

  // 🎯 OBLIGATOIRE : Récupérer le schéma depuis l'environnement
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new DatabaseSchemaError(schema, 'Invalid schema name format');
    }

    return schema;
  }

  private async schemaExists(
    queryRunner: QueryRunner,
    schemaName: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `
      SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata
        WHERE schema_name = $1
      ) as exists
    `,
      [schemaName],
    );

    return result[0]?.exists || false;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier que le schéma existe
    const exists = await this.schemaExists(queryRunner, schema);
    if (!exists) {
      throw new DatabaseSchemaError(schema, 'Schema does not exist');
    }

    await queryRunner.createTable(
      new Table({
        name: `${schema}.service_categories`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            comment: 'Unique identifier for service category',
          },
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Business that owns this service category',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Name of the service category',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '10',
            isNullable: false,
            isUnique: true,
            comment: 'Unique code for the service category',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Optional description of the service category',
          },
          {
            name: 'color',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Color for UI display (hex, rgb, named)',
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Icon identifier for UI display',
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
            comment: 'Order for sorting categories',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            comment: 'Whether the category is active',
          },
          {
            name: 'parent_category_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Parent category for hierarchical structure',
          },
          // ⚠️ TRAÇABILITÉ OBLIGATOIRE - Colonnes d'audit (nullable)
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'UUID of user who created this service category',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'UUID of user who last updated this service category',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Creation timestamp',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            comment: 'Last update timestamp',
          },
        ],
      }),
      true,
    );

    // Index pour business_id (requêtes fréquentes)
    await queryRunner.query(`
      CREATE INDEX "IDX_service_categories_business_id"
      ON "${schema}"."service_categories" ("business_id")
    `);

    // Index pour parent_category_id (requêtes hiérarchiques)
    await queryRunner.query(`
      CREATE INDEX "IDX_service_categories_parent_id"
      ON "${schema}"."service_categories" ("parent_category_id")
    `);

    // Index composé pour recherche par business + name
    await queryRunner.query(`
      CREATE INDEX "IDX_service_categories_business_name"
      ON "${schema}"."service_categories" ("business_id", "name")
    `);

    // Index pour tri par sort_order
    await queryRunner.query(`
      CREATE INDEX "IDX_service_categories_sort_order"
      ON "${schema}"."service_categories" ("sort_order")
    `);

    // Foreign Key vers businesses (si la table existe)
    try {
      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_categories"
        ADD CONSTRAINT "FK_service_categories_business"
        FOREIGN KEY ("business_id") REFERENCES "${schema}"."businesses"("id")
        ON DELETE CASCADE
      `);
    } catch (error) {
      // Si la table businesses n'existe pas encore, ignorer cette FK
      console.warn(
        'Could not create FK to businesses table, it may not exist yet',
      );
    }

    // Self-referencing Foreign Key pour hierarchie
    await queryRunner.query(`
      ALTER TABLE "${schema}"."service_categories"
      ADD CONSTRAINT "FK_service_categories_parent"
      FOREIGN KEY ("parent_category_id") REFERENCES "${schema}"."service_categories"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer les Foreign Keys
    await queryRunner.query(`
      ALTER TABLE "${schema}"."service_categories"
      DROP CONSTRAINT IF EXISTS "FK_service_categories_parent"
    `);

    try {
      await queryRunner.query(`
        ALTER TABLE "${schema}"."service_categories"
        DROP CONSTRAINT IF EXISTS "FK_service_categories_business"
      `);
    } catch (error) {
      // FK peut ne pas exister si elle n'a pas pu être créée
    }

    // Supprimer les index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_categories_sort_order"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_categories_business_name"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_categories_parent_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_categories_business_id"`,
    );

    // Supprimer la table
    await queryRunner.dropTable(`"${schema}"."service_categories"`);
  }
}
