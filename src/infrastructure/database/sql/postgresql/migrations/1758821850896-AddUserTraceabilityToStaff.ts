import { DatabaseSchemaError } from '@infrastructure/exceptions/infrastructure.exceptions';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTraceabilityToStaff1758821850896
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
