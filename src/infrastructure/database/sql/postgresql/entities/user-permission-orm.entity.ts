/**
 * 🔐 USER PERMISSION ORM ENTITY - Infrastructure Layer
 *
 * Entité ORM pour la persistence des permissions utilisateurs en base de données.
 * Table simple pour gérer les permissions CRUD granulaires.
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_permissions')
@Index(['user_id', 'action', 'resource', 'business_id'], { unique: true })
@Index(['user_id'])
@Index(['resource', 'business_id'])
export class UserPermissionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'user_id' })
  user_id!: string;

  @Column('varchar', { length: 20 })
  action!: string; // CREATE, READ, UPDATE, DELETE, LIST, MANAGE

  @Column('varchar', { length: 50 })
  resource!: string; // USER, BUSINESS, PROSPECT, etc.

  @Column('uuid', { name: 'business_id', nullable: true })
  business_id!: string | null; // null = permission globale

  @Column('boolean', { name: 'is_granted', default: true })
  is_granted!: boolean; // true = accordée, false = refusée

  @Column('uuid', { name: 'granted_by' })
  granted_by!: string; // ID de l'utilisateur qui a accordé

  @CreateDateColumn({ name: 'granted_at' })
  granted_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
