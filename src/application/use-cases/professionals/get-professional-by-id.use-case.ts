/**
 * @fileoverview GetProfessionalByIdUseCase - Application Layer
 * @module application/use-cases/professionals/get-professional-by-id.use-case
 * @description Use Case pour récupérer un professionnel par son ID avec logging, i18n et contexte
 */

import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { ProfessionalNotFoundError } from "@domain/exceptions/professional.exceptions";
import { IProfessionalRepository } from "@domain/repositories/professional.repository";
import { ProfessionalId } from "@domain/value-objects/professional-id.value-object";

export interface GetProfessionalByIdRequest {
  readonly professionalId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface GetProfessionalByIdResponse {
  readonly success: true;
  readonly data: {
    readonly id: string;
    readonly businessId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly speciality: string;
    readonly licenseNumber: string;
    readonly experience?: string;
    readonly bio?: string;
    readonly isActive: boolean;
    readonly profileImageUrl?: string;
    readonly createdBy: string;
    readonly createdAt: Date;
    readonly updatedBy: string;
    readonly updatedAt: Date;
  };
  readonly meta: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

export class GetProfessionalByIdUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: GetProfessionalByIdRequest,
  ): Promise<GetProfessionalByIdResponse> {
    // ✅ OBLIGATOIRE - Logging avec contexte complet
    this.logger.info("Retrieving professional by ID", {
      professionalId: request.professionalId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // ✅ OBLIGATOIRE - Validation de l'ID professionnel
      const professionalId = ProfessionalId.fromString(request.professionalId);

      // ✅ Rechercher le professionnel dans le repository
      const professional =
        await this.professionalRepository.findById(professionalId);

      if (!professional) {
        const errorMessage = this.i18n.translate(
          "professional.errors.notFound",
          {
            professionalId: request.professionalId,
          },
        );

        this.logger.error("Professional not found", new Error(errorMessage), {
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        });

        throw new ProfessionalNotFoundError(request.professionalId);
      }

      // ✅ OBLIGATOIRE - Logging de succès avec contexte business
      this.logger.info("Professional retrieved successfully", {
        professionalId: request.professionalId, // ✅ Utiliser la valeur de la requête pour cohérence
        businessId: professional.getBusinessId().getValue(),
        correlationId: request.correlationId,
        requestingUserId: request.requestingUserId,
      });

      // ✅ OBLIGATOIRE - Mapper vers response avec tous les champs
      return {
        success: true,
        data: {
          id: professional.getId().getValue(),
          businessId: professional.getBusinessId().getValue(),
          email: professional.getEmail().toString(),
          firstName: professional.getFirstName(),
          lastName: professional.getLastName(),
          speciality: professional.getSpeciality(),
          licenseNumber: professional.getLicenseNumber() || "",
          phone: professional.getPhoneNumber(),
          bio: professional.getBio(),
          experience: professional.getExperience(),
          profileImageUrl: professional.getProfileImage(),
          isActive: professional.isActive(),
          createdBy: professional.getCreatedBy(),
          updatedBy: professional.getUpdatedBy(),
          createdAt: professional.getCreatedAt(),
          updatedAt: professional.getUpdatedAt(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          correlationId: request.correlationId,
        },
      };
    } catch (error) {
      // ✅ OBLIGATOIRE - Logging d'erreur avec contexte complet
      this.logger.error("Failed to retrieve professional", error as Error, {
        professionalId: request.professionalId,
        requestingUserId: request.requestingUserId,
        correlationId: request.correlationId,
      });

      // ✅ Re-lancer l'erreur pour permettre la gestion en amont
      throw error;
    }
  }
}
