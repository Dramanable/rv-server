import { ServiceNotFoundError } from "../../../domain/exceptions/service.exceptions";
import { ServiceRepository } from "../../../domain/repositories/service.repository.interface";
import { ServiceId } from "../../../domain/value-objects/service-id.value-object";
import { ApplicationValidationError } from "../../exceptions/application.exceptions";
import { I18nService } from "../../ports/i18n.port";
import { Logger } from "../../ports/logger.port";
import { IPermissionService } from "../../ports/permission.service.interface";

export interface DeleteServiceRequest {
  readonly serviceId: string;
  readonly requestingUserId: string;
}

export interface DeleteServiceResponse {
  readonly success: boolean;
  readonly serviceId: string;
}

export class DeleteServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: DeleteServiceRequest): Promise<DeleteServiceResponse> {
    try {
      this.logger.info("Attempting to delete service", {
        serviceId: request.serviceId,
        requestingUserId: request.requestingUserId,
      });

      // Parameter validation
      if (!request.serviceId || request.serviceId.trim().length === 0) {
        throw new ApplicationValidationError(
          "serviceId",
          request.serviceId,
          "Service ID is required",
        );
      }

      if (
        !request.requestingUserId ||
        request.requestingUserId.trim().length === 0
      ) {
        throw new ApplicationValidationError(
          "requestingUserId",
          request.requestingUserId,
          "Requesting user ID is required",
        );
      }

      // Find existing service first to get business context
      const serviceId = new ServiceId(request.serviceId);
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new ServiceNotFoundError(request.serviceId);
      }

      // 🚨 CRITIQUE : TOUJOURS vérifier les permissions en PREMIER
      await this.permissionService.requirePermission(
        request.requestingUserId,
        "MANAGE_SERVICES",
        {
          businessId: existingService.businessId.getValue(),
          resourceId: request.serviceId,
        },
      );

      // Business rule: Cannot delete active service
      if (existingService.isActive()) {
        throw new ApplicationValidationError(
          "serviceId",
          request.serviceId,
          "Cannot delete active service",
        );
      }

      // Delete the service
      await this.serviceRepository.delete(serviceId);

      this.logger.info("Service deleted successfully", {
        serviceId: request.serviceId,
        requestingUserId: request.requestingUserId,
        serviceName: existingService.name,
      });

      return {
        success: true,
        serviceId: request.serviceId,
      };
    } catch (error) {
      // Log permission errors with specific context
      if (
        error instanceof Error &&
        error.constructor.name === "InsufficientPermissionsError"
      ) {
        // Try to get business context from the service if it was found
        let businessId = "unknown";
        try {
          const serviceId = new ServiceId(request.serviceId);
          const service = await this.serviceRepository.findById(serviceId);
          if (service) {
            businessId = service.businessId.getValue();
          }
        } catch (contextError) {
          // If we can't get the service, use serviceId as fallback
          businessId = request.serviceId;
        }

        this.logger.error("Permission denied for service deletion", error, {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
          requiredPermission: "MANAGE_SERVICES",
          businessId: businessId,
        });
      } else {
        this.logger.error("Error deleting service", error as Error, {
          serviceId: request.serviceId,
          requestingUserId: request.requestingUserId,
        });
      }
      throw error;
    }
  }
}
