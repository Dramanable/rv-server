/**
 * 🏥 APPLICATION USE CASE - GetProfessionalRole
 * Clean Architecture - Application Layer
 * Cas d'usage pour récupérer un rôle professionnel par ID
 */

import { ProfessionalRole } from '@domain/entities/professional-role.entity';
import { IProfessionalRoleRepository } from '@domain/repositories/professional-role.repository';
import {
  ProfessionalRoleNotFoundError,
  ProfessionalRoleValidationError,
} from '@domain/exceptions/professional-role.exceptions';

export interface GetProfessionalRoleRequest {
  readonly professionalRoleId: string;
  readonly requestingUserId: string;
}

export interface GetProfessionalRoleResponse {
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

export class GetProfessionalRoleUseCase {
  constructor(
    private readonly professionalRoleRepository: IProfessionalRoleRepository,
  ) {}

  async execute(
    request: GetProfessionalRoleRequest,
  ): Promise<GetProfessionalRoleResponse> {
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

    // 📄 Return response
    return {
      id: professionalRole.getId(),
      code: professionalRole.getCode(),
      name: professionalRole.getName(),
      displayName: professionalRole.getDisplayName(),
      category: professionalRole.getCategory(),
      description: professionalRole.getDescription(),
      canLead: professionalRole.getCanLead(),
      isActive: professionalRole.getIsActive(),
      createdAt: professionalRole.getCreatedAt(),
      updatedAt: professionalRole.getUpdatedAt(),
    };
  }
}
