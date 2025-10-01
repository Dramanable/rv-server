/**
 * 🏥 APPLICATION USE CASE - ListProfessionalRoles
 * Clean Architecture - Application Layer
 * Cas d'usage pour lister les rôles professionnels avec filtrage et pagination
 */

import {
  ProfessionalCategory,
  ProfessionalRole,
} from "@domain/entities/professional-role.entity";
import { ProfessionalRoleValidationError } from "@domain/exceptions/professional-role.exceptions";
import { IProfessionalRoleRepository } from "@domain/repositories/professional-role.repository";

export interface ListProfessionalRolesRequest {
  readonly category?: ProfessionalCategory;
  readonly isActive?: boolean;
  readonly canLead?: boolean;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly requestingUserId: string;
}

export interface ListProfessionalRolesResponse {
  readonly data: Array<{
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
  }>;
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class ListProfessionalRolesUseCase {
  constructor(
    private readonly professionalRoleRepository: IProfessionalRoleRepository,
  ) {}

  async execute(
    request: ListProfessionalRolesRequest,
  ): Promise<ListProfessionalRolesResponse> {
    // 🔍 Validate request
    if (!request.requestingUserId) {
      throw new ProfessionalRoleValidationError(
        "Requesting user ID is required",
      );
    }

    const page = request.page || 1;
    const limit = Math.min(request.limit || 10, 100); // Max 100 items per page

    if (page < 1) {
      throw new ProfessionalRoleValidationError("Page must be greater than 0");
    }

    if (limit < 1) {
      throw new ProfessionalRoleValidationError("Limit must be greater than 0");
    }

    // 🔍 Get professional roles based on filters
    let professionalRoles: ProfessionalRole[] = [];

    if (request.search) {
      professionalRoles = await this.professionalRoleRepository.search(
        request.search,
      );
    } else if (request.category) {
      professionalRoles = await this.professionalRoleRepository.findByCategory(
        request.category,
      );
    } else if (request.canLead === true) {
      professionalRoles =
        await this.professionalRoleRepository.findLeaderRoles();
    } else if (request.isActive === true) {
      professionalRoles = await this.professionalRoleRepository.findActive();
    } else {
      professionalRoles = await this.professionalRoleRepository.findAll();
    }

    // 🎯 Apply additional filters
    let filteredRoles = professionalRoles;

    if (
      request.isActive !== undefined &&
      !request.search &&
      request.category === undefined &&
      request.canLead !== true
    ) {
      filteredRoles = professionalRoles.filter(
        (role) => role.getIsActive() === request.isActive,
      );
    }

    if (request.canLead !== undefined && request.canLead !== true) {
      filteredRoles = filteredRoles.filter(
        (role) => role.getCanLead() === request.canLead,
      );
    }

    // 📊 Calculate pagination
    const totalItems = filteredRoles.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

    // 📄 Transform to response format
    const data = paginatedRoles.map((role) => ({
      id: role.getId(),
      code: role.getCode(),
      name: role.getName(),
      displayName: role.getDisplayName(),
      category: role.getCategory(),
      description: role.getDescription(),
      canLead: role.getCanLead(),
      isActive: role.getIsActive(),
      createdAt: role.getCreatedAt(),
      updatedAt: role.getUpdatedAt(),
    }));

    // 📄 Return response
    return {
      data,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
