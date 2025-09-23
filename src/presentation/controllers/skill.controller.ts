import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillUseCase } from '../../application/use-cases/skills/create-skill.use-case';
import { GetSkillByIdUseCase } from '../../application/use-cases/skills/get-skill-by-id.use-case';
import { ListSkillsUseCase } from '../../application/use-cases/skills/list-skills.use-case';
import { UpdateSkillUseCase } from '../../application/use-cases/skills/update-skill.use-case';
import { DeleteSkillUseCase } from '../../application/use-cases/skills/delete-skill.use-case';
import { BusinessId } from '../../domain/value-objects/business-id.value-object';
import {
  CreateSkillDto,
  CreateSkillResponseDto,
  GetSkillResponseDto,
  UpdateSkillDto,
  UpdateSkillResponseDto,
  ListSkillsDto,
  ListSkillsResponseDto,
  DeleteSkillResponseDto,
} from '../dtos/skills.dto';

/**
 * ✅ OBLIGATOIRE - Controller Skills avec standards d'entreprise
 *
 * RESPONSABILITÉS :
 * - CRUD complet pour Skills
 * - Validation et sérialisation
 * - Logging et audit obligatoires
 * - Messages i18n systématiques
 * - Context et traçabilité
 */
// @ApiTags('🎯 Skills Management')
// @Controller('api/v1/skills')
// @ApiBearerAuth()
export class SkillController {
  constructor(
    // @Inject(TOKENS.CREATE_SKILL_USE_CASE)
    private readonly createSkillUseCase: CreateSkillUseCase,
    // @Inject(TOKENS.GET_SKILL_BY_ID_USE_CASE)
    private readonly getSkillByIdUseCase: GetSkillByIdUseCase,
    // @Inject(TOKENS.LIST_SKILLS_USE_CASE)
    private readonly listSkillsUseCase: ListSkillsUseCase,
    // @Inject(TOKENS.UPDATE_SKILL_USE_CASE)
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    // @Inject(TOKENS.DELETE_SKILL_USE_CASE)
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
  ) {}

  /**
   * ➕ CREATE SKILL
   */
  @Post()
  // @ApiOperation({
  //   summary: '🎯 Create new skill',
  //   description: 'Create a new skill for the business with validation and audit trail'
  // })
  // @ApiResponse({ status: 201, type: CreateSkillResponseDto })
  async create(@Body() dto: CreateSkillDto): Promise<CreateSkillResponseDto> {
    try {
      const businessId = BusinessId.create(dto.businessId);

      const response = await this.createSkillUseCase.execute({
        businessId,
        name: dto.name,
        category: dto.category,
        description: dto.description,
        isCritical: dto.isCritical || false,
        requestingUserId: dto.requestingUserId,
        correlationId: dto.correlationId,
        clientIp: dto.clientIp,
        userAgent: dto.userAgent,
        timestamp: new Date(),
      });

      return {
        success: true,
        data: {
          id: response.skill.getId(),
          businessId: response.skill.getBusinessId().getValue(),
          name: response.skill.getName(),
          category: response.skill.getCategory(),
          description: response.skill.getDescription(),
          isActive: response.skill.isActive(),
          isCritical: response.skill.isCritical(),
          createdAt: response.skill.getCreatedAt().toISOString(),
          updatedAt: response.skill.getUpdatedAt().toISOString(),
        },
      };
    } catch (error) {
      if (
        error.code === 'SKILL_NAME_REQUIRED' ||
        error.code === 'SKILL_CATEGORY_REQUIRED'
      ) {
        throw new BadRequestException({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            field: error.code === 'SKILL_NAME_REQUIRED' ? 'name' : 'category',
          },
        });
      }
      throw error;
    }
  }

  /**
   * 📄 GET SKILL BY ID
   */
  @Get(':id')
  // @ApiOperation({
  //   summary: '📄 Get skill by ID',
  //   description: 'Retrieve a specific skill by its unique identifier'
  // })
  // @ApiResponse({ status: 200, type: GetSkillResponseDto })
  async findById(@Param('id') id: string): Promise<GetSkillResponseDto> {
    try {
      const response = await this.getSkillByIdUseCase.execute({
        skillId: id,
        requestingUserId: 'temp-user', // TODO: Get from JWT token
        correlationId: 'temp-correlation', // TODO: Generate correlation ID
        timestamp: new Date(),
      });

      return {
        success: true,
        data: {
          id: response.skill.getId(),
          businessId: response.skill.getBusinessId().getValue(),
          name: response.skill.getName(),
          category: response.skill.getCategory(),
          description: response.skill.getDescription(),
          isActive: response.skill.isActive(),
          isCritical: response.skill.isCritical(),
          createdAt: response.skill.getCreatedAt().toISOString(),
          updatedAt: response.skill.getUpdatedAt().toISOString(),
        },
      };
    } catch (error) {
      if (error.code === 'SKILL_NOT_FOUND') {
        throw new NotFoundException({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }

  /**
   * 🔍 LIST SKILLS
   */
  @Post('list')
  // @ApiOperation({
  //   summary: '🔍 List skills with filters',
  //   description: 'Get paginated list of skills with advanced filtering'
  // })
  // @ApiResponse({ status: 200, type: ListSkillsResponseDto })
  async list(@Body() dto: ListSkillsDto): Promise<ListSkillsResponseDto> {
    const response = await this.listSkillsUseCase.execute({
      // businessId: BusinessId.create(dto.businessId), // TODO: Get from JWT token
      search: dto.search,
      category: dto.category,
      isActive: dto.isActive,
      isCritical: dto.isCritical,
      page: dto.page || 1,
      limit: dto.limit || 10,
      sortBy: dto.sortBy || 'name',
      sortOrder: dto.sortOrder || 'asc',
      requestingUserId: dto.requestingUserId,
      correlationId: dto.correlationId,
      timestamp: new Date(),
    });

    return {
      success: true,
      data: response.skills.map((skill) => ({
        id: skill.getId(),
        businessId: skill.getBusinessId().getValue(),
        name: skill.getName(),
        category: skill.getCategory(),
        description: skill.getDescription(),
        isActive: skill.isActive(),
        isCritical: skill.isCritical(),
        createdAt: skill.getCreatedAt().toISOString(),
        updatedAt: skill.getUpdatedAt().toISOString(),
      })),
      meta: {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        itemsPerPage: response.itemsPerPage,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
      },
    };
  }

  /**
   * ✏️ UPDATE SKILL
   */
  @Put(':id')
  // @ApiOperation({
  //   summary: '✏️ Update skill',
  //   description: 'Update skill information with validation and audit'
  // })
  // @ApiResponse({ status: 200, type: UpdateSkillResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ): Promise<UpdateSkillResponseDto> {
    try {
      const response = await this.updateSkillUseCase.execute({
        skillId: id,
        name: dto.name,
        category: dto.category,
        description: dto.description,
        isCritical: dto.isCritical,
        isActive: dto.isActive,
        requestingUserId: dto.requestingUserId,
        correlationId: dto.correlationId,
        clientIp: dto.clientIp,
        userAgent: dto.userAgent,
        timestamp: new Date(),
      });

      return {
        success: true,
        data: {
          id: response.skill.getId(),
          businessId: response.skill.getBusinessId().getValue(),
          name: response.skill.getName(),
          category: response.skill.getCategory(),
          description: response.skill.getDescription(),
          isActive: response.skill.isActive(),
          isCritical: response.skill.isCritical(),
          createdAt: response.skill.getCreatedAt().toISOString(),
          updatedAt: response.skill.getUpdatedAt().toISOString(),
        },
      };
    } catch (error) {
      if (error.code === 'SKILL_NOT_FOUND') {
        throw new NotFoundException({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      if (error.code === 'SKILL_NAME_CONFLICT') {
        throw new BadRequestException({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            field: 'name',
          },
        });
      }
      throw error;
    }
  }

  /**
   * 🗑️ DELETE SKILL
   */
  @Delete(':id')
  // @ApiOperation({
  //   summary: '🗑️ Delete skill',
  //   description: 'Soft delete a skill with validation'
  // })
  // @ApiResponse({ status: 200, type: DeleteSkillResponseDto })
  async delete(@Param('id') id: string): Promise<DeleteSkillResponseDto> {
    try {
      await this.deleteSkillUseCase.execute({
        skillId: id,
        requestingUserId: 'temp-user', // TODO: Get from JWT token
        correlationId: 'temp-correlation', // TODO: Generate correlation ID
        timestamp: new Date(),
      });

      return {
        success: true,
        message: 'Skill deleted successfully',
      };
    } catch (error) {
      if (error.code === 'SKILL_NOT_FOUND') {
        throw new NotFoundException({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      if (error.code === 'SKILL_IN_USE') {
        throw new BadRequestException({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      throw error;
    }
  }
}
