/**
 * 🔄 UpdateStaffUseCase - Cas d'usage de mise à jour du personnel
 *
 * Couche Application - Orchestration métier pour modification du personnel
 * Aucune dépendance vers les frameworks (NestJS, TypeORM, etc.)
 */

import {
  Staff,
  StaffProfile,
  StaffStatus,
} from '../../../domain/entities/staff.entity';
import { StaffNotFoundError } from '../../../domain/exceptions/staff.exceptions';
import { StaffRepository } from '../../../domain/repositories/staff.repository.interface';
import { Email } from '../../../domain/value-objects/email.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { Permission } from '../../../shared/enums/permission.enum';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPermissionService } from '../../ports/permission.service.interface';

export interface UpdateStaffRequest {
  readonly staffId: string;
  readonly requestingUserId: string;
  readonly updates: {
    readonly profile?: Partial<StaffProfile>;
    readonly email?: string;
    readonly status?: StaffStatus;
    readonly availability?: any; // TODO: Define proper type
  };
}

export interface UpdateStaffResponse {
  readonly id: string;
  readonly businessId: string;
  readonly profile: {
    readonly firstName: string;
    readonly lastName: string;
    readonly specialization?: string;
  };
  readonly role: string;
  readonly email: string;
  readonly status: string;
  readonly updatedAt: Date;
}

export class UpdateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(request: UpdateStaffRequest): Promise<UpdateStaffResponse> {
    try {
      // 1. Validation des paramètres
      this.validateParameters(request);

      // 2. Vérifier les permissions avec IPermissionService
      await this.permissionService.requirePermission(
        request.requestingUserId,
        Permission.MANAGE_STAFF,
        {
          action: 'update',
          resource: 'staff',
          staffId: request.staffId,
        },
      );

      // 3. Log de l'opération
      this.logger.info('Attempting to update staff', {
        staffId: request.staffId,
        requestingUserId: request.requestingUserId,
      });

      // 4. Récupérer le staff existant
      const staffId = UserId.create(request.staffId);
      const staff = await this.staffRepository.findById(staffId);

      if (!staff) {
        throw new StaffNotFoundError(request.staffId);
      }

      // 5. Validation des règles métier
      await this.validateBusinessRules(request, staff);

      // 6. Appliquer les modifications
      this.applyUpdates(staff, request.updates);

      // 7. Sauvegarder
      await this.staffRepository.save(staff);

      // 8. Log du succès
      this.logger.info('Staff updated successfully', {
        staffId: request.staffId,
        requestingUserId: request.requestingUserId,
      });

      // 9. Retourner la réponse
      return this.mapStaffToResponse(staff);
    } catch (error) {
      this.logger.error('Error updating staff', error as Error, {
        staffId: request.staffId,
        requestingUserId: request.requestingUserId,
      });
      throw error;
    }
  }

  private validateParameters(request: UpdateStaffRequest): void {
    if (!request.staffId || request.staffId.trim() === '') {
      throw new ApplicationValidationError(
        'staffId',
        request.staffId,
        'Staff ID is required',
      );
    }

    if (!request.requestingUserId || request.requestingUserId.trim() === '') {
      throw new ApplicationValidationError(
        'requestingUserId',
        request.requestingUserId,
        'Requesting user ID is required',
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.staffId)) {
      throw new ApplicationValidationError(
        'staffId',
        request.staffId,
        'Staff ID must be a valid UUID',
      );
    }

    // Validate updates not empty
    if (!request.updates || Object.keys(request.updates).length === 0) {
      throw new ApplicationValidationError(
        'updates',
        'empty',
        'At least one field must be updated',
      );
    }
  }

  private async validateBusinessRules(
    request: UpdateStaffRequest,
    staff: Staff,
  ): Promise<void> {
    // Validate profile updates
    if (request.updates.profile) {
      if (
        request.updates.profile.firstName !== undefined &&
        request.updates.profile.firstName.length < 2
      ) {
        throw new ApplicationValidationError(
          'firstName',
          request.updates.profile.firstName,
          'First name must be at least 2 characters long',
        );
      }

      if (
        request.updates.profile.lastName !== undefined &&
        request.updates.profile.lastName.length < 2
      ) {
        throw new ApplicationValidationError(
          'lastName',
          request.updates.profile.lastName,
          'Last name must be at least 2 characters long',
        );
      }
    }

    // Validate email updates
    if (request.updates.email) {
      try {
        Email.create(request.updates.email);
      } catch (error) {
        throw new ApplicationValidationError(
          'email',
          request.updates.email,
          'Invalid email format',
        );
      }

      // Check if email already exists (excluding current staff)
      const existingEmail = await this.staffRepository.existsByEmail(
        Email.create(request.updates.email),
      );
      if (existingEmail && request.updates.email !== staff.email.getValue()) {
        throw new ApplicationValidationError(
          'email',
          request.updates.email,
          'Email already exists',
        );
      }
    }
  }

  private applyUpdates(
    staff: Staff,
    updates: UpdateStaffRequest['updates'],
  ): void {
    // Apply profile updates
    if (updates.profile) {
      const currentProfile = staff.profile;
      const updatedProfile: StaffProfile = {
        ...currentProfile,
        ...updates.profile,
      };
      (staff as any)._profile = updatedProfile;
    }

    // Apply email updates
    if (updates.email) {
      (staff as any)._email = Email.create(updates.email);
    }

    // Apply status updates
    if (updates.status) {
      (staff as any)._status = updates.status;
    }

    // Update timestamp
    (staff as any)._updatedAt = new Date();
  }

  private mapStaffToResponse(staff: Staff): UpdateStaffResponse {
    return {
      id: staff.id.getValue(),
      businessId: staff.businessId.getValue(),
      profile: {
        firstName: staff.profile.firstName,
        lastName: staff.profile.lastName,
        specialization: staff.profile.specialization,
      },
      role: staff.role,
      email: staff.email.getValue(),
      status: staff.status,
      updatedAt: staff.updatedAt,
    };
  }
}
