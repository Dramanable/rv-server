import { ApplicationValidationError } from "@application/exceptions/application.exceptions";
import { Service } from "@domain/entities/service.entity";
import { ServiceNotFoundError } from "@domain/exceptions/service.exceptions";
import { ServiceRepository } from "@domain/repositories/service.repository.interface";
import { ServiceId } from "@domain/value-objects/service-id.value-object";

export interface GetServiceRequest {
  readonly serviceId: string;
  readonly requestingUserId: string;
}

export interface GetServiceResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly businessId: string;
  readonly serviceTypeIds: string[];
  readonly pricing: {
    readonly basePrice: {
      readonly amount: number;
      readonly currency: string;
    } | null;
    readonly discountPrice: {
      readonly amount: number;
      readonly currency: string;
    } | null;
  };
  readonly duration: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class GetServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(request: GetServiceRequest): Promise<GetServiceResponse> {
    this.validateRequest(request);

    try {
      const serviceId = new ServiceId(request.serviceId);
      const service = await this.serviceRepository.findById(serviceId);

      if (!service) {
        throw new ServiceNotFoundError(request.serviceId);
      }

      return this.mapServiceToResponse(service);
    } catch (error) {
      if (
        error instanceof ServiceNotFoundError ||
        error instanceof ApplicationValidationError
      ) {
        throw error;
      }

      throw error;
    }
  }

  private validateRequest(request: GetServiceRequest): void {
    if (!request) {
      throw new ApplicationValidationError(
        "request",
        request,
        "Request object cannot be null or undefined",
      );
    }

    if (!request.serviceId || request.serviceId.trim().length === 0) {
      throw new ApplicationValidationError(
        "serviceId",
        request.serviceId,
        "Service ID is required and cannot be empty",
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new ApplicationValidationError(
        "requestingUserId",
        request.requestingUserId,
        "User ID is required for authorization",
      );
    }
  }

  private mapServiceToResponse(service: Service): GetServiceResponse {
    const basePrice = service.pricingConfig.getBasePrice();
    return {
      id: service.id.getValue(),
      name: service.name,
      description: service.description,
      businessId: service.businessId.getValue(),
      serviceTypeIds: service.getServiceTypeIds().map((id) => id.getValue()),
      pricing: {
        basePrice: basePrice
          ? {
              amount: basePrice.getAmount(),
              currency: basePrice.getCurrency(),
            }
          : null,
        discountPrice: null, // PricingConfig ne semble pas avoir de discountPrice
      },
      duration: service.scheduling.duration,
      isActive: service.status === "ACTIVE",
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
