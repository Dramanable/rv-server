/**
 * 🎯 Get User Use Case
 *
 * Règles métier pour la récupération d'utilisateurs avec autorisation et logging
 */

import { User } from "../../../domain/entities/user.entity";
import {
  InsufficientPermissionsError,
  UserNotFoundError,
} from "../../../domain/exceptions/user.exceptions";
import { UserRepository } from "../../../domain/repositories/user.repository.interface";
import { Permission, UserRole } from "../../../shared/enums/user-role.enum";
import type { I18nService } from "../../ports/i18n.port";
import { Logger } from "../../ports/logger.port";

// DTOs
export interface GetUserRequest {
  userId: string;
  requestingUserId: string;
}

export interface GetUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordChangeRequired: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: "GetUser",
      requestingUserId: request.requestingUserId,
      targetUserId: request.userId,
    };

    this.logger.info(
      this.i18n.t("operations.user.retrieval_attempt", {
        userId: request.userId,
      }),
      requestContext,
    );

    try {
      // 1. Validation de l'utilisateur demandeur
      this.logger.debug(
        this.i18n.t("operations.user.validation_process"),
        requestContext,
      );

      const requestingUser = await this.userRepository.findById(
        request.requestingUserId,
      );
      if (!requestingUser) {
        this.logger.warn(
          this.i18n.t("warnings.user.not_found"),
          requestContext,
        );
        throw new UserNotFoundError(request.requestingUserId);
      }

      // 2. Récupération de l'utilisateur cible
      this.logger.debug(
        this.i18n.t("operations.user.target_lookup", {
          userId: request.userId,
        }),
        requestContext,
      );

      const targetUser = await this.userRepository.findById(request.userId);
      if (!targetUser) {
        this.logger.warn(
          this.i18n.t("warnings.user.target_not_found", {
            userId: request.userId,
          }),
          requestContext,
        );
        throw new UserNotFoundError(request.userId);
      }

      // 3. Vérification des permissions d'accès
      this.logger.debug(
        this.i18n.t("operations.permission.check", { operation: "GetUser" }),
        requestContext,
      );
      this.validateViewPermissions(requestingUser, targetUser);

      const duration = Date.now() - startTime;

      // Log de succès
      this.logger.info(
        this.i18n.t("success.user.retrieval_success", {
          email: targetUser.email.value,
          requestingUser: requestingUser.email.value,
        }),
        { ...requestContext, duration },
      );

      // Audit trail
      this.logger.audit(
        this.i18n.t("audit.user.accessed"),
        request.requestingUserId,
        {
          targetUserId: targetUser.id,
          targetEmail: targetUser.email.value,
          targetRole: targetUser.role,
        },
      );

      // 4. Retour des données
      return {
        id: targetUser.id || "generated-id",
        email: targetUser.email.value,
        name: targetUser.name,
        role: targetUser.role,
        passwordChangeRequired: targetUser.passwordChangeRequired,
        createdAt: targetUser.createdAt || new Date(),
        updatedAt: targetUser.updatedAt,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        this.i18n.t("operations.failed", { operation: "GetUser" }),
        error as Error,
        { ...requestContext, duration },
      );
      throw error;
    }
  }

  private validateViewPermissions(
    requestingUser: User,
    targetUser: User,
  ): void {
    // 1. Les utilisateurs peuvent toujours voir leur propre profil
    if (requestingUser.id === targetUser.id) {
      return;
    }

    // 2. Les clients réguliers ne peuvent voir que leur propre profil
    const clientRoles = [
      UserRole.REGULAR_CLIENT,
      UserRole.VIP_CLIENT,
      UserRole.CORPORATE_CLIENT,
      UserRole.GUEST_CLIENT,
    ];
    if (clientRoles.includes(requestingUser.role)) {
      this.logger.warn(this.i18n.t("warnings.permission.denied"), {
        requestingUserId: requestingUser.id,
        requestingUserRole: requestingUser.role,
        requiredPermission: Permission.VIEW_STAFF_PERFORMANCE,
      });
      throw new InsufficientPermissionsError(
        Permission.VIEW_STAFF_PERFORMANCE,
        requestingUser.role,
      );
    }

    // 3. Vérification des permissions pour managers et admins
    if (!requestingUser.hasPermission(Permission.VIEW_STAFF_PERFORMANCE)) {
      this.logger.warn(this.i18n.t("warnings.permission.denied"), {
        requestingUserId: requestingUser.id,
        requestingUserRole: requestingUser.role,
        requiredPermission: Permission.VIEW_STAFF_PERFORMANCE,
      });
      throw new InsufficientPermissionsError(
        Permission.VIEW_STAFF_PERFORMANCE,
        requestingUser.role,
      );
    }

    // 4. Les location managers ne peuvent voir que certains utilisateurs
    if (requestingUser.role === UserRole.LOCATION_MANAGER) {
      const adminRoles = [UserRole.PLATFORM_ADMIN, UserRole.BUSINESS_OWNER];
      if (adminRoles.includes(targetUser.role)) {
        this.logger.warn(
          this.i18n.t("warnings.permission.admin_access_denied"),
          {
            requestingUserId: requestingUser.id,
            targetUserId: targetUser.id,
            targetRole: targetUser.role,
          },
        );
        throw new InsufficientPermissionsError(
          Permission.VIEW_STAFF_PERFORMANCE,
          requestingUser.role,
        );
      }
    }
  }
}
