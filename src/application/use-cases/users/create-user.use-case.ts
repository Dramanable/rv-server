/**
 * 👤 CREATE USER USE CASE - Clean Architecture
 *
 * Use Case pour la création d'utilisateurs avec permissions strictes par rôle
 * Application Layer : Orchestration de la logique métier sans dépendance framework
 */

import { User } from "../../../domain/entities/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository.interface";
import { Email } from "../../../domain/value-objects/email.vo";
import { AppContextFactory } from "../../../shared/context/app-context";
import { UserRole } from "../../../shared/enums/user-role.enum";
import {
  DuplicationError,
  UserNotFoundError,
  ValidationError,
} from "../../exceptions/auth.exceptions";
import { I18nService } from "../../ports/i18n.port";
import { Logger } from "../../ports/logger.port";
import { IPermissionService } from "../../ports/permission.service.interface";

// ═══════════════════════════════════════════════════════════════
// 📋 REQUEST & RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateUserRequest {
  requestingUserId: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
  locationId?: string;
  temporaryPassword?: string;
  requirePasswordChange?: boolean;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
  locationId?: string;
  isActive: boolean;
  requirePasswordChange: boolean;
  createdAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 CREATE USER USE CASE
// ═══════════════════════════════════════════════════════════════

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const context = AppContextFactory.userOperation(
      "CreateUser",
      request.requestingUserId,
    );

    this.logger.info("create_attempt", {
      ...context,
      targetEmail: request.email,
      targetRole: request.role,
    });

    try {
      // 1. Vérifier que l'utilisateur requérant existe
      const requestingUser = await this.userRepository.findById(
        request.requestingUserId,
      );
      if (!requestingUser) {
        throw new UserNotFoundError("Requesting user not found", {
          userId: request.requestingUserId,
        });
      }

      // 2. Vérifier les permissions avec IPermissionService
      await this.permissionService.requirePermission(
        request.requestingUserId,
        "MANAGE_USERS",
        { businessId: request.businessId },
      );

      // 2b. Vérifier que l'utilisateur peut créer ce type de rôle
      await this.permissionService.canActOnRole(
        request.requestingUserId,
        request.role,
        { businessId: request.businessId },
      );

      // 3. Valider les données
      this.validateInput(request);

      // 4. Vérifier unicité email
      await this.validateEmailUniqueness(request.email);

      // 5. Créer l'utilisateur
      const newUser = this.createUser(request);

      // 6. Sauvegarder
      const savedUser = await this.userRepository.save(newUser);

      const response = this.buildResponse(savedUser);

      this.logger.info("create_success", {
        ...context,
        createdUserId: response.id,
        createdUserRole: response.role,
      });

      return response;
    } catch (error) {
      this.logger.error(
        "create_failed",
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔒 VALIDATION METHODS
  // ═══════════════════════════════════════════════════════════════

  private validateInput(request: CreateUserRequest): void {
    // Validation email
    try {
      Email.create(request.email);
    } catch (error) {
      throw new ValidationError("Invalid email format", {
        email: request.email,
      });
    }

    // Validation nom
    if (!request.name || request.name.trim().length === 0) {
      throw new ValidationError("Name is required");
    }

    if (request.name.trim().length < 2) {
      throw new ValidationError("Name must be at least 2 characters long");
    }

    if (request.name.length > 100) {
      throw new ValidationError("Name must be less than 100 characters");
    }

    // Validation rôle
    if (!Object.values(UserRole).includes(request.role)) {
      throw new ValidationError("Invalid user role", { role: request.role });
    }
  }

  private async validateEmailUniqueness(email: string): Promise<void> {
    const emailVO = Email.create(email);
    const exists = await this.userRepository.emailExists(emailVO);

    if (exists) {
      throw new DuplicationError("Email already exists", { email });
    }
  }

  private createUser(request: CreateUserRequest): User {
    const email = Email.create(request.email);
    const normalizedName = request.name.trim();

    const user = User.create(email, normalizedName, request.role);

    // Si un mot de passe temporaire est fourni
    if (request.temporaryPassword) {
      // TODO: Hash du mot de passe temporaire
      // Pour l'instant, on force le changement de mot de passe
    }

    // Forcer le changement de mot de passe si demandé
    if (request.requirePasswordChange !== undefined) {
      // TODO: Setter le flag passwordChangeRequired
    }

    return user;
  }

  private buildResponse(user: User): CreateUserResponse {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      role: user.role,
      isActive: true, // Par défaut
      requirePasswordChange: false, // TODO: Récupérer la vraie valeur
      createdAt: new Date(), // TODO: Récupérer la vraie date de création
    };
  }
}
