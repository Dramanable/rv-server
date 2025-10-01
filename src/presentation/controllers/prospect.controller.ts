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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Security
import { GetUser } from '../security/decorators/get-user.decorator';
import { Public } from '../security/decorators/public.decorator';

// DTOs
import { CreateProspectDto } from '../dtos/prospects/create-prospect.dto';
import { ListProspectsResponseDto } from '../dtos/prospects/list-prospects-response.dto';
import { ListProspectsDto } from '../dtos/prospects/list-prospects.dto';
import { ProspectResponseDto } from '../dtos/prospects/prospect-response.dto';
import { UpdateProspectDto } from '../dtos/prospects/update-prospect.dto';

// Use Cases
import type { CreateProspectUseCase } from '@application/use-cases/prospects/create-prospect.use-case';
import type { DeleteProspectUseCase } from '@application/use-cases/prospects/delete-prospect.use-case';
import type { GetProspectByIdUseCase } from '@application/use-cases/prospects/get-prospect-by-id.use-case';
import type { ListProspectsUseCase } from '@application/use-cases/prospects/list-prospects.use-case';
import type { UpdateProspectUseCase } from '@application/use-cases/prospects/update-prospect.use-case';

// Mappers
import { ProspectDtoMapper } from '../mappers/prospect-dto.mapper';

// Shared
import { TOKENS } from '@shared/constants/injection-tokens';
import type { AuthenticatedUser } from '../security/types/guard.types';

/**
 * 🎯 ProspectController - Gestion des prospects pour l'organisation interne
 *
 * Ce controller gère les prospects dans le contexte de l'éditeur SaaS :
 * - Commerciaux qui démarchent des partenaires potentiels
 * - Super-admin qui supervise les ventes
 * - Suivi du pipeline de vente et des métriques
 *
 * 🔐 Sécurité : Authentification JWT requise
 * 🎭 Permissions : Basées sur les rôles SALES_REP et SUPER_ADMIN
 */
@ApiTags('🎯 Prospects Management')
@Controller('prospects')
@ApiBearerAuth()
export class ProspectController {
  constructor(
    @Inject(TOKENS.CREATE_PROSPECT_USE_CASE)
    private readonly createProspectUseCase: CreateProspectUseCase,

    @Inject(TOKENS.GET_PROSPECT_USE_CASE)
    private readonly getProspectUseCase: GetProspectByIdUseCase,

    @Inject(TOKENS.LIST_PROSPECTS_USE_CASE)
    private readonly listProspectsUseCase: ListProspectsUseCase,

    @Inject(TOKENS.UPDATE_PROSPECT_USE_CASE)
    private readonly updateProspectUseCase: UpdateProspectUseCase,

    @Inject(TOKENS.DELETE_PROSPECT_USE_CASE)
    private readonly deleteProspectUseCase: DeleteProspectUseCase,
  ) {}

  /**
   * 🧪 Test endpoint public pour vérifier que le controller fonctionne
   */
  @Get('test')
  @Public()
  @ApiOperation({
    summary: '🧪 Test endpoint for prospects controller',
    description:
      'Public endpoint to test that the prospects controller is working',
  })
  async test(): Promise<{ message: string; timestamp: string }> {
    return {
      message: '✅ Prospects controller is working with cookie authentication!',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🔍 Recherche avancée paginée des prospects
   *
   * Fonctionnalités :
   * - Pagination (page, limit)
   * - Tri multi-critères (sortBy, sortOrder)
   * - Recherche textuelle (search)
   * - Filtres spécialisés (status, businessSize, assignedSalesRep)
   *
   * Permissions : MANAGE_PROSPECTS ou READ_PROSPECTS
   */
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 Search prospects with advanced filters',
    description: `
    Recherche avancée paginée des prospects avec filtrage complet.

    ✅ Fonctionnalités :
    - Pagination (page, limit)
    - Tri multi-critères (sortBy, sortOrder)
    - Recherche textuelle (businessName, contactName, email)
    - Filtres métier (status, businessSize, assignedSalesRep, source)

    🔐 Permissions requises :
    - MANAGE_PROSPECTS ou READ_PROSPECTS
    - Scoping automatique selon rôle utilisateur (commercial vs super-admin)
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Prospects found successfully',
    type: ListProspectsResponseDto,
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
    @Body() dto: ListProspectsDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ListProspectsResponseDto> {
    // Debug: Logguer l'utilisateur
    console.log('🔍 DEBUG User from @GetUser():', user);
    console.log('🔍 DEBUG User ID:', user?.id);

    // Mapper DTO → Use Case Request
    const request = ProspectDtoMapper.toListProspectsRequest(dto, user);
    console.log('🔍 DEBUG Request:', request);

    // Exécuter Use Case
    const result = await this.listProspectsUseCase.execute(request);

    // Mapper Domain → DTO Response
    return ProspectDtoMapper.toListProspectsResponse(result);
  }

  /**
   * 📄 Récupérer un prospect par ID
   */
  @Get(':id')
  @ApiOperation({
    summary: '📄 Get prospect by ID',
    description: "Récupère les détails complets d'un prospect par son ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Prospect found',
    type: ProspectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Prospect not found',
  })
  async findById(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ProspectResponseDto> {
    // Mapper vers Use Case Request
    const request = ProspectDtoMapper.toGetProspectRequest(id, user);

    // Exécuter Use Case
    const prospect = await this.getProspectUseCase.execute(request);

    // Mapper Domain → DTO Response
    return ProspectDtoMapper.toProspectResponse(prospect);
  }

  /**
   * ➕ Créer un nouveau prospect
   */
  @Post()
  @Public()
  @ApiOperation({
    summary: '➕ Create new prospect',
    description: 'Créer un nouveau prospect dans le pipeline de vente',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Prospect created successfully',
    type: ProspectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid prospect data',
  })
  async create(@Body() dto: CreateProspectDto): Promise<ProspectResponseDto> {
    // Pour endpoint public temporaire, créer un utilisateur par défaut
    const defaultUser: AuthenticatedUser = {
      id: 'e4b05561-b0f9-4d91-832c-12b538ff2770', // Votre ID utilisateur
      email: 'am@live.fr',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mapper DTO → Use Case Request
    const request = ProspectDtoMapper.toCreateProspectRequest(dto, defaultUser);

    // Exécuter Use Case
    const prospect = await this.createProspectUseCase.execute(request);

    // Mapper Domain → DTO Response
    return ProspectDtoMapper.toProspectResponse(prospect);
  }

  /**
   * ✏️ Mettre à jour un prospect
   */
  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update prospect',
    description: "Mettre à jour les informations d'un prospect existant",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Prospect updated successfully',
    type: ProspectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Prospect not found',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProspectDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ProspectResponseDto> {
    // Mapper DTO → Use Case Request
    const request = ProspectDtoMapper.toUpdateProspectRequest(id, dto, user);

    // Exécuter Use Case
    const prospect = await this.updateProspectUseCase.execute(request);

    // Mapper Domain → DTO Response
    return ProspectDtoMapper.toProspectResponse(prospect);
  }

  /**
   * 🗑️ Supprimer un prospect (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '🗑️ Delete prospect',
    description: 'Supprimer un prospect (soft delete avec audit trail)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '✅ Prospect deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Prospect not found',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<void> {
    // Mapper vers Use Case Request
    const request = ProspectDtoMapper.toDeleteProspectRequest(id, user);

    // Exécuter Use Case
    await this.deleteProspectUseCase.execute(request);
  }
}
