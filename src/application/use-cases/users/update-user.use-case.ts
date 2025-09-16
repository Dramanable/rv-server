/**
 * 🎯 Update User Use Case
 *
 * Règles métier pour la modification d'utilisateurs avec logging et i18n
 */

import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole, Permission } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { ICacheService } from '../../ports/cache.port';
import {
  UserNotFoundError,
  EmailAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidEmailFormatError,
  InvalidNameError,
  RoleElevationError,
} from '../../../domain/exceptions/user.exceptions';

// DTOs
export interface UpdateUserRequest {
  userId: string;
  email?: string;
  name?: string;
  role?: UserRole;
  passwordChangeRequired?: boolean;
  requestingUserId: string;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  updatedAt: Date;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: 'UpdateUser',
      requestingUserId: request.requestingUserId,
      targetUserId: request.userId,
      updates: {
        email: request.email,
        name: request.name,
        role: request.role,
      },
    };

    this.logger.info(
      this.i18n.t('operations.user.update_attempt', { userId: request.userId }),
      requestContext,
    );

    try {
      // 1. Validation de l'utilisateur demandeur
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
        this.logger.warn(this.i18n.t('warnings.user.not_found'), {
          ...requestContext,
          targetUserId: request.userId,
        });
        throw new UserNotFoundError(request.userId);
      }

      // 3. Vérification des permissions
      this.validatePermissions(requestingUser, targetUser, request);

      // 4. Validation des données d'entrée
      await this.validateInput(request, targetUser);

      // 5. Construction des données de mise à jour
      const updateData: Partial<{
        email: string;
        name: string;
        role: UserRole;
      }> = {};

      if (request.name !== undefined) {
        updateData.name = request.name.trim();
      }

      if (request.email !== undefined) {
        // Email validation déjà faite dans validateInput
        updateData.email = request.email.trim().toLowerCase();
      }

      if (request.role !== undefined) {
        updateData.role = request.role;
      }

      // 6. Mise à jour de l'utilisateur - Reconstruction avec l'ID existant
      const updatedUser = User.restore(
        targetUser.id,
        request.email !== undefined
          ? request.email.trim()
          : targetUser.email.value,
        request.name !== undefined ? request.name.trim() : targetUser.name,
        request.role !== undefined ? request.role : targetUser.role,
        targetUser.createdAt,
        new Date(), // updatedAt
        targetUser.hashedPassword,
        targetUser.passwordChangeRequired,
      );

      const savedUser = await this.userRepository.update(updatedUser);

      // 🗑️ Invalider le cache de l'utilisateur modifié
      try {
        await this.cacheService.invalidateUserCache(savedUser.id);
        this.logger.debug(
          this.i18n.t('infrastructure.cache.user_cache_invalidated'),
          {
            ...requestContext,
            invalidatedUserId: savedUser.id,
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

      const duration = Date.now() - startTime;

      // Log de succès avec détails
      this.logger.info(
        this.i18n.t('success.user.update_success', {
          email: savedUser.email.value,
          requestingUser: requestingUser.email.value,
        }),
        { ...requestContext, duration },
      );

      // Audit trail traduit
      this.logger.audit(
        this.i18n.t('audit.user.updated'),
        request.requestingUserId,
        {
          targetUserId: savedUser.id,
          targetEmail: savedUser.email.value,
          changes: updateData,
        },
      );

      // 7. Retour de la réponse
      return {
        id: savedUser.id || request.userId,
        email: savedUser.email.value,
        name: savedUser.name,
        role: savedUser.role,
        updatedAt: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        this.i18n.t('operations.failed', { operation: 'UpdateUser' }),
        error as Error,
        { ...requestContext, duration },
      );
      throw error;
    }
  }

  private validatePermissions(
    requestingUser: User,
    targetUser: User,
    request: UpdateUserRequest,
  ): void {
    // Les utilisateurs peuvent modifier leur propre profil (sauf le rôle)
    const isSelfUpdate = requestingUser.id === targetUser.id;

    if (isSelfUpdate) {
      // Utilisateur modifie son propre profil
      if (request.role !== undefined) {
        // Ne peut pas changer son propre rôle
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'self_role_change_forbidden',
          requestingUserId: requestingUser.id,
        });
        throw new InsufficientPermissionsError(
          'CHANGE_OWN_ROLE',
          requestingUser.role,
        );
      }
      return; // Peut modifier son propre nom/email
    }

    // Modification d'un autre utilisateur selon les permissions hiérarchiques
    // Platform admins peuvent modifier tous
    if (requestingUser.role === UserRole.PLATFORM_ADMIN) {
      // Vérification des restrictions par rôle pour les changements de rôle
      if (request.role !== undefined) {
        this.validateRoleChange(requestingUser, targetUser, request.role);
      }
      return;
    }

    // Business owners peuvent modifier tous sauf platform admin et autres business owners
    if (requestingUser.role === UserRole.BUSINESS_OWNER) {
      const restrictedRoles = [
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
      ];
      if (restrictedRoles.includes(targetUser.role)) {
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'cannot_modify_equal_or_higher_role',
          requestingUserId: requestingUser.id,
          targetUserRole: targetUser.role,
        });
        throw new InsufficientPermissionsError(
          'MODIFY_HIGHER_ROLE',
          requestingUser.role,
        );
      }
      // Vérification des restrictions par rôle pour les changements de rôle
      if (request.role !== undefined) {
        this.validateRoleChange(requestingUser, targetUser, request.role);
      }
      return;
    }

    // Business admins peuvent modifier ceux de rang inférieur
    if (requestingUser.role === UserRole.BUSINESS_ADMIN) {
      const restrictedRoles = [
        UserRole.PLATFORM_ADMIN,
        UserRole.BUSINESS_OWNER,
        UserRole.BUSINESS_ADMIN,
      ];
      if (restrictedRoles.includes(targetUser.role)) {
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'cannot_modify_equal_or_higher_role',
          requestingUserId: requestingUser.id,
          targetUserRole: targetUser.role,
        });
        throw new InsufficientPermissionsError(
          'MODIFY_HIGHER_ROLE',
          requestingUser.role,
        );
      }
      // Vérification des restrictions par rôle pour les changements de rôle
      if (request.role !== undefined) {
        this.validateRoleChange(requestingUser, targetUser, request.role);
      }
      return;
    }

    // Location managers peuvent modifier le personnel opérationnel
    if (requestingUser.role === UserRole.LOCATION_MANAGER) {
      const allowedRoles = [
        UserRole.PRACTITIONER,
        UserRole.JUNIOR_PRACTITIONER,
        UserRole.RECEPTIONIST,
        UserRole.ASSISTANT,
        UserRole.REGULAR_CLIENT,
      ];
      if (!allowedRoles.includes(targetUser.role)) {
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'manager_cannot_modify_manager_or_admin',
          requestingUserId: requestingUser.id,
          targetUserRole: targetUser.role,
        });
        throw new InsufficientPermissionsError(
          'MODIFY_MANAGER_OR_ADMIN',
          requestingUser.role,
        );
      }
      // Vérification des restrictions par rôle pour les changements de rôle
      if (request.role !== undefined) {
        this.validateRoleChange(requestingUser, targetUser, request.role);
      }
      return;
    }

    // Tous les autres rôles ne peuvent pas modifier d'autres utilisateurs
    this.logger.warn(this.i18n.t('warnings.permission.denied'), {
      requestingUserId: requestingUser.id,
      requestingUserRole: requestingUser.role,
      reason: 'insufficient_permissions_to_update_others',
    });
    throw new InsufficientPermissionsError(
      Permission.MANAGE_ALL_STAFF,
      requestingUser.role,
    );
  }

  private validateRoleChange(
    requestingUser: User,
    targetUser: User,
    newRole: UserRole,
  ): void {
    // Seuls les platform admins peuvent changer les rôles librement
    if (requestingUser.role !== UserRole.PLATFORM_ADMIN) {
      // Les location managers ne peuvent pas élever vers des rôles de management
      if (requestingUser.role === UserRole.LOCATION_MANAGER) {
        const restrictedRoles = [
          UserRole.PLATFORM_ADMIN,
          UserRole.BUSINESS_OWNER,
          UserRole.BUSINESS_ADMIN,
          UserRole.LOCATION_MANAGER,
        ];
        if (restrictedRoles.includes(newRole)) {
          this.logger.warn(
            this.i18n.t('warnings.role.elevation_attempt', {
              targetRole: newRole,
            }),
            {
              requestingUserId: requestingUser.id,
              targetUserId: targetUser.id,
              currentRole: targetUser.role,
              newRole,
            },
          );
          throw new RoleElevationError(requestingUser.role, newRole);
        }
      }
    }
  }

  private async validateInput(
    request: UpdateUserRequest,
    targetUser: User,
  ): Promise<void> {
    // Validation du nom
    if (request.name !== undefined) {
      if (!request.name || request.name.trim().length === 0) {
        this.logger.warn(
          this.i18n.t('operations.validation.failed', { field: 'name' }),
          { name: request.name, reason: 'empty' },
        );
        throw new InvalidNameError(
          request.name,
          this.i18n.t('errors.name.empty'),
        );
      }

      if (request.name.trim().length > 100) {
        this.logger.warn(
          this.i18n.t('operations.validation.failed', { field: 'name' }),
          { name: request.name, reason: 'too_long' },
        );
        throw new InvalidNameError(
          request.name,
          this.i18n.t('errors.name.too_long'),
        );
      }
    }

    // Validation de l'email
    if (request.email !== undefined) {
      let email: Email;
      try {
        email = new Email(request.email.trim());
      } catch {
        this.logger.warn(
          this.i18n.t('warnings.email.invalid_format', {
            email: request.email,
          }),
          { email: request.email },
        );
        throw new InvalidEmailFormatError(request.email);
      }

      // Vérifier l'unicité (sauf si c'est le même email)
      if (email.value !== targetUser.email.value) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
          this.logger.warn(
            this.i18n.t('warnings.email.already_exists', {
              email: email.value,
            }),
            { email: email.value, targetUserId: request.userId },
          );
          throw new EmailAlreadyExistsError(email.value);
        }
      }
    }
  }
}
