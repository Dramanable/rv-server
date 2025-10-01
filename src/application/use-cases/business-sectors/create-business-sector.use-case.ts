/**
 * 🏢 Create Business Sector Use Case - Clean Architecture
 *
 * Use Case pour la création de secteurs d'activité métier.
 * Accessible uniquement aux super-administrateurs (PLATFORM_ADMIN).
 */

import {
  BusinessSectorAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidBusinessSectorDataError,
} from "@application/exceptions/business-sector.exceptions";
import { IBusinessSectorRepository } from "@application/ports/business-sector.repository.interface";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { IPermissionService } from "@application/ports/permission.service.interface";
import { BusinessSector } from "@domain/entities/business-sector.entity";

/**
 * 📝 Requête de création de secteur d'activité
 */
export interface CreateBusinessSectorRequest {
  readonly requestingUserId: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
}

/**
 * 📋 Réponse de création de secteur d'activité
 */
export interface CreateBusinessSectorResponse {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly createdBy: string;
}

/**
 * 🏢 Use Case : Créer un Secteur d'Activité
 *
 * Crée un nouveau secteur d'activité dans le système.
 * Seuls les super-administrateurs peuvent effectuer cette action.
 */
export class CreateBusinessSectorUseCase {
  constructor(
    private readonly businessSectorRepository: IBusinessSectorRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly permissionService: IPermissionService,
  ) {}

  /**
   * 🎯 Exécuter la création du secteur d'activité
   */
  async execute(
    request: CreateBusinessSectorRequest,
  ): Promise<CreateBusinessSectorResponse> {
    const { requestingUserId, name, code, description } = request;

    this.logger.debug("Starting business sector creation", {
      requestingUserId,
      sectorCode: code,
      sectorName: name,
    });

    try {
      // 🔐 Vérification des permissions super-admin
      await this.validatePermissions(requestingUserId);

      // ✅ Validation des données d'entrée
      this.validateInput(request);

      // 🔍 Vérification de l'unicité du code
      await this.validateCodeUniqueness(code, requestingUserId);

      // 🏭 Création de l'entité métier
      const businessSector = this.createBusinessSectorEntity(request);

      // 💾 Sauvegarde en base de données
      const savedSector =
        await this.businessSectorRepository.save(businessSector);

      // 📊 Logging de succès
      this.logger.info("Business sector created successfully", {
        sectorId: savedSector.id,
        sectorCode: savedSector.code,
        sectorName: savedSector.name,
        requestingUserId,
      });

      // 📋 Construction de la réponse
      return this.buildResponse(savedSector);
    } catch (error) {
      this.logger.error(
        "Failed to create business sector",
        error instanceof Error ? error : new Error(String(error)),
        {
          requestingUserId,
          sectorCode: code,
          sectorName: name,
        },
      );
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions utilisateur
   */
  private async validatePermissions(requestingUserId: string): Promise<void> {
    try {
      const hasPermission = await this.permissionService.hasPermission(
        requestingUserId,
        "MANAGE_BUSINESS_SECTORS",
      );

      if (!hasPermission) {
        const errorMessage = this.i18n.t(
          "business-sector.insufficient-permissions",
          { permission: "MANAGE_BUSINESS_SECTORS" },
        );

        this.logger.warn("Permission denied for business sector creation", {
          requestingUserId,
          attemptedAction: "CREATE_BUSINESS_SECTOR",
          requiredPermission: "MANAGE_BUSINESS_SECTORS",
        });

        throw new InsufficientPermissionsError(
          "MANAGE_BUSINESS_SECTORS",
          requestingUserId,
          errorMessage,
        );
      }
    } catch (error) {
      if (error instanceof InsufficientPermissionsError) {
        throw error;
      }

      this.logger.error(
        "Error checking permissions for business sector creation",
        error instanceof Error ? error : new Error(String(error)),
        {
          requestingUserId,
        },
      );
      throw error;
    }
  }

  /**
   * ✅ Valider les données d'entrée
   */
  private validateInput(request: CreateBusinessSectorRequest): void {
    const errors: string[] = [];

    // Validation du nom
    if (!request.name) {
      errors.push(this.i18n.t("business-sector.validation.name-required"));
    } else if (request.name.trim().length === 0) {
      errors.push(this.i18n.t("business-sector.validation.name-empty"));
    } else if (request.name.trim().length < 2) {
      errors.push(this.i18n.t("business-sector.validation.name-too-short"));
    } else if (request.name.trim().length > 100) {
      errors.push(this.i18n.t("business-sector.validation.name-too-long"));
    }

    // Validation du code
    if (!request.code) {
      errors.push(this.i18n.t("business-sector.validation.code-required"));
    } else if (request.code.trim().length === 0) {
      errors.push(this.i18n.t("business-sector.validation.code-empty"));
    } else {
      const normalizedCode = this.normalizeCode(request.code);
      if (!this.isValidCodeFormat(normalizedCode)) {
        errors.push(
          this.i18n.t("business-sector.validation.code-invalid-format"),
        );
      }
    }

    // Validation de la description (optionnelle)
    if (request.description && request.description.trim().length > 500) {
      errors.push(
        this.i18n.t("business-sector.validation.description-too-long"),
      );
    }

    if (errors.length > 0) {
      const errorMessage = this.i18n.t(
        "business-sector.validation.invalid-data",
      );
      throw new InvalidBusinessSectorDataError(errors, errorMessage);
    }
  }

  /**
   * 🔍 Valider l'unicité du code secteur
   */
  private async validateCodeUniqueness(
    code: string,
    requestingUserId: string,
  ): Promise<void> {
    const normalizedCode = this.normalizeCode(code);
    const isUnique =
      await this.businessSectorRepository.isCodeUnique(normalizedCode);

    if (!isUnique) {
      const errorMessage = this.i18n.t("business-sector.already-exists", {
        code: normalizedCode,
      });

      this.logger.warn("Duplicate business sector code attempted", {
        code: normalizedCode,
        requestingUserId,
      });

      throw new BusinessSectorAlreadyExistsError(normalizedCode, errorMessage);
    }
  }

  /**
   * 🏭 Créer l'entité métier BusinessSector
   */
  private createBusinessSectorEntity(
    request: CreateBusinessSectorRequest,
  ): BusinessSector {
    const normalizedName = request.name.trim();
    const normalizedDescription = request.description?.trim() || "";
    const normalizedCode = this.normalizeCode(request.code);

    return BusinessSector.create(
      normalizedName,
      normalizedDescription,
      normalizedCode,
      request.requestingUserId,
    );
  }

  /**
   * 📋 Construire la réponse du use case
   */
  private buildResponse(sector: BusinessSector): CreateBusinessSectorResponse {
    return {
      id: sector.id,
      name: sector.name,
      code: sector.code,
      description: sector.description || undefined,
      isActive: sector.isActive,
      createdAt: sector.createdAt,
      createdBy: sector.createdBy,
    };
  }

  /**
   * 🔤 Normaliser le code secteur (uppercase, underscores)
   */
  private normalizeCode(code: string): string {
    return code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_");
  }

  /**
   * ✅ Vérifier le format du code secteur
   */
  private isValidCodeFormat(code: string): boolean {
    // Code doit être: lettres majuscules, chiffres, underscores uniquement
    // Entre 2 et 50 caractères
    const codeRegex = /^[A-Z0-9_]{2,50}$/;
    return codeRegex.test(code);
  }
}
