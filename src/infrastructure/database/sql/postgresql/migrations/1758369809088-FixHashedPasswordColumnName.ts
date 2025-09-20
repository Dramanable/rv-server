import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixHashedPasswordColumnName1758369809088
  implements MigrationInterface
{
  name = 'FixHashedPasswordColumnName1758369809088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Renommer la colonne hashedPassword en hashed_password
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "hashedPassword" TO "hashed_password"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Retour en arrière : renommer hashed_password en hashedPassword
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "hashed_password" TO "hashedPassword"`,
    );
  }
}
