import { MigrationInterface, QueryRunner } from 'typeorm';
import { getSchemaName } from '../utils/migration-utils';

export class CreateCustomSchema1695825500000 implements MigrationInterface {
  name = 'CreateCustomSchema1695825500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schemaName = getSchemaName();

    // Créer le schéma personnalisé pour l'application
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    // Créer l'extension UUID dans le schéma personnalisé
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "${schemaName}"`,
    );

    // S'assurer que l'extension est disponible dans le chemin de recherche
    await queryRunner.query(`SET search_path TO "${schemaName}", public`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schemaName = getSchemaName();

    // Supprimer l'extension du schéma (optionnel, peut être conservée)
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE`);

    // Supprimer le schéma personnalisé (attention : supprime toutes les tables)
    await queryRunner.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  }
}
