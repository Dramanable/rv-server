/**
 * 🔍 GET SERVICE USE CASE - Application Layer
 *
 * Use Case pour récupérer un service par ID et lister les services d'un business
 * Respecte les principes Clean Architecture
 */

import { Service } from "../../../domain/entities/service.entity";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import { ServiceId } from "../../../domain/value-objects/service-id.value-object";
import type { Logger } from "../../ports/logger.port";

// Interfaces Repository (Domain Layer)
export interface ServiceRepository {
  findById(id: ServiceId): Promise<Service | null>;
  findByBusinessId(
    businessId: BusinessId,
    options?: { page?: number; limit?: number },
  ): Promise<{
    services: Service[];
    total: number;
    page: number;
    limit: number;
  }>;
}

// Request/Response DTOs
export interface GetServiceRequest {
  requestingUserId: string;
  serviceId: string;
  businessId: string;
}

export interface GetServiceResponse {
  service: Service;
}

export interface ListServicesRequest {
  requestingUserId: string;
  businessId: string;
  page?: number;
  limit?: number;
}

export interface ListServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
}

/**
 * 🔍 GET SERVICE USE CASE
 *
 * Application Layer - Orchestration Business Logic
 */
export class GetServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: GetServiceRequest): Promise<GetServiceResponse> {
    this.logger.info("Getting service by ID", {
      serviceId: request.serviceId,
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
    });

    // 1. Validation des formats ID
    let serviceId: ServiceId;
    let businessId: BusinessId;

    try {
      serviceId = ServiceId.create(request.serviceId);
    } catch (error) {
      throw new Error("Invalid service ID format");
    }

    try {
      businessId = BusinessId.fromString(request.businessId);
    } catch (error) {
      throw new Error("Invalid business ID format");
    }

    // 2. Récupération du service
    const service = await this.serviceRepository.findById(serviceId);

    if (!service) {
      throw new Error("Service not found");
    }

    // 3. Vérification appartenance au business
    if (!service.businessId.equals(businessId)) {
      throw new Error("Service does not belong to the specified business");
    }

    this.logger.info("Service retrieved successfully", {
      serviceId: service.id.getValue(),
      serviceName: service.name,
      businessId: request.businessId,
    });

    return {
      service,
    };
  }

  async executeList(
    request: ListServicesRequest,
  ): Promise<ListServicesResponse> {
    this.logger.info("Listing services for business", {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      page: request.page || 1,
      limit: request.limit || 10,
    });

    // 1. Validation du format business ID
    let businessId: BusinessId;

    try {
      businessId = BusinessId.fromString(request.businessId);
    } catch (error) {
      throw new Error("Invalid business ID format");
    }

    // 2. Récupération des services
    const result = await this.serviceRepository.findByBusinessId(businessId, {
      page: request.page || 1,
      limit: request.limit || 10,
    });

    this.logger.info("Services listed successfully", {
      businessId: request.businessId,
      totalServices: result.total,
      returnedServices: result.services.length,
    });

    return result;
  }
}
