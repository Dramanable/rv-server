/**
 * 🔄 Business Sector Mappers - Presentation Layer
 *
 * Mappers pour convertir entre les DTOs de présentation et les objets des couches métier.
 * Assure la transformation bidirectionnelle entre HTTP et Use Cases.
 */

import { BusinessSector } from '@domain/entities/business-sector.entity';
import {
  CreateBusinessSectorRequest,
  CreateBusinessSectorResponse,
} from '@application/use-cases/business-sectors/create-business-sector.use-case';
import {
  ListBusinessSectorsRequest,
  ListBusinessSectorsResponse,
} from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import {
  UpdateBusinessSectorRequest,
  UpdateBusinessSectorResponse,
} from '@application/use-cases/business-sectors/update-business-sector.use-case';
import {
  DeleteBusinessSectorRequest,
  DeleteBusinessSectorResponse,
} from '@application/use-cases/business-sectors/delete-business-sector.use-case';
import {
  CreateBusinessSectorDto,
  UpdateBusinessSectorDto,
  ListBusinessSectorsDto,
  DeleteBusinessSectorDto,
  BusinessSectorResponseDto,
  ListBusinessSectorsResponseDto,
  CreateBusinessSectorResponseDto,
  UpdateBusinessSectorResponseDto,
  DeleteBusinessSectorResponseDto,
  BusinessSectorPaginationMetaDto,
  BusinessSectorFiltersDto,
  BusinessSectorSortDto,
  BusinessSectorPaginationDto,
} from '@presentation/dtos/business-sector.dto';

/**
 * 🔄 Mapper : Business Sector
 *
 * Transformations entre les représentations DTO, Use Case et Domain
 */
export class BusinessSectorMapper {
  // ═══════════════════════════════════════════════════════════════
  // 📥 DTO → Use Case Request Mappings
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🔄 Convertir CreateBusinessSectorDto en CreateBusinessSectorRequest
   */
  static toCreateRequest(
    dto: CreateBusinessSectorDto,
    requestingUserId: string,
  ): CreateBusinessSectorRequest {
    return {
      name: dto.name,
      description: dto.description,
      code: dto.code,
      requestingUserId,
    };
  }

  /**
   * 🔄 Convertir UpdateBusinessSectorDto en UpdateBusinessSectorRequest
   */
  static toUpdateRequest(
    id: string,
    dto: UpdateBusinessSectorDto,
    requestingUserId: string,
  ): UpdateBusinessSectorRequest {
    return {
      id,
      name: dto.name,
      description: dto.description,
      requestingUserId,
    };
  }

  /**
   * 🔄 Convertir ListBusinessSectorsDto en ListBusinessSectorsRequest
   */
  static toListRequest(
    dto: ListBusinessSectorsDto,
    requestingUserId: string,
  ): ListBusinessSectorsRequest {
    return {
      requestingUserId,
      page: dto.pagination?.page || 1,
      limit: dto.pagination?.limit || 20,
    };
  }

  /**
   * 🔄 Convertir DeleteBusinessSectorDto en DeleteBusinessSectorRequest
   */
  static toDeleteRequest(
    id: string,
    dto: DeleteBusinessSectorDto,
    requestingUserId: string,
  ): DeleteBusinessSectorRequest {
    return {
      id,
      requestingUserId,
      force: dto.force || false,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 📤 Use Case Response → DTO Mappings
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🔄 Convertir CreateBusinessSectorResponse en CreateBusinessSectorResponseDto
   */
  static toCreateResponseDto(
    response: CreateBusinessSectorResponse,
  ): CreateBusinessSectorResponseDto {
    return {
      success: true,
      message: 'Business sector created successfully',
      data: {
        id: response.id,
        name: response.name,
        description: response.description || '',
        code: response.code,
        isActive: response.isActive,
        createdAt: response.createdAt,
        createdBy: response.createdBy,
        updatedAt: undefined,
        updatedBy: undefined,
      },
    };
  }

  /**
   * 🔄 Convertir UpdateBusinessSectorResponse en UpdateBusinessSectorResponseDto
   */
  static toUpdateResponseDto(
    response: UpdateBusinessSectorResponse,
  ): UpdateBusinessSectorResponseDto {
    return {
      success: true,
      message: 'Business sector updated successfully',
      data: {
        id: response.id,
        name: response.name,
        description: response.description || '',
        code: response.code,
        isActive: response.isActive,
        createdAt: response.createdAt,
        createdBy: '', // Pas disponible dans UpdateResponse
        updatedAt: response.updatedAt,
        updatedBy: undefined,
      },
    };
  }

  /**
   * 🔄 Convertir ListBusinessSectorsResponse en ListBusinessSectorsResponseDto
   */
  static toListResponseDto(
    response: ListBusinessSectorsResponse,
  ): ListBusinessSectorsResponseDto {
    return {
      data: response.businessSectors.data.map(BusinessSectorMapper.toDto),
      meta: BusinessSectorMapper.toPaginationMetaDto(
        response.businessSectors.meta,
      ),
    };
  }

  /**
   * 🔄 Convertir DeleteBusinessSectorResponse en DeleteBusinessSectorResponseDto
   */
  static toDeleteResponseDto(
    response: DeleteBusinessSectorResponse,
  ): DeleteBusinessSectorResponseDto {
    return {
      success: response.success,
      message: response.message,
      deletedAt: response.deletedAt,
      sectorId: response.sectorId,
      sectorName: response.sectorName,
      wasForced: response.wasForced,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🏢 Entity → DTO Mappings
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🔄 Convertir BusinessSector en BusinessSectorResponseDto
   */
  static toDto(entity: BusinessSector): BusinessSectorResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      code: entity.code,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
      updatedAt: entity.updatedAt,
      updatedBy: entity.updatedBy,
    };
  }

  /**
   * 🔄 Convertir liste de BusinessSector en BusinessSectorResponseDto[]
   */
  static toDtos(entities: BusinessSector[]): BusinessSectorResponseDto[] {
    return entities.map(BusinessSectorMapper.toDto);
  }

  // ═══════════════════════════════════════════════════════════════
  // 📊 Pagination Mappings
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🔄 Convertir pagination metadata en DTO
   */
  static toPaginationMetaDto(pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  }): BusinessSectorPaginationMetaDto {
    return {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔧 Helper Methods pour la validation
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🔍 Valider si un DTO de création est complet
   */
  static isValidCreateDto(dto: CreateBusinessSectorDto): boolean {
    return !!(dto.name?.trim() && dto.description?.trim() && dto.code?.trim());
  }

  /**
   * 🔍 Valider si un DTO de mise à jour contient au moins un champ
   */
  static isValidUpdateDto(dto: UpdateBusinessSectorDto): boolean {
    return !!(dto.name || dto.description);
  }

  /**
   * 🔧 Nettoyer et normaliser les filtres
   */
  static normalizeFilters(
    filters?: BusinessSectorFiltersDto,
  ): BusinessSectorFiltersDto | undefined {
    if (!filters) return undefined;

    return {
      search: filters.search?.trim() || undefined,
      isActive: filters.isActive,
      codes: filters.codes?.filter((code) => code?.trim()) || undefined,
    };
  }

  /**
   * 🔧 Valider et normaliser les options de pagination
   */
  static normalizePagination(
    pagination?: BusinessSectorPaginationDto,
  ): BusinessSectorPaginationDto | undefined {
    if (!pagination) return undefined;

    return {
      page: Math.max(1, pagination.page || 1),
      limit: Math.min(100, Math.max(1, pagination.limit || 20)),
    };
  }

  /**
   * 🔧 Valider et normaliser les options de tri
   */
  static normalizeSort(
    sort?: BusinessSectorSortDto,
  ): BusinessSectorSortDto | undefined {
    if (!sort) return undefined;

    const validFields = ['name', 'code', 'createdAt', 'updatedAt'];
    const validDirections = ['ASC', 'DESC'];

    return {
      field: validFields.includes(sort.field || '')
        ? (sort.field as 'name' | 'code' | 'createdAt' | 'updatedAt')
        : 'name',
      direction: validDirections.includes(sort.direction || '')
        ? (sort.direction as 'ASC' | 'DESC')
        : 'ASC',
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // 🧪 Test Helpers (pour les tests unitaires)
  // ═══════════════════════════════════════════════════════════════

  /**
   * 🧪 Créer un DTO de test pour les tests unitaires
   */
  static createTestDto(): CreateBusinessSectorDto {
    return {
      name: 'Test Sector',
      description: 'Test sector description for unit testing',
      code: 'TEST_SECTOR',
    };
  }

  /**
   * 🧪 Créer un DTO de mise à jour de test
   */
  static createTestUpdateDto(): UpdateBusinessSectorDto {
    return {
      name: 'Updated Test Sector',
      description: 'Updated test sector description',
    };
  }

  /**
   * 🧪 Créer un DTO de liste de test
   */
  static createTestListDto(): ListBusinessSectorsDto {
    return {
      pagination: { page: 1, limit: 20 },
      sort: { field: 'name', direction: 'ASC' },
      filters: { isActive: true },
    };
  }
}
