import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
/**
 * 🔄 Migration - Add Flexible Pricing System to Services
 *
 * Ajoute le support des configurations de pricing flexibles :
 * - Pricing nullable pour services gratuits ou hidden
 * - Support des PricingConfig avec types et visibilité
 * - Migration des données existantes vers le nouveau format
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlexiblePricingToServices1695829250000
  implements MigrationInterface
{
  name = 'AddFlexiblePricingToServices1695829250000';

  // 🎯 OBLIGATOIRE : Récupérer le schéma depuis l'environnement
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
    // Ajouter des colonnes pour stocker la configuration de pricing
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN IF NOT EXISTS "pricing_config" jsonb
    `);

    // Migrer les données existantes vers le nouveau format
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "pricing_config" = jsonb_build_object(
        'type', 'FIXED',
        'visibility', 'PUBLIC',
        'basePrice', CASE
          WHEN pricing->'base_price' IS NOT NULL THEN pricing->'base_price'
          ELSE NULL
        END,
        'rules', '[]'::jsonb,
        'description', NULL
      )
      WHERE "pricing_config" IS NULL
    `);

    // Mettre à jour le champ pricing pour supporter les valeurs null
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "pricing" = jsonb_set(
        "pricing",
        '{base_price}',
        CASE
          WHEN (pricing->'base_price'->>'amount')::numeric = 0 THEN 'null'::jsonb
          ELSE pricing->'base_price'
        END
      )
    `);

    // Supprimer les discount_price qui ne sont plus utilisés
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "pricing" = jsonb_set(
        "pricing",
        '{discount_price}',
        'null'::jsonb
      )
      WHERE pricing->'discount_price' IS NOT NULL
    `);

    // Rendre pricing_config obligatoire maintenant qu'elle est migrée
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ALTER COLUMN "pricing_config" SET NOT NULL
    `);

    // Ajouter un index B-tree sur le type de pricing
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_services_pricing_config_type"
      ON "${schema}"."services" USING BTREE (("pricing_config"->>'type'))
    `);

    // Ajouter un index B-tree sur la visibilité du pricing
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_services_pricing_config_visibility"
      ON "${schema}"."services" USING BTREE (("pricing_config"->>'visibility'))
    `);

    // Ajouter une contrainte pour valider les types de pricing
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD CONSTRAINT "CHK_services_pricing_config_type"
      CHECK (("pricing_config"->>'type') IN ('FREE', 'FIXED', 'VARIABLE', 'HIDDEN', 'ON_DEMAND'))
    `);

    // Ajouter une contrainte pour valider la visibilité
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD CONSTRAINT "CHK_services_pricing_config_visibility"
      CHECK (("pricing_config"->>'visibility') IN ('PUBLIC', 'AUTHENTICATED', 'PRIVATE', 'HIDDEN'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer les contraintes
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      DROP CONSTRAINT IF EXISTS "CHK_services_pricing_config_visibility"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      DROP CONSTRAINT IF EXISTS "CHK_services_pricing_config_type"
    `);

    // Supprimer les index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."IDX_services_pricing_config_visibility"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "${schema}"."IDX_services_pricing_config_type"
    `);

    // Restaurer les discount_price à partir des données sauvegardées si nécessaire
    // (Cette partie dépend de la stratégie de rollback souhaitée)

    // Supprimer la colonne pricing_config
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      DROP COLUMN IF EXISTS "pricing_config"
    `);

    // Restaurer le format original du pricing (optionnel)
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "pricing" = jsonb_set(
        "pricing",
        '{base_price}',
        jsonb_build_object(
          'amount', COALESCE((pricing->'base_price'->>'amount')::numeric, 0),
          'currency', COALESCE(pricing->'base_price'->>'currency', 'EUR')
        )
      )
      WHERE pricing->'base_price' IS NULL
    `);
  }
}
