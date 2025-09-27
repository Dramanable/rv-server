/**
 * @fileoverview DeleteServiceTypeUseCase - Use Case pour suppression des types de service
 *
 * @description
 * Implémente la logique applicative pour supprimer un ServiceType existant,
 * avec validation des règles métier et gestion des dépendances.
 *
 * Règles métier :
 * - Seuls les types de service existants peuvent être supprimés
 * - Un type de service ne peut pas être supprimé s'il est utilisé par des services
 * - Traçabilité complète avec utilisateur et audit
 * - Logging obligatoire pour toutes les opérations
 * - Messages internationalisés (i18n)
 *
 * @author Auto-generated - TDD Strict Workflow
 * @version 1.0.0
 */

import { ApplicationValidationError } from "@application/exceptions/application.exceptions";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import {
  ServiceTypeInUseError,
  ServiceTypeNotFoundError,
} from "@domain/exceptions/service-type.exceptions";
import { IServiceTypeRepository } from "@domain/repositories/service-type.repository";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { ServiceTypeId } from "@domain/value-objects/service-type-id.value-object";

/**
 * Request DTO pour la suppression d'un ServiceType
 */
export interface DeleteServiceTypeRequest {
  readonly serviceTypeId: ServiceTypeId;
  readonly businessId: BusinessId;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

/**
 * Response DTO pour la suppression d'un ServiceType
 */
export interface DeleteServiceTypeResponse {
  readonly success: boolean;
  readonly message: string;
  readonly deletedServiceTypeId?: string;
  readonly deletedAt: Date;
}

/**
 * Use Case pour supprimer un ServiceType existant
 *
 * Applique les règles métier suivantes :
 * - Validation de l'existence du ServiceType
 * - Vérification qu'il n'est pas utilisé par des services
 * - Suppression avec audit trail
 * - Logging et messages i18n
 */
export class DeleteServiceTypeUseCase {
  constructor(
    private readonly serviceTypeRepository: IServiceTypeRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Exécute la suppression d'un ServiceType
   *
   * @param request - Les données de suppression
   * @returns Promise<DeleteServiceTypeResponse> - Résultat de la suppression
   *
   * @throws {ApplicationValidationError} - Si les données de requête sont invalides
   * @throws {ServiceTypeNotFoundError} - Si le ServiceType n'existe pas
   * @throws {ServiceTypeInUseError} - Si le ServiceType est utilisé par des services
   */
  async execute(
    request: DeleteServiceTypeRequest,
  ): Promise<DeleteServiceTypeResponse> {
    this.logger.info("Attempting to delete service type", {
      serviceTypeId: request.serviceTypeId?.getValue?.() || "invalid",
      businessId: request.businessId?.getValue?.() || "invalid",
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 1. Validation des données d'entrée
      this.validateRequest(request);

      // 2. Récupération du ServiceType à supprimer
      const serviceType = await this.serviceTypeRepository.findById(
        request.serviceTypeId,
      );

      if (!serviceType) {
        this.logger.error("Service type not found for deletion", undefined, {
          serviceTypeId: request.serviceTypeId.getValue(),
          businessId: request.businessId.getValue(),
        });

        throw new ServiceTypeNotFoundError(request.serviceTypeId.getValue());
      }

      // 3. Vérification que le ServiceType appartient au business
      if (
        serviceType.getBusinessId().getValue() !== request.businessId.getValue()
      ) {
        this.logger.error(
          "Service type belongs to different business",
          undefined,
          {
            serviceTypeId: request.serviceTypeId.getValue(),
            requestedBusinessId: request.businessId.getValue(),
            actualBusinessId: serviceType.getBusinessId().getValue(),
          },
        );

        throw new ServiceTypeNotFoundError(request.serviceTypeId.getValue());
      }

      // 4. Vérification que le ServiceType n'est pas utilisé par des services
      const isReferenced =
        await this.serviceTypeRepository.isReferencedByServices(
          request.serviceTypeId,
        );
      if (isReferenced) {
        this.logger.error(
          "Cannot delete service type - it is referenced by services",
          undefined,
          {
            serviceTypeId: request.serviceTypeId.getValue(),
            serviceTypeName: serviceType.getName(),
          },
        );

        throw new ServiceTypeInUseError(
          request.serviceTypeId.getValue(),
          "referenced by services",
        );
      }

      // 5. Suppression du ServiceType
      await this.serviceTypeRepository.delete(request.serviceTypeId);

      const deletedAt = new Date();

      this.logger.info("Service type deleted successfully", {
        serviceTypeId: request.serviceTypeId?.getValue?.() || "invalid",
        serviceTypeName: serviceType.getName(),
        businessId: request.businessId?.getValue?.() || "invalid",
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
        deletedAt: deletedAt.toISOString(),
      });

      // 6. Construction de la réponse de succès
      return {
        success: true,
        message: this.i18n.translate("serviceType.deletedSuccessfully", {
          name: serviceType.getName(),
        }),
        deletedServiceTypeId: request.serviceTypeId?.getValue?.(),
        deletedAt,
      };
    } catch (error) {
      this.logger.error(
        "Failed to delete service type",
        error instanceof Error ? error : undefined,
        {
          serviceTypeId: request.serviceTypeId?.getValue?.() || "invalid",
          businessId: request.businessId?.getValue?.() || "invalid",
          requestingUserId: request.requestingUserId,
          error: error instanceof Error ? error.message : "Unknown error",
          correlationId: request.correlationId,
        },
      );

      // Re-lancer l'erreur pour le gestionnaire global
      throw error;
    }
  }

  /**
   * Valide les données de la requête de suppression
   *
   * @param request - La requête à valider
   * @throws {ApplicationValidationError} - Si la validation échoue
   */
  private validateRequest(request: DeleteServiceTypeRequest): void {
    const serviceTypeIdValue = request.serviceTypeId?.getValue?.();
    const businessIdValue = request.businessId?.getValue?.();
    const requestingUserIdValue = request.requestingUserId;
    const correlationIdValue = request.correlationId;

    if (!serviceTypeIdValue?.trim()) {
      throw new ApplicationValidationError(
        "serviceTypeId",
        serviceTypeIdValue,
        "required",
      );
    }

    if (!businessIdValue?.trim()) {
      throw new ApplicationValidationError(
        "businessId",
        businessIdValue,
        "required",
      );
    }

    if (!requestingUserIdValue?.trim()) {
      throw new ApplicationValidationError(
        "requestingUserId",
        requestingUserIdValue,
        "required",
      );
    }

    if (!correlationIdValue?.trim()) {
      throw new ApplicationValidationError(
        "correlationId",
        correlationIdValue,
        "required",
      );
    }

    // Validation format UUID pour serviceTypeId
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(serviceTypeIdValue)) {
      throw new ApplicationValidationError(
        "serviceTypeId",
        serviceTypeIdValue,
        "invalidUuid",
      );
    }

    if (!uuidRegex.test(businessIdValue)) {
      throw new ApplicationValidationError(
        "businessId",
        businessIdValue,
        "invalidUuid",
      );
    }

    if (!uuidRegex.test(requestingUserIdValue)) {
      throw new ApplicationValidationError(
        "requestingUserId",
        requestingUserIdValue,
        "invalidUuid",
      );
    }
  }
}
