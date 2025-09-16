/**
 * 🗑️ Delete User Use Case
 *
 * Règles métier pour la suppression d'utilisateurs avec logging et i18n
 */

import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRole, Permission } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { ICacheService } from '../../ports/cache.port';
import {
  UserNotFoundError,
  InsufficientPermissionsError,
  SelfDeletionError,
} from '../../../domain/exceptions/user.exceptions';

// DTOs
export interface DeleteUserRequest {
  userId: string;
  requestingUserId: string;
}

export interface DeleteUserResponse {
  success: boolean;
  deletedUserId: string;
  deletedAt: Date;
}

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: 'DeleteUser',
      requestingUserId: request.requestingUserId,
      targetUserId: request.userId,
    };

    this.logger.info(
      this.i18n.t('operations.user.deletion_attempt', {
        userId: request.userId,
      }),
      requestContext,
    );

    try {
      // 1. Validation de l'utilisateur demandeur
      this.logger.debug(
        this.i18n.t('info.user.validation_start'),
        requestContext,
      );

      const requestingUser = await this.userRepository.findById(
        request.requestingUserId,
      );
      if (!requestingUser) {
        this.logger.warn(
          this.i18n.t('warnings.user.not_found'),
          requestContext,
        );
        throw new UserNotFoundError(request.requestingUserId);
      }

      // 2. Validation de l'utilisateur cible
      const targetUser = await this.userRepository.findById(request.userId);
      if (!targetUser) {
        this.logger.warn(
          this.i18n.t('warnings.user.target_not_found', {
            userId: request.userId,
          }),
          requestContext,
        );
        throw new UserNotFoundError(request.userId);
      }

      // 3. Vérification des permissions
      this.logger.debug(
        this.i18n.t('info.permission.check', { operation: 'DeleteUser' }),
        requestContext,
      );
      this.validatePermissions(requestingUser, targetUser);

      // 4. Invalider le cache de l'utilisateur avant suppression
      try {
        await this.cacheService.invalidateUserCache(request.userId);
        this.logger.debug(
          this.i18n.t('infrastructure.cache.user_cache_invalidated'),
          {
            ...requestContext,
            invalidatedUserId: request.userId,
          },
        );
      } catch (cacheError) {
        // Ne pas faire échouer l'opération si le cache échoue
        this.logger.warn(
          this.i18n.t('infrastructure.cache.user_cache_invalidation_failed'),
          {
            ...requestContext,
            cacheError: (cacheError as Error).message,
          },
        );
      }

      // 5. Suppression de l'utilisateur
      await this.userRepository.delete(request.userId);

      const duration = Date.now() - startTime;

      // Log de succès avec détails
      this.logger.info(
        this.i18n.t('success.user.deletion_success', {
          email: targetUser.email.value,
          requestingUser: requestingUser.email.value,
        }),
        { ...requestContext, duration },
      );

      // Audit trail traduit
      this.logger.audit(
        this.i18n.t('audit.user.deleted'),
        request.requestingUserId,
        {
          targetUserId: targetUser.id,
          targetEmail: targetUser.email.value,
          targetRole: targetUser.role,
        },
      );

      // 5. Retour de la réponse
      return {
        success: true,
        deletedUserId: request.userId,
        deletedAt: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        this.i18n.t('operations.failed', { operation: 'DeleteUser' }),
        error as Error,
        { ...requestContext, duration },
      );
      throw error;
    }
  }

  private validatePermissions(requestingUser: User, targetUser: User): void {
    // Interdiction de se supprimer soi-même
    if (requestingUser.id === targetUser.id) {
      this.logger.warn(this.i18n.t('warnings.user.self_deletion_forbidden'), {
        requestingUserId: requestingUser.id,
      });
      throw new SelfDeletionError(requestingUser.id);
    }

    // Vérification de la permission DELETE_USER
    if (!requestingUser.hasPermission(Permission.MANAGE_ALL_STAFF)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId: requestingUser.id,
        requestingUserRole: requestingUser.role,
        requiredPermission: Permission.MANAGE_ALL_STAFF,
      });
      throw new InsufficientPermissionsError(
        Permission.MANAGE_ALL_STAFF,
        requestingUser.role,
      );
    }

    // Les managers ne peuvent supprimer que des utilisateurs réguliers
    if (requestingUser.role === UserRole.LOCATION_MANAGER) {
      if (
        targetUser.role === UserRole.LOCATION_MANAGER ||
        targetUser.role === UserRole.PLATFORM_ADMIN
      ) {
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'manager_cannot_delete_manager_or_admin',
          requestingUserId: requestingUser.id,
          targetUserRole: targetUser.role,
        });
        throw new InsufficientPermissionsError(
          'DELETE_MANAGER_OR_ADMIN',
          requestingUser.role,
        );
      }
    }
  }
}
