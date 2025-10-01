/**
 * 🎯 PERMISSION CONTROLLER
 * Clean Architecture - Presentation Layer
 * Controller REST pour la gestion des permissions
 */

import type { CreatePermissionUseCase } from "@application/use-cases/permissions/create-permission.use-case";
import type { DeletePermissionUseCase } from "@application/use-cases/permissions/delete-permission.use-case";
import type { GetPermissionByIdUseCase } from "@application/use-cases/permissions/get-permission-by-id.use-case";
import type { ListPermissionsUseCase } from "@application/use-cases/permissions/list-permissions.use-case";
import type { UpdatePermissionUseCase } from "@application/use-cases/permissions/update-permission.use-case";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { GetUser } from "@presentation/security/decorators/get-user.decorator";
import { JwtAuthGuard } from "@presentation/security/guards/jwt-auth.guard";
import { TOKENS } from "@shared/constants/injection-tokens";
import { CreatePermissionDto } from "../dtos/permissions/create-permission.dto";
import { ListPermissionsDto } from "../dtos/permissions/list-permissions.dto";
import { PermissionResponseDto } from "../dtos/permissions/permission-response.dto";
import {
  CreatePermissionResponseDto,
  DeletePermissionResponseDto,
  ListPermissionsResponseDto,
  UpdatePermissionResponseDto,
} from "../dtos/permissions/response-dtos.dto";
import { UpdatePermissionDto } from "../dtos/permissions/update-permission.dto";
import { PermissionMapper } from "../mappers/permission.mapper";

@ApiTags("🔐 Permissions")
@Controller("permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(
    @Inject(TOKENS.CREATE_PERMISSION_USE_CASE)
    private readonly createPermissionUseCase: CreatePermissionUseCase,

    @Inject(TOKENS.LIST_PERMISSIONS_USE_CASE)
    private readonly listPermissionsUseCase: ListPermissionsUseCase,

    @Inject(TOKENS.GET_PERMISSION_BY_ID_USE_CASE)
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,

    @Inject(TOKENS.UPDATE_PERMISSION_USE_CASE)
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,

    @Inject(TOKENS.DELETE_PERMISSION_USE_CASE)
    private readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  /**
   * 📋 Recherche et liste paginée des permissions
   */
  @Post("list")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "🔍 Rechercher permissions avec filtres avancés",
    description: `
    **Recherche avancée paginée** des permissions avec système de filtrage complet.

    ## 🎯 Fonctionnalités

    ### 📊 **Filtres disponibles**
    - **Recherche textuelle** : Nom, nom d'affichage, description
    - **Filtres métier** : Catégorie, statut actif, type système
    - **Tri multi-critères** : Par nom, nom d'affichage, catégorie, date
    - **Pagination** : Page/limit avec métadonnées complètes

    ### 🔐 **Sécurité**
    - **JWT** : Token Bearer obligatoire
    - **RBAC** : Permissions granulaires par ressource
    - **Rate limiting** : 100 req/min par utilisateur

    ## 🎯 **Guide d'intégration Frontend**

    ### React/Vue.js Example
    \`\`\`typescript
    const searchPermissions = async (filters: PermissionFilters) => {
      const response = await api.post('/api/v1/permissions/list', {
        ...filters,
        page: 1,
        limit: 20
      });

      return {
        permissions: response.data.data,
        pagination: response.data.meta
      };
    };
    \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Permissions trouvées avec succès",
    type: ListPermissionsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Paramètres de recherche invalides",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "🔐 Authentification requise",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "🚫 Permissions insuffisantes",
  })
  async list(
    @Body() dto: ListPermissionsDto,
    @GetUser() user: any,
  ): Promise<ListPermissionsResponseDto> {
    const request = PermissionMapper.toListPermissionsRequest(dto, user.id);
    const response = await this.listPermissionsUseCase.execute(request);

    return {
      success: true,
      data: PermissionMapper.toPermissionResponseDtos(
        response.permissions.map(
          (p) =>
            ({
              ...p,
              getId: () => p.id,
              getName: () => p.name,
              getDisplayName: () => p.displayName,
              getDescription: () => p.description,
              getCategory: () => p.category,
              isSystemPermission: () => p.isSystemPermission,
              isActive: () => p.isActive,
              getCreatedAt: () => new Date(p.createdAt),
              getUpdatedAt: () => new Date(p.updatedAt),
            }) as any,
        ),
      ),
      meta: response.meta,
    };
  }

  /**
   * 📄 Récupérer une permission par ID
   */
  @Get(":id")
  @ApiOperation({
    summary: "📄 Récupérer permission par ID",
    description:
      "Récupère les détails complets d'une permission par son identifiant.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Permission trouvée",
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Permission non trouvée",
  })
  async findById(
    @Param("id") id: string,
    @GetUser() user: any,
  ): Promise<PermissionResponseDto> {
    const request = {
      permissionId: id,
      requestingUserId: user.id,
      correlationId: `get-permission-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.getPermissionByIdUseCase.execute(request);
    return PermissionMapper.fromPermissionJSON(response);
  }

  /**
   * ➕ Créer une nouvelle permission
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "➕ Créer nouvelle permission",
    description:
      "Crée une nouvelle permission avec toutes les validations métier.",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "✅ Permission créée avec succès",
    type: CreatePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Données de permission invalides",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Permission avec ce nom existe déjà",
  })
  async create(
    @Body() dto: CreatePermissionDto,
    @GetUser() user: any,
  ): Promise<CreatePermissionResponseDto> {
    const request = PermissionMapper.toCreatePermissionRequest(dto, user.id);
    const response = await this.createPermissionUseCase.execute(request);

    return {
      success: true,
      data: PermissionMapper.fromPermissionJSON(response),
    };
  }

  /**
   * ✏️ Mettre à jour une permission
   */
  @Put(":id")
  @ApiOperation({
    summary: "✏️ Mettre à jour permission",
    description: "Met à jour une permission existante (sauf catégorie et nom).",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Permission mise à jour avec succès",
    type: UpdatePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Permission non trouvée",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "🚫 Impossible de modifier permission système",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePermissionDto,
    @GetUser() user: any,
  ): Promise<UpdatePermissionResponseDto> {
    const request = PermissionMapper.toUpdatePermissionRequest(
      dto,
      id,
      user.id,
    );
    const response = await this.updatePermissionUseCase.execute(request);

    return {
      success: true,
      data: PermissionMapper.fromPermissionJSON(response),
    };
  }

  /**
   * 🗑️ Supprimer une permission
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "🗑️ Supprimer permission",
    description: "Supprime une permission (seulement si non-système).",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Permission supprimée avec succès",
    type: DeletePermissionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Permission non trouvée",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "🚫 Impossible de supprimer permission système",
  })
  async delete(
    @Param("id") id: string,
    @GetUser() user: any,
  ): Promise<DeletePermissionResponseDto> {
    const request = {
      permissionId: id,
      requestingUserId: user.id,
      correlationId: `delete-permission-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.deletePermissionUseCase.execute(request);

    return {
      success: response.success,
      message: response.message,
    };
  }
}
