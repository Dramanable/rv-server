import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateServiceTypesTable1703703000000
  implements MigrationInterface
{
  name = "CreateServiceTypesTable1703703000000";

  // 🎯 OBLIGATORY: Récupérer le schéma depuis l'environnement
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || "public";

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name: ${schema}`);
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
      throw new Error(`Schema "${schema}" does not exist`);
    }

    await queryRunner.createTable(
      new Table({
        name: "service_types",
        schema: schema,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
            comment: "Primary key - UUID v4",
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
            comment: 'Service type name (e.g., "Consultation", "Treatment")',
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
            comment: "Optional detailed description of the service type",
          },
          {
            name: "service_category_id",
            type: "uuid",
            isNullable: false,
            comment: "Reference to service_categories table",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
            comment: "Indicates if service type is active and available",
          },

          // ✅ OBLIGATORY - Audit trail columns for traceability
          {
            name: "created_by",
            type: "uuid",
            isNullable: false,
            comment: "UUID of user who created this service type",
          },
          {
            name: "updated_by",
            type: "uuid",
            isNullable: false,
            comment: "UUID of user who last updated this service type",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            comment: "Creation timestamp",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
            comment: "Last update timestamp",
          },
        ],
      }),
      true,
    );

    // ✅ OBLIGATORY - Index pour optimiser les recherches fréquentes
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_service_types_name_category"
      ON "${schema}"."service_types" ("name", "service_category_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_types_category_id"
      ON "${schema}"."service_types" ("service_category_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_types_is_active"
      ON "${schema}"."service_types" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_service_types_created_by"
      ON "${schema}"."service_types" ("created_by")
    `);

    // ✅ OBLIGATORY - Foreign Key vers service_categories
    await queryRunner.query(`
      ALTER TABLE "${schema}"."service_types"
      ADD CONSTRAINT "FK_service_types_service_category_id"
      FOREIGN KEY ("service_category_id")
      REFERENCES "${schema}"."service_categories" ("id")
      ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Drop foreign keys first
    await queryRunner.query(`
      ALTER TABLE "${schema}"."service_types"
      DROP CONSTRAINT IF EXISTS "FK_service_types_service_category_id"
    `);

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_types_name_category"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_types_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_types_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_service_types_created_by"`,
    );

    // Drop table
    await queryRunner.dropTable(`"${schema}"."service_types"`);
  }
}
