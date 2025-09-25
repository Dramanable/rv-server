/**
 * @fileoverview UpdateProfessionalUseCase
 * @module application/use-cases/professionals/update-professional.use-case
 * @description Use case pour mettre à jour un professionnel selon la Clean Architecture
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import {
  ProfessionalNotFoundError,
  ProfessionalValidationError,
} from '@domain/exceptions/professional.exceptions';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { Email } from '@domain/value-objects/email.value-object';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';

/**
 * ✅ OBLIGATOIRE - Interface de requête avec contexte complet
 */
export interface UpdateProfessionalRequest {
  readonly professionalId: string;
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phoneNumber?: string;
  readonly speciality?: string;
  readonly licenseNumber?: string;
  readonly bio?: string;
  readonly experience?: string;
  readonly profileImage?: string;
  // ⚠️ OBLIGATOIRE - Contexte de traçabilité
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

/**
 * ✅ OBLIGATOIRE - Interface de réponse avec données complètes
 */
export interface UpdateProfessionalResponse {
  readonly success: boolean;
  readonly data: {
    readonly id: string;
    readonly businessId: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly speciality: string;
    readonly licenseNumber?: string;
    readonly phoneNumber?: string;
    readonly profileImage?: string;
    readonly bio?: string;
    readonly experience?: string; // ✅ Maintenir cohérence avec entité (string)
    readonly isActive: boolean;
    readonly isVerified: boolean;
    readonly status: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
}

/**
 * ✅ OBLIGATOIRE - Use Case selon Clean Architecture + Instructions Copilot
 * Respecte les principes : Logging, I18n, Contexte, Audit, Exceptions
 */
export class UpdateProfessionalUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly logger: Logger, // ⚠️ OBLIGATOIRE
    private readonly i18n: I18nService, // ⚠️ OBLIGATOIRE
  ) {}

  /**
   * ✅ OBLIGATOIRE - Exécution du use case avec logging et validation complète
   */
  async execute(
    request: UpdateProfessionalRequest,
  ): Promise<UpdateProfessionalResponse> {
    // ✅ OBLIGATOIRE - Logging de début avec contexte complet
    this.logger.info('Updating professional', {
      professionalId: request.professionalId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      timestamp: request.timestamp.toISOString(),
    });

    try {
      // ✅ ÉTAPE 1 - Validation ID
      let professionalId: ProfessionalId;
      try {
        professionalId = ProfessionalId.fromString(request.professionalId);
      } catch (error) {
        const errorMessage = this.i18n.translate(
          'professional.errors.invalidId',
          {
            professionalId: request.professionalId,
          },
        );

        this.logger.error('Invalid professional ID format', error as Error, {
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        });

        throw new ProfessionalValidationError(errorMessage);
      }

      // ✅ ÉTAPE 2 - Récupérer le professionnel existant
      const existingProfessional =
        await this.professionalRepository.findById(professionalId);

      if (!existingProfessional) {
        const errorMessage = this.i18n.translate(
          'professional.errors.notFound',
          {
            professionalId: request.professionalId,
          },
        );

        this.logger.error(
          'Professional not found for update',
          new Error(errorMessage),
          {
            professionalId: request.professionalId,
            correlationId: request.correlationId,
          },
        );

        throw new ProfessionalNotFoundError(request.professionalId);
      }

      // ✅ ÉTAPE 3 - Validation des champs requis
      if (request.firstName !== undefined && !request.firstName?.trim()) {
        this.logger.error(
          'Professional update failed: empty first name',
          undefined,
          {
            correlationId: request.correlationId,
          },
        );
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.firstNameRequired'),
          { professionalId: request.professionalId },
        );
      }

      if (request.lastName !== undefined && !request.lastName?.trim()) {
        this.logger.error(
          'Professional update failed: empty last name',
          undefined,
          {
            correlationId: request.correlationId,
          },
        );
        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.lastNameRequired'),
          { professionalId: request.professionalId },
        );
      }

      // ✅ Validation des changements d'email
      if (request.email) {
        try {
          Email.create(request.email); // Validation du format
        } catch (error) {
          this.logger.error(
            'Professional update failed: invalid email format',
            error instanceof Error ? error : undefined,
            {
              email: request.email,
              correlationId: request.correlationId,
            },
          );
          throw new ProfessionalValidationError(
            this.i18n.translate('professional.errors.emailInvalid'),
            { professionalId: request.professionalId, email: request.email },
          );
        }
      }

      // ✅ ÉTAPE 4 - Préparer les données de mise à jour
      const updateData: {
        firstName?: string;
        lastName?: string;
        speciality?: string;
        phoneNumber?: string;
        experience?: number;
        licenseNumber?: string;
        email?: Email;
        updatedBy: string;
      } = {
        updatedBy: request.requestingUserId,
      };

      if (request.firstName !== undefined)
        updateData.firstName = request.firstName;
      if (request.lastName !== undefined)
        updateData.lastName = request.lastName;
      if (request.speciality !== undefined)
        updateData.speciality = request.speciality;
      if (request.phoneNumber !== undefined)
        updateData.phoneNumber = request.phoneNumber;
      if (request.email !== undefined)
        updateData.email = Email.create(request.email);
      if (request.experience !== undefined) {
        const experienceNum = Number(request.experience);
        if (isNaN(experienceNum) || experienceNum < 0) {
          this.logger.error(
            'Professional update failed: invalid experience',
            undefined,
            {
              experience: request.experience,
              correlationId: request.correlationId,
            },
          );
          throw new ProfessionalValidationError(
            this.i18n.translate('professional.validation.experienceInvalid'),
            {
              professionalId: request.professionalId,
              experience: request.experience,
            },
          );
        }
        updateData.experience = experienceNum;
      }
      if (request.licenseNumber !== undefined)
        updateData.licenseNumber = request.licenseNumber;

      // ✅ ÉTAPE 5 - Appliquer les modifications
      existingProfessional.update(updateData);

      // ✅ ÉTAPE 6 - Sauvegarder
      const updatedProfessional =
        await this.professionalRepository.save(existingProfessional);

      // ✅ OBLIGATOIRE - Logging de succès
      this.logger.info('Professional updated successfully', {
        professionalId: updatedProfessional.getId().getValue(),
        updatedBy: request.requestingUserId,
        updateFields: Object.keys(updateData).filter(
          (key) => key !== 'updatedBy',
        ),
        correlationId: request.correlationId,
      });

      // ✅ OBLIGATOIRE - Retourner la réponse complète
      return {
        success: true,
        data: {
          id: updatedProfessional.getId().getValue(),
          businessId: updatedProfessional.getBusinessId().getValue(),
          email: updatedProfessional.getEmail().toString(),
          firstName: updatedProfessional.getFirstName(),
          lastName: updatedProfessional.getLastName(),
          speciality: updatedProfessional.getSpeciality(),
          licenseNumber: updatedProfessional.getLicenseNumber(),
          phoneNumber: updatedProfessional.getPhoneNumber(),
          profileImage: updatedProfessional.getProfileImage(),
          bio: updatedProfessional.getBio(),
          experience: updatedProfessional.getExperience(),
          isActive: updatedProfessional.isActive(),
          isVerified: updatedProfessional.isVerified(),
          status: updatedProfessional.getStatus(),
          createdAt: updatedProfessional.getCreatedAt(),
          updatedAt: updatedProfessional.getUpdatedAt(),
        },
      };
    } catch (error) {
      // ✅ OBLIGATOIRE - Gestion des erreurs repository avec logging
      if (
        !(error instanceof ProfessionalNotFoundError) &&
        !(error instanceof ProfessionalValidationError)
      ) {
        this.logger.error(
          'Repository error during professional update',
          error as Error,
          {
            professionalId: request.professionalId,
            correlationId: request.correlationId,
          },
        );
      }

      throw error;
    }
  }
}
