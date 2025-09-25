/**
 * 🎯 Professional Controller - REST API Endpoints
 *
 * Contrôleur REST pour la gestion complète des professionnels
 * avec opérations CRUD, recherche paginée, validation stricte,
 * sécurité JWT et documentation Swagger complète.
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '@domain/entities/user.entity';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { JwtAuthGuard } from '@presentation/security/guards/jwt-auth.guard';
import { TOKENS } from '@shared/constants/injection-tokens';

// Professional Use Cases
import { CreateProfessionalUseCase } from '@application/use-cases/professionals/create-professional.use-case';
import { DeleteProfessionalUseCase } from '@application/use-cases/professionals/delete-professional.use-case';
import { GetProfessionalByIdUseCase } from '@application/use-cases/professionals/get-professional-by-id.use-case';
import { ListProfessionalsUseCase } from '@application/use-cases/professionals/list-professionals.use-case';
import { UpdateProfessionalUseCase } from '@application/use-cases/professionals/update-professional.use-case';

// Professional DTOs
import {
  CreateProfessionalDto,
  CreateProfessionalResponseDto,
} from '@presentation/dtos/professionals/create-professional.dto';
import { DeleteProfessionalResponseDto } from '@presentation/dtos/professionals/delete-professional.dto';
import { GetProfessionalResponseDto } from '@presentation/dtos/professionals/get-professional.dto';
import {
  ListProfessionalsDto,
  ListProfessionalsResponseDto,
} from '@presentation/dtos/professionals/list-professionals.dto';
import {
  UpdateProfessionalDto,
  UpdateProfessionalResponseDto,
} from '@presentation/dtos/professionals/update-professional.dto';

// Professional Mapper
import { ProfessionalMapper } from '@presentation/mappers/professional.mapper';

@ApiTags('👨‍💼 Professional Management')
@Controller('professionals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProfessionalController {
  constructor(
    @Inject(TOKENS.CREATE_PROFESSIONAL_USE_CASE)
    private readonly createProfessionalUseCase: CreateProfessionalUseCase,

    @Inject(TOKENS.GET_PROFESSIONAL_BY_ID_USE_CASE)
    private readonly getProfessionalByIdUseCase: GetProfessionalByIdUseCase,

    @Inject(TOKENS.UPDATE_PROFESSIONAL_USE_CASE)
    private readonly updateProfessionalUseCase: UpdateProfessionalUseCase,

    @Inject(TOKENS.DELETE_PROFESSIONAL_USE_CASE)
    private readonly deleteProfessionalUseCase: DeleteProfessionalUseCase,

    @Inject(TOKENS.LIST_PROFESSIONALS_USE_CASE)
    private readonly listProfessionalsUseCase: ListProfessionalsUseCase,
  ) {}

  /**
   * 🔍 Recherche paginée des professionnels avec filtres avancés
   */
  @Post('list')
  @ApiOperation({
    summary: '🔍 Search professionals with advanced filters and pagination',
    description: `
      **Recherche avancée paginée** des professionnels avec système de filtrage complet.

      ## 🎯 Fonctionnalités

      ### 📊 **Filtres disponibles**
      - **Recherche textuelle** : Nom, prénom, email, spécialisation
      - **Filtres métier** : Disponibilité, spécialisation, licence
      - **Tri multi-critères** : Tous champs avec asc/desc
      - **Pagination** : Page/limit avec métadonnées complètes

      ### 👨‍💼 **Exemple professionnel complet**
      \`\`\`json
      {
        "id": "prof-uuid-123",
        "businessId": "business-uuid-456",
        "firstName": "Dr. Marie",
        "lastName": "Dubois",
        "email": "marie.dubois@clinic.com",
        "phone": "+33123456789",
        "specialization": "Kinésithérapie",
        "licenseNumber": "K123456789",
        "biography": "15 ans d'expérience en rééducation",
        "profileImageUrl": "https://cdn.example.com/profiles/marie.jpg",
        "isAvailable": true
      }
      \`\`\`

      ### 📋 **Règles métier**
      - ✅ **Permissions** : Scoped selon rôle utilisateur
      - ✅ **Validation** : Tous paramètres validés côté serveur
      - ✅ **Performance** : Pagination obligatoire, cache Redis

      ### 🔐 **Sécurité**
      - **JWT** : Token Bearer obligatoire
      - **RBAC** : Permissions granulaires par ressource
      - **Rate limiting** : 100 req/min par utilisateur

      ## 🎯 **Guide d'intégration Frontend**

      ### React/Vue.js Example
      \`\`\`typescript
      const searchProfessionals = async (filters: ProfessionalFilters) => {
        const response = await api.post('/api/v1/professionals/list', {
          ...filters,
          page: 1,
          limit: 20
        });

        return {
          professionals: response.data.data,
          pagination: response.data.meta
        };
      };
      \`\`\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Professionals found successfully',
    type: ListProfessionalsResponseDto,
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
    @Body() dto: ListProfessionalsDto,
    @GetUser() user: User,
  ): Promise<ListProfessionalsResponseDto> {
    // Validation: businessId is required
    if (!dto.businessId) {
      throw new Error('businessId is required for listing professionals');
    }

    const request = {
      businessId: dto.businessId, // Now guaranteed to be string
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
        search: dto.search?.trim(),
        businessId: dto.businessId,
        isAvailable: dto.isAvailable,
        specialization: dto.specialization?.trim(),
        hasLicense: dto.hasLicense,
      },
      correlationId: `list-professionals-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.listProfessionalsUseCase.execute(request);

    return ProfessionalMapper.toListResponseDto(
      response.data,
      response.meta.totalItems,
      response.meta.currentPage,
      response.meta.itemsPerPage,
      request.correlationId,
    );
  }

  /**
   * 📄 Récupérer un professionnel par ID
   */
  @Get(':id')
  @ApiOperation({
    summary: '📄 Get professional by ID',
    description:
      "Récupère les détails complets d'un professionnel par son ID unique",
  })
  @ApiParam({
    name: 'id',
    description: 'UUID unique du professionnel',
    example: 'prof-uuid-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Professional found successfully',
    type: GetProfessionalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Professional not found',
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
  ): Promise<GetProfessionalResponseDto> {
    const request = {
      professionalId: id,
      requestingUserId: user.id,
      correlationId: `get-professional-${id}-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.getProfessionalByIdUseCase.execute(request);

    return ProfessionalMapper.fromUseCaseToGetResponseDto(
      response,
      request.correlationId,
    );
  }

  /**
   * ➕ Créer un nouveau professionnel
   */
  @Post()
  @ApiOperation({
    summary: '➕ Create new professional',
    description: `
      Crée un nouveau professionnel dans le système avec validation complète.

      ### 📋 **Validation requise**
      - **Email unique** par entreprise
      - **Numéro de licence** valide si fourni
      - **Spécialisation** parmi les valeurs autorisées
      - **Téléphone** format international recommandé

      ### 🎯 **Cas d'usage typiques**
      - Ajout d'un nouveau praticien à la clinique
      - Enregistrement d'un professionnel externe
      - Import depuis système tiers
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Professional created successfully',
    type: CreateProfessionalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid professional data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '❌ Professional with this email already exists',
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
    @Body() dto: CreateProfessionalDto,
    @GetUser() user: User,
  ): Promise<CreateProfessionalResponseDto> {
    const request = {
      businessId: dto.businessId,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim(),
      phoneNumber: dto.phone?.trim(),
      speciality: dto.specialization.trim(),
      licenseNumber: dto.licenseNumber?.trim() || '',
      biography: dto.biography?.trim(),
      profileImageUrl: dto.profileImageUrl?.trim(),
      requestingUserId: user.id,
      correlationId: `create-professional-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.createProfessionalUseCase.execute(request);

    return {
      success: response.success,
      data: {
        id: response.data.id,
        businessId: response.data.businessId,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phoneNumber, // Mapping phoneNumber -> phone
        specialization: response.data.speciality, // Mapping speciality -> specialization
        licenseNumber: response.data.licenseNumber,
        biography: response.data.bio, // Mapping bio -> biography
        isAvailable: response.data.isActive,
        createdAt: response.data.createdAt.toISOString(),
        updatedAt: response.data.updatedAt.toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: request.correlationId,
      },
    };
  }

  /**
   * ✏️ Mettre à jour un professionnel
   */
  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update professional',
    description: `
      Met à jour les informations d'un professionnel existant.

      ### 🔄 **Mise à jour partielle**
      - Seuls les champs fournis sont mis à jour
      - Email unique par entreprise (si modifié)
      - Validation complète des données modifiées

      ### ⚠️ **Contraintes**
      - Impossible de changer l'entreprise (businessId)
      - Numéro de licence doit rester valide
      - Spécialisation doit être autorisée
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'UUID unique du professionnel à mettre à jour',
    example: 'prof-uuid-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Professional updated successfully',
    type: UpdateProfessionalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid update data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Professional not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '❌ Email already exists for another professional',
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
    @Body() dto: UpdateProfessionalDto,
    @GetUser() user: User,
  ): Promise<UpdateProfessionalResponseDto> {
    const request = {
      professionalId: id,
      firstName: dto.firstName?.trim(),
      lastName: dto.lastName?.trim(),
      email: dto.email?.trim(),
      phone: dto.phone?.trim(),
      specialization: dto.specialization?.trim(),
      licenseNumber: dto.licenseNumber?.trim(),
      biography: dto.biography?.trim(),
      profileImageUrl: dto.profileImageUrl?.trim(),
      isAvailable: dto.isAvailable,
      requestingUserId: user.id,
      correlationId: `update-professional-${id}-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.updateProfessionalUseCase.execute(request);

    return {
      success: response.success,
      data: {
        id: response.data.id,
        businessId: response.data.businessId,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phoneNumber,
        specialization: response.data.speciality,
        licenseNumber: response.data.licenseNumber,
        biography: response.data.bio,
        profileImageUrl: response.data.profileImage,
        isAvailable: response.data.isActive,
        createdAt: response.data.createdAt.toISOString(),
        updatedAt: response.data.updatedAt.toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: request.correlationId,
      },
    };
  }

  /**
   * 🗑️ Supprimer un professionnel
   */
  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete professional',
    description: `
      Supprime un professionnel du système après vérification des contraintes.

      ### ⚠️ **Vérifications de sécurité**
      - Aucun rendez-vous futur associé
      - Aucune dépendance métier active
      - Permissions administrateur requises

      ### 🔄 **Alternative recommandée**
      - Préférer la désactivation (isAvailable = false)
      - Suppression réservée aux cas exceptionnels
      - Conservation de l'historique pour l'audit
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'UUID unique du professionnel à supprimer',
    example: 'prof-uuid-123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Professional deleted successfully',
    type: DeleteProfessionalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Professional not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: '❌ Cannot delete professional with active dependencies',
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
    @GetUser() user: User,
  ): Promise<DeleteProfessionalResponseDto> {
    const request = {
      professionalId: id,
      requestingUserId: user.id,
      correlationId: `delete-professional-${id}-${Date.now()}`,
      timestamp: new Date(),
    };

    const response = await this.deleteProfessionalUseCase.execute(request);

    return {
      success: response.success,
      message: 'Professional deleted successfully',
      deletedId: response.data.professionalId,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: request.correlationId,
      },
    };
  }
}
