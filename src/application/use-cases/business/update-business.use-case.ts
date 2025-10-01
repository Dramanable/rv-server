/**
 * 🏢 Update Business Use Case - Clean Architecture + SOLID
 *
 * Mise à jour d'une entreprise avec validation métier et permissions
 */
import {
  BusinessNotFoundError,
  BusinessValidationError,
} from "../../../application/exceptions/application.exceptions";
import type { I18nService } from "../../../application/ports/i18n.port";
import type { Logger } from "../../../application/ports/logger.port";
import type { IPermissionService } from "../../../application/ports/permission.service.interface";
import {
  Business,
  BusinessStatus,
} from "../../../domain/entities/business.entity";
import type { BusinessRepository } from "../../../domain/repositories/business.repository.interface";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import { BusinessName } from "../../../domain/value-objects/business-name.value-object";
import { Email } from "../../../domain/value-objects/email.value-object";
import { Phone } from "../../../domain/value-objects/phone.value-object";
import {
  AppContext,
  AppContextFactory,
} from "../../../shared/context/app-context";

export interface UpdateBusinessRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly name?: string;
  readonly description?: string;
  readonly slogan?: string;
  readonly branding?: {
    readonly logoUrl?: string;
    readonly coverImageUrl?: string;
    readonly brandColors?: {
      readonly primary: string;
      readonly secondary: string;
      readonly accent?: string;
    };
    readonly images?: string[];
  };
  readonly contactInfo?: {
    readonly primaryEmail?: string;
    readonly secondaryEmails?: string[];
    readonly primaryPhone?: string;
    readonly secondaryPhones?: string[];
    readonly website?: string;
    readonly socialMedia?: {
      readonly facebook?: string;
      readonly instagram?: string;
      readonly linkedin?: string;
      readonly twitter?: string;
    };
  };
  readonly settings?: {
    readonly timezone?: string;
    readonly currency?: string;
    readonly language?: string;
    readonly appointmentSettings?: {
      readonly defaultDuration?: number;
      readonly bufferTime?: number;
      readonly advanceBookingLimit?: number;
      readonly cancellationPolicy?: string;
    };
    readonly notificationSettings?: {
      readonly emailNotifications?: boolean;
      readonly smsNotifications?: boolean;
      readonly reminderTime?: number;
    };
  };
}

export interface UpdateBusinessResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: BusinessStatus;
  readonly updatedAt: Date;
}

export class UpdateBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: UpdateBusinessRequest,
  ): Promise<UpdateBusinessResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation("UpdateBusiness")
      .requestingUser(request.requestingUserId)
      .metadata("businessId", request.businessId)
      .build();

    this.logger.info(this.i18n.t("operations.business.update_attempt"), {
      ...context,
    } as Record<string, unknown>);

    try {
      // 2. Validation des permissions
      const business = await this.validatePermissions(
        request.requestingUserId,
        request.businessId,
        context,
      );

      // 3. Validation des règles métier
      await this.validateBusinessRules(request, context);

      // 4. Mise à jour du branding si fourni
      if (request.branding) {
        const branding = this.convertBrandingToDomain(request.branding);
        business.updateBranding(branding);
      }

      // 5. Mise à jour des paramètres si fournis
      if (request.settings) {
        const settings = this.convertSettingsToDomain(request.settings);
        business.updateSettings(settings);
      }

      // Note: Pour les autres champs, nous aurions besoin de méthodes
      // de mise à jour dans l'entité Business (immutable par design)

      // 6. Persistance
      await this.businessRepository.save(business);

      // 7. Réponse typée
      const response: UpdateBusinessResponse = {
        id: business.id.getValue(),
        name: business.name.getValue(),
        description: business.description,
        status: business.status,
        updatedAt: business.updatedAt,
      };

      this.logger.info(this.i18n.t("operations.business.update_success"), {
        ...context,
        businessId: business.id.getValue(),
      } as Record<string, unknown>);

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t("operations.business.update_failed"),
        error as Error,
        { ...context } as Record<string, unknown>,
      );
      throw error;
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    businessId: string,
    context: AppContext,
  ): Promise<Business> {
    this.logger.info("🔐 Validating permissions for business update", {
      requestingUserId,
      businessId,
    });

    // 🎯 Use new permission service for validation
    await this.permissionService.requirePermission(
      requestingUserId,
      "MANAGE_BUSINESS",
      { businessId },
    );

    // 🔍 Get target business after permission validation
    const business = await this.businessRepository.findById(
      BusinessId.create(businessId),
    );
    if (!business) {
      throw new BusinessNotFoundError(
        `Business with id ${businessId} not found`,
      );
    }

    this.logger.info("✅ Permissions validated successfully", {
      requestingUserId,
      businessId,
    });

    return business;
  }

  private async validateBusinessRules(
    request: UpdateBusinessRequest,
    context: AppContext,
  ): Promise<void> {
    // Validation du nom si fourni
    if (request.name !== undefined) {
      if (!request.name || request.name.trim().length < 3) {
        throw new BusinessValidationError(
          "name",
          request.name,
          "Business name must be at least 3 characters long",
          request.businessId,
        );
      }

      if (request.name.trim().length > 100) {
        throw new BusinessValidationError(
          "name",
          request.name,
          "Business name cannot exceed 100 characters",
          request.businessId,
        );
      }

      // Vérification d'unicité du nom (si différent de l'actuel)
      const existingBusiness = await this.businessRepository.findByName(
        BusinessName.create(request.name.trim()),
      );

      if (
        existingBusiness &&
        existingBusiness.id.getValue() !== request.businessId
      ) {
        this.logger.warn(this.i18n.t("warnings.business.name_already_exists"), {
          ...context,
          businessName: request.name,
        });
        throw new BusinessValidationError(
          "name",
          request.name,
          `Business with name "${request.name}" already exists`,
          request.businessId,
        );
      }
    }

    // Validation de l'email si fourni
    if (request.contactInfo?.primaryEmail) {
      try {
        Email.create(request.contactInfo.primaryEmail);
      } catch (error) {
        throw new BusinessValidationError(
          "primaryEmail",
          request.contactInfo.primaryEmail,
          "Invalid primary email address",
          request.businessId,
        );
      }
    }

    // Validation du téléphone si fourni
    if (request.contactInfo?.primaryPhone) {
      try {
        Phone.create(request.contactInfo.primaryPhone);
      } catch (error) {
        throw new BusinessValidationError(
          "primaryPhone",
          request.contactInfo.primaryPhone,
          "Invalid primary phone number",
          request.businessId,
        );
      }
    }

    // Validation des couleurs de marque si fournies
    if (request.branding?.brandColors) {
      const { primary, secondary, accent } = request.branding.brandColors;

      if (primary && !this.isValidHexColor(primary)) {
        throw new BusinessValidationError(
          "primaryColor",
          primary,
          "Primary color must be a valid hex color",
          request.businessId,
        );
      }

      if (secondary && !this.isValidHexColor(secondary)) {
        throw new BusinessValidationError(
          "secondaryColor",
          secondary,
          "Secondary color must be a valid hex color",
          request.businessId,
        );
      }

      if (accent && !this.isValidHexColor(accent)) {
        throw new BusinessValidationError(
          "accentColor",
          accent,
          "Accent color must be a valid hex color",
          request.businessId,
        );
      }
    }

    // Validation des paramètres d'appointment si fournis
    if (request.settings?.appointmentSettings) {
      const { defaultDuration, bufferTime, advanceBookingLimit } =
        request.settings.appointmentSettings;

      if (defaultDuration !== undefined && defaultDuration < 5) {
        throw new BusinessValidationError(
          "defaultDuration",
          defaultDuration,
          "Default duration must be at least 5 minutes",
          request.businessId,
        );
      }

      if (bufferTime !== undefined && bufferTime < 0) {
        throw new BusinessValidationError(
          "bufferTime",
          bufferTime,
          "Buffer time cannot be negative",
          request.businessId,
        );
      }

      if (advanceBookingLimit !== undefined && advanceBookingLimit < 1) {
        throw new BusinessValidationError(
          "advanceBookingLimit",
          advanceBookingLimit,
          "Advance booking limit must be at least 1 day",
          request.businessId,
        );
      }
    }
  }

  private convertBrandingToDomain(branding: any): any {
    // Pour l'instant, retourner tel quel
    // TODO: Implémenter la conversion vers les types domaine
    return branding;
  }

  private convertSettingsToDomain(settings: any): any {
    // Pour l'instant, retourner tel quel
    // TODO: Implémenter la conversion vers les types domaine
    return settings;
  }

  private isValidHexColor(color: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }
}
