/**
 * 🏥 INFRASTRUCTURE ORM ENTITY - ProfessionalRole
 * Clean Architecture - Infrastructure Layer
 * Entité ORM pour les rôles professionnels avec TypeORM
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('professional_roles')
export class ProfessionalRoleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: 'Code unique du rôle (ex: DOCTOR, NURSE)',
  })
  @Index('IDX_professional_roles_code')
  code!: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Nom technique du rôle en anglais',
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 150,
    name: 'display_name',
    comment: "Nom d'affichage localisé du rôle",
  })
  display_name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Catégorie professionnelle (MEDICAL, DENTAL, etc.)',
  })
  @Index('IDX_professional_roles_category')
  category!: string;

  @Column({
    type: 'text',
    comment: 'Description détaillée du rôle et responsabilités',
  })
  description!: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'can_lead',
    comment: 'Indique si le rôle peut diriger une équipe',
  })
  @Index('IDX_professional_roles_can_lead')
  can_lead!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: 'Statut actif/inactif du rôle',
  })
  @Index('IDX_professional_roles_active')
  is_active!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: 'Date et heure de création',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: 'Date et heure de dernière modification',
  })
  updated_at!: Date;
}

// Index composé pour optimiser les recherches fréquentes
@Index('IDX_professional_roles_category_active', ['category', 'is_active'])
export class ProfessionalRoleOrmEntityIndexes extends ProfessionalRoleOrmEntity {}
