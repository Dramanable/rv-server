import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 🏢 Business Context ORM Entity
 *
 * Entité persistante pour les contextes métier hiérarchiques.
 * Supporte la structure : Business > Location > Department
 *
 * 📋 Fonctionnalités :
 * - Hiérarchie flexible (parent/enfant)
 * - Types de contexte (BUSINESS, LOCATION, DEPARTMENT)
 * - Validation des contraintes métier
 * - Audit trail complet
 * - Support multi-tenant
 */
@Entity('business_contexts')
@Index(['type', 'isActive'])
@Index(['businessId', 'type'])
@Index(['parentContextId'])
export class BusinessContextOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 🏢 Identification et hiérarchie
  @Column({ name: 'name', type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type!: string; // BUSINESS, LOCATION, DEPARTMENT

  @Column({ name: 'business_id', type: 'uuid' })
  businessId!: string;

  @Column({ name: 'parent_context_id', type: 'uuid', nullable: true })
  parentContextId!: string | null;

  // 📝 Métadonnées descriptives
  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: true })
  code!: string | null;

  // 🎯 Configuration
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'settings', type: 'jsonb', nullable: true })
  settings!: Record<string, any> | null;

  // 📊 Statistiques et métadonnées
  @Column({ name: 'level', type: 'integer', default: 0 })
  level!: number; // 0=Business, 1=Location, 2=Department

  @Column({ name: 'path', type: 'text', nullable: true })
  path!: string | null; // Chemin hiérarchique pour requêtes

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder!: number;

  // 👥 Audit trail - Traçabilité obligatoire
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy!: string;

  // ⏱️ Timestamps automatiques
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  // 🔄 Optimistic locking
  @Column({ name: 'version', type: 'integer', default: 1 })
  version!: number;

  // 🏗️ Relations métier (pour future extension)
  @Column({ name: 'external_id', type: 'varchar', length: 100, nullable: true })
  externalId!: string | null; // ID externe pour intégrations

  @Column({ name: 'timezone', type: 'varchar', length: 50, nullable: true })
  timezone!: string | null; // Timezone pour locations/departments
}
