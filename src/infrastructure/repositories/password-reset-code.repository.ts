import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, IsNull } from 'typeorm';
import { PasswordResetCode } from '../../domain/entities/password-reset-code.entity';
import { IPasswordResetCodeRepository } from '../../domain/repositories/password-reset-code.repository';

@Injectable()
export class PasswordResetCodeRepository
  implements IPasswordResetCodeRepository
{
  constructor(
    @InjectRepository(PasswordResetCode)
    private readonly repository: Repository<PasswordResetCode>,
  ) {}

  async save(code: PasswordResetCode): Promise<void> {
    await this.repository.save(code);
  }

  async findByCode(code: string): Promise<PasswordResetCode | null> {
    const resetCode = await this.repository.findOne({
      where: { code },
      relations: ['user'],
    });
    return resetCode || null;
  }

  async findActiveByUserId(userId: string): Promise<PasswordResetCode | null> {
    const resetCode = await this.repository.findOne({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return resetCode || null;
  }

  async countRecentByUserId(
    userId: string,
    sinceMinutes: number,
  ): Promise<number> {
    const since = new Date();
    since.setMinutes(since.getMinutes() - sinceMinutes);

    return await this.repository.count({
      where: {
        userId,
        createdAt: MoreThan(since),
      },
    });
  }

  async hasValidCodeForUser(userId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
    });
    return count > 0;
  }

  async markAsUsed(codeString: string): Promise<void> {
    await this.repository.update(
      { code: codeString },
      {
        usedAt: new Date(),
      },
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async deleteUserCodes(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async invalidateUserCodes(userId: string): Promise<void> {
    await this.repository.update(
      { userId, usedAt: IsNull() },
      { usedAt: new Date() },
    );
  }

  async findValidCodesByUserId(userId: string): Promise<PasswordResetCode[]> {
    return await this.repository.find({
      where: {
        userId,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteExpiredCodes(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected || 0;
  }

  async isCodeValid(code: string): Promise<boolean> {
    const resetCode = await this.repository.findOne({
      where: {
        code,
        expiresAt: MoreThan(new Date()),
        usedAt: IsNull(),
      },
    });
    return resetCode !== null;
  }
}
