/**
 * 🗄️ TYPEORM REPOSITORY - Password Reset Code Repository
 *
 * Implémentation TypeORM du repository de codes de réinitialisation de mot de passe.
 * Respect de Clean Architecture : Infrastructure implémente Domain.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull } from 'typeorm';
import { IPasswordResetCodeRepository } from '../../../../../domain/repositories/password-reset-code.repository';
import { PasswordResetCode } from '../../../../../domain/entities/password-reset-code.entity';
import { PasswordResetCodeEntity } from '../entities/password-reset-code.entity';

@Injectable()
export class PasswordResetCodeRepository
  implements IPasswordResetCodeRepository
{
  constructor(
    @InjectRepository(PasswordResetCodeEntity)
    private readonly repository: Repository<PasswordResetCodeEntity>,
  ) {}

  async save(resetCode: PasswordResetCode): Promise<void> {
    const entity = PasswordResetCodeEntity.fromDomain(resetCode);
    await this.repository.save(entity);
  }

  async findByCode(code: string): Promise<PasswordResetCode | null> {
    const entity = await this.repository.findOne({
      where: { code },
      relations: ['user'],
    });

    return entity ? entity.toDomain() : null;
  }

  async findValidCodesByUserId(userId: string): Promise<PasswordResetCode[]> {
    const entities = await this.repository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => entity.toDomain());
  }

  async invalidateUserCodes(userId: string): Promise<void> {
    const now = new Date();

    await this.repository.update(
      {
        userId,
        expiresAt: MoreThan(now),
        usedAt: IsNull(),
      },
      {
        usedAt: now,
      },
    );
  }

  async markAsUsed(code: string): Promise<void> {
    await this.repository.update({ code }, { usedAt: new Date() });
  }

  async deleteExpiredCodes(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  async deleteUserCodes(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async isCodeValid(code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        code,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
    });

    return count > 0;
  }

  // === MÉTHODES UTILITAIRES POUR LA MAINTENANCE ===

  /**
   * Nettoie automatiquement les codes expirés (tâche cron)
   */
  async cleanupExpiredCodes(): Promise<{ deletedCount: number }> {
    const deletedCount = await this.deleteExpiredCodes();
    return { deletedCount };
  }

  /**
   * Statistiques pour monitoring
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    expired: number;
    used: number;
  }> {
    const now = new Date();

    const [total, active, expired, used] = await Promise.all([
      this.repository.count(),
      this.repository.count({
        where: {
          expiresAt: MoreThan(now),
          usedAt: IsNull(),
        },
      }),
      this.repository.count({
        where: {
          expiresAt: LessThan(now),
        },
      }),
      this.repository.count({
        where: {
          usedAt: MoreThan(new Date(0)), // Not null
        },
      }),
    ]);

    return { total, active, expired, used };
  }

  /**
   * Trouve les codes récents pour un utilisateur (anti-spam)
   */
  async findRecentCodesByUserId(
    userId: string,
    sinceMinutes: number,
  ): Promise<PasswordResetCode[]> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - sinceMinutes);

    const entities = await this.repository.find({
      where: {
        userId,
        createdAt: MoreThan(since),
      },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => entity.toDomain());
  }
}
