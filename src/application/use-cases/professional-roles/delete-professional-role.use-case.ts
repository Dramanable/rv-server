/**
 * 🏥 APPLICATION USE CASE - DeleteProfessionalRole
 * Clean Architecture - Application Layer
 * Cas d'usage pour supprimer un rôle professionnel
 */

import {
  ProfessionalRoleInUseError,
  ProfessionalRoleNotFoundError,
  ProfessionalRoleValidationError,
} from '@domain/exceptions/professional-role.exceptions';
import { IProfessionalRoleRepository } from '@domain/repositories/professional-role.repository';

export interface DeleteProfessionalRoleRequest {
  readonly professionalRoleId: string;
  readonly requestingUserId: string;
}

export interface DeleteProfessionalRoleResponse {
  readonly success: boolean;
  readonly message: string;
}

export class DeleteProfessionalRoleUseCase {
  constructor(
    private readonly professionalRoleRepository: IProfessionalRoleRepository,
  ) {}

  async execute(
    request: DeleteProfessionalRoleRequest,
  ): Promise<DeleteProfessionalRoleResponse> {
    // 🔍 Validate request
    if (!request.professionalRoleId) {
      throw new ProfessionalRoleValidationError(
        'Professional role ID is required',
      );
    }

    if (!request.requestingUserId) {
      throw new ProfessionalRoleValidationError(
        'Requesting user ID is required',
      );
    }

    // 🔍 Find professional role
    const professionalRole = await this.professionalRoleRepository.findById(
      request.professionalRoleId,
    );
    if (!professionalRole) {
      throw new ProfessionalRoleNotFoundError(request.professionalRoleId);
    }

    // 🔒 Business rule: Cannot delete predefined roles
    const predefinedCodes = [
      'DOCTOR',
      'SURGEON',
      'NURSE',
      'DENTIST',
      'DENTAL_HYGIENIST',
      'PSYCHOLOGIST',
      'LAWYER',
      'CONSULTANT',
    ];
    if (predefinedCodes.includes(professionalRole.getCode())) {
      throw new ProfessionalRoleInUseError(professionalRole.getCode());
    }

    // TODO: Check if role is currently assigned to any staff members
    // This would require a StaffRepository dependency to check usage
    // For now, we'll implement basic deletion

    // 🗑️ Delete professional role
    await this.professionalRoleRepository.delete(request.professionalRoleId);

    // 📄 Return response
    return {
      success: true,
      message: `Professional role "${professionalRole.getDisplayName()}" has been successfully deleted`,
    };
  }
}
