/**
 * 🗑️ DELETE USER USE CASE - Clean Architecture
 *
 * Use Case pour la suppression d'utilisateurs avec permissions strictes par rôle
 * Application Layer      case UserRole.LOCATION_MANAGER: {
        // LOCATION_MANAGER peut supprimer seulement les utilisateurs opérationnels
        const allowedTargetsForManager = [
          UserRole.DEPARTMENT_HEAD,
          UserRole.SENIOR_PRACTITIONER,
          UserRole.PRACTITIONER,
          UserRole.JUNIOR_PRACTITIONER,
          UserRole.RECEPTIONIST,
          UserRole.ASSISTANT,
          UserRole.SCHEDULER,
          UserRole.CORPORATE_CLIENT,
          UserRole.VIP_CLIENT,
          UserRole.REGULAR_CLIENT,
        ];
        if (!allowedTargetsForManager.includes(targetRole)) {
          throw new ForbiddenError(
            `Location manager cannot delete ${targetRole} users`,
          );
        }
        return;
      }la logique métier sans dépendance framework
 */

import { UserRole } from '../../../shared/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { AppContextFactory } from '../../../shared/context/app-context';
import {
  UserNotFoundError,
  ForbiddenError,
  ValidationError,
} from '../../exceptions/auth.exceptions';

// ═══════════════════════════════════════════════════════════════
// 📋 REQUEST & RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface DeleteUserRequest {
  requestingUserId: string;
  targetUserId: string;
}

export interface DeleteUserResponse {
  id: string;
  email: string;
  deletedAt: Date;
  deletedBy: string;
}

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE USER USE CASE
// ═══════════════════════════════════════════════════════════════

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: DeleteUserRequest): Promise<DeleteUserResponse> {
    const context = AppContextFactory.userOperation(
      'DeleteUser',
      request.requestingUserId,
      request.targetUserId,
    );

    this.logger.info('delete_attempt', {
      ...context,
      targetUserId: request.targetUserId,
    });

    try {
      // 1. Vérifier que l'utilisateur requérant existe
      const requestingUser = await this.userRepository.findById(
        request.requestingUserId,
      );
      if (!requestingUser) {
        throw new UserNotFoundError('Requesting user not found', {
          userId: request.requestingUserId,
        });
      }

      // 2. Vérifier que l'utilisateur cible existe
      const targetUser = await this.userRepository.findById(
        request.targetUserId,
      );
      if (!targetUser) {
        throw new UserNotFoundError('Target user not found', {
          userId: request.targetUserId,
        });
      }

      // 3. Vérifier les permissions
      await this.validatePermissions(requestingUser, targetUser);

      // 4. Vérifier que l'utilisateur n'est pas déjà supprimé
      await this.validateNotAlreadyDeleted(request.targetUserId);

      // 5. Effectuer la suppression (pour l'instant avec delete, plus tard softDelete)
      await this.userRepository.delete(request.targetUserId);

      const response = this.buildResponse(targetUser, request.requestingUserId);

      this.logger.info('delete_success', {
        ...context,
        deletedUserId: response.id,
        deletedBy: request.requestingUserId,
      });

      return response;
    } catch (error) {
      this.logger.error(
        'delete_failed',
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔒 VALIDATION METHODS
  // ═══════════════════════════════════════════════════════════════

  private async validatePermissions(
    requestingUser: User,
    targetUser: User,
  ): Promise<void> {
    const requestingRole = requestingUser.role;
    const targetRole = targetUser.role;

    // Interdiction d'auto-suppression
    if (requestingUser.id === targetUser.id) {
      throw new ForbiddenError('Users cannot delete themselves');
    }

    // Règles de permissions par rôle
    switch (requestingRole) {
      case UserRole.PLATFORM_ADMIN:
        // PLATFORM_ADMIN peut supprimer n'importe qui (sauf eux-mêmes)
        return;

      case UserRole.BUSINESS_OWNER: {
        // BUSINESS_OWNER ne peut pas supprimer PLATFORM_ADMIN ou autres BUSINESS_OWNER
        const forbiddenTargetsForOwner = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
        ];
        if (forbiddenTargetsForOwner.includes(targetRole)) {
          throw new ForbiddenError(
            `Business owner cannot delete ${targetRole} users`,
          );
        }
        return;
      }

      case UserRole.BUSINESS_ADMIN: {
        // BUSINESS_ADMIN ne peut supprimer que des utilisateurs de niveau inférieur
        const forbiddenTargetsForAdmin = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
          UserRole.BUSINESS_ADMIN,
        ];
        if (forbiddenTargetsForAdmin.includes(targetRole)) {
          throw new ForbiddenError(
            `Business admin cannot delete ${targetRole} users`,
          );
        }
        return;
      }

      case UserRole.LOCATION_MANAGER: {
        // LOCATION_MANAGER peut supprimer seulement les utilisateurs opérationnels
        const allowedTargetsForManager = [
          UserRole.DEPARTMENT_HEAD,
          UserRole.SENIOR_PRACTITIONER,
          UserRole.PRACTITIONER,
          UserRole.JUNIOR_PRACTITIONER,
          UserRole.RECEPTIONIST,
          UserRole.ASSISTANT,
          UserRole.SCHEDULER,
          UserRole.CORPORATE_CLIENT,
          UserRole.VIP_CLIENT,
          UserRole.REGULAR_CLIENT,
        ];
        if (!allowedTargetsForManager.includes(targetRole)) {
          throw new ForbiddenError(
            `Location manager cannot delete ${targetRole} users`,
          );
        }
        return;
      }

      default:
        // Tous les autres rôles ne peuvent pas supprimer d'autres utilisateurs
        throw new ForbiddenError(
          `Role ${requestingRole} is not authorized to delete users`,
        );
    }
  }

  private async validateNotAlreadyDeleted(userId: string): Promise<void> {
    // Pour l'instant, on considère que si findById retourne null, c'est "supprimé"
    // Plus tard, on implémentera isDeleted() quand on aura le soft delete
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User is already deleted', { userId });
    }
  }

  private buildResponse(user: User, deletedBy: string): DeleteUserResponse {
    return {
      id: user.id,
      email: user.email.value,
      deletedAt: new Date(),
      deletedBy,
    };
  }
}
