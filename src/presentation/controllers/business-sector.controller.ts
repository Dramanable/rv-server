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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

// 🔐 Security & Validation
import { JwtAuthGuard } from '@presentation/security/guards/jwt-auth.guard';
import { I18nValidationPipe } from '@infrastructure/validation/i18n-validation.pipe';

// 📝 DTOs
import {
  CreateBusinessSectorDto,
  UpdateBusinessSectorDto,
  BusinessSectorResponseDto,
  ListBusinessSectorsDto,
  DeleteBusinessSectorDto,
} from '@presentation/dtos/business-sector.dto';

// 🔄 Mappers
import { BusinessSectorMapper } from '@presentation/mappers/business-sector.mapper';

// 💼 Use Cases
import { CreateBusinessSectorUseCase } from '@application/use-cases/business-sectors/create-business-sector.use-case';
import { ListBusinessSectorsUseCase } from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import { UpdateBusinessSectorUseCase } from '@application/use-cases/business-sectors/update-business-sector.use-case';
import { DeleteBusinessSectorUseCase } from '@application/use-cases/business-sectors/delete-business-sector.use-case';

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
@ApiTags('🏢 Business Sectors')
@Controller('business-sectors')
@UseGuards(JwtAuthGuard)
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
   * 📋 List business sectors with pagination
   *
   * @description Retrieves all business sectors with optional pagination
   * @param query Pagination and filtering options
   * @returns Paginated list of business sectors
   */
  @Get()
  @ApiOperation({
    summary: '📋 List Business Sectors',
    description: 'Retrieves all business sectors with pagination support.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20, max: 100)',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Business sectors retrieved successfully',
    type: [BusinessSectorResponseDto], // Array response
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async listBusinessSectors(
    @Query() query: ListBusinessSectorsDto,
    @Request() req: any,
  ): Promise<BusinessSectorResponseDto[]> {
    // � Extract requesting user ID from JWT token
    const requestingUserId = req.user?.id || 'anonymous';

    // �🔄 Convert query to use case request
    const request = BusinessSectorMapper.toListRequest(query, requestingUserId);

    // 💼 Execute use case
    const response = await this.listBusinessSectorsUseCase.execute(request);

    // 🔄 Convert response to DTOs
    return response.businessSectors.data.map((sector) =>
      BusinessSectorMapper.toDto(sector),
    );
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
