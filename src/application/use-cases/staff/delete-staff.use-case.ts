/**
 * 🧪 DeleteStaffUseCase - Phase TDD: RED → GREEN → REFACTOR
 *
 * Cas d'usage pour la suppression d'un membre du personnel
 * Couche Application - Orchestration métier
 */

import { StaffRepository } from '../../../domain/repositories/staff.repository.interface';
import { Logger } from '../../ports/logger.port';
import { I18nService } from '../../ports/i18n.port';
import {
  ApplicationValidationError,
  ResourceNotFoundError,
} from '../../exceptions/application.exceptions';
import { UserId } from '../../../domain/value-objects/user-id.value-object';

export interface DeleteStaffRequest {
  readonly staffId: string;
  readonly requestingUserId: string;
}

export interface DeleteStaffResponse {
  readonly success: boolean;
  readonly staffId: string;
  readonly message: string;
}

export class DeleteStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: DeleteStaffRequest): Promise<DeleteStaffResponse> {
    try {
      // Phase GREEN - Implémentation minimale qui fait passer les tests
      this.logger.info('Attempting to delete staff', {
        staffId: request.staffId,
        requestingUserId: request.requestingUserId,
      });

      // 1. Validation des paramètres
      await this.validateParameters(request);

      // 2. Récupérer le staff
      const staff = await this.staffRepository.findById(
        UserId.create(request.staffId),
      );
      if (!staff) {
        const error = new ResourceNotFoundError('Staff', request.staffId);
        this.logger.error('Staff not found', error, {
          staffId: request.staffId,
        });
        throw error;
      }

      // 3. Valider les règles métier
      await this.validateBusinessRules(staff, request.staffId);

      // 4. Supprimer le staff
      await this.staffRepository.delete(staff.id);

      // 5. Log du succès
      this.logger.info('Staff deleted successfully', {
        staffId: request.staffId,
        staffName: staff.fullName,
      });

      return {
        success: true,
        staffId: request.staffId,
        message: this.i18n.translate('staff.deleted.success'),
      };
    } catch (error) {
      this.logger.error('Error deleting staff', error as Error, {
        staffId: request.staffId,
      });
      throw error;
    }
  }

  private async validateParameters(request: DeleteStaffRequest): Promise<void> {
    if (!request.staffId || request.staffId.trim() === '') {
      throw new ApplicationValidationError(
        'staff',
        request.staffId,
        this.i18n.translate('validation.staffId.required'),
      );
    }

    if (!request.requestingUserId || request.requestingUserId.trim() === '') {
      throw new ApplicationValidationError(
        'staff',
        request.requestingUserId,
        this.i18n.translate('validation.requestingUserId.required'),
      );
    }

    // Validation UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.staffId)) {
      throw new ApplicationValidationError(
        'staff',
        request.staffId,
        this.i18n.translate('validation.staffId.invalid'),
      );
    }
  }

  private async validateBusinessRules(
    staff: any,
    staffId: string,
  ): Promise<void> {
    // Vérifier si le staff peut être supprimé selon les règles métier
    if (!staff.canBeDeleted()) {
      throw new ApplicationValidationError(
        'staff',
        staffId,
        this.i18n.translate('staff.delete.hasActiveAppointments'),
      );
    }
  }
}
