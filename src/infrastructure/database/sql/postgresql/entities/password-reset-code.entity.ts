/**
 * 🗄️ TYPEORM ENTITY - Password Reset Code
 *
 * Entité TypeORM pour la persistance des codes de réinitialisation de mot de passe.
 * Mapping entre l'entité domaine et la base de données PostgreSQL.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserOrmEntity } from './user-orm.entity';
import { PasswordResetCode } from '../../../../../domain/entities/password-reset-code.entity';

@Entity('password_reset_codes')
@Index(['code'], { unique: true })
@Index(['user_id', 'expires_at'])
@Index(['expires_at']) // Pour le nettoyage des codes expirés
export class PasswordResetCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 4,
    comment: 'Code à 4 chiffres pour la réinitialisation',
  })
  code!: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    comment: "Date d'expiration du code (15 minutes après création)",
  })
  expiresAt!: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @Column({
    name: 'used_at',
    type: 'timestamp with time zone',
    nullable: true,
    comment: "Date d'utilisation du code (null si non utilisé)",
  })
  usedAt!: Date | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;

  @ManyToOne(() => UserOrmEntity, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user?: UserOrmEntity;

  /**
   * Convertit l'entité TypeORM en entité domaine
   */
  toDomain(): PasswordResetCode {
    return PasswordResetCode.fromData({
      id: this.id,
      code: this.code,
      userId: this.userId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      usedAt: this.usedAt,
    });
  }

  /**
   * Crée une entité TypeORM à partir d'une entité domaine
   */
  static fromDomain(domainEntity: PasswordResetCode): PasswordResetCodeEntity {
    const entity = new PasswordResetCodeEntity();

    if (domainEntity.id) {
      entity.id = domainEntity.id;
    }
    entity.code = domainEntity.code;
    entity.userId = domainEntity.userId;
    entity.expiresAt = domainEntity.expiresAt;
    entity.createdAt = domainEntity.createdAt;
    entity.usedAt = domainEntity.usedAt;

    return entity;
  }
}
