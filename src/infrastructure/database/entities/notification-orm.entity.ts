import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Entité ORM pour les notifications
 * Cette classe est responsable uniquement de la persistence en base de données
 */
@Entity('notifications')
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_id', type: 'varchar', length: 255 })
  recipient_id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 50 })
  channel!: string; // EMAIL, SMS, PUSH, IN_APP

  @Column({ type: 'varchar', length: 50 })
  priority!: string; // LOW, MEDIUM, HIGH, URGENT

  @Column({ type: 'varchar', length: 50 })
  status!: string; // PENDING, SENT, DELIVERED, READ, FAILED

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, any>;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sent_at!: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  delivered_at!: Date | null;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  read_at!: Date | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failure_reason!: string | null;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retry_count!: number;

  @Column({ name: 'scheduled_for', type: 'timestamp', nullable: true })
  scheduled_for!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
