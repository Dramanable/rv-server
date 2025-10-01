/**
 * 🎯 PRESENTATION MAPPER - Permission
 * Clean Architecture - Presentation Layer
 * Mapper pour convertir entre Domain Entities et DTOs de présentation
 */

import type { CreatePermissionRequest } from "@application/use-cases/permissions/create-permission.use-case";
import type { ListPermissionsRequest } from "@application/use-cases/permissions/list-permissions.use-case";
import type { UpdatePermissionRequest } from "@application/use-cases/permissions/update-permission.use-case";
import type { Permission } from "@domain/entities/permission.entity";
import type { CreatePermissionDto } from "../dtos/permissions/create-permission.dto";
import type { ListPermissionsDto } from "../dtos/permissions/list-permissions.dto";
import type { PermissionResponseDto } from "../dtos/permissions/permission-response.dto";
import type { UpdatePermissionDto } from "../dtos/permissions/update-permission.dto";

/**
 * 🔄 Mapper statique pour conversions Permission
 */
export class PermissionMapper {
  /**
   * Convertit un CreatePermissionDto vers CreatePermissionRequest
   */
  static toCreatePermissionRequest(
    dto: CreatePermissionDto,
    requestingUserId: string,
  ): CreatePermissionRequest {
    return {
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,
      category: dto.category,
      isSystemPermission: dto.isSystemPermission || false,
      requestingUserId,
      correlationId: `create-permission-${Date.now()}`,
    };
  }

  /**
   * Convertit un UpdatePermissionDto vers UpdatePermissionRequest
   */
  static toUpdatePermissionRequest(
    dto: UpdatePermissionDto,
    permissionId: string,
    requestingUserId: string,
  ): UpdatePermissionRequest {
    return {
      permissionId,
      displayName: dto.displayName,
      description: dto.description,
      isActive: dto.isActive,
      requestingUserId,
      correlationId: `update-permission-${Date.now()}`,
      timestamp: new Date(),
    };
  }

  /**
   * Convertit un ListPermissionsDto vers ListPermissionsRequest
   */
  static toListPermissionsRequest(
    dto: ListPermissionsDto,
    requestingUserId: string,
  ): ListPermissionsRequest {
    return {
      pagination: {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      sorting: {
        sortBy: dto.sortBy || "createdAt",
        sortOrder: dto.sortOrder || "desc",
      },
      filters: {
        search: dto.search,
        category: dto.category,
        isActive: dto.isActive,
        isSystemPermission: dto.isSystemPermission,
      },
      requestingUserId,
      correlationId: `list-permissions-${Date.now()}`,
      timestamp: new Date(),
    };
  }

  /**
   * Convertit une Permission Domain vers PermissionResponseDto
   */
  static toPermissionResponseDto(
    permission: Permission,
  ): PermissionResponseDto {
    return {
      id: permission.getId(), // getId() returns string, not value object
      name: permission.getName(),
      displayName: permission.getDisplayName(),
      description: permission.getDescription(),
      category: permission.getCategory(),
      isSystemPermission: permission.isSystemPermission(),
      isActive: permission.isActive(),
      createdAt: permission.getCreatedAt().toISOString(),
      updatedAt: permission.getUpdatedAt().toISOString(),
    };
  }

  /**
   * Convertit un PermissionJSON (from use case) vers PermissionResponseDto
   */
  static fromPermissionJSON(permissionJSON: any): PermissionResponseDto {
    return {
      id: permissionJSON.id,
      name: permissionJSON.name,
      displayName: permissionJSON.displayName,
      description: permissionJSON.description,
      category: permissionJSON.category,
      isSystemPermission: permissionJSON.isSystemPermission,
      isActive: permissionJSON.isActive,
      createdAt: permissionJSON.createdAt,
      updatedAt: permissionJSON.updatedAt,
    };
  }

  /**
   * Convertit une liste de Permissions Domain vers DTOs
   */
  static toPermissionResponseDtos(
    permissions: Permission[],
  ): PermissionResponseDto[] {
    return permissions.map((permission) =>
      this.toPermissionResponseDto(permission),
    );
  }
}
