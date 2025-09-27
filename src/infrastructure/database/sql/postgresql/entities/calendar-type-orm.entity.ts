/**
 * 🏗️ INFRASTRUCTURE - CalendarType ORM Entity
 *
 * Entité TypeORM pour la persistence des types de calendrier
 * Mapping avec l'entité Domain CalendarType
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('calendar_types')
@Index(['business_id', 'code'], { unique: true })
@Index(['business_id'])
export class CalendarTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: false })
  @Index()
  business_id!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', nullable: false, default: '{}' })
  settings!: Record<string, any>;

  @Column({ type: 'boolean', nullable: false, default: true })
  is_active!: boolean;

  @Column({
    type: 'uuid',
    nullable: false,
    comment: 'UUID of user who created this calendar type',
  })
  created_by!: string;

  @Column({
    type: 'uuid',
    nullable: false,
    comment: 'UUID of user who last updated this calendar type',
  })
  updated_by!: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Creation timestamp',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: 'Last update timestamp',
  })
  updated_at!: Date;
}
