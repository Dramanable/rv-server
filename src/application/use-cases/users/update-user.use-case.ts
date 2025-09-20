/**
 * ✏️ UPDATE USER USE CASE - Clean Architecture
 *
 * Use Case pour la mise à jour d'utilisateurs avec permissions strictes par rôle
 * Application Layer : Orchestration de la logique métier sans dépendance framework
 */

import { UserRole } from '../../../shared/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import { AppContextFactory } from '../../../shared/context/app-context';
import {
  UserNotFoundError,
  ForbiddenError,
  ValidationError,
  DuplicationError,
} from '../../exceptions/auth.exceptions';

// ═══════════════════════════════════════════════════════════════
// 📋 REQUEST & RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface UpdateUserRequest {
  requestingUserId: string;
  targetUserId: string;
  updates: {
    email?: string;
    name?: string;
    role?: UserRole;
    isActive?: boolean;
    businessId?: string;
    locationId?: string;
    requirePasswordChange?: boolean;
  };
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
  locationId?: string;
  isActive: boolean;
  requirePasswordChange: boolean;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 UPDATE USER USE CASE
// ═══════════════════════════════════════════════════════════════

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const context = AppContextFactory.userOperation(
      'UpdateUser',
      request.requestingUserId,
      request.targetUserId,
    );

    this.logger.info('update_attempt', {
      ...context,
      targetUserId: request.targetUserId,
      updates: Object.keys(request.updates),
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

      // 3. Vérifier les permissions (avant la validation des données)
      await this.validatePermissions(requestingUser, targetUser, request);

      // 4. Valider les données
      this.validateInput(request);

      // 5. Vérifier unicité email si changement
      if (
        request.updates.email &&
        request.updates.email !== targetUser.email.value
      ) {
        await this.validateEmailUniqueness(request.updates.email);
      }

      // 6. Appliquer les mises à jour
      const updatedUser = await this.applyUpdates(targetUser, request.updates);

      // 7. Sauvegarder
      const savedUser = await this.userRepository.save(updatedUser);

      const response = this.buildResponse(savedUser);
      const changedFields = Object.keys(request.updates).filter(
        (key) =>
          request.updates[key as keyof typeof request.updates] !== undefined,
      );

      this.logger.info('update_success', {
        ...context,
        updatedUserId: response.id,
        changedFields,
      });

      return response;
    } catch (error) {
      this.logger.error(
        'update_failed',
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔒 VALIDATION METHODS
  // ═══════════════════════════════════════════════════════════════

  private validateInput(request: UpdateUserRequest): void {
    // Vérifier qu'il y a au moins une mise à jour
    const updates = request.updates;
    const hasUpdates = Object.keys(updates).some(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (!hasUpdates) {
      throw new ValidationError('No updates provided');
    }

    // Validation email si fourni
    if (updates.email) {
      try {
        Email.create(updates.email);
      } catch (error) {
        throw new ValidationError('Invalid email format', {
          email: updates.email,
        });
      }
    }

    // Validation nom si fourni
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new ValidationError('Name cannot be empty');
      }

      if (updates.name.trim().length < 2) {
        throw new ValidationError('Name must be at least 2 characters long');
      }

      if (updates.name.length > 100) {
        throw new ValidationError('Name must be less than 100 characters');
      }
    }

    // Validation rôle si fourni
    if (updates.role && !Object.values(UserRole).includes(updates.role)) {
      throw new ValidationError('Invalid user role', { role: updates.role });
    }
  }

  private async validatePermissions(
    requestingUser: User,
    targetUser: User,
    request: UpdateUserRequest,
  ): Promise<void> {
    const requestingRole = requestingUser.role;
    const targetRole = targetUser.role;
    const isSelfUpdate = requestingUser.id === targetUser.id;

    // Cas spécial : mise à jour de soi-même
    if (isSelfUpdate) {
      this.validateSelfUpdatePermissions(request.updates);
      return;
    }

    // Règles de permissions par rôle
    switch (requestingRole) {
      case UserRole.PLATFORM_ADMIN:
        // PLATFORM_ADMIN peut modifier n'importe qui
        if (request.updates.role) {
          // Même les PLATFORM_ADMIN peuvent changer les rôles
        }
        return;

      case UserRole.BUSINESS_OWNER: {
        // BUSINESS_OWNER ne peut pas modifier PLATFORM_ADMIN ou autres BUSINESS_OWNER
        const forbiddenTargetsForOwner = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
        ];
        if (forbiddenTargetsForOwner.includes(targetRole)) {
          throw new ForbiddenError(
            `Business owner cannot modify ${targetRole} users`,
          );
        }

        // BUSINESS_OWNER ne peut pas élever vers des rôles interdits
        if (request.updates.role) {
          const forbiddenRoleElevations = [
            UserRole.PLATFORM_ADMIN,
            UserRole.BUSINESS_OWNER,
          ];
          if (forbiddenRoleElevations.includes(request.updates.role)) {
            throw new ForbiddenError(
              `Business owner cannot elevate user to ${request.updates.role}`,
            );
          }
        }
        return;
      }

      case UserRole.BUSINESS_ADMIN: {
        // BUSINESS_ADMIN ne peut modifier que des utilisateurs de niveau inférieur
        const forbiddenTargetsForAdmin = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
          UserRole.BUSINESS_ADMIN,
        ];
        if (forbiddenTargetsForAdmin.includes(targetRole)) {
          throw new ForbiddenError(
            `Business admin cannot modify ${targetRole} users`,
          );
        }

        // BUSINESS_ADMIN ne peut pas élever vers des rôles management
        if (request.updates.role) {
          const forbiddenRoleElevationsForAdmin = [
            UserRole.PLATFORM_ADMIN,
            UserRole.BUSINESS_OWNER,
            UserRole.BUSINESS_ADMIN,
          ];
          if (forbiddenRoleElevationsForAdmin.includes(request.updates.role)) {
            throw new ForbiddenError(
              `Business admin cannot elevate user to ${request.updates.role}`,
            );
          }
        }
        return;
      }

      case UserRole.LOCATION_MANAGER: {
        // LOCATION_MANAGER peut modifier seulement les utilisateurs opérationnels
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
            `Location manager cannot modify ${targetRole} users`,
          );
        }

        // LOCATION_MANAGER ne peut pas élever au-dessus de son niveau
        if (request.updates.role) {
          if (!allowedTargetsForManager.includes(request.updates.role)) {
            throw new ForbiddenError(
              `Location manager cannot elevate user to ${request.updates.role}`,
            );
          }
        }
        return;
      }

      default:
        // Tous les autres rôles ne peuvent pas modifier d'autres utilisateurs
        throw new ForbiddenError(
          `Role ${requestingRole} is not authorized to update other users`,
        );
    }
  }

  private validateSelfUpdatePermissions(
    updates: UpdateUserRequest['updates'],
  ): void {
    // Les utilisateurs ne peuvent changer que certains champs de leur profil
    const allowedSelfUpdateFields = ['name', 'email'];
    const attemptedFields = Object.keys(updates);

    const forbiddenFields = attemptedFields.filter(
      (field) => !allowedSelfUpdateFields.includes(field),
    );

    if (forbiddenFields.length > 0) {
      throw new ForbiddenError(
        `Users cannot modify these fields: ${forbiddenFields.join(', ')}`,
      );
    }

    // Interdiction spéciale pour le changement de rôle
    if (updates.role) {
      throw new ForbiddenError('Users cannot change their own role');
    }
  }

  private async validateEmailUniqueness(email: string): Promise<void> {
    const emailVO = Email.create(email);
    const exists = await this.userRepository.emailExists(emailVO);

    if (exists) {
      throw new DuplicationError('Email already exists', { email });
    }
  }

  private async applyUpdates(
    user: User,
    updates: UpdateUserRequest['updates'],
  ): Promise<User> {
    // Pour l'instant, on crée un nouvel utilisateur avec les mises à jour
    // Dans une vraie implémentation, User aurait des méthodes de mise à jour

    const currentEmail = updates.email
      ? Email.create(updates.email)
      : user.email;
    const currentName = updates.name?.trim() ?? user.name;
    const currentRole = updates.role ?? user.role;

    // Créer un utilisateur mis à jour (simplification pour les tests)
    const updatedUser = User.create(currentEmail, currentName, currentRole);

    // Conserver l'ID original
    Object.defineProperty(updatedUser, 'id', {
      value: user.id,
      writable: false,
    });

    return updatedUser;
  }

  private buildResponse(user: User): UpdateUserResponse {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      role: user.role,
      isActive: true, // Par défaut
      requirePasswordChange: false, // TODO: Récupérer la vraie valeur
      updatedAt: new Date(), // TODO: Récupérer la vraie date de mise à jour
    };
  }
}
