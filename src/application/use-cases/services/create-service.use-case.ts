/**
 * 💼 CREATE SERVICE USE CASE - Application Layer
 *
 * Use Case pour créer un nouveau service dans un business
 * Respecte les principes Clean Architecture
 */

import { Business } from '../../../domain/entities/business.entity';
import { Service } from '../../../domain/entities/service.entity';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '../../../domain/value-objects/service-type-id.value-object';
import type { Logger } from '../../ports/logger.port';

// Interfaces Repository (Domain Layer)
export interface ServiceRepository {
  save(service: Service): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByName(businessId: BusinessId, name: string): Promise<Service | null>;
}

export interface BusinessRepository {
  findById(id: BusinessId): Promise<Business | null>;
}

// Request/Response DTOs
export interface CreateServiceRequest {
  requestingUserId: string;
  businessId: string;
  name: string;
  description: string;
  serviceTypeIds: string[];
  basePrice: number;
  currency: string;
  duration: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
}

export interface CreateServiceResponse {
  service: Service;
}

/**
 * 🏗️ CREATE SERVICE USE CASE
 *
 * Application Layer - Orchestration Business Logic
 */
export class CreateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly logger: Logger,
  ) {}

  async execute(request: CreateServiceRequest): Promise<CreateServiceResponse> {
    this.logger.info('Creating new service', {
      businessId: request.businessId,
      serviceName: request.name,
      requestingUserId: request.requestingUserId,
    });

    // 1. Validation du business
    const businessId = BusinessId.fromString(request.businessId);
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new Error('Business not found');
    }

    // 2. Validation prix positif
    if (request.basePrice <= 0) {
      throw new Error('Price must be positive');
    }

    // 3. Vérification unicité du nom
    const existingService = await this.serviceRepository.findByName(
      businessId,
      request.name,
    );

    if (existingService) {
      throw new Error('Service name already exists');
    }

    // 4. Création du service (Domain Entity)
    const serviceTypeIds = request.serviceTypeIds.map((id) =>
      ServiceTypeId.fromString(id),
    );

    const service = Service.create({
      businessId,
      name: request.name,
      description: request.description,
      serviceTypeIds,
      basePrice: request.basePrice,
      currency: request.currency,
      duration: request.duration,
    });

    // 5. Persistence
    const savedService = await this.serviceRepository.save(service);

    this.logger.info('Service created successfully', {
      serviceId: savedService.id.getValue(),
      serviceName: savedService.name,
      businessId: request.businessId,
    });

    return {
      service: savedService,
    };
  }
}
