/**
 * 🏢 BUSINESS SECTOR CONTROLLER
 * ✅ Clean Architecture - Presentation Layer
 * ✅ Full CRUD operations for business sectors
 * ✅ Super Admin permissions required
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// 🔐 Security & Validation
import { I18nValidationPipe } from '@infrastructure/validation/i18n-validation.pipe';

// 📝 DTOs
import {
  BusinessSectorResponseDto,
  CreateBusinessSectorDto,
  DeleteBusinessSectorDto,
  ListBusinessSectorsDto,
  UpdateBusinessSectorDto,
} from '@presentation/dtos/business-sector.dto';

// 🔄 Mappers
import { BusinessSectorMapper } from '@presentation/mappers/business-sector.mapper';

// 💼 Use Cases
import { CreateBusinessSectorUseCase } from '@application/use-cases/business-sectors/create-business-sector.use-case';
import { DeleteBusinessSectorUseCase } from '@application/use-cases/business-sectors/delete-business-sector.use-case';
import { ListBusinessSectorsUseCase } from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import { UpdateBusinessSectorUseCase } from '@application/use-cases/business-sectors/update-business-sector.use-case';

// 🔧 Shared
import { TOKENS } from '@shared/constants/injection-tokens';

/**
 * 🏢 Business Sector REST Controller
 *
 * Provides CRUD operations for business sectors:
 * - Create new business sectors (super admin only)
 * - List all business sectors with pagination
 * - Update existing business sectors
 * - Delete business sectors (with usage validation)
 */
@ApiTags('🏭 Business Sectors')
@Controller('business-sectors')
@ApiBearerAuth()
@UsePipes(new I18nValidationPipe())
export class BusinessSectorController {
  constructor(
    @Inject(TOKENS.CREATE_BUSINESS_SECTOR_USE_CASE)
    private readonly createBusinessSectorUseCase: CreateBusinessSectorUseCase,

    @Inject(TOKENS.LIST_BUSINESS_SECTORS_USE_CASE)
    private readonly listBusinessSectorsUseCase: ListBusinessSectorsUseCase,

    @Inject(TOKENS.UPDATE_BUSINESS_SECTOR_USE_CASE)
    private readonly updateBusinessSectorUseCase: UpdateBusinessSectorUseCase,

    @Inject(TOKENS.DELETE_BUSINESS_SECTOR_USE_CASE)
    private readonly deleteBusinessSectorUseCase: DeleteBusinessSectorUseCase,
  ) {}

  /**
   * 🎯 Create new business sector
   *
   * @description Creates a new business sector (super admin only)
   * @param dto Business sector creation data
   * @returns Created business sector details
   */
  @Post()
  @ApiOperation({
    summary: '🎯 Create Business Sector',
    description:
      'Creates a new business sector. Only super admin can perform this action.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Business sector created successfully',
    type: BusinessSectorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions (super admin required)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '⚠️ Business sector with this name already exists',
  })
  async createBusinessSector(
    @Body() dto: CreateBusinessSectorDto,
    @Request() req: any,
  ): Promise<BusinessSectorResponseDto> {
    // 🔐 Extract requesting user ID from JWT token
    const requestingUserId = req.user?.id || 'anonymous';

    // 🔄 Convert DTO to use case request
    const request = BusinessSectorMapper.toCreateRequest(dto, requestingUserId);

    // 💼 Execute use case
    const response = await this.createBusinessSectorUseCase.execute(request);

    // 🔄 Convert response to DTO
    return {
      id: response.id,
      name: response.name,
      description: response.description || '',
      code: response.code,
      isActive: response.isActive,
      createdAt: response.createdAt,
      createdBy: response.createdBy,
      updatedAt: undefined,
    };
  }

  /**
   * � LIST BUSINESS SECTORS - POST /api/v1/business-sectors/list
   *
   * @description Recherche avancée paginée des secteurs d'activité avec système de filtrage complet
   * @param dto Complex filtering, pagination and sorting options
   * @returns Paginated list of business sectors with metadata
   */
  @Post('list')
  @ApiOperation({
    summary: '� Search Business Sectors with Advanced Filters',
    description: `
    **Recherche avancée paginée** des secteurs d'activité avec système de filtrage complet.

    ## 🎯 Fonctionnalités

    ### 📊 **Filtres disponibles**
    - **Recherche textuelle** : Nom, description, code
    - **Filtres métier** : Statut actif/inactif
    - **Tri multi-critères** : Tous champs avec asc/desc
    - **Pagination** : Page/limit avec métadonnées complètes

    ### 🔐 **Sécurité**
    - **JWT** : Token Bearer obligatoire
    - **RBAC** : Permissions granulaires par ressource
    - **Rate limiting** : 100 req/min par utilisateur

    ## 🎯 **Guide d'intégration Frontend**

    ### React/Vue.js Example
    \`\`\`typescript
    const searchBusinessSectors = async (filters: BusinessSectorFilters) => {
      const response = await api.post('/api/v1/business-sectors/list', {
        pagination: { page: 1, limit: 20 },
        sort: { sortBy: 'name', sortOrder: 'asc' },
        filters: { search: 'tech', isActive: true }
      });

      return {
        sectors: response.data.data,
        pagination: response.data.meta
      };
    };
    \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Business sectors found successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BusinessSectorResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            currentPage: { type: 'number', example: 1 },
            totalPages: { type: 'number', example: 5 },
            totalItems: { type: 'number', example: 47 },
            itemsPerPage: { type: 'number', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid search parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async listBusinessSectors(
    @Body() dto: ListBusinessSectorsDto,
    @Request() req: any,
  ): Promise<{
    success: boolean;
    data: BusinessSectorResponseDto[];
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    // 🔐 Extract requesting user ID from JWT token
    const requestingUserId = req.user?.id || 'anonymous';

    // 🔄 Convert DTO to use case request
    const request = BusinessSectorMapper.toListRequest(dto, requestingUserId);

    // 💼 Execute use case
    const response = await this.listBusinessSectorsUseCase.execute(request);

    // 🔄 Convert response to standard API format with metadata
    return {
      success: true,
      data: response.businessSectors.data.map((sector) =>
        BusinessSectorMapper.toDto(sector),
      ),
      meta: {
        currentPage: response.businessSectors.meta.currentPage,
        totalPages: response.businessSectors.meta.totalPages,
        totalItems: response.businessSectors.meta.totalItems,
        itemsPerPage: response.businessSectors.meta.itemsPerPage,
        hasNextPage: response.businessSectors.meta.hasNextPage,
        hasPrevPage: response.businessSectors.meta.hasPrevPage,
      },
    };
  }

  /**
   * ✏️ Update business sector
   *
   * @description Updates an existing business sector (partial update supported)
   * @param id Business sector ID
   * @param dto Update data
   * @returns Updated business sector details
   */
  @Patch(':id')
  @ApiOperation({
    summary: '✏️ Update Business Sector',
    description:
      'Updates an existing business sector. Supports partial updates.',
  })
  @ApiParam({
    name: 'id',
    description: 'Business sector unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Business sector updated successfully',
    type: BusinessSectorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '🔍 Business sector not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async updateBusinessSector(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessSectorDto,
    @Request() req: any,
  ): Promise<BusinessSectorResponseDto> {
    // � Extract requesting user ID from JWT token
    const requestingUserId = req.user?.id || 'anonymous';

    // �🔄 Convert DTO to use case request
    const request = BusinessSectorMapper.toUpdateRequest(
      id,
      dto,
      requestingUserId,
    );

    // 💼 Execute use case
    const response = await this.updateBusinessSectorUseCase.execute(request);

    // 🔄 Convert response to DTO
    return {
      id: response.id,
      name: response.name,
      description: response.description || '',
      code: response.code,
      isActive: response.isActive,
      createdAt: response.createdAt,
      createdBy: '', // Not available in UpdateResponse
      updatedAt: response.updatedAt,
    };
  }

  /**
   * 🗑️ Delete business sector
   *
   * @description Deletes a business sector (validates no businesses are using it)
   * @param id Business sector ID
   * @param query Delete options (force delete)
   * @returns Success confirmation
   */
  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete Business Sector',
    description:
      'Deletes a business sector. Validates that no businesses are using it unless force delete is enabled.',
  })
  @ApiParam({
    name: 'id',
    description: 'Business sector unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'force',
    required: false,
    description: 'Force delete even if sector is in use',
    example: false,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '✅ Business sector deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '🔍 Business sector not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '⚠️ Cannot delete sector that is in use by businesses',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async deleteBusinessSector(
    @Param('id') id: string,
    @Query() query: DeleteBusinessSectorDto,
    @Request() req: any,
  ): Promise<void> {
    // 🔐 Extract requesting user ID from JWT token
    const requestingUserId = req.user?.id || 'anonymous';

    // 🔄 Convert to use case request
    const request = BusinessSectorMapper.toDeleteRequest(
      id,
      query,
      requestingUserId,
    );

    // 💼 Execute use case
    await this.deleteBusinessSectorUseCase.execute(request);

    // ✅ Success - no content returned for DELETE operations
  }
}
