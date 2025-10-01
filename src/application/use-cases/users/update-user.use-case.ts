/**
 * ✏️ UPDATE USER USE CASE - Clean Architecture
 *
 * Use Case pour la mise à jour d'utilisateurs avec permissions strictes par rôle
 * Application Layer : Orchestration de la logique métier sans dépendance framework
 */

import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.vo';
import { AppContextFactory } from '../../../shared/context/app-context';
import { UserRole } from '../../../shared/enums/user-role.enum';
import {
  DuplicationError,
  InsufficientPermissionsError,
  UserNotFoundError,
  ValidationError,
} from '../../exceptions/auth.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPermissionService } from '../../ports/permission.service.interface';

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
    private readonly permissionService: IPermissionService,
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
      await this.validatePermissions(request.requestingUserId, request);

      // 4. Valider les données
      this.validateInput(request);

      // 5. Vérifier unicité email si changement
      if (
        request.updates.email &&
        request.updates.email !== targetUser.email.getValue()
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
    requestingUserId: string,
    request: UpdateUserRequest,
  ): Promise<void> {
    const isSelfUpdate = requestingUserId === request.targetUserId;

    // Cas spécial : mise à jour de soi-même (permissions plus restrictives)
    if (isSelfUpdate) {
      this.validateSelfUpdatePermissions(request.updates);
      return;
    }

    // Vérifier les permissions via le service RBAC
    const canManageUser = await this.permissionService.canManageUser(
      requestingUserId,
      request.targetUserId,
    );

    if (!canManageUser) {
      throw new InsufficientPermissionsError(
        'Insufficient permissions to update this user',
      );
    }

    // Vérifications spécifiques pour le changement de rôle
    if (request.updates.role) {
      const canActOnRole = await this.permissionService.canActOnRole(
        requestingUserId,
        request.updates.role,
      );

      if (!canActOnRole) {
        throw new InsufficientPermissionsError(
          `Insufficient permissions to assign role: ${request.updates.role}`,
        );
      }
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
      throw new InsufficientPermissionsError(
        `Users cannot modify these fields: ${forbiddenFields.join(', ')}`,
      );
    }

    // Interdiction spéciale pour le changement de rôle
    if (updates.role) {
      throw new InsufficientPermissionsError(
        'Users cannot change their own role',
      );
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
      email: user.email.getValue(),
      name: user.name,
      role: user.role,
      isActive: user.isActive ?? true,
      requirePasswordChange: user.passwordChangeRequired,
      updatedAt: user.updatedAt ?? new Date(),
    };
  }
}
