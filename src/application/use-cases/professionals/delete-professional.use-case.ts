/**
 * @fileoverview DeleteProfessionalUseCase
 * @module application/use-cases/professionals/delete-professional.use-case
 * @description Use case pour supprimer un professionnel selon la Clean Architecture
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import {
  ProfessionalNotFoundError,
  ProfessionalValidationError,
} from '@domain/exceptions/professional.exceptions';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';

/**
 * ✅ OBLIGATOIRE - Interface de requête avec contexte complet
 */
export interface DeleteProfessionalRequest {
  readonly professionalId: string;
  // ⚠️ OBLIGATOIRE - Contexte de traçabilité
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

/**
 * ✅ OBLIGATOIRE - Interface de réponse avec confirmation
 */
export interface DeleteProfessionalResponse {
  readonly success: boolean;
  readonly data: {
    readonly deleted: boolean;
    readonly professionalId: string;
  };
}

/**
 * ✅ OBLIGATOIRE - Use Case selon Clean Architecture + Instructions Copilot
 * Respecte les principes : Logging, I18n, Contexte, Audit, Exceptions
 */
export class DeleteProfessionalUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly logger: Logger, // ⚠️ OBLIGATOIRE
    private readonly i18n: I18nService, // ⚠️ OBLIGATOIRE
  ) {}

  /**
   * ✅ OBLIGATOIRE - Exécution du use case avec logging et validation complète
   */
  async execute(
    request: DeleteProfessionalRequest,
  ): Promise<DeleteProfessionalResponse> {
    // ✅ OBLIGATOIRE - Validation des champs requis
    if (!request.correlationId) {
      throw new ProfessionalValidationError(
        'Correlation ID is required for deletion',
      );
    }

    // ✅ OBLIGATOIRE - Logging de début avec contexte complet
    this.logger.info('Deleting professional', {
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

      // ✅ ÉTAPE 2 - Vérifier existence du professionnel
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
          'Professional not found for deletion',
          new Error(errorMessage),
          {
            professionalId: request.professionalId,
            correlationId: request.correlationId,
          },
        );

        throw new ProfessionalNotFoundError(request.professionalId);
      }

      // ✅ ÉTAPE 3 - Validation des règles métier
      if (
        existingProfessional.getStatus() === 'ACTIVE' &&
        (existingProfessional as any).hasActiveAppointments
      ) {
        const errorMessage = this.i18n.translate(
          'professional.errors.cannotDeleteWithAppointments',
          {
            professionalId: request.professionalId,
          },
        );

        this.logger.error(
          'Cannot delete professional with active appointments',
          undefined,
          {
            professionalId: request.professionalId,
            correlationId: request.correlationId,
          },
        );

        throw new ProfessionalValidationError(errorMessage);
      }

      // ✅ ÉTAPE 4 - Supprimer le professionnel
      await this.professionalRepository.deleteById(professionalId);

      // ✅ OBLIGATOIRE - Logging de succès
      this.logger.info('Professional deleted successfully', {
        professionalId: request.professionalId,
        deletedBy: request.requestingUserId,
        correlationId: request.correlationId,
      });

      // ✅ OBLIGATOIRE - Retourner la réponse de confirmation
      return {
        success: true,
        data: {
          deleted: true,
          professionalId: request.professionalId,
        },
      };
    } catch (error) {
      // ✅ OBLIGATOIRE - Gestion des erreurs repository avec logging
      if (
        !(error instanceof ProfessionalNotFoundError) &&
        !(error instanceof ProfessionalValidationError)
      ) {
        this.logger.error(
          'Repository error during professional deletion',
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
