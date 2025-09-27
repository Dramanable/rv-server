/**
 * 🗄️ MIGRATION TYPEORM - CreateProfessionalRolesTable
 * Clean Architecture - Infrastructure Layer
 * Migration pour créer la table des rôles professionnels
 */

import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { generateId } from '@shared/utils/id.utils';

export class CreateProfessionalRolesTable1727549200000
  implements MigrationInterface
{
  name = 'CreateProfessionalRolesTable1727549200000';

  /**
   * 🎯 PLAN DE MIGRATION SÉCURISÉ
   *
   * 📊 OBJECTIF : Créer la table professional_roles pour gérer les rôles professionnels
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Utilisation du schéma dynamique depuis variables d'environnement
   * - Contraintes d'unicité sur le code
   * - Index pour optimiser les recherches fréquentes
   * - Rollback complet possible via méthode down()
   *
   * ✅ STRUCTURE TABLE :
   * - id (UUID, clé primaire)
   * - code (VARCHAR, unique, pour identification)
   * - name (VARCHAR, nom technique)
   * - display_name (VARCHAR, nom d'affichage localisé)
   * - category (VARCHAR, catégorie professionnelle)
   * - description (TEXT, description détaillée)
   * - can_lead (BOOLEAN, peut diriger une équipe)
   * - is_active (BOOLEAN, statut actif/inactif)
   * - created_at (TIMESTAMP, horodatage création)
   * - updated_at (TIMESTAMP, horodatage dernière modification)
   */

  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name: ${schema}`);
    }

    return schema;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier que le schéma existe
    const schemaExists = await queryRunner.query(
      `
      SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata
        WHERE schema_name = $1
      ) as exists
    `,
      [schema],
    );

    if (!schemaExists[0]?.exists) {
      throw new Error(`Schema "${schema}" does not exist`);
    }

    // Créer la table professional_roles
    await queryRunner.createTable(
      new Table({
        name: `${schema}.professional_roles`,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
            comment: 'Identifiant unique du rôle professionnel',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
            comment: 'Code unique du rôle (ex: DOCTOR, NURSE)',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Nom technique du rôle en anglais',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '150',
            isNullable: false,
            comment: "Nom d'affichage localisé du rôle",
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Catégorie professionnelle (MEDICAL, DENTAL, etc.)',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
            comment: 'Description détaillée du rôle et responsabilités',
          },
          {
            name: 'can_lead',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Indique si le rôle peut diriger une équipe',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Statut actif/inactif du rôle',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Date et heure de création',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Date et heure de dernière modification',
          },
        ],
      }),
      true,
    );

    // Créer index pour améliorer les performances de recherche
    await queryRunner.query(`
      CREATE INDEX "IDX_professional_roles_code" ON "${schema}"."professional_roles" ("code")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professional_roles_category" ON "${schema}"."professional_roles" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professional_roles_active" ON "${schema}"."professional_roles" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_professional_roles_can_lead" ON "${schema}"."professional_roles" ("can_lead")
    `);

    // Index composé pour recherches fréquentes
    await queryRunner.query(`
      CREATE INDEX "IDX_professional_roles_category_active" ON "${schema}"."professional_roles" ("category", "is_active")
    `);

    // Insérer les rôles prédéfinis (MVP neutres)
    await queryRunner.query(`
      INSERT INTO "${schema}"."professional_roles" (id, code, name, display_name, category, description, can_lead, is_active, created_at, updated_at)
      VALUES 
        ('${generateId()}', 'SPECIALIST', 'Specialist', 'Spécialiste', 'SERVICE_PROVIDER', 'Professionnel spécialisé dans la prestation de services', true, true, NOW(), NOW()),
        ('${generateId()}', 'ASSISTANT', 'Assistant', 'Assistant(e)', 'SUPPORT', 'Assistant pour l''accompagnement et le support', false, true, NOW(), NOW()),
        ('${generateId()}', 'SUPERVISOR', 'Supervisor', 'Superviseur', 'MANAGEMENT', 'Responsable de la supervision et du management', true, true, NOW(), NOW()),
        ('${generateId()}', 'COORDINATOR', 'Coordinator', 'Coordinateur', 'MANAGEMENT', 'Responsable de la coordination des activités', true, true, NOW(), NOW()),
        ('${generateId()}', 'TECHNICIAN', 'Technician', 'Technicien', 'TECHNICAL', 'Support technique et maintenance', false, true, NOW(), NOW()),
        ('${generateId()}', 'RECEPTIONIST', 'Receptionist', 'Réceptionniste', 'ADMINISTRATIVE', 'Accueil et gestion administrative', false, true, NOW(), NOW())
    `);

    console.log(
      '🎯 Professional roles table created with predefined MVP roles',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Supprimer les index
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_professional_roles_code"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_professional_roles_category"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_professional_roles_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_professional_roles_can_lead"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "${schema}"."IDX_professional_roles_category_active"`,
    );

    // Supprimer la table
    await queryRunner.dropTable(`${schema}.professional_roles`);
  }

  /**
   * Insérer les rôles professionnels prédéfinis
   */
  private async insertPredefinedRoles(
    queryRunner: QueryRunner,
    schema: string,
  ): Promise<void> {
    const predefinedRoles = [
      {
        code: 'DOCTOR',
        name: 'Doctor',
        displayName: 'Médecin',
        category: 'MEDICAL',
        description:
          'Professionnel de santé qualifié pour diagnostiquer et traiter les maladies',
        canLead: true,
      },
      {
        code: 'SURGEON',
        name: 'Surgeon',
        displayName: 'Chirurgien',
        category: 'MEDICAL',
        description: 'Médecin spécialisé dans les interventions chirurgicales',
        canLead: true,
      },
      {
        code: 'NURSE',
        name: 'Nurse',
        displayName: 'Infirmier(ère)',
        category: 'MEDICAL',
        description:
          'Professionnel de santé spécialisé dans les soins aux patients',
        canLead: false,
      },
      {
        code: 'DENTIST',
        name: 'Dentist',
        displayName: 'Dentiste',
        category: 'DENTAL',
        description:
          'Professionnel de santé spécialisé dans les soins dentaires',
        canLead: true,
      },
      {
        code: 'DENTAL_HYGIENIST',
        name: 'Dental Hygienist',
        displayName: 'Hygiéniste Dentaire',
        category: 'DENTAL',
        description:
          "Spécialiste de l'hygiène et des soins préventifs dentaires",
        canLead: false,
      },
      {
        code: 'PSYCHOLOGIST',
        name: 'Psychologist',
        displayName: 'Psychologue',
        category: 'PSYCHOLOGICAL',
        description:
          "Professionnel spécialisé dans l'étude et le traitement des troubles mentaux",
        canLead: true,
      },
      {
        code: 'LAWYER',
        name: 'Lawyer',
        displayName: 'Avocat',
        category: 'LEGAL',
        description:
          'Professionnel du droit représentant et conseillant les clients',
        canLead: true,
      },
      {
        code: 'CONSULTANT',
        name: 'Consultant',
        displayName: 'Consultant',
        category: 'CONSULTANCY',
        description:
          'Expert fournissant des conseils spécialisés dans son domaine',
        canLead: true,
      },
    ];

    for (const role of predefinedRoles) {
      await queryRunner.query(
        `
        INSERT INTO "${schema}"."professional_roles" 
        (code, name, display_name, category, description, can_lead, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [
          role.code,
          role.name,
          role.displayName,
          role.category,
          role.description,
          role.canLead,
          true, // is_active
        ],
      );
    }
  }
}
