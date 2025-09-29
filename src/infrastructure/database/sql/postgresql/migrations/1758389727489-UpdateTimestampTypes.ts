import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTimestampTypes1758389727489 implements MigrationInterface {
  name = 'UpdateTimestampTypes1758389727489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cette migration met à jour les types de colonnes timestamp
    // ATTENTION: Ces modifications sont sécurisées et préservent les données existantes

    // Mise à jour des commentaires sur les colonnes timestamp pour toutes les tables
    // Les données existantes sont préservées

    // Table users - Ajouter des commentaires aux colonnes timestamp
    await queryRunner.query(`
      COMMENT ON COLUMN "users"."created_at" IS 'Timestamp when the user was created'
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "users"."updated_at" IS 'Timestamp when the user was last updated'
    `);

    // Table business_sectors - Ajouter des commentaires aux colonnes timestamp
    await queryRunner.query(`
      COMMENT ON COLUMN "business_sectors"."created_at" IS 'Timestamp when the business sector was created'
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "business_sectors"."updated_at" IS 'Timestamp when the business sector was last updated'
    `);

    // Table refresh_tokens - Ajouter des commentaires aux colonnes timestamp
    await queryRunner.query(`
      COMMENT ON COLUMN "refresh_tokens"."created_at" IS 'Timestamp when the refresh token was created'
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "refresh_tokens"."updated_at" IS 'Timestamp when the refresh token was last updated'
    `);

    // Les index sont créés par la migration initiale, pas besoin de les recréer ici
    // Cette migration ne fait que des ajouts de commentaires sécurisés
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les commentaires ajoutés (reversal sécurisé)
    await queryRunner.query(`
      COMMENT ON COLUMN "users"."created_at" IS NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "users"."updated_at" IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "business_sectors"."created_at" IS NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "business_sectors"."updated_at" IS NULL
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "refresh_tokens"."created_at" IS NULL
    `);
    await queryRunner.query(`
      COMMENT ON COLUMN "refresh_tokens"."updated_at" IS NULL
    `);

    // Pas d'index à supprimer - cette migration ne crée que des commentaires
  }
}
