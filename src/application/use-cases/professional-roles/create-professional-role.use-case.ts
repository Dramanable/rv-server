/**
 * 🏥 APPLICATION USE CASE - CreateProfessionalRole
 * Clean Architecture - Application Layer
 * Cas d'usage pour créer un rôle professionnel
 */

import {
  ProfessionalRole,
  ProfessionalCategory,
} from '@domain/entities/professional-role.entity';
import { IProfessionalRoleRepository } from '@domain/repositories/professional-role.repository';
import {
  ProfessionalRoleCodeAlreadyExistsError,
  ProfessionalRoleValidationError,
} from '@domain/exceptions/professional-role.exceptions';

export interface CreateProfessionalRoleRequest {
  readonly code: string;
  readonly name: string;
  readonly displayName: string;
  readonly category: ProfessionalCategory;
  readonly description: string;
  readonly canLead?: boolean;
  readonly requestingUserId: string;
}

export interface CreateProfessionalRoleResponse {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly displayName: string;
  readonly category: ProfessionalCategory;
  readonly description: string;
  readonly canLead: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class CreateProfessionalRoleUseCase {
  constructor(
    private readonly professionalRoleRepository: IProfessionalRoleRepository,
  ) {}

  async execute(
    request: CreateProfessionalRoleRequest,
  ): Promise<CreateProfessionalRoleResponse> {
    // 🔍 Validate request
    if (
      !request.code ||
      !request.name ||
      !request.displayName ||
      !request.description
    ) {
      throw new ProfessionalRoleValidationError('Missing required fields');
    }

    if (!request.requestingUserId) {
      throw new ProfessionalRoleValidationError(
        'Requesting user ID is required',
      );
    }

    // 🔍 Check if code already exists
    const existingRole = await this.professionalRoleRepository.findByCode(
      request.code.trim().toUpperCase(),
    );
    if (existingRole) {
      throw new ProfessionalRoleCodeAlreadyExistsError(request.code);
    }

    // 🏗️ Create professional role
    const professionalRole = ProfessionalRole.create({
      code: request.code,
      name: request.name,
      displayName: request.displayName,
      category: request.category,
      description: request.description,
      canLead: request.canLead,
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
