/**
 * 🏥 PRESENTATION MAPPER - ProfessionalRole
 * Clean Architecture - Presentation Layer
 * Mappers bidirectionnels entre DTOs et Domain/Application
 */

import { ProfessionalRole } from "@domain/entities/professional-role.entity";
import {
  CreateProfessionalRoleDto,
  CreateProfessionalRoleResponseDto,
  DeleteProfessionalRoleResponseDto,
  ListProfessionalRolesDto,
  ListProfessionalRolesResponseDto,
  ProfessionalRoleDto,
  UpdateProfessionalRoleDto,
  UpdateProfessionalRoleResponseDto,
} from "@presentation/dtos/professional-roles/professional-role.dto";

// Import des interfaces Use Case
import { CreateProfessionalRoleRequest } from "@application/use-cases/professional-roles/create-professional-role.use-case";
import { GetProfessionalRoleResponse } from "@application/use-cases/professional-roles/get-professional-role.use-case";
import {
  ListProfessionalRolesRequest,
  ListProfessionalRolesResponse,
} from "@application/use-cases/professional-roles/list-professional-roles.use-case";
import { UpdateProfessionalRoleRequest } from "@application/use-cases/professional-roles/update-professional-role.use-case";

export class ProfessionalRoleMapper {
  /**
   * Convertit une entité Domain vers DTO de présentation
   */
  static toDto(domain: ProfessionalRole): ProfessionalRoleDto {
    return {
      id: domain.getId(),
      code: domain.getCode(),
      name: domain.getName(),
      displayName: domain.getDisplayName(),
      category: domain.getCategory(),
      description: domain.getDescription(),
      canLead: domain.getCanLead(),
      isActive: domain.getIsActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
    };
  }

  /**
   * Convertit un objet plain (depuis use case response) vers DTO
   */
  static plainToDto(plain: {
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
  }): ProfessionalRoleDto {
    return {
      id: plain.id,
      code: plain.code,
      name: plain.name,
      displayName: plain.displayName,
      category: plain.category as any,
      description: plain.description,
      canLead: plain.canLead,
      isActive: plain.isActive,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }

  /**
   * Convertit une liste d'entités Domain vers DTOs
   */
  static toDtos(domains: ProfessionalRole[]): ProfessionalRoleDto[] {
    return domains.map((domain) => this.toDto(domain));
  }

  /**
   * Convertit une liste d'objets plain vers DTOs
   */
  static plainToDtos(
    plains: Array<{
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
    }>,
  ): ProfessionalRoleDto[] {
    return plains.map((plain) => this.plainToDto(plain));
  }

  /**
   * Convertit un DTO de création vers requête Use Case
   */
  static toCreateRequest(
    dto: CreateProfessionalRoleDto,
    requestingUserId: string,
  ): CreateProfessionalRoleRequest {
    return {
      code: dto.code,
      name: dto.name,
      displayName: dto.displayName,
      category: dto.category,
      description: dto.description,
      canLead: dto.canLead || false,
      requestingUserId,
    };
  }

  /**
   * Convertit un DTO de mise à jour vers requête Use Case
   */
  static toUpdateRequest(
    id: string,
    dto: UpdateProfessionalRoleDto,
    requestingUserId: string,
  ): UpdateProfessionalRoleRequest {
    return {
      professionalRoleId: id,
      displayName: dto.displayName,
      description: dto.description,
      canLead: dto.canLead,
      isActive: dto.isActive,
      requestingUserId,
    };
  }

  /**
   * Convertit un DTO de liste vers requête Use Case
   */
  static toListRequest(
    dto: ListProfessionalRolesDto,
    requestingUserId: string,
  ): ListProfessionalRolesRequest {
    return {
      category: dto.category,
      isActive: dto.isActive,
      canLead: dto.canLead,
      search: dto.search,
      page: dto.page || 1,
      limit: dto.limit || 10,
      requestingUserId,
    };
  }

  /**
   * Convertit une réponse Use Case vers DTO de création
   */
  static toCreateResponse(response: {
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
  }): CreateProfessionalRoleResponseDto {
    return {
      success: true,
      data: this.plainToDto(response),
    };
  }

  /**
   * Convertit une réponse Use Case vers DTO de mise à jour
   */
  static toUpdateResponse(response: {
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
  }): UpdateProfessionalRoleResponseDto {
    return {
      success: true,
      data: this.plainToDto(response),
    };
  }

  /**
   * Crée une réponse de suppression
   */
  static toDeleteResponse(): DeleteProfessionalRoleResponseDto {
    return {
      success: true,
      message: "Professional role deleted successfully",
    };
  }

  /**
   * Convertit une réponse Use Case de liste vers DTO de liste
   */
  static toListResponse(
    response: ListProfessionalRolesResponse,
  ): ListProfessionalRolesResponseDto {
    return {
      data: this.plainToDtos(response.data),
      meta: {
        currentPage: response.meta.currentPage,
        totalPages: response.meta.totalPages,
        totalItems: response.meta.totalItems,
        itemsPerPage: response.meta.itemsPerPage,
        hasNextPage: response.meta.hasNextPage,
        hasPrevPage: response.meta.hasPrevPage,
      },
    };
  }

  /**
   * Convertit une réponse Use Case Get vers DTO
   */
  static toGetResponse(
    response: GetProfessionalRoleResponse,
  ): ProfessionalRoleDto {
    return this.plainToDto(response);
  }
}
