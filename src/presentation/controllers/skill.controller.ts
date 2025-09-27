import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateSkillUseCase } from "../../application/use-cases/skills/create-skill.use-case";
import { DeleteSkillUseCase } from "../../application/use-cases/skills/delete-skill.use-case";
import { GetSkillByIdUseCase } from "../../application/use-cases/skills/get-skill-by-id.use-case";
import { ListSkillsUseCase } from "../../application/use-cases/skills/list-skills.use-case";
import { UpdateSkillUseCase } from "../../application/use-cases/skills/update-skill.use-case";
import { BusinessId } from "../../domain/value-objects/business-id.value-object";
import {
  CreateSkillDto,
  CreateSkillResponseDto,
  DeleteSkillResponseDto,
  GetSkillResponseDto,
  ListSkillsDto,
  ListSkillsResponseDto,
  UpdateSkillDto,
  UpdateSkillResponseDto,
} from "../dtos/skills.dto";

@ApiTags("🎯 Skills Management")
@Controller("api/v1/skills")
export class SkillController {
  constructor(
    private readonly createSkillUseCase: CreateSkillUseCase,
    private readonly getSkillByIdUseCase: GetSkillByIdUseCase,
    private readonly listSkillsUseCase: ListSkillsUseCase,
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
  ) {}

  /**
   * ➕ CREATE SKILL
   */
  @Post()
  @ApiOperation({
    summary: "🎯 Create new skill",
    description:
      "Create a new skill for the business with validation and audit trail",
  })
  @ApiResponse({ status: 201, type: CreateSkillResponseDto })
  async create(@Body() dto: CreateSkillDto): Promise<CreateSkillResponseDto> {
    try {
      const businessId = BusinessId.create(dto.businessId);

      const response = await this.createSkillUseCase.execute({
        businessId: businessId.getValue(),
        name: dto.name,
        category: dto.category,
        description: dto.description || "",
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
          id: response.skillId,
          businessId: response.businessId,
          name: response.name,
          category: response.category,
          description: response.description,
          isActive: response.isActive,
          isCritical: response.isCritical,
          createdAt: response.createdAt.toISOString(),
          updatedAt: response.createdAt.toISOString(), // createdAt car c'est une création
        },
      };
    } catch (error) {
      const skillError = error as { code?: string; message?: string };
      if (
        skillError.code === "SKILL_NAME_REQUIRED" ||
        skillError.code === "SKILL_CATEGORY_REQUIRED"
      ) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Validation error",
              field:
                skillError.code === "SKILL_NAME_REQUIRED" ? "name" : "category",
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  /**
   * 📄 GET SKILL BY ID
   */
  @Get(":id")
  @ApiOperation({
    summary: "📄 Get skill by ID",
    description: "Retrieve a specific skill by its unique identifier",
  })
  @ApiResponse({ status: 200, type: GetSkillResponseDto })
  async findById(@Param("id") id: string): Promise<GetSkillResponseDto> {
    try {
      const response = await this.getSkillByIdUseCase.execute({
        skillId: id,
        businessId: "temp-business-id", // TODO: Get from context
        requestingUserId: "temp-user", // TODO: Get from JWT token
        correlationId: "temp-correlation", // TODO: Generate correlation ID
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
      const skillError = error as { code?: string; message?: string };
      if (skillError.code === "SKILL_NOT_FOUND") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Skill not found",
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }

  /**
   * 🔍 LIST SKILLS
   */
  @Post("list")
  @ApiOperation({
    summary: "🔍 Search skills with advanced filters",
    description:
      "List skills with pagination, filtering, and search capabilities",
  })
  @ApiResponse({ status: 200, type: ListSkillsResponseDto })
  async list(@Body() dto: ListSkillsDto): Promise<ListSkillsResponseDto> {
    const response = await this.listSkillsUseCase.execute({
      businessId: "temp-business-id", // TODO: Get from context
      requestingUserId: dto.requestingUserId,
      correlationId: dto.correlationId,
      timestamp: new Date(),
      pagination: {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      filters: {
        search: dto.search,
        category: dto.category,
        isActive: dto.isActive,
        isCritical: dto.isCritical,
      },
      sorting: {
        sortBy: dto.sortBy || "createdAt",
        sortOrder: dto.sortOrder || "desc",
      },
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
        currentPage: response.metadata.currentPage,
        totalPages: response.metadata.pageCount,
        totalItems: response.metadata.totalCount,
        itemsPerPage: dto.limit || 10,
        hasNextPage:
          response.metadata.currentPage < response.metadata.pageCount,
        hasPrevPage: response.metadata.currentPage > 1,
      },
    };
  }

  /**
   * ✏️ UPDATE SKILL
   */
  @Put(":id")
  @ApiOperation({
    summary: "✏️ Update skill",
    description: "Update an existing skill with new information",
  })
  @ApiResponse({ status: 200, type: UpdateSkillResponseDto })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSkillDto,
  ): Promise<UpdateSkillResponseDto> {
    try {
      const response = await this.updateSkillUseCase.execute({
        skillId: id,
        businessId: "temp-business-id", // TODO: Get from context
        requestingUserId: "temp-user", // TODO: Get from JWT token
        correlationId: "temp-correlation", // TODO: Generate correlation ID
        timestamp: new Date(),
        updates: {
          name: dto.name,
          category: dto.category,
          description: dto.description,
          isCritical: dto.isCritical,
          isActive: dto.isActive,
        },
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
      const skillError = error as { code?: string; message?: string };
      if (skillError.code === "SKILL_NOT_FOUND") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Skill not found",
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (skillError.code === "SKILL_NAME_CONFLICT") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Skill name already exists",
            },
          },
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  /**
   * 🗑️ DELETE SKILL
   */
  @Delete(":id")
  @ApiOperation({
    summary: "🗑️ Delete skill",
    description: "Delete a skill from the system",
  })
  @ApiResponse({ status: 200, type: DeleteSkillResponseDto })
  async delete(@Param("id") id: string): Promise<DeleteSkillResponseDto> {
    try {
      await this.deleteSkillUseCase.execute({
        skillId: id,
        businessId: "temp-business-id", // TODO: Get from context
        requestingUserId: "temp-user", // TODO: Get from JWT token
        correlationId: "temp-correlation", // TODO: Generate correlation ID
        timestamp: new Date(),
      });

      return {
        success: true,
        message: "Skill deleted successfully",
      };
    } catch (error) {
      const skillError = error as { code?: string; message?: string };
      if (skillError.code === "SKILL_NOT_FOUND") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Skill not found",
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }
      if (skillError.code === "SKILL_IN_USE") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message:
                skillError.message ||
                "Skill is currently in use and cannot be deleted",
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      throw error;
    }
  }
}
