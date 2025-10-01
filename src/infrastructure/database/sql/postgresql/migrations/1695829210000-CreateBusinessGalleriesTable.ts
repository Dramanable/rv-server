/**
 * 🖼️ CREATE BUSINESS GALLERIES TABLE MIGRATION
 * ✅ Migration pour galeries business
 * ✅ Configuration JSONB e      new TableForeignKey({
        columnNames: ['gallery_id'],
        referencedTableName: 'business_galleries',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),tions
 */

import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateBusinessGalleriesTable1695829210000
  implements MigrationInterface
{
  name = 'CreateBusinessGalleriesTable1695829210000';

  // 🎯 OBLIGATOIRE : Récupérer le schéma depuis l'environnement
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name format: ${schema}`);
    }

    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Créer la table business_galleries
    await queryRunner.createTable(
      new Table({
        name: `${schema}.business_galleries`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'business_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            default: "'Main Gallery'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 0,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'gallery_config',
            type: 'jsonb',
            default: `'{"maxImages":50,"allowedFormats":["JPEG","PNG","WEBP"],"thumbnailSize":{"width":200,"height":200}}'`,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['business_id'],
            referencedTableName: `${schema}.businesses`,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Créer les index
    await queryRunner.query(`
      CREATE INDEX "IDX_business_galleries_business_id"
      ON "${schema}"."business_galleries" ("business_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_galleries_display_order"
      ON "${schema}"."business_galleries" ("display_order")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_business_galleries_is_primary"
      ON "${schema}"."business_galleries" ("is_primary", "is_active")
    `);

    // Maintenant ajouter la contrainte de clé étrangère pour gallery_id dans business_images
    await queryRunner.createForeignKey(
      `${schema}.business_images`,
      new TableForeignKey({
        columnNames: ['gallery_id'],
        referencedTableName: `${schema}.business_galleries`,
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer la contrainte de clé étrangère d'abord
    const table = await queryRunner.getTable(`${schema}.business_images`);
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('gallery_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey(
          `${schema}.business_images`,
          foreignKey,
        );
      }
    }

    // Supprimer la table business_galleries
    await queryRunner.dropTable(`${schema}.business_galleries`);
  }
}
