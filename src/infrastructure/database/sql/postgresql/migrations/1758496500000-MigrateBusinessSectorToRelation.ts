import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class MigrateBusinessSectorToRelation1758496500000
  implements MigrationInterface
{
  name = 'MigrateBusinessSectorToRelation1758496500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Utiliser la variable d'environnement pour le schéma
    const schema = process.env.DB_SCHEMA || 'rvproject_schema';

    // 1. Ajouter la nouvelle colonne business_sector_id
    await queryRunner.addColumn(
      `${schema}.businesses`,
      new TableColumn({
        name: 'business_sector_id',
        type: 'uuid',
        isNullable: true, // Temporairement nullable pour la migration
      }),
    );

    // 2. Créer des business sectors par défaut pour chaque enum existant
    const defaultSectors = [
      {
        code: 'LEGAL',
        name: 'Services Juridiques',
        description: 'Avocats, notaires, conseils juridiques',
      },
      {
        code: 'MEDICAL',
        name: 'Services Médicaux',
        description: 'Médecins, spécialistes, cliniques',
      },
      {
        code: 'HEALTH',
        name: 'Santé & Bien-être',
        description: 'Kinésithérapeutes, ostéopathes, services de santé',
      },
      {
        code: 'BEAUTY',
        name: 'Beauté & Esthétique',
        description: 'Salons de beauté, esthéticienne, coiffeurs',
      },
      {
        code: 'CONSULTING',
        name: 'Conseil & Expertise',
        description: 'Consultants, experts, conseil en management',
      },
      {
        code: 'FINANCE',
        name: 'Services Financiers',
        description: 'Comptables, conseillers financiers, banques',
      },
      {
        code: 'EDUCATION',
        name: 'Éducation & Formation',
        description: 'Écoles, formations, cours particuliers',
      },
      {
        code: 'WELLNESS',
        name: 'Bien-être & Relaxation',
        description: 'Spas, massage, centres de bien-être',
      },
      {
        code: 'AUTOMOTIVE',
        name: 'Automobile',
        description: 'Garages, concessionnaires, services auto',
      },
      {
        code: 'OTHER',
        name: 'Autres Services',
        description: 'Autres types de services',
      },
    ];

    // Créer ou récupérer un utilisateur système pour les migrations
    let systemUserId: string;

    const systemUserQuery = await queryRunner.query(`
      SELECT id FROM ${schema}.users WHERE email = 'system@migration.local' LIMIT 1
    `);

    if (systemUserQuery.length === 0) {
      // Créer un utilisateur système pour les migrations
      const result = await queryRunner.query(`
        INSERT INTO ${schema}.users (email, first_name, last_name, username, hashed_password, role, is_active, is_verified)
        VALUES ('system@migration.local', 'System', 'Migration', 'system_migration', '$2b$10$dummy.hash.for.migration.only', 'ADMIN', true, true)
        RETURNING id
      `);
      systemUserId = result[0].id;
    } else {
      systemUserId = systemUserQuery[0].id;
    }

    // Insérer les business sectors par défaut
    for (const sector of defaultSectors) {
      await queryRunner.query(`
        INSERT INTO ${schema}.business_sectors (code, name, description, is_active, created_by)
        VALUES (
          '${sector.code}',
          '${sector.name}',
          '${sector.description}',
          true,
          '${systemUserId}'
        )
        ON CONFLICT (code) DO NOTHING;
      `);
    }

    // 3. Mettre à jour business_sector_id en fonction de l'enum sector existant
    await queryRunner.query(`
      UPDATE ${schema}.businesses
      SET business_sector_id = bs.id
      FROM ${schema}.business_sectors bs
      WHERE businesses.sector::text = bs.code;
    `);

    // 4. Rendre business_sector_id NOT NULL
    await queryRunner.changeColumn(
      `${schema}.businesses`,
      'business_sector_id',
      new TableColumn({
        name: 'business_sector_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    // 5. Créer la foreign key
    await queryRunner.createForeignKey(
      `${schema}.businesses`,
      new TableForeignKey({
        columnNames: ['business_sector_id'],
        referencedTableName: `${schema}.business_sectors`,
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        name: 'FK_businesses_business_sector_id',
      }),
    );

    // 6. Supprimer l'ancienne colonne enum sector
    await queryRunner.dropColumn(`${schema}.businesses`, 'sector');

    // 7. Créer un index sur la nouvelle colonne
    await queryRunner.query(`
      CREATE INDEX "IDX_businesses_business_sector_id"
      ON ${schema}.businesses (business_sector_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'rvproject_schema';

    // 1. Recréer la colonne enum sector
    await queryRunner.addColumn(
      `${schema}.businesses`,
      new TableColumn({
        name: 'sector',
        type: 'enum',
        enum: [
          'LEGAL',
          'MEDICAL',
          'HEALTH',
          'BEAUTY',
          'CONSULTING',
          'FINANCE',
          'EDUCATION',
          'WELLNESS',
          'AUTOMOTIVE',
          'OTHER',
        ],
        default: "'OTHER'",
      }),
    );

    // 2. Remplir sector à partir de business_sector_id
    await queryRunner.query(`
      UPDATE ${schema}.businesses
      SET sector = bs.code::${schema}.businesses_sector_enum
      FROM ${schema}.business_sectors bs
      WHERE businesses.business_sector_id = bs.id;
    `);

    // 3. Supprimer la foreign key
    await queryRunner.dropForeignKey(
      `${schema}.businesses`,
      'FK_businesses_business_sector_id',
    );

    // 4. Supprimer la colonne business_sector_id (TypeORM supprime automatiquement l'index)
    await queryRunner.dropColumn(`${schema}.businesses`, 'business_sector_id');

    // 6. Recréer l'index sur sector
    await queryRunner.query(`
      CREATE INDEX "IDX_businesses_sector" ON ${schema}.businesses (sector);
    `);
  }
}
