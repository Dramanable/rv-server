/**
 * @fileoverview CreateProfessionalUseCase
 * @module application/use-cases/professionals/create-professional.use-case
 * @description Use case pour créer un nouveau professionnel avec logging, audit et i18n
 */

import { IAuditService } from '@application/ports/audit.port';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { Professional } from '@domain/entities/professional.entity';
import { ProfessionalValidationError } from '@domain/exceptions/professional.exceptions';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';

/**
 * Interface de requête pour créer un professionnel
 */
export interface CreateProfessionalRequest {
  readonly businessId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly speciality: string;
  readonly licenseNumber: string;
  readonly phoneNumber?: string;
  readonly bio?: string;
  readonly experience?: number;

  // ⚠️ CONTEXTE OBLIGATOIRE (Instructions Copilot)
  readonly requestingUserId: string; // Qui fait l'action
  readonly correlationId: string; // Traçabilité unique
  readonly clientIp?: string; // IP client (sécurité)
  readonly userAgent?: string; // User agent
  readonly timestamp: Date; // Horodatage précis
}

/**
 * Interface de réponse pour la création d'un professionnel
 */
export interface CreateProfessionalResponse {
  readonly success: true;
  readonly data: {
    readonly id: string;
    readonly businessId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly fullName: string;
    readonly email: string;
    readonly speciality: string;
    readonly licenseNumber: string;
    readonly phoneNumber?: string;
    readonly bio?: string;
    readonly experience?: string;
    readonly isActive: boolean;
    readonly isVerified: boolean;
    readonly status: string;
    readonly createdBy: string;
    readonly updatedBy: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
  readonly meta: {
    readonly correlationId: string;
    readonly timestamp: Date;
  };
}

/**
 * Use case pour créer un nouveau professionnel
 * ✅ RESPECT OBLIGATIONS COPILOT : Logging + I18n + Context + Audit
 */
export class CreateProfessionalUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly logger: Logger, // ⚠️ OBLIGATOIRE
    private readonly i18n: I18nService, // ⚠️ OBLIGATOIRE
    private readonly auditService: IAuditService, // ⚠️ OBLIGATOIRE
  ) {}

  /**
   * Exécute la création d'un professionnel
   */
  async execute(
    request: CreateProfessionalRequest,
  ): Promise<CreateProfessionalResponse> {
    // ✅ OBLIGATOIRE - Logging avec contexte complet
    this.logger.info('Creating new professional', {
      businessId: request.businessId,
      professionalEmail: request.email,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      clientIp: request.clientIp,
      userAgent: request.userAgent,
    });

    try {
      // 1. Validation des données d'entrée
      this.validateRequest(request);

      // 2. Création des Value Objects
      const businessId = BusinessId.fromString(request.businessId);
      const email = Email.create(request.email);

      // 3. Vérification de l'unicité de l'email
      const existsByEmail =
        await this.professionalRepository.existsByEmail(email);
      if (existsByEmail) {
        this.logger.error(
          'Professional creation failed: email already exists',
          undefined, // No Error object
          {
            email: request.email,
            businessId: request.businessId,
            correlationId: request.correlationId,
          },
        );

        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.emailAlreadyExists', {
            email: request.email,
          }),
          { email: request.email },
        );
      }

      // 4. Vérification de l'unicité du numéro de licence
      const existsByLicense =
        await this.professionalRepository.existsByLicenseNumber(
          request.licenseNumber,
        );
      if (existsByLicense) {
        this.logger.error(
          'Professional creation failed: license number already exists',
          undefined, // No Error object
          {
            licenseNumber: request.licenseNumber,
            businessId: request.businessId,
            correlationId: request.correlationId,
          },
        );

        throw new ProfessionalValidationError(
          this.i18n.translate('professional.validation.licenseAlreadyExists', {
            licenseNumber: request.licenseNumber,
          }),
          { licenseNumber: request.licenseNumber },
        );
      }

      // 5. Création de l'entité Professional
      const professional = Professional.create({
        businessId,
        email,
        firstName: request.firstName,
        lastName: request.lastName,
        speciality: request.speciality,
        licenseNumber: request.licenseNumber,
        phoneNumber: request.phoneNumber,
        bio: request.bio,
        experience: request.experience,
        createdBy: request.requestingUserId,
      });

      // 6. Sauvegarde en repository
      const savedProfessional =
        await this.professionalRepository.save(professional);

      // ✅ OBLIGATOIRE - Audit Trail
      await this.auditService.logOperation({
        operation: 'CREATE_PROFESSIONAL',
        entityType: 'PROFESSIONAL',
        entityId: savedProfessional.getId().getValue(),
        businessId: request.businessId,
        userId: request.requestingUserId,
        correlationId: request.correlationId,
        changes: {
          created: savedProfessional.toJSON(),
        },
        timestamp: new Date(),
      });

      this.logger.info('Professional created successfully', {
        professionalId: savedProfessional.getId().getValue(),
        businessId: request.businessId,
        email: request.email,
        correlationId: request.correlationId,
      });

      // 7. Mapping vers la réponse
      return this.mapToResponse(savedProfessional, request.correlationId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(
        'Failed to create professional',
        error instanceof Error ? error : undefined,
        {
          message: errorMessage,
          businessId: request.businessId,
          email: request.email,
          correlationId: request.correlationId,
          stack: errorStack,
        },
      );
      throw error;
    }
  }

  /**
   * Valide la requête de création
   */
  private validateRequest(request: CreateProfessionalRequest): void {
    if (!request.firstName?.trim()) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.firstNameRequired'),
      );
    }

    if (!request.lastName?.trim()) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.lastNameRequired'),
      );
    }

    if (!request.speciality?.trim()) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.specialityRequired'),
      );
    }

    if (!request.licenseNumber?.trim()) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.licenseRequired'),
      );
    }

    if (request.experience !== undefined && request.experience < 0) {
      throw new ProfessionalValidationError(
        this.i18n.translate('professional.validation.experienceInvalid'),
        { experience: request.experience },
      );
    }
  }

  /**
   * Mappe l'entité Professional vers la réponse
   */
  private mapToResponse(
    professional: Professional,
    correlationId: string,
  ): CreateProfessionalResponse {
    return {
      success: true,
      data: {
        id: professional.getId().getValue(),
        businessId: professional.getBusinessId().getValue(),
        firstName: professional.getFirstName(),
        lastName: professional.getLastName(),
        fullName: professional.getFullName(),
        email: professional.getEmail().toString(),
        speciality: professional.getSpeciality(),
        licenseNumber: professional.getLicenseNumber() || '',
        phoneNumber: professional.getPhoneNumber(),
        bio: professional.getBio(),
        experience: professional.getExperience(),
        isActive: professional.isActive(),
        isVerified: professional.isVerified(),
        status: professional.getStatus(),
        createdBy: professional.getCreatedBy(),
        updatedBy: professional.getUpdatedBy(),
        createdAt: professional.getCreatedAt(),
        updatedAt: professional.getUpdatedAt(),
      },
      meta: {
        correlationId,
        timestamp: new Date(),
      },
    };
  }
}
