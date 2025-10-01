/**
 * 🏥 PRESENTATION CONTROLLER - ProfessionalRole
 * Clean Architecture - Presentation Layer
 * Contrôleur REST pour la gestion des rôles professionnels
 */

import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { GetUser } from "@presentation/security/decorators/get-user.decorator";
import { JwtAuthGuard } from "@presentation/security/guards/jwt-auth.guard";
import { TOKENS } from "@shared/constants/injection-tokens";

// DTOs
import {
  CreateProfessionalRoleDto,
  CreateProfessionalRoleResponseDto,
  DeleteProfessionalRoleResponseDto,
  ListProfessionalRolesDto,
  ListProfessionalRolesResponseDto,
  ProfessionalRoleDto,
  UpdateProfessionalRoleDto,
  UpdateProfessionalRoleResponseDto,
} from "@presentation/dtos/professional-roles/professional-role.dto";

// Mappers
import { ProfessionalRoleMapper } from "@presentation/mappers/professional-role.mapper";

// Use Cases
import { CreateProfessionalRoleUseCase } from "@application/use-cases/professional-roles/create-professional-role.use-case";
import { DeleteProfessionalRoleUseCase } from "@application/use-cases/professional-roles/delete-professional-role.use-case";
import { GetProfessionalRoleUseCase } from "@application/use-cases/professional-roles/get-professional-role.use-case";
import { ListProfessionalRolesUseCase } from "@application/use-cases/professional-roles/list-professional-roles.use-case";
import { UpdateProfessionalRoleUseCase } from "@application/use-cases/professional-roles/update-professional-role.use-case";

@ApiTags("🎭 Professional Roles")
@Controller("professional-roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProfessionalRoleController {
  constructor(
    @Inject(TOKENS.CREATE_PROFESSIONAL_ROLE_USE_CASE)
    private readonly createProfessionalRoleUseCase: CreateProfessionalRoleUseCase,

    @Inject(TOKENS.GET_PROFESSIONAL_ROLE_USE_CASE)
    private readonly getProfessionalRoleUseCase: GetProfessionalRoleUseCase,

    @Inject(TOKENS.LIST_PROFESSIONAL_ROLES_USE_CASE)
    private readonly listProfessionalRolesUseCase: ListProfessionalRolesUseCase,

    @Inject(TOKENS.UPDATE_PROFESSIONAL_ROLE_USE_CASE)
    private readonly updateProfessionalRoleUseCase: UpdateProfessionalRoleUseCase,

    @Inject(TOKENS.DELETE_PROFESSIONAL_ROLE_USE_CASE)
    private readonly deleteProfessionalRoleUseCase: DeleteProfessionalRoleUseCase,
  ) {}

  @Post("list")
  @ApiOperation({
    summary: "🔍 Search Professional Roles with Advanced Filters",
    description: `
    **Recherche avancée paginée** des rôles professionnels avec système de filtrage complet.

    ## 🎯 Fonctionnalités

    ### 📊 **Filtres disponibles**
    - **Recherche textuelle** : Nom, nom d'affichage, description, code
    - **Filtres métier** : Catégorie, statut actif, capacité de leadership
    - **Tri multi-critères** : Tous champs avec asc/desc
    - **Pagination** : Page/limit avec métadonnées complètes

    ### 🏥 **Catégories disponibles**
    - **HEALTHCARE** : Personnel médical et paramédical
    - **WELLNESS** : Professionnels du bien-être
    - **BEAUTY** : Professionnels de l'esthétique
    - **SPORTS** : Entraîneurs et coaches sportifs
    - **THERAPY** : Thérapeutes et conseillers
    - **TECHNICAL** : Personnel technique et support
    - **ADMINISTRATIVE** : Personnel administratif

    ### 📋 **Règles métier**
    - ✅ **Permissions** : Scoped selon rôle utilisateur
    - ✅ **Validation** : Tous paramètres validés côté serveur
    - ✅ **Performance** : Pagination obligatoire, cache Redis

    ### 🔐 **Sécurité**
    - **JWT** : Token Bearer obligatoire
    - **RBAC** : Permissions granulaires par ressource
    - **Rate limiting** : 100 req/min par utilisateur
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Professional roles found successfully",
    type: ListProfessionalRolesResponseDto,
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
    @Body() dto: ListProfessionalRolesDto,
    @GetUser() user: any,
  ): Promise<ListProfessionalRolesResponseDto> {
    const request = ProfessionalRoleMapper.toListRequest(dto, user.id);
    const response = await this.listProfessionalRolesUseCase.execute(request);
    return ProfessionalRoleMapper.toListResponse(response);
  }

  @Get(":id")
  @ApiOperation({
    summary: "📄 Get Professional Role by ID",
    description:
      "Récupère un rôle professionnel spécifique par son identifiant unique",
  })
  @ApiParam({
    name: "id",
    description: "Professional role unique identifier",
    example: "12345678-1234-1234-1234-123456789012",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Professional role found",
    type: ProfessionalRoleDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Professional role not found",
  })
  async findById(
    @Param("id") id: string,
    @GetUser() user: any,
  ): Promise<ProfessionalRoleDto> {
    const request = {
      professionalRoleId: id,
      requestingUserId: user.id,
    };
    const response = await this.getProfessionalRoleUseCase.execute(request);
    return ProfessionalRoleMapper.toGetResponse(response);
  }

  @Post()
  @ApiOperation({
    summary: "➕ Create New Professional Role",
    description: `
    **Crée un nouveau rôle professionnel** avec validation complète.

    ### ✅ **Règles de validation**
    - **Code** : Unique, majuscules, chiffres et underscores uniquement
    - **Nom** : 2-100 caractères
    - **Nom d'affichage** : 2-100 caractères
    - **Catégorie** : Une des catégories prédéfinies
    - **Description** : Optionnelle, max 500 caractères

    ### 🎯 **Paramètres optionnels**
    - **canLead** : Défaut false, indique si le rôle peut diriger
    - **isActive** : Défaut true, statut d'activation
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "✅ Professional role created successfully",
    type: CreateProfessionalRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Validation errors",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Professional role code already exists",
  })
  async create(
    @Body() dto: CreateProfessionalRoleDto,
    @GetUser() user: any,
  ): Promise<CreateProfessionalRoleResponseDto> {
    const request = ProfessionalRoleMapper.toCreateRequest(dto, user.id);
    const domainEntity =
      await this.createProfessionalRoleUseCase.execute(request);
    return ProfessionalRoleMapper.toCreateResponse(domainEntity);
  }

  @Put(":id")
  @ApiOperation({
    summary: "✏️ Update Professional Role",
    description: `
    **Met à jour un rôle professionnel existant** avec validation partielle.

    ### 📝 **Champs modifiables**
    - **Nom d'affichage** : Peut être différent du nom technique
    - **Description** : Texte libre, max 500 caractères
    - **Capacité leadership** : Boolean canLead
    - **Statut actif** : Boolean isActive

    ### 🚫 **Champs non modifiables**
    - **Code** : Identifiant technique permanent
    - **Nom** : Nom technique permanent
    - **Catégorie** : Type de rôle permanent

    ### ⚠️ **Restrictions**
    - Seuls les administrateurs peuvent désactiver un rôle
    - Les rôles avec du personnel assigné ne peuvent pas être supprimés
    `,
  })
  @ApiParam({
    name: "id",
    description: "Professional role unique identifier",
    example: "12345678-1234-1234-1234-123456789012",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Professional role updated successfully",
    type: UpdateProfessionalRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Professional role not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "❌ Validation errors",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProfessionalRoleDto,
    @GetUser() user: any,
  ): Promise<UpdateProfessionalRoleResponseDto> {
    const request = ProfessionalRoleMapper.toUpdateRequest(id, dto, user.id);
    const domainEntity =
      await this.updateProfessionalRoleUseCase.execute(request);
    return ProfessionalRoleMapper.toUpdateResponse(domainEntity);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "🗑️ Delete Professional Role",
    description: `
    **Supprime un rôle professionnel** après vérification des contraintes.

    ### ⚠️ **Contraintes de suppression**
    - Le rôle ne doit pas être assigné à du personnel actif
    - Seuls les administrateurs peuvent supprimer des rôles
    - Les rôles système ne peuvent pas être supprimés

    ### 🔄 **Alternative recommandée**
    - Désactiver le rôle (isActive = false) plutôt que le supprimer
    - Permet de conserver l'historique et les références
    `,
  })
  @ApiParam({
    name: "id",
    description: "Professional role unique identifier",
    example: "12345678-1234-1234-1234-123456789012",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "✅ Professional role deleted successfully",
    type: DeleteProfessionalRoleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "❌ Professional role not found",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "❌ Cannot delete: role is still in use",
  })
  async delete(
    @Param("id") id: string,
    @GetUser() user: any,
  ): Promise<DeleteProfessionalRoleResponseDto> {
    const request = {
      professionalRoleId: id,
      requestingUserId: user.id,
    };
    await this.deleteProfessionalRoleUseCase.execute(request);
    return ProfessionalRoleMapper.toDeleteResponse();
  }
}
