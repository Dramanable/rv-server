import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateSkillsTable1703701200000 implements MigrationInterface {
  name = 'CreateSkillsTable1703701200000';

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

    // ✅ Créer la table skills avec tous les index et contraintes
    await queryRunner.createTable(
      new Table({
        name: `${schema}.skills`,
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
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_critical',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          // ⚠️ TRAÇABILITÉ OBLIGATOIRE
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who created this skill',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who last updated this skill',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Creation timestamp',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Last update timestamp',
          },
        ],
      }),
      true,
    );

    // ✅ Index pour optimisation des requêtes business
    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_business_id',
        columnNames: ['business_id'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_business_category',
        columnNames: ['business_id', 'category'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_business_active',
        columnNames: ['business_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_business_critical',
        columnNames: ['business_id', 'is_critical'],
      }),
    );

    // ✅ CRITIQUE : Index unique pour éviter les doublons de skills par business
    await queryRunner.createIndex(
      `${schema}.skills`,
      new TableIndex({
        name: 'IDX_skills_business_name_unique',
        columnNames: ['business_id', 'name'],
        isUnique: true,
        where: 'is_active = true',
      }),
    );

    // ✅ Foreign Key vers businesses
    await queryRunner.createForeignKey(
      `${schema}.skills`,
      new TableForeignKey({
        columnNames: ['business_id'],
        referencedTableName: `${schema}.businesses`,
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_skills_business_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ Rollback complet dans l'ordre inverse
    await queryRunner.dropForeignKey(
      `${schema}.skills`,
      'FK_skills_business_id',
    );
    await queryRunner.dropIndex(
      `${schema}.skills`,
      'IDX_skills_business_name_unique',
    );
    await queryRunner.dropIndex(
      `${schema}.skills`,
      'IDX_skills_business_critical',
    );
    await queryRunner.dropIndex(
      `${schema}.skills`,
      'IDX_skills_business_active',
    );
    await queryRunner.dropIndex(
      `${schema}.skills`,
      'IDX_skills_business_category',
    );
    await queryRunner.dropIndex(`${schema}.skills`, 'IDX_skills_category');
    await queryRunner.dropIndex(`${schema}.skills`, 'IDX_skills_name');
    await queryRunner.dropIndex(`${schema}.skills`, 'IDX_skills_business_id');
    await queryRunner.dropTable(`${schema}.skills`);
  }
}
