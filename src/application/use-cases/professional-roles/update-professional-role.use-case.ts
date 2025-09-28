/**
 * 🏥 APPLICATION USE CASE - UpdateProfessionalRole
 * Clean Architecture - Application Layer
 * Cas d'usage pour mettre à jour un rôle professionnel
 */

import { IProfessionalRoleRepository } from '@domain/repositories/professional-role.repository';
import {
  ProfessionalRoleValidationError,
  ProfessionalRoleNotFoundError,
} from '@domain/exceptions/professional-role.exceptions';

export interface UpdateProfessionalRoleRequest {
  readonly professionalRoleId: string;
  readonly displayName?: string;
  readonly description?: string;
  readonly canLead?: boolean;
  readonly isActive?: boolean;
  readonly requestingUserId: string;
}

export interface UpdateProfessionalRoleResponse {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly displayName: string;
  readonly category: string;
  readonly description: string;
  readonly canLead: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class UpdateProfessionalRoleUseCase {
  constructor(
    private readonly professionalRoleRepository: IProfessionalRoleRepository,
  ) {}

  async execute(
    request: UpdateProfessionalRoleRequest,
  ): Promise<UpdateProfessionalRoleResponse> {
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

    // Check if at least one field is provided for update
    const hasUpdateFields =
      request.displayName !== undefined ||
      request.description !== undefined ||
      request.canLead !== undefined ||
      request.isActive !== undefined;

    if (!hasUpdateFields) {
      throw new ProfessionalRoleValidationError(
        'At least one field must be provided for update',
      );
    }

    // 🔍 Find professional role
    const professionalRole = await this.professionalRoleRepository.findById(
      request.professionalRoleId,
    );
    if (!professionalRole) {
      throw new ProfessionalRoleNotFoundError(request.professionalRoleId);
    }

    // 🔄 Update professional role
    professionalRole.update({
      displayName: request.displayName,
      description: request.description,
      canLead: request.canLead,
      isActive: request.isActive,
    });

    // 💾 Save to repository
    const savedRole =
      await this.professionalRoleRepository.save(professionalRole);

    // 📄 Return response
    return {
      id: savedRole.getId(),
      code: savedRole.getCode(),
      name: savedRole.getName(),
      displayName: savedRole.getDisplayName(),
      category: savedRole.getCategory(),
      description: savedRole.getDescription(),
      canLead: savedRole.getCanLead(),
      isActive: savedRole.getIsActive(),
      createdAt: savedRole.getCreatedAt(),
      updatedAt: savedRole.getUpdatedAt(),
    };
  }
}
