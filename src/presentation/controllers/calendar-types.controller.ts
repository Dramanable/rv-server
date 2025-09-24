import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CreateCalendarTypeUseCase } from '@application/use-cases/calendar-types/create-calendar-type.use-case';
import { GetCalendarTypeByIdUseCase } from '@application/use-cases/calendar-types/get-calendar-type-by-id.use-case';
import { ListCalendarTypesUseCase } from '@application/use-cases/calendar-types/list-calendar-types.use-case';
import { UpdateCalendarTypeUseCase } from '@application/use-cases/calendar-types/update-calendar-type.use-case';
import { DeleteCalendarTypeUseCase } from '@application/use-cases/calendar-types/delete-calendar-type.use-case';
import { TOKENS } from '@shared/constants/injection-tokens';
import { JwtAuthGuard } from '@presentation/security/auth.guard';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { User } from '@domain/entities/user.entity';

import {
  CreateCalendarTypeDto,
  UpdateCalendarTypeDto,
  ListCalendarTypesDto,
  DeleteCalendarTypeDto,
  CalendarTypeResponseDto,
  CreateCalendarTypeResponseDto,
  ListCalendarTypesResponseDto,
  UpdateCalendarTypeResponseDto,
  DeleteCalendarTypeResponseDto,
} from '@presentation/dtos/calendar-types';

/**
 * 📅 Controller pour la gestion des types de calendrier
 * ✅ CRUD complet avec validation
 * ✅ Swagger documentation
 * ✅ Authentification JWT obligatoire
 * ✅ Audit et logging intégrés
 */
@ApiTags('📅 Calendar Types')
@Controller('calendar-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
   * 🔍 Recherche avancée paginée des types de calendrier
   */
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 Search Calendar Types with Advanced Filters',
    description: `
    **Recherche avancée paginée** des types de calendrier avec système de filtrage complet.

    ## 🎯 Fonctionnalités

    ### 📊 **Filtres disponibles**
    - **Recherche textuelle** : Nom, description
    - **Filtres métier** : Statut actif/inactif
    - **Tri multi-critères** : Nom, date création, ordre d'affichage
    - **Pagination** : Page/limit avec métadonnées complètes

    ### 📋 **Règles métier**
    - ✅ **Permissions** : Scoped selon rôle utilisateur
    - ✅ **Validation** : Tous paramètres validés côté serveur
    - ✅ **Performance** : Pagination obligatoire, cache optimisé

    ### 🔐 **Sécurité**
    - **JWT** : Token Bearer obligatoire
    - **RBAC** : Permissions granulaires par ressource

    ## 🎯 **Guide d'intégration Frontend**

    ### React/Vue.js Example
    \`\`\`typescript
    const searchCalendarTypes = async (filters: CalendarTypeFilters) => {
      const response = await api.post('/api/v1/calendar-types/list', {
        ...filters,
        page: 1,
        limit: 20
      });

      return {
        calendarTypes: response.data.data,
        pagination: response.data.meta
      };
    };
    \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Calendar types found successfully',
    type: ListCalendarTypesResponseDto,
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
  async list(
    @Body() dto: ListCalendarTypesDto,
    @GetUser() user: User,
  ): Promise<ListCalendarTypesResponseDto> {
    const result = await this.listCalendarTypesUseCase.execute({
      businessId: dto.businessId,
      page: dto.page ?? 1,
      limit: dto.limit ?? 10,
      sortBy: dto.sortBy ?? 'createdAt',
      sortOrder: dto.sortOrder ?? 'desc',
      search: dto.search,
      isActive: dto.isActive,
      requestingUserId: user.id,
      correlationId: this.generateCorrelationId(),
    });

    return {
      success: true,
      data: result.data.map((calendarType: any) => ({
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
  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'UUID unique du type de calendrier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: '📄 Get Calendar Type by ID',
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
    description: '✅ Calendar type found successfully',
    type: CalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Calendar type not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async findById(
    @Param('id') id: string,
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
    summary: '➕ Create New Calendar Type',
    description: `
    Crée un nouveau type de calendrier avec validation complète des données métier.

    ## 🎯 Fonctionnalités
    - **Validation stricte** : Toutes les données sont validées
    - **Unicité** : Vérification automatique des doublons
    - **Audit complet** : Traçabilité de la création
    - **Configuration métier** : Paramètres personnalisables

    ## 📋 **Règles de validation**
    - **Nom** : 2-100 caractères, unique par business
    - **Description** : Optionnelle, max 500 caractères
    - **Couleur** : Format hexadécimal (#RRGGBB)
    - **Icône** : Nom d'icône valide (optionnel)
    - **Ordre d'affichage** : Nombre entier positif

    ## 🎯 **Guide d'intégration Frontend**

    ### React/Vue.js Example
    \`\`\`typescript
    const createCalendarType = async (data: CalendarTypeData) => {
      const response = await api.post('/api/v1/calendar-types', {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        sortOrder: data.sortOrder,
        isActive: true
      });

      return response.data.data;
    };
    \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Calendar type created successfully',
    type: CreateCalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid calendar type data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '❌ Calendar type name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
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
   * ✏️ Mettre à jour un type de calendrier existant
   */
  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'UUID unique du type de calendrier à modifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: '✏️ Update Existing Calendar Type',
    description: `
    Met à jour un type de calendrier existant avec validation complète.

    ## 🎯 Fonctionnalités
    - **Mise à jour partielle** : Seulement les champs fournis sont modifiés
    - **Validation** : Toutes les nouvelles données sont validées
    - **Audit complet** : Traçabilité des modifications
    - **Vérifications métier** : Contraintes d'unicité respectées

    ## 📋 **Champs modifiables**
    - Nom, description, couleur, icône
    - Ordre d'affichage, statut actif/inactif
    - Toutes modifications sont auditées et horodatées
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Calendar type updated successfully',
    type: UpdateCalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Calendar type not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid update data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '❌ Calendar type name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async update(
    @Param('id') id: string,
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
  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'UUID unique du type de calendrier à supprimer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: '🗑️ Delete Calendar Type',
    description: `
    Supprime un type de calendrier avec vérifications de sécurité complètes.

    ## ⚠️ **Règles de suppression**
    - **Vérification d'usage** : Impossible de supprimer si utilisé par des calendriers existants
    - **Soft delete** : Marquage comme inactif plutôt que suppression physique
    - **Audit complet** : Traçabilité de la suppression
    - **Permissions** : Seuls les administrateurs peuvent supprimer

    ## 🔒 **Sécurité**
    - Vérification des dépendances avant suppression
    - Confirmation utilisateur requise côté frontend
    - Logs détaillés pour audit de sécurité
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Calendar type deleted successfully',
    type: DeleteCalendarTypeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Calendar type not found',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: '❌ Cannot delete: calendar type is in use',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async delete(
    @Param('id') id: string,
    @Body() dto: DeleteCalendarTypeDto,
    @GetUser() user: User,
  ): Promise<DeleteCalendarTypeResponseDto> {
    const result = await this.deleteCalendarTypeUseCase.execute({
      calendarTypeId: id,
      businessId: dto.businessId,
      requestingUserId: user.id,
      correlationId: dto.correlationId || this.generateCorrelationId(),
    });

    return {
      success: true,
      message: result.message,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: dto.correlationId || this.generateCorrelationId(),
      },
    };
  }

  /**
   * Génère un ID de corrélation unique pour le tracing
   */
  private generateCorrelationId(): string {
    return `calendar-type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
