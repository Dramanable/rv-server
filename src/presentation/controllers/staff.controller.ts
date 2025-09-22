/**
 * 👥 STAFF CONTROLLER
 * ✅ REST API pour la gestion du personnel
 * ✅ CRUD complet + recherche avancée
 * ✅ Pattern standardisé conforme au projet
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '../../domain/entities/user.entity';
import { GetUser } from '../security/decorators/get-user.decorator';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

import { CreateStaffUseCase } from '../../application/use-cases/staff/create-staff.use-case';
import { GetStaffUseCase } from '../../application/use-cases/staff/get-staff.use-case';
import { ListStaffUseCase } from '../../application/use-cases/staff/list-staff.use-case';
import { UpdateStaffUseCase } from '../../application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '../../application/use-cases/staff/delete-staff.use-case';

import {
  CreateStaffDto,
  CreateStaffResponseDto,
  GetStaffResponseDto,
  ListStaffDto,
  ListStaffResponseDto,
  UpdateStaffDto,
  UpdateStaffResponseDto,
  DeleteStaffResponseDto,
} from '../dtos/staff.dto';
import { StaffStatus } from '../../domain/entities/staff.entity';
import {
  FileUrl,
  CloudProvider,
} from '../../domain/value-objects/file-url.value-object';

@ApiTags('👥 Staff Management')
@Controller('api/v1/staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly getStaffUseCase: GetStaffUseCase,
    private readonly listStaffUseCase: ListStaffUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly deleteStaffUseCase: DeleteStaffUseCase,
  ) {}

  /**
   * 📋 LIST STAFF - Pattern standardisé
   * Liste paginée avec recherche et filtres avancés
   */
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📋 List staff with advanced search and pagination',
    description: `
    Liste paginée du personnel avec recherche avancée et filtres.

    ✅ Fonctionnalités :
    - Recherche textuelle (nom, email, spécialisation)
    - Filtrage par rôle, statut, entreprise
    - Tri par multiple critères
    - Pagination avancée avec métadonnées
    - Support des permissions par rôle

    📊 Métadonnées incluses :
    - Statistiques de pagination complètes
    - Compteurs par statut et rôle
    - Indicateurs de performance
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Staff list retrieved successfully',
    type: ListStaffResponseDto,
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
    @Body() dto: ListStaffDto,
    @GetUser() user: User,
  ): Promise<ListStaffResponseDto> {
    const response = await this.listStaffUseCase.execute({
      requestingUserId: user.id,
      pagination: {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      sorting: {
        sortBy: dto.sortBy || 'createdAt',
        sortOrder: dto.sortOrder || 'desc',
      },
      filters: {
        search: dto.search,
        role: dto.role,
        isActive: dto.isActive,
        businessId: dto.businessId,
      },
    });

    return {
      success: true,
      data: response.data,
      meta: response.meta,
    };
  }

  /**
   * 📄 GET STAFF BY ID
   * Récupère les détails complets d'un membre du personnel
   */
  @Get(':id')
  @ApiOperation({
    summary: '📄 Get staff member by ID',
    description: `
    Récupère les informations complètes d'un membre du personnel.

    ✅ Informations retournées :
    - Profil complet (nom, titre, spécialisation)
    - Horaires de travail et disponibilités
    - Rôle et permissions
    - Statistiques de performance
    - Intégration calendaire
    - Informations de contact
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Staff member retrieved successfully',
    type: GetStaffResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Staff member not found',
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
  ): Promise<GetStaffResponseDto> {
    const response = await this.getStaffUseCase.execute({
      staffId: id,
      requestingUserId: user.id,
    });

    return {
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `staff-${Date.now()}`,
      },
    };
  }

  /**
   * ➕ CREATE STAFF
   * Créé un nouveau membre du personnel
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '➕ Create new staff member',
    description: `
    Créé un nouveau membre du personnel avec profil complet.

    ✅ Fonctionnalités :
    - Validation des données complète
    - Vérification des permissions
    - Intégration automatique au calendrier
    - Configuration des horaires de travail
    - Notification aux parties prenantes
    - Géneration automatique des accès

    📝 Données requises :
    - Informations personnelles de base
    - Rôle et permissions
    - Entreprise d'affectation
    - Spécialisation et certifications
    - Horaires de travail par défaut
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Staff member created successfully',
    type: CreateStaffResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid staff data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '⚠️ Staff member already exists',
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
    @Body() dto: CreateStaffDto,
    @GetUser() user: User,
  ): Promise<CreateStaffResponseDto> {
    const response = await this.createStaffUseCase.execute({
      businessId: dto.businessId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      jobTitle: dto.jobTitle,
      workingHours: dto.workingHours,
      requestingUserId: user.id,
    });

    return {
      success: true,
      data: {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role,
        businessId: response.businessId,
        isActive: response.isActive,
        createdAt: response.createdAt,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `create-staff-${Date.now()}`,
      },
    };
  }

  /**
   * ✏️ UPDATE STAFF
   * Met à jour les informations d'un membre du personnel
   */
  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update staff member',
    description: `
    Met à jour les informations d'un membre du personnel.

    ✅ Données modifiables :
    - Profil personnel (nom, titre, bio)
    - Spécialisation et certifications
    - Rôle et permissions (avec validation)
    - Horaires de travail
    - Informations de contact
    - Statut (actif/inactif)
    - Intégration calendaire

    🔐 Règles de sécurité :
    - Vérification des permissions appropriées
    - Validation des modifications de rôle
    - Audit trail complet des changements
    - Notification des changements critiques
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Staff member updated successfully',
    type: UpdateStaffResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid update data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Staff member not found',
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
    @Body() dto: UpdateStaffDto,
    @GetUser() user: User,
  ): Promise<UpdateStaffResponseDto> {
    const response = await this.updateStaffUseCase.execute({
      staffId: id,
      requestingUserId: user.id,
      updates: {
        profile: dto.profile
          ? {
              firstName: dto.profile.firstName,
              lastName: dto.profile.lastName,
              title: dto.profile.title,
              specialization: dto.profile.specialization,
              bio: dto.profile.bio,
              profileImageUrl: dto.profile.profileImageUrl
                ? new FileUrl(
                    dto.profile.profileImageUrl,
                    CloudProvider.AWS_S3,
                    'staff-profiles',
                    `staff-${Date.now()}`,
                  )
                : undefined,
              certifications: dto.profile.certifications,
              languages: dto.profile.languages,
            }
          : undefined,
        email: dto.contactInfo?.email,
        status: dto.status ? (dto.status as StaffStatus) : undefined,
        availability: dto.availability,
      },
    });

    return {
      success: true,
      data: response,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `update-staff-${Date.now()}`,
      },
    };
  }

  /**
   * 🗑️ DELETE STAFF
   * Supprime un membre du personnel (avec vérifications)
   */
  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete staff member',
    description: `
    Supprime un membre du personnel avec toutes les vérifications nécessaires.

    ⚠️ Vérifications avant suppression :
    - Validation des permissions appropriées
    - Vérification des rendez-vous en cours
    - Gestion des rendez-vous futurs
    - Réassignation si nécessaire
    - Archivage des données historiques

    🔒 Règles de sécurité :
    - Seuls les administrateurs peuvent supprimer
    - Audit trail complet de la suppression
    - Confirmation requise pour suppression définitive
    - Possibilité de désactivation plutôt que suppression
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Staff member deleted successfully',
    type: DeleteStaffResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Staff member not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '⚠️ Cannot delete staff with active appointments',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions - Admin required',
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<DeleteStaffResponseDto> {
    const response = await this.deleteStaffUseCase.execute({
      staffId: id,
      requestingUserId: user.id,
    });

    return {
      success: response.success,
      data: {
        staffId: response.staffId,
        message: response.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `delete-staff-${Date.now()}`,
      },
    };
  }
}
