/**
 * 🔐 INFRASTRUCTURE REPOSITORY - Refresh Token TypeORM Repository
 *
 * Implémentation TypeORM du repository RefreshToken.
 * Respecte les principes Clean Architecture et SOLID.
 *
 * CLEAN ARCHITECTURE :
 * - Couche Infrastructure (adapter)
 * - Implémente l'interface du domaine
 * - Isole la logique de persistance TypeORM
 */

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { Logger } from "../../../../../application/ports/logger.port";
import { RefreshToken } from "../../../../../domain/entities/refresh-token.entity";
import { RefreshTokenRepository } from "../../../../../domain/repositories/refresh-token.repository.interface";
import { RefreshTokenOrmEntity } from "../entities/refresh-token-orm.entity";

export class RefreshTokenOrmRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repository: Repository<RefreshTokenOrmEntity>,
    private readonly logger: Logger,
  ) {}

  /**
   * Sauvegarde un refresh token
   */
  async save(token: RefreshToken): Promise<RefreshToken> {
    try {
      const ormEntity = this.toOrmEntity(token);
      const savedEntity = await this.repository.save(ormEntity);

      this.logger.debug("Refresh token saved successfully", {
        tokenId: savedEntity.id,
        userId: savedEntity.userId,
      });

      return this.toDomainEntity(savedEntity);
    } catch (error) {
      this.logger.error(
        "Failed to save refresh token",
        error instanceof Error ? error : new Error(String(error)),
        { userId: token.userId },
      );
      throw error;
    }
  }

  /**
   * Trouve un token par sa valeur hashée
   */
  async findByToken(tokenHash: string): Promise<RefreshToken | null> {
    try {
      const ormEntity = await this.repository.findOne({
        where: { token: tokenHash },
      });

      if (!ormEntity) {
        this.logger.debug("Refresh token not found", { tokenHash });
        return null;
      }

      return this.toDomainEntity(ormEntity);
    } catch (error) {
      this.logger.error(
        "Failed to find refresh token by token",
        error instanceof Error ? error : new Error(String(error)),
        { tokenHash },
      );
      throw error;
    }
  }

  /**
   * Trouve tous les tokens d'un utilisateur
   */
  async findByUserId(userId: string): Promise<RefreshToken[]> {
    try {
      const ormEntities = await this.repository.find({
        where: { userId, isRevoked: false },
        order: { createdAt: "DESC" },
      });

      this.logger.debug("Found refresh tokens for user", {
        userId,
        count: ormEntities.length,
      });

      return ormEntities.map((entity) => this.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        "Failed to find refresh tokens by user ID",
        error instanceof Error ? error : new Error(String(error)),
        { userId },
      );
      throw error;
    }
  }

  /**
   * Révoque tous les tokens d'un utilisateur
   */
  async deleteByUserId(userId: string): Promise<void> {
    try {
      const result = await this.repository.delete({ userId });

      this.logger.info("Deleted refresh tokens for user", {
        userId,
        deletedCount: result.affected || 0,
      });
    } catch (error) {
      this.logger.error(
        "Failed to delete refresh tokens by user ID",
        error instanceof Error ? error : new Error(String(error)),
        { userId },
      );
      throw error;
    }
  }

  /**
   * Révoque tous les tokens d'un utilisateur (alias pour deleteByUserId)
   */
  async revokeAllByUserId(userId: string): Promise<void> {
    try {
      const result = await this.repository.update(
        { userId },
        { isRevoked: true },
      );

      this.logger.info("Revoked all refresh tokens for user", {
        userId,
        revokedCount: result.affected || 0,
      });
    } catch (error) {
      this.logger.error(
        "Failed to revoke refresh tokens by user ID",
        error instanceof Error ? error : new Error(String(error)),
        { userId },
      );
      throw error;
    }
  }

  /**
   * Révoque un token spécifique
   */
  async revokeByToken(tokenHash: string): Promise<void> {
    try {
      const result = await this.repository.update(
        { token: tokenHash },
        { isRevoked: true },
      );

      this.logger.debug("Revoked refresh token", {
        tokenHash,
        revokedCount: result.affected || 0,
      });
    } catch (error) {
      this.logger.error(
        "Failed to revoke refresh token",
        error instanceof Error ? error : new Error(String(error)),
        { tokenHash },
      );
      throw error;
    }
  }

  /**
   * Supprime tous les tokens expirés et révoqués
   */
  async deleteExpiredTokens(): Promise<number> {
    try {
      const now = new Date();
      const result = await this.repository
        .createQueryBuilder()
        .delete()
        .where("expiresAt < :now", { now })
        .execute();

      const deletedCount = result.affected || 0;
      this.logger.info("Deleted expired refresh tokens", {
        deletedCount,
        timestamp: now,
      });

      return deletedCount;
    } catch (error) {
      this.logger.error(
        "Failed to delete expired refresh tokens",
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  /**
   * Convertit une entité domaine vers une entité ORM
   */
  private toOrmEntity(token: RefreshToken): RefreshTokenOrmEntity {
    const ormEntity = new RefreshTokenOrmEntity();

    ormEntity.id = token.id;
    ormEntity.userId = token.userId;
    ormEntity.token = token.tokenHash;
    ormEntity.expiresAt = token.expiresAt;
    ormEntity.isRevoked = token.isRevoked;
    ormEntity.createdAt = token.createdAt;

    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers une entité domaine
   */
  private toDomainEntity(ormEntity: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.reconstruct(
      ormEntity.id,
      ormEntity.userId,
      ormEntity.token,
      ormEntity.expiresAt,
      {}, // metadata vide pour l'instant
      ormEntity.isRevoked,
      undefined,
      ormEntity.createdAt,
    );
  }
}
