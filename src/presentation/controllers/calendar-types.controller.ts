import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { User } from "@domain/entities/user.entity";
import {
  CalendarTypeResponseDto,
  CreateCalendarTypeDto,
  CreateCalendarTypeResponseDto,
  DeleteCalendarTypeResponseDto,
  ListCalendarTypesDto,
  ListCalendarTypesResponseDto,
  UpdateCalendarTypeDto,
  UpdateCalendarTypeResponseDto,
} from "@presentation/dtos/calendar-types";
import { GetUser } from "@presentation/security/decorators/get-user.decorator";
import { Public } from "@presentation/security/decorators/public.decorator";
import { TOKENS } from "@shared/constants/injection-tokens";

// Use Cases
import { CreateCalendarTypeUseCase } from "@application/use-cases/calendar-types/create-calendar-type.use-case";
import { DeleteCalendarTypeUseCase } from "@application/use-cases/calendar-types/delete-calendar-type.use-case";
import { GetCalendarTypeByIdUseCase } from "@application/use-cases/calendar-types/get-calendar-type-by-id.use-case";
import { ListCalendarTypesUseCase } from "@application/use-cases/calendar-types/list-calendar-types.use-case";
import { UpdateCalendarTypeUseCase } from "@application/use-cases/calendar-types/update-calendar-type.use-case";

/**
 * 📅 Calendar Types Controller - Clean Architecture + NestJS
 *
 * 🎯 ENDPOINTS STANDARDISÉS REST
 * ✅ Validation automatique avec DTOs
 * ✅ Documentation Swagger complète
 * ✅ Gestion d'erreurs avec i18n
 * ✅ Authentification globale (JwtAuthGuard via APP_GUARD)
 * ✅ Logging et audit trail
 */
@ApiTags("📅 Calendar Types")
@Controller("calendar-types")
@ApiBearerAuth()
export class CalendarTypesController {
  constructor(
    @Inject(TOKENS.CREATE_CALENDAR_TYPE_USE_CASE)
    private readonly createCalendarTypeUseCase: CreateCalendarTypeUseCase,

    @Inject(TOKENS.GET_CALENDAR_TYPE_BY_ID_USE_CASE)
    private readonly getCalendarTypeByIdUseCase: GetCalendarTypeByIdUseCase,

    @Inject(TOKENS.LIST_CALENDAR_TYPES_USE_CASE)
    private readonly listCalendarTypesUseCase: ListCalendarTypesUseCase,

    @Inject(TOKENS.UPDATE_CALENDAR_TYPE_USE_CASE)
    private readonly updateCalendarTypeUseCase: UpdateCalendarTypeUseCase,

    @Inject(TOKENS.DELETE_CALENDAR_TYPE_USE_CASE)
    private readonly deleteCalendarTypeUseCase: DeleteCalendarTypeUseCase,
  ) {}

  /**
   * 🔍 LIST CALENDAR TYPES - POST /api/v1/calendar-types/list
   * Recherche et filtrage avancés avec pagination
   */
  @Post("list")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "🔍 Search Calendar Types with Advanced Filters",
    description: `
    **Recherche avancée paginée** des types de calendrier avec système de filtrage complet.

    ## 🎯 Fonctionnalités

    ### 📊 **Filtres disponibles**
    - **Recherche textuelle** : Nom, description
    - **Filtres métier** : Statut actif/inactif, business
    - **Tri multi-critères** : Nom, date création, ordre d'affichage
    - **Pagination** : Page/limit avec métadonnées complètes

    ### 📋 **Règles métier**
    - ✅ **Permissions** : Scoped selon rôle utilisateur
    - ✅ **Validation** : Tous paramètres validés côté serveur
    - ✅ **Performance** : Pagination obligatoire, cache optimisé

    ### 🔐 **Sécurité**
    - **JWT** : Token Bearer obligatoire
    - **RBAC** : Permissions granulaires par ressource
    `,
  })
  @ApiBody({ type: ListCalendarTypesDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Calendar types found successfully",
    type: ListCalendarTypesResponseDto,
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
    @Body() dto: ListCalendarTypesDto,
    @GetUser() user: User,
  ): Promise<ListCalendarTypesResponseDto> {
    const result = await this.listCalendarTypesUseCase.execute({
      businessId: dto.businessId,
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
      sortBy: dto.sortBy ?? "createdAt",
      sortOrder: dto.sortOrder ?? "desc",
      search: dto.search,
      isActive: dto.isActive,
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
    });

    return {
      success: true,
      data: result.data.map((calendarType) => ({
        id: calendarType.getId().getValue(),
        businessId: calendarType.getBusinessId().getValue(),
        name: calendarType.getName(),
        code: calendarType.getCode(),
        description: calendarType.getDescription(),
        color: calendarType.getColor(),
        icon: calendarType.getIcon(),
        sortOrder: calendarType.getSortOrder(),
        isActive: calendarType.isActive(),
        isBuiltIn: calendarType.isBuiltIn(),
        createdBy: calendarType.getCreatedBy(),
        updatedBy: calendarType.getUpdatedBy(),
        createdAt: calendarType.getCreatedAt(),
        updatedAt: calendarType.getUpdatedAt(),
      })),
      meta: {
        currentPage: result.meta.currentPage,
        totalPages: result.meta.totalPages,
        totalItems: result.meta.totalItems,
        itemsPerPage: result.meta.itemsPerPage,
        hasNextPage: result.meta.hasNextPage,
        hasPrevPage: result.meta.hasPrevPage,
      },
    };
  }

  /**
   * 📄 Récupérer un type de calendrier par son ID
   */
  @Get(":id")
  @ApiParam({
    name: "id",
    description: "UUID unique du type de calendrier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiOperation({
    summary: "📄 Get Calendar Type by ID",
    description: `
    Récupère un type de calendrier spécifique par son identifiant UUID.

    ## 🎯 Fonctionnalités
    - **Validation UUID** : Format d'ID vérifié automatiquement
    - **Permissions** : Accès contrôlé selon le rôle utilisateur
    - **Cache** : Réponse mise en cache pour optimiser les performances
    - **Audit** : Toutes les consultations sont tracées

    ## 📊 **Données retournées**
    - Informations complètes du type de calendrier
    - Métadonnées (dates création/modification, auteur)
    - Statut et paramètres de configuration
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Calendar type found successfully",
    type: CalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Calendar type not found",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "🔐 Authentication required",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "🚫 Insufficient permissions",
  })
  async findById(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<CalendarTypeResponseDto> {
    const result = await this.getCalendarTypeByIdUseCase.execute({
      calendarTypeId: id,
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
    });

    return {
      success: true,
      data: {
        id: result.calendarType.getId().getValue(),
        businessId: result.calendarType.getBusinessId().getValue(),
        name: result.calendarType.getName(),
        code: result.calendarType.getCode(),
        description: result.calendarType.getDescription(),
        color: result.calendarType.getColor(),
        icon: result.calendarType.getIcon(),
        sortOrder: result.calendarType.getSortOrder(),
        isActive: result.calendarType.isActive(),
        isBuiltIn: result.calendarType.isBuiltIn(),
        createdBy: result.calendarType.getCreatedBy(),
        updatedBy: result.calendarType.getUpdatedBy(),
        createdAt: result.calendarType.getCreatedAt(),
        updatedAt: result.calendarType.getUpdatedAt(),
      },
    };
  }

  /**
   * ➕ Créer un nouveau type de calendrier
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "➕ Create New Calendar Type",
    description:
      "Crée un nouveau type de calendrier avec configuration complète",
  })
  @ApiBody({ type: CreateCalendarTypeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "✅ Calendar type created successfully",
    type: CreateCalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Invalid calendar type data",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Calendar type with this code already exists",
  })
  async create(
    @Body() dto: CreateCalendarTypeDto,
    @GetUser() user: User,
  ): Promise<CreateCalendarTypeResponseDto> {
    const result = await this.createCalendarTypeUseCase.execute({
      businessId: dto.businessId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      color: dto.color,
      icon: dto.icon,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
      timestamp: new Date(),
    });

    return {
      success: true,
      data: {
        id: result.calendarType.getId().getValue(),
        businessId: result.calendarType.getBusinessId().getValue(),
        name: result.calendarType.getName(),
        code: result.calendarType.getCode(),
        description: result.calendarType.getDescription(),
        color: result.calendarType.getColor(),
        icon: result.calendarType.getIcon(),
        sortOrder: result.calendarType.getSortOrder(),
        isActive: result.calendarType.isActive(),
        isBuiltIn: result.calendarType.isBuiltIn(),
        createdBy: result.calendarType.getCreatedBy(),
        updatedBy: result.calendarType.getUpdatedBy(),
        createdAt: result.calendarType.getCreatedAt(),
        updatedAt: result.calendarType.getUpdatedAt(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: this.generateCorrelationId(),
      },
    };
  }

  /**
   * ✏️ Mettre à jour un type de calendrier
   */
  @Put(":id")
  @ApiParam({
    name: "id",
    description: "UUID unique du type de calendrier",
  })
  @ApiOperation({
    summary: "✏️ Update Calendar Type",
    description: "Met à jour un type de calendrier existant",
  })
  @ApiBody({ type: UpdateCalendarTypeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Calendar type updated successfully",
    type: UpdateCalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Calendar type not found",
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarTypeDto,
    @GetUser() user: User,
  ): Promise<UpdateCalendarTypeResponseDto> {
    const result = await this.updateCalendarTypeUseCase.execute({
      calendarTypeId: id,
      businessId: dto.businessId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      color: dto.color,
      icon: dto.icon,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
    });

    return {
      success: true,
      data: {
        id: result.calendarType.getId().getValue(),
        businessId: result.calendarType.getBusinessId().getValue(),
        name: result.calendarType.getName(),
        code: result.calendarType.getCode(),
        description: result.calendarType.getDescription(),
        color: result.calendarType.getColor(),
        icon: result.calendarType.getIcon(),
        sortOrder: result.calendarType.getSortOrder(),
        isActive: result.calendarType.isActive(),
        isBuiltIn: result.calendarType.isBuiltIn(),
        createdBy: result.calendarType.getCreatedBy(),
        updatedBy: result.calendarType.getUpdatedBy(),
        createdAt: result.calendarType.getCreatedAt(),
        updatedAt: result.calendarType.getUpdatedAt(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: this.generateCorrelationId(),
      },
    };
  }

  /**
   * 🗑️ Supprimer un type de calendrier
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: "id",
    description: "UUID unique du type de calendrier",
  })
  @ApiOperation({
    summary: "🗑️ Delete Calendar Type",
    description:
      "Supprime un type de calendrier et gère les dépendances associées",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Calendar type deleted successfully",
    type: DeleteCalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Calendar type not found",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Cannot delete calendar type with active dependencies",
  })
  async delete(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<DeleteCalendarTypeResponseDto> {
    // First get the calendar type to get its business ID
    const calendarTypeResult = await this.getCalendarTypeByIdUseCase.execute({
      calendarTypeId: id,
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
    });

    const result = await this.deleteCalendarTypeUseCase.execute({
      calendarTypeId: id,
      businessId: calendarTypeResult.calendarType.getBusinessId().getValue(),
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
    });

    return {
      success: true,
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: this.generateCorrelationId(),
      },
    };
  }

  /**
   * ❤️ Health Check Endpoint
   */
  @Get("health")
  @Public()
  @ApiOperation({
    summary: "❤️ Calendar Types Health Check",
    description: "Health check endpoint for calendar types service",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Service is healthy",
  })
  getHealth() {
    return {
      status: "OK",
      service: "calendar-types",
      timestamp: new Date().toISOString(),
    };
  }

  private generateCorrelationId(): string {
    return `calendar-type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
