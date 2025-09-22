/**
 * 🖼️ CREATE BUSINESS IMAGES TABLE MIGRATION
 * ✅ Migration pour images business avec AWS S3
 * ✅ Support variants et métadonnées JSONB
 */

import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateBusinessImagesTable1695829200000
  implements MigrationInterface
{
  name = 'CreateBusinessImagesTable1695829200000';

  // 🎯 OBLIGATOIRE : Récupérer le schéma depuis l'environnement
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name: ${schema}`);
    }

    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Créer l'enum pour les catégories d'images
    await queryRunner.query(`
      CREATE TYPE "${schema}"."image_category_enum" AS ENUM (
        'PROFILE',
        'GALLERY', 
        'COVER'
      )
    `);

    // Créer l'enum pour les formats d'images
    await queryRunner.query(`
      CREATE TYPE "${schema}"."image_format_enum" AS ENUM (
        'JPEG',
        'PNG',
        'WEBP'
      )
    `);

    // Créer la table business_images
    await queryRunner.createTable(
      new Table({
        name: `${schema}.business_images`,
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
            name: 'gallery_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 's3_key',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'original_filename',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['PROFILE', 'GALLERY', 'COVER'],
            default: "'GALLERY'",
          },
          {
            name: 'format',
            type: 'enum',
            enum: ['JPEG', 'PNG', 'WEBP'],
            isNullable: false,
          },
          {
            name: 'file_size',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'width',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'height',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'alt_text',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'variants',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 's3_metadata',
            type: 'jsonb',
            isNullable: true,
            default: "'{}'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
    await queryRunner.createIndex(
      `${schema}.business_images`,
      new TableIndex({
        name: 'IDX_business_images_business_id',
        columnNames: ['business_id'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.business_images`,
      new TableIndex({
        name: 'IDX_business_images_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.business_images`,
      new TableIndex({
        name: 'IDX_business_images_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.business_images`,
      new TableIndex({
        name: 'IDX_business_images_s3_key',
        columnNames: ['s3_key'],
      }),
    );

    // Index composé pour requêtes optimisées
    await queryRunner.createIndex(
      `${schema}.business_images`,
      new TableIndex({
        name: 'IDX_business_images_business_category_active',
        columnNames: ['business_id', 'category', 'is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer la table (cascade supprimera automatiquement les index)
    await queryRunner.dropTable(`${schema}.business_images`);

    // Supprimer les enums
    await queryRunner.query(
      `DROP TYPE IF EXISTS "${schema}"."image_format_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "${schema}"."image_category_enum"`,
    );
  }
}
