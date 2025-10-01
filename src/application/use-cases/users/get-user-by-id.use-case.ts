/**
 * 👁️ GET USER BY ID USE CASE - Clean Architecture
 *
 * Use Case pour la récupération d'un utilisateur par ID avec permissions strictes par rôle
 * Application Layer : Orchestration de la logique métier sans dépendance framework
 */

import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { AppContextFactory } from '../../../shared/context/app-context';
import { UserRole } from '../../../shared/enums/user-role.enum';
import {
  ForbiddenError,
  UserNotFoundError,
} from '../../exceptions/auth.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';

// ═══════════════════════════════════════════════════════════════
// 📋 REQUEST & RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface GetUserByIdRequest {
  requestingUserId: string;
  targetUserId: string;
}

export interface GetUserByIdResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  canViewSensitiveData: boolean;
  businessId?: string;
  locationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ═══════════════════════════════════════════════════════════════
// 👁️ GET USER BY ID USE CASE
// ═══════════════════════════════════════════════════════════════

export class GetUserByIdUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const context = AppContextFactory.userOperation(
      'GetUserById',
      request.requestingUserId,
      request.targetUserId,
    );

    this.logger.info('get_user_attempt', {
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

      // 3. Vérifier les permissions de visualisation
      await this.validateViewPermissions(requestingUser, targetUser);

      // 4. Construire la réponse avec les données appropriées
      const response = this.buildResponse(
        targetUser,
        requestingUser,
        request.requestingUserId === request.targetUserId,
      );

      this.logger.info('get_user_success', {
        ...context,
        retrievedUserId: response.id,
        requestingUserId: request.requestingUserId,
      });

      return response;
    } catch (error) {
      this.logger.error(
        'get_user_failed',
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔒 VALIDATION METHODS
  // ═══════════════════════════════════════════════════════════════

  private async validateViewPermissions(
    requestingUser: User,
    targetUser: User,
  ): Promise<void> {
    const requestingRole = requestingUser.role;
    const targetRole = targetUser.role;
    const isSelfView = requestingUser.id === targetUser.id;

    // Autorisation de consulter son propre profil
    if (isSelfView) {
      return;
    }

    // Règles de permissions par rôle pour consulter d'autres utilisateurs
    switch (requestingRole) {
      case UserRole.PLATFORM_ADMIN:
        // PLATFORM_ADMIN peut voir n'importe qui
        return;

      case UserRole.BUSINESS_OWNER:
        // BUSINESS_OWNER ne peut pas voir PLATFORM_ADMIN
        if (targetRole === UserRole.PLATFORM_ADMIN) {
          throw new ForbiddenError(
            `Business owner cannot view ${targetRole} users`,
          );
        }
        // BUSINESS_OWNER peut voir autres BUSINESS_OWNER (pairs) et tous les autres
        return;

      case UserRole.BUSINESS_ADMIN: {
        // BUSINESS_ADMIN ne peut voir que des utilisateurs de niveau inférieur
        const forbiddenTargetsForAdmin = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
          UserRole.BUSINESS_ADMIN,
        ];
        if (forbiddenTargetsForAdmin.includes(targetRole)) {
          throw new ForbiddenError(
            `Business admin cannot view ${targetRole} users`,
          );
        }
        return;
      }

      case UserRole.LOCATION_MANAGER: {
        // LOCATION_MANAGER peut voir seulement les utilisateurs opérationnels
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
            `Location manager cannot view ${targetRole} users`,
          );
        }
        return;
      }

      default:
        // Tous les autres rôles ne peuvent voir que leur propre profil
        throw new ForbiddenError(
          `Role ${requestingRole} is not authorized to view other users`,
        );
    }
  }

  private buildResponse(
    targetUser: User,
    requestingUser: User,
    isSelfView: boolean,
  ): GetUserByIdResponse {
    // Déterminer si des données sensibles peuvent être exposées
    const canViewSensitiveData = this.canAccessSensitiveData(
      requestingUser,
      targetUser,
      isSelfView,
    );

    return {
      id: targetUser.id,
      email: targetUser.email.getValue(),
      name: targetUser.name,
      role: targetUser.role,
      isActive: targetUser.isActive ?? true,
      canViewSensitiveData,
      // Les champs optionnels peuvent être ajoutés selon les besoins
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt,
    };
  }

  private canAccessSensitiveData(
    requestingUser: User,
    targetUser: User,
    isSelfView: boolean,
  ): boolean {
    // Pas de données sensibles pour soi-même dans ce contexte
    if (isSelfView) {
      return false;
    }

    const requestingRole = requestingUser.role;
    const targetRole = targetUser.role;

    // PLATFORM_ADMIN peut toujours voir les données sensibles
    if (requestingRole === UserRole.PLATFORM_ADMIN) {
      return true;
    }

    // BUSINESS_OWNER peut voir les données sensibles de ses employés (pas des pairs)
    if (requestingRole === UserRole.BUSINESS_OWNER) {
      const businessOwnerPeers = [UserRole.BUSINESS_OWNER];
      return !businessOwnerPeers.includes(targetRole);
    }

    // BUSINESS_ADMIN peut voir les données sensibles de niveau inférieur
    if (requestingRole === UserRole.BUSINESS_ADMIN) {
      const adminOrHigher = [
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
        UserRole.BUSINESS_ADMIN,
      ];
      return !adminOrHigher.includes(targetRole);
    }

    // LOCATION_MANAGER ne peut pas voir de données sensibles
    return false;
  }
}
