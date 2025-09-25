import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveServiceCategoryAndAddManyToManyServiceTypes1758748293996
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
