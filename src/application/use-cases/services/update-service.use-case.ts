/**
 * ✏️ UPDATE SERVICE USE CASE - Application Layer
 *
 * Use Case pour mettre à jour un service existant
 * Respecte les principes Clean Architecture
 */

import { Service } from "../../../domain/entities/service.entity";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import { ServiceId } from "../../../domain/value-objects/service-id.value-object";
import { ServiceTypeId } from "../../../domain/value-objects/service-type-id.value-object";
import type { Logger } from "../../ports/logger.port";

// Interfaces Repository (Domain Layer)
export interface ServiceRepository {
  findById(id: ServiceId): Promise<Service | null>;
  findByName(businessId: BusinessId, name: string): Promise<Service | null>;
  save(service: Service): Promise<Service>;
}

// Request/Response DTOs
export interface UpdateServiceRequest {
  requestingUserId: string;
  serviceId: string;
  businessId: string;
  name?: string;
  description?: string;
  serviceTypeIds?: string[];
  basePrice?: number;
  currency?: string;
  duration?: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
}

export interface UpdateServiceResponse {
  service: Service;
}

/**
 * ✏️ UPDATE SERVICE USE CASE
 *
 * Application Layer - Orchestration Business Logic
 */
export class UpdateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: UpdateServiceRequest): Promise<UpdateServiceResponse> {
    try {
      this.logger.info("Updating service", {
        serviceId: request.serviceId,
        businessId: request.businessId,
        requestingUserId: request.requestingUserId,
      });

      // Validation et récupération des données
      const { serviceId, businessId, existingService } =
        await this.validateAndRetrieveService(request);

      // Validation des règles métier
      await this.validateBusinessRules(
        request,
        existingService,
        serviceId,
        businessId,
      );

      // Application des mises à jour au service
      this.applyUpdates(request, existingService);

      // Persistence et réponse
      const updatedService = await this.serviceRepository.save(existingService);

      this.logger.info("Service updated successfully", {
        serviceId: updatedService.id.getValue(),
        serviceName: updatedService.name,
        businessId: request.businessId,
      });

      return { service: updatedService };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to update service ${request.serviceId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Valide les IDs et récupère le service existant
   */
  private async validateAndRetrieveService(request: UpdateServiceRequest) {
    const serviceId = ServiceId.create(request.serviceId);
    const businessId = BusinessId.fromString(request.businessId);

    const existingService = await this.serviceRepository.findById(serviceId);

    if (!existingService) {
      throw new Error("Service not found");
    }

    // Vérification appartenance au business
    if (!existingService.businessId.equals(businessId)) {
      throw new Error("Service does not belong to the specified business");
    }

    return { serviceId, businessId, existingService };
  }

  /**
   * Valide les règles métier pour la mise à jour
   */
  private async validateBusinessRules(
    request: UpdateServiceRequest,
    existingService: Service,
    serviceId: ServiceId,
    businessId: BusinessId,
  ) {
    // Validation prix positif
    if (request.basePrice !== undefined && request.basePrice <= 0) {
      throw new Error("Price must be positive");
    }

    // Vérification unicité du nom (si nom modifié)
    if (request.name && request.name !== existingService.name) {
      const serviceWithSameName = await this.serviceRepository.findByName(
        businessId,
        request.name,
      );

      if (serviceWithSameName && !serviceWithSameName.id.equals(serviceId)) {
        throw new Error("Service name already exists");
      }
    }
  }

  /**
   * Applique les mises à jour au service selon les domaines
   */
  private applyUpdates(request: UpdateServiceRequest, service: Service) {
    // Mise à jour des informations de base
    const basicInfoUpdates = this.extractBasicInfoUpdates(request);
    if (Object.keys(basicInfoUpdates).length > 0) {
      service.updateBasicInfo(basicInfoUpdates);
    }

    // Mise à jour du scheduling
    const schedulingUpdates = this.extractSchedulingUpdates(request);
    if (Object.keys(schedulingUpdates).length > 0) {
      service.updateScheduling(schedulingUpdates);
    }

    // Mise à jour des service types
    if (request.serviceTypeIds) {
      const serviceTypeIds = request.serviceTypeIds.map((id) =>
        ServiceTypeId.fromString(id),
      );
      service.updateServiceTypes(serviceTypeIds);
    }
  }

  /**
   * Extrait les mises à jour des informations de base
   */
  private extractBasicInfoUpdates(
    request: UpdateServiceRequest,
  ): Record<string, any> {
    const updates: Record<string, any> = {};

    if (request.name !== undefined) updates.name = request.name;
    if (request.description !== undefined)
      updates.description = request.description;
    if (request.basePrice !== undefined) updates.basePrice = request.basePrice;
    if (request.currency !== undefined) updates.currency = request.currency;

    return updates;
  }

  /**
   * Extrait les mises à jour de scheduling
   */
  private extractSchedulingUpdates(
    request: UpdateServiceRequest,
  ): Record<string, any> {
    const updates: Record<string, any> = {};

    if (request.duration !== undefined) updates.duration = request.duration;
    if (request.allowOnlineBooking !== undefined)
      updates.allowOnlineBooking = request.allowOnlineBooking;
    if (request.requiresApproval !== undefined)
      updates.requiresApproval = request.requiresApproval;

    return updates;
  }
}
