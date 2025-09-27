import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 🏗️ PROFESSIONAL ORM ENTITY - Infrastructure Layer
 *
 * ⚠️ RÈGLE CRITIQUE : Cette entité NE DOIT CONTENIR AUCUNE LOGIQUE MÉTIER
 * Uniquement les annotations TypeORM et la définition des colonnes
 */
@Entity('professionals')
@Index('IDX_professionals_business_id', ['business_id'])
@Index('IDX_professionals_email', ['email'])
@Index('IDX_professionals_is_active', ['is_active'])
@Index('IDX_professionals_specialization', ['specialization'])
export class ProfessionalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'business_id', type: 'uuid', nullable: false })
  @Index()
  business_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  first_name!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  specialization?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_image_url?: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  @Index()
  is_active!: boolean;

  // ⚠️ TRAÇABILITÉ OBLIGATOIRE selon Copilot instructions
  @Column({ name: 'created_by', type: 'uuid', nullable: false })
  created_by!: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: false })
  updated_by!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
