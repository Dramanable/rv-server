import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Permission ORM Entity
 * Clean Architecture - Infrastructure Layer - Database Entity
 */
@Entity('permissions')
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: 'Unique permission name (e.g., MANAGE_APPOINTMENTS)',
  })
  @Index('IDX_permissions_name')
  name!: string;

  @Column({
    type: 'varchar',
    length: 200,
    comment: 'Human-readable display name for the permission',
  })
  display_name!: string;

  @Column({
    type: 'text',
    comment: 'Detailed description of what the permission allows',
  })
  description!: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Category grouping for the permission (e.g., APPOINTMENTS, STAFF)',
  })
  @Index('IDX_permissions_category')
  category!: string;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this is a system permission that cannot be modified',
  })
  @Index('IDX_permissions_is_system')
  is_system_permission!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether the permission is currently active',
  })
  @Index('IDX_permissions_is_active')
  is_active!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    comment: 'Creation timestamp',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    comment: 'Last update timestamp',
  })
  updated_at!: Date;

  // Index composé pour optimiser les requêtes fréquentes
  @Index('IDX_permissions_category_active', ['category', 'is_active'])
  // Cette annotation est décorative, l'index réel est créé dans la migration
  static readonly COMPOSITE_INDEX_MARKER = true;
}
