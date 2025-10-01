/**
 * 🎯 Skills Controller - Presentation Layer
 * Clean Architecture - API REST complète pour gestion des compétences
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { CreateSkillUseCase } from "@application/use-cases/skills/create-skill.use-case";
import { DeleteSkillUseCase } from "@application/use-cases/skills/delete-skill.use-case";
import { GetSkillByIdUseCase } from "@application/use-cases/skills/get-skill-by-id.use-case";
import { ListSkillsUseCase } from "@application/use-cases/skills/list-skills.use-case";
import { UpdateSkillUseCase } from "@application/use-cases/skills/update-skill.use-case";

import { User } from "@domain/entities/user.entity";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { GetUser } from "@presentation/security/decorators/get-user.decorator";
import { JwtAuthGuard } from "@presentation/security/guards/jwt-auth.guard";
import { TOKENS } from "@shared/constants/injection-tokens";

import {
  CreateSkillDto,
  CreateSkillResponseDto,
  DeleteSkillResponseDto,
  GetSkillResponseDto,
  ListSkillsDto,
  ListSkillsResponseDto,
  SkillDto,
  UpdateSkillDto,
  UpdateSkillResponseDto,
} from "@presentation/dtos/skills.dto";

@ApiTags("🎯 Skills Management")
@Controller("skills")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SkillController {
  constructor(
    @Inject(TOKENS.CREATE_SKILL_USE_CASE)
    private readonly createSkillUseCase: CreateSkillUseCase,
    @Inject(TOKENS.GET_SKILL_BY_ID_USE_CASE)
    private readonly getSkillByIdUseCase: GetSkillByIdUseCase,
    @Inject(TOKENS.LIST_SKILLS_USE_CASE)
    private readonly listSkillsUseCase: ListSkillsUseCase,
    @Inject(TOKENS.UPDATE_SKILL_USE_CASE)
    private readonly updateSkillUseCase: UpdateSkillUseCase,
    @Inject(TOKENS.DELETE_SKILL_USE_CASE)
    private readonly deleteSkillUseCase: DeleteSkillUseCase,
  ) {}

  /**
   * 🔍 LIST SKILLS WITH ADVANCED SEARCH
   */
  @Post("list")
  @ApiOperation({
    summary: "🔍 Search skills with advanced filters",
    description: `
      **Recherche avancée paginée** des compétences avec système de filtrage complet.

      ## 🎯 Fonctionnalités

      ### 📊 **Filtres disponibles**
      - **Recherche textuelle** : Nom, description
      - **Filtres métier** : Catégorie, statut actif, compétences critiques
      - **Tri multi-critères** : Nom, catégorie, dates avec asc/desc
      - **Pagination** : Page/limit avec métadonnées complètes

      ### 📋 **Règles métier**
      - ✅ **Permissions** : Scoped selon business de l'utilisateur
      - ✅ **Validation** : Tous paramètres validés côté serveur
      - ✅ **Performance** : Pagination obligatoire, limites strictes

      ### 🔐 **Sécurité**
      - **JWT** : Token Bearer obligatoire
      - **Business Scoping** : Utilisateur ne voit que ses compétences
      - **Audit Trail** : Toutes les recherches sont loggées

      ## 🎯 **Guide d'intégration Frontend**

      ### React/Vue.js Example
      \`\`\`typescript
      const searchSkills = async (filters: SkillFilters) => {
        const response = await api.post('/api/v1/skills/list', {
          ...filters,
          page: 1,
          limit: 20,
          requestingUserId: currentUser.id,
          correlationId: uuidv4()
        });

        return {
          skills: response.data.data,
          pagination: response.data.meta
        };
      };
      \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Skills retrieved successfully",
    type: ListSkillsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Invalid search parameters",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "🔐 Authentication required",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "🚫 Insufficient permissions",
  })
  async list(
    @Body() dto: ListSkillsDto,
    @GetUser() user: User,
  ): Promise<ListSkillsResponseDto> {
    try {
      const response = await this.listSkillsUseCase.execute({
        businessId: user.getId(), // Business context from user
        requestingUserId: user.getId(),
        correlationId: dto.correlationId || crypto.randomUUID(),
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
          sortBy: dto.sortBy || "name",
          sortOrder: dto.sortOrder || "asc",
        },
      });

      return {
        success: true,
        data: response.skills.map(
          (skill): SkillDto => ({
            id: skill.getId(),
            businessId: skill.getBusinessId().getValue(),
            name: skill.getName(),
            category: skill.getCategory(),
            description: skill.getDescription(),
            isActive: skill.isActive(),
            isCritical: skill.isCritical(),
            createdAt: skill.getCreatedAt().toISOString(),
            updatedAt: skill.getUpdatedAt().toISOString(),
          }),
        ),
        meta: {
          currentPage: response.metadata.currentPage,
          totalPages: response.metadata.pageCount,
          totalItems: response.metadata.totalCount,
          itemsPerPage: dto.limit || 10,
          hasNextPage: response.metadata.hasNextPage,
          hasPrevPage: response.metadata.hasPrevPage,
        },
      };
    } catch (error) {
      const skillError = error as { code?: string; message?: string };
      throw new HttpException(
        {
          success: false,
          error: {
            code: skillError.code || "SKILL_LIST_ERROR",
            message: skillError.message || "Error retrieving skills",
            timestamp: new Date().toISOString(),
            correlationId: dto.correlationId || crypto.randomUUID(),
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ➕ CREATE SKILL
   */
  @Post()
  @ApiOperation({
    summary: "🎯 Create new skill",
    description: `
      **Création d'une nouvelle compétence** avec validation complète et audit trail.

      ### 📋 **Validation automatique**
      - **Nom unique** par business (2-100 caractères)
      - **Catégorie** obligatoire (2-50 caractères)
      - **Description** optionnelle (max 500 caractères)
      - **Statut critique** configurable

      ### 🔐 **Sécurité**
      - **Authentification JWT** obligatoire
      - **Business scoping** automatique
      - **Audit trail** complet

      ### 💡 **Exemple d'utilisation**
      \`\`\`json
      {
        "businessId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Massage thérapeutique",
        "category": "Soins corporels",
        "description": "Techniques de massage pour soulager les tensions",
        "isCritical": true
      }
      \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "✅ Skill created successfully",
    type: CreateSkillResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Invalid input data or validation error",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Skill name already exists in this business",
  })
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
        correlationId: dto.correlationId || crypto.randomUUID(),
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
          updatedAt: response.createdAt.toISOString(),
        },
      };
    } catch (error) {
      const skillError = error as { code?: string; message?: string };

      if (skillError.code === "SKILL_NAME_CONFLICT") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Skill name already exists",
              field: "name",
              timestamp: new Date().toISOString(),
              correlationId: dto.correlationId || crypto.randomUUID(),
            },
          },
          HttpStatus.CONFLICT,
        );
      }

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
              timestamp: new Date().toISOString(),
              correlationId: dto.correlationId || crypto.randomUUID(),
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: {
            code: "SKILL_CREATION_ERROR",
            message: "Error creating skill",
            timestamp: new Date().toISOString(),
            correlationId: dto.correlationId || crypto.randomUUID(),
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * � GET SKILL BY ID
   */
  @Get(":id")
  @ApiOperation({
    summary: "� Get skill by ID",
    description: `
      **Récupération d'une compétence** par son identifiant unique.

      ### 🎯 **Fonctionnalités**
      - **Récupération rapide** par UUID
      - **Validation des permissions** automatique
      - **Business scoping** intégré

      ### 🔐 **Sécurité**
      - **Authentification JWT** obligatoire
      - **Accès limité** aux compétences du business utilisateur
      - **Audit des accès** automatique
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Skill retrieved successfully",
    type: GetSkillResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Skill not found",
  })
  async findById(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<GetSkillResponseDto> {
    try {
      const response = await this.getSkillByIdUseCase.execute({
        skillId: id,
        businessId: user.getId(), // Business context from user
        requestingUserId: user.getId(),
        correlationId: crypto.randomUUID(),
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
              timestamp: new Date().toISOString(),
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: {
            code: "SKILL_RETRIEVAL_ERROR",
            message: "Error retrieving skill",
            timestamp: new Date().toISOString(),
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ✏️ UPDATE SKILL
   */
  @Put(":id")
  @ApiOperation({
    summary: "✏️ Update skill",
    description: `
      **Mise à jour d'une compétence existante** avec validation et historique.

      ### 🎯 **Champs modifiables**
      - **Nom** : Unique par business (2-100 caractères)
      - **Catégorie** : Classification (2-50 caractères)
      - **Description** : Détails optionnels (max 500 caractères)
      - **Statut critique** : Impact sur les services
      - **Statut actif** : Disponibilité de la compétence

      ### ⚠️ **Règles métier**
      - **Validation unicité** du nom dans le business
      - **Préservation historique** des modifications
      - **Audit trail** complet des changements

      ### 🔐 **Sécurité**
      - **Authentification JWT** obligatoire
      - **Permissions business** vérifiées
      - **Traçabilité** des modifications
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Skill updated successfully",
    type: UpdateSkillResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Invalid input data or validation error",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Skill not found",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Skill name already exists in this business",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSkillDto,
    @GetUser() user: User,
  ): Promise<UpdateSkillResponseDto> {
    try {
      const response = await this.updateSkillUseCase.execute({
        skillId: id,
        businessId: user.getId(), // Business context from user
        requestingUserId: user.getId(),
        correlationId: dto.correlationId || crypto.randomUUID(),
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
              timestamp: new Date().toISOString(),
              correlationId: dto.correlationId || crypto.randomUUID(),
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
              field: "name",
              timestamp: new Date().toISOString(),
              correlationId: dto.correlationId || crypto.randomUUID(),
            },
          },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: {
            code: "SKILL_UPDATE_ERROR",
            message: "Error updating skill",
            timestamp: new Date().toISOString(),
            correlationId: dto.correlationId || crypto.randomUUID(),
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 🗑️ DELETE SKILL
   */
  @Delete(":id")
  @ApiOperation({
    summary: "🗑️ Delete skill",
    description: `
      **Suppression d'une compétence** avec vérification des dépendances.

      ### ⚠️ **Règles de sécurité**
      - **Vérification usage** : Compétence non utilisée par le personnel
      - **Compétences critiques** : Protection supplémentaire
      - **Sauvegarde audit** : Historique complet préservé

      ### 🔐 **Sécurité**
      - **Authentification JWT** obligatoire
      - **Permissions business** vérifiées
      - **Audit trail** complet de suppression

      ### 💡 **Gestion des erreurs**
      - **404** : Compétence introuvable
      - **422** : Compétence utilisée (suppression impossible)
      - **403** : Permissions insuffisantes
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Skill deleted successfully",
    type: DeleteSkillResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Skill not found",
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: "❌ Skill is in use and cannot be deleted",
  })
  async delete(
    @Param("id") id: string,
    @GetUser() user: User,
  ): Promise<DeleteSkillResponseDto> {
    try {
      const correlationId = crypto.randomUUID();

      await this.deleteSkillUseCase.execute({
        skillId: id,
        businessId: user.getId(), // Business context from user
        requestingUserId: user.getId(),
        correlationId,
        timestamp: new Date(),
      });

      return {
        success: true,
        message: "Skill deleted successfully",
      };
    } catch (error) {
      const skillError = error as { code?: string; message?: string };
      const correlationId = crypto.randomUUID();

      if (skillError.code === "SKILL_NOT_FOUND") {
        throw new HttpException(
          {
            success: false,
            error: {
              code: skillError.code,
              message: skillError.message || "Skill not found",
              timestamp: new Date().toISOString(),
              correlationId,
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
              timestamp: new Date().toISOString(),
              correlationId,
            },
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: {
            code: "SKILL_DELETION_ERROR",
            message: "Error deleting skill",
            timestamp: new Date().toISOString(),
            correlationId,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
