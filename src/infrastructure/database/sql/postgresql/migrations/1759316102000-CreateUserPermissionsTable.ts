import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPermissionsTable1759316102000
  implements MigrationInterface
{
  name = 'CreateUserPermissionsTable1759316102000';

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ Créer la table user_permissions
    await queryRunner.query(`
      CREATE TABLE "${schema}"."user_permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "action" varchar(20) NOT NULL,
        "resource" varchar(50) NOT NULL,
        "business_id" uuid NULL,
        "is_granted" boolean NOT NULL DEFAULT true,
        "granted_by" uuid NOT NULL,
        "granted_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ✅ Index unique pour éviter les doublons
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_permissions_unique" 
      ON "${schema}"."user_permissions" ("user_id", "action", "resource", "business_id")
    `);

    // ✅ Index pour les requêtes par utilisateur
    await queryRunner.query(`
      CREATE INDEX "IDX_user_permissions_user_id" 
      ON "${schema}"."user_permissions" ("user_id")
    `);

    // ✅ Index pour les requêtes par ressource et business
    await queryRunner.query(`
      CREATE INDEX "IDX_user_permissions_resource_business" 
      ON "${schema}"."user_permissions" ("resource", "business_id")
    `);

    // ✅ Index pour les requêtes de vérification de permissions
    await queryRunner.query(`
      CREATE INDEX "IDX_user_permissions_check" 
      ON "${schema}"."user_permissions" ("user_id", "resource", "is_granted")
    `);

    // ✅ Trigger pour mettre à jour updated_at automatiquement
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION "${schema}".update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_user_permissions_updated_at 
      BEFORE UPDATE ON "${schema}"."user_permissions"
      FOR EACH ROW EXECUTE FUNCTION "${schema}".update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer la table (les index seront supprimés automatiquement)
    await queryRunner.dropTable(`${schema}.user_permissions`);
  }
}
