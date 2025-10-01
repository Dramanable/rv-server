/**
 * 🗄️ MIGRATION - Create Password Reset Codes Table
 *
 * Crée la table pour stocker les codes de réinitialisation de mot de passe à 4 chiffres.
 */

import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreatePasswordResetCodesTable1696012800000
  implements MigrationInterface
{
  name = 'CreatePasswordResetCodesTable1696012800000';

  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name format: ${schema}`);
    }
    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Créer la table password_reset_codes
    await queryRunner.createTable(
      new Table({
        name: `${schema}.password_reset_codes`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: "Référence vers l'utilisateur",
          },
          {
            name: 'code',
            type: 'varchar',
            length: '4',
            isNullable: false,
            comment: 'Code à 4 chiffres pour la réinitialisation',
          },
          {
            name: 'expires_at',
            type: 'timestamp with time zone',
            isNullable: false,
            comment: "Date d'expiration du code (15 minutes après création)",
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'used_at',
            type: 'timestamp with time zone',
            isNullable: true,
            comment: "Date d'utilisation du code (null si non utilisé)",
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Index unique sur le code
    await queryRunner.createIndex(
      'password_reset_codes',
      new TableIndex({
        name: 'IDX_password_reset_codes_code_unique',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Index pour les requêtes par utilisateur et expiration
    await queryRunner.createIndex(
      'password_reset_codes',
      new TableIndex({
        name: 'IDX_password_reset_codes_user_expires',
        columnNames: ['user_id', 'expires_at'],
      }),
    );

    // Index pour le nettoyage des codes expirés
    await queryRunner.createIndex(
      'password_reset_codes',
      new TableIndex({
        name: 'IDX_password_reset_codes_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    // Clé étrangère vers la table users
    await queryRunner.createForeignKey(
      'password_reset_codes',
      new TableForeignKey({
        name: 'FK_password_reset_codes_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Supprimer les codes si l'utilisateur est supprimé
        onUpdate: 'CASCADE',
      }),
    );

    // Trigger pour mise à jour automatique de updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_password_reset_codes_updated_at
      BEFORE UPDATE ON "${schema}"."password_reset_codes"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Commentaires sur la table
    await queryRunner.query(`
      COMMENT ON TABLE "${schema}"."password_reset_codes" IS 'Codes temporaires à 4 chiffres pour la réinitialisation de mot de passe';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer le trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_password_reset_codes_updated_at ON "${schema}"."password_reset_codes"`,
    );

    // Supprimer la fonction (seulement si elle n'est pas utilisée ailleurs)
    // await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column()');

    // Supprimer les index
    await queryRunner.dropIndex(
      `${schema}.password_reset_codes`,
      'IDX_password_reset_codes_expires_at',
    );
    await queryRunner.dropIndex(
      `${schema}.password_reset_codes`,
      'IDX_password_reset_codes_user_expires',
    );
    await queryRunner.dropIndex(
      `${schema}.password_reset_codes`,
      'IDX_password_reset_codes_code_unique',
    );

    // Supprimer la clé étrangère
    await queryRunner.dropForeignKey(
      `${schema}.password_reset_codes`,
      'FK_password_reset_codes_user',
    );

    // Supprimer la table
    await queryRunner.dropTable(`${schema}.password_reset_codes`);
  }
}
