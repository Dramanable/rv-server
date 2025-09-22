/**
 * 🎯 Service Controller - Clean Architecture Presentation Layer
 *
 * Contrôleur REST pour la gestion des services
 * ✅ Pattern CRUD standardisé avec recherche avancée
 * ✅ Alignement parfait avec les Use Cases
 * ✅ Validation, permissions, et documentation Swagger complètes
 */
import { User } from '@domain/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
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
import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { JwtAuthGuard } from '@presentation/security/guards/jwt-auth.guard';

// Injection Tokens
import { TOKENS } from '@shared/constants/injection-tokens';

// Use Cases Imports
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';

// DTOs Imports
import {
  CreateServiceDto,
  CreateServiceResponseDto,
  DeleteServiceResponseDto,
  ListServicesDto,
  ListServicesResponseDto,
  ServiceDto,
  UpdateServiceDto,
  UpdateServiceResponseDto,
} from '@presentation/dtos/service.dto';

@ApiTags('💼 Services')
@ApiBearerAuth()
@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(
    @Inject(TOKENS.CREATE_SERVICE_USE_CASE)
    private readonly createServiceUseCase: CreateServiceUseCase,
    @Inject(TOKENS.GET_SERVICE_USE_CASE)
    private readonly getServiceUseCase: GetServiceUseCase,
    @Inject(TOKENS.LIST_SERVICES_USE_CASE)
    private readonly listServicesUseCase: ListServicesUseCase,
    @Inject(TOKENS.UPDATE_SERVICE_USE_CASE)
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    @Inject(TOKENS.DELETE_SERVICE_USE_CASE)
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  /**
   * 🔍 LIST & SEARCH Services with Advanced Filtering
   */
  @Post('list')
  @ApiOperation({
    summary: '🔍 List Services with Advanced Search and Pagination',
    description: `
      **Recherche avancée paginée** avec système de tarification flexible.

      ## ✨ Fonctionnalités
      - 🔍 **Recherche textuelle** par nom ou description
      - 🏷️ **Filtres avancés** : entreprise, catégorie, prix, durée
      - 🔀 **Tri multi-critères** : nom, catégorie, durée, prix, date création
      - 📄 **Pagination optimisée** avec métadonnées complètes
      - 🛡️ **Contrôle d'accès** basé sur les rôles utilisateur
      - 💰 **Pricing flexible** : gratuit, fixe, variable, masqué, sur demande

      ## 🔐 Permissions requises
      | Rôle | Accès |
      |------|-------|
      | PLATFORM_ADMIN | Tous les services système |
      | BUSINESS_OWNER | Services de ses entreprises |
      | BUSINESS_ADMIN | Services de son entreprise |
      | LOCATION_MANAGER | Services de sa localisation |
      | PRACTITIONER | Services qu'il/elle fournit |

      ## 💡 Exemples d'utilisation
      - **Recherche simple** : \`{ "search": "massage" }\`
      - **Filtrage par prix** : \`{ "filters": { "priceRange": { "min": 50, "max": 200 } } }\`
      - **Services gratuits** : \`{ "filters": { "pricingType": "FREE" } }\`
      - **Réservation en ligne** : \`{ "filters": { "allowOnlineBooking": true } }\`
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services retrieved successfully with pagination metadata',
    type: ListServicesResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid pagination, sorting, or filtering parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to list services',
  })
  async list(
    @Body() dto: ListServicesDto,
    @GetUser() user: User,
  ): Promise<ListServicesResponseDto> {
    const request = {
      requestingUserId: user.id,
      businessId: dto.businessId || '', // Will be handled by Use Case based on permissions
      pagination: {
        page: dto.page ?? 1,
        limit: dto.limit ?? 10,
      },
      sorting: {
        sortBy: dto.sortBy ?? 'createdAt',
        sortOrder: dto.sortOrder ?? 'desc',
      },
      filters: {
        name: dto.search,
        category: dto.category as any, // ServiceCategory enum
        isActive: dto.isActive,
        minPrice: dto.minPrice,
        maxPrice: dto.maxPrice,
        minDuration: dto.minDuration,
        maxDuration: dto.maxDuration,
      },
    };

    const response = await this.listServicesUseCase.execute(request);

    return {
      data: response.data.map(this.mapServiceToDto),
      meta: response.meta,
    };
  }

  /**
   * 📄 GET Service by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: '📄 Get Service by ID',
    description: `
      **Récupération détaillée** d'un service avec sa configuration complète.

      ## 📋 Informations retournées
      - 🏷️ **Détails du service** : nom, description, catégorie
      - 💰 **Configuration pricing** : type, prix, remises, forfaits
      - ⏰ **Planification** : durée, créneaux, réservation en ligne
      - 📋 **Prérequis** : âge, documents, préparation
      - 👥 **Personnel assigné** : praticiens disponibles
      - 🔄 **Historique** : dates de création et modification

      ## 🔐 Contrôle d'accès
      - ✅ **PLATFORM_ADMIN** : Accès à tous les services
      - ✅ **BUSINESS_OWNER** : Services de ses entreprises
      - ✅ **BUSINESS_ADMIN** : Services de son entreprise
      - ✅ **LOCATION_MANAGER** : Services de sa localisation
      - ✅ **PRACTITIONER** : Services qu'il/elle fournit

      ## 💡 Cas d'usage typiques
      - 🖥️ **Interface cliente** : Affichage détails avant réservation
      - 📱 **App mobile** : Fiche service complète
      - 🛠️ **Administration** : Gestion et modification
      - 📊 **Reporting** : Analyse des configurations pricing
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service retrieved successfully',
    type: ServiceDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to view this service',
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<ServiceDto> {
    const request = {
      serviceId: id,
      requestingUserId: user.id,
    };

    const response = await this.getServiceUseCase.execute(request);

    return this.mapServiceToDto(response);
  }

  /**
   * ➕ CREATE New Service
   */
  @Post()
  @ApiOperation({
    summary: '➕ Create New Service with Flexible Pricing',
    description: `
      **Création complète** d'un service avec système de tarification avancé.

      ## 🎯 Types de pricing supportés

      ### 🆓 **Service GRATUIT**
      \`\`\`json
      {
        "pricingConfig": {
          "type": "FREE",
          "visibility": "PUBLIC"
        }
      }
      \`\`\`

      ### 💰 **Prix FIXE avec remises**
      \`\`\`json
      {
        "pricingConfig": {
          "type": "FIXED",
          "visibility": "PUBLIC",
          "basePrice": { "amount": 85.00, "currency": "EUR" },
          "discountRules": [
            {
              "type": "FIRST_TIME_CLIENT",
              "discountType": "PERCENTAGE",
              "value": 20
            }
          ]
        }
      }
      \`\`\`

      ### 🔧 **Prix VARIABLE**
      \`\`\`json
      {
        "pricingConfig": {
          "type": "VARIABLE",
          "basePrice": { "amount": 80.00, "currency": "EUR" },
          "variablePricing": {
            "factors": [
              {
                "name": "Durée",
                "options": [
                  { "label": "30 min", "priceModifier": 0 },
                  { "label": "60 min", "priceModifier": 40 }
                ]
              }
            ]
          }
        }
      }
      \`\`\`

      ### 🔒 **Prix MASQUÉ** (devis sur demande)
      \`\`\`json
      {
        "pricingConfig": {
          "type": "ON_DEMAND",
          "visibility": "HIDDEN",
          "onDemandPricing": {
            "requiresQuote": true,
            "estimationProcess": "Consultation préalable"
          }
        }
      }
      \`\`\`

      ## 📋 Règles métier
      - ✅ **Nom unique** par entreprise
      - ✅ **Durée** : 15 minutes à 8 heures
      - ✅ **Catégorie** recommandée pour le filtrage
      - ✅ **Personnel assigné** optionnel
      - ✅ **Prérequis** configurables (âge, documents)

      ## 🔐 Permissions
      - **PLATFORM_ADMIN** : Création pour toute entreprise
      - **BUSINESS_OWNER** : Ses entreprises uniquement
      - **BUSINESS_ADMIN** : Son entreprise uniquement
    `,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: CreateServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid service data or validation errors',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to create services',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service with this name already exists in the business',
  })
  async create(
    @Body() dto: CreateServiceDto,
    @GetUser() user: User,
  ): Promise<CreateServiceResponseDto> {
    const request = {
      requestingUserId: user.id,
      businessId: dto.businessId,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      duration: dto.duration,
      // ✅ Legacy price support - utiliser pricingConfig basePrice si price non fourni
      price: dto.price
        ? {
            amount: dto.price.amount,
            currency: dto.price.currency,
          }
        : dto.pricingConfig.basePrice
          ? {
              amount: parseFloat(dto.pricingConfig.basePrice.amount),
              currency: dto.pricingConfig.basePrice.currency,
            }
          : { amount: 0, currency: 'EUR' }, // Fallback pour FREE services
      // TODO: Passer pricingConfig aux use cases après mise à jour interfaces
      settings: dto.settings
        ? {
            isOnlineBookingEnabled: dto.settings.isOnlineBookingEnabled,
            requiresApproval: dto.settings.requiresApproval,
            maxAdvanceBookingDays: dto.settings.maxAdvanceBookingDays,
            minAdvanceBookingHours: dto.settings.minAdvanceBookingHours,
            bufferTimeBefore: dto.settings.bufferTimeBefore,
            bufferTimeAfter: dto.settings.bufferTimeAfter,
            isGroupBookingAllowed: dto.settings.isGroupBookingAllowed,
            maxGroupSize: dto.settings.maxGroupSize,
          }
        : undefined,
      requirements: dto.requirements
        ? {
            preparation: dto.requirements.preparation,
            materials: dto.requirements.materials,
            restrictions: dto.requirements.restrictions,
            cancellationPolicy: dto.requirements.cancellationPolicy,
          }
        : undefined,
      isActive: dto.isActive ?? true,
    };

    const response = await this.createServiceUseCase.execute(request);

    return {
      success: true,
      data: this.mapServiceToDto(response),
      message: 'Service created successfully',
    };
  }

  /**
   * ✏️ UPDATE Service
   */
  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update Service with Flexible Pricing',
    description: `
      **Mise à jour complète** d'un service existant avec gestion avancée des prix.

      ## 🔄 Modification du pricing

      ### Passage de GRATUIT → PAYANT
      \`\`\`json
      {
        "pricingConfig": {
          "type": "FIXED",
          "visibility": "PUBLIC",
          "basePrice": { "amount": 50.00, "currency": "EUR" }
        }
      }
      \`\`\`

      ### Ajout de règles de remise
      \`\`\`json
      {
        "pricingConfig": {
          "type": "FIXED",
          "discountRules": [
            {
              "type": "LOYALTY_PROGRAM",
              "discountType": "FIXED_AMOUNT",
              "value": 10,
              "conditions": { "minimumVisits": 5 }
            },
            {
              "type": "BULK_BOOKING",
              "discountType": "PERCENTAGE",
              "value": 15,
              "conditions": { "minimumSessions": 3 }
            }
          ]
        }
      }
      \`\`\`

      ### Configuration pricing variable
      \`\`\`json
      {
        "pricingConfig": {
          "type": "VARIABLE",
          "basePrice": { "amount": 60.00, "currency": "EUR" },
          "variablePricing": {
            "factors": [
              {
                "name": "Complexité",
                "options": [
                  { "label": "Standard", "priceModifier": 0 },
                  { "label": "Avancé", "priceModifier": 25 },
                  { "label": "Expert", "priceModifier": 50 }
                ]
              }
            ]
          }
        }
      }
      \`\`\`

      ## 📋 Champs modifiables
      - ✅ **Nom** et description
      - ✅ **Durée** et catégorie
      - ✅ **Statut** (actif/inactif)
      - ✅ **Visibilité** (public/privé)
      - ✅ **Réservation en ligne** activée
      - ✅ **Configuration pricing** complète
      - ✅ **Personnel assigné**
      - ✅ **Prérequis** et tags

      ## 🔐 Permissions
      - **PLATFORM_ADMIN** : Modification de tout service
      - **BUSINESS_OWNER/ADMIN** : Services de leur entreprise uniquement
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    type: UpdateServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data or validation errors',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to update this service',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service name already exists in the business',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @GetUser() user: User,
  ): Promise<UpdateServiceResponseDto> {
    const request = {
      serviceId: id,
      requestingUserId: user.id,
      updates: {
        name: dto.name,
        description: dto.description,
        category: dto.category as any, // ServiceCategory enum
        duration: dto.duration,
        // ✅ Legacy price support - utiliser pricingConfig basePrice si disponible
        price: dto.price
          ? {
              amount: dto.price.amount,
              currency: dto.price.currency,
            }
          : dto.pricingConfig?.basePrice
            ? {
                amount: parseFloat(dto.pricingConfig.basePrice.amount),
                currency: dto.pricingConfig.basePrice.currency,
              }
            : undefined,
        // TODO: Passer pricingConfig aux use cases après mise à jour interfaces
        settings: dto.settings
          ? {
              isOnlineBookingEnabled: dto.settings.isOnlineBookingEnabled,
              requiresApproval: dto.settings.requiresApproval,
              maxAdvanceBookingDays: dto.settings.maxAdvanceBookingDays,
              minAdvanceBookingHours: dto.settings.minAdvanceBookingHours,
              bufferTimeBefore: dto.settings.bufferTimeBefore,
              bufferTimeAfter: dto.settings.bufferTimeAfter,
              isGroupBookingAllowed: dto.settings.isGroupBookingAllowed,
              maxGroupSize: dto.settings.maxGroupSize,
            }
          : undefined,
        requirements: dto.requirements
          ? {
              preparation: dto.requirements.preparation,
              materials: dto.requirements.materials,
              restrictions: dto.requirements.restrictions,
              cancellationPolicy: dto.requirements.cancellationPolicy,
            }
          : undefined,
        isActive: dto.isActive,
      },
    };

    const response = await this.updateServiceUseCase.execute(request);

    return {
      success: true,
      data: this.mapServiceToDto(response),
      message: 'Service updated successfully',
    };
  }

  /**
   * 🗑️ DELETE Service
   */
  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete Service (Soft Delete)',
    description: `
      **Suppression sécurisée** d'un service avec préservation des données historiques.

      ## 🛡️ Règles de protection

      ### ❌ **Suppression BLOQUÉE si :**
      - ✋ Rendez-vous **actifs** ou **futurs** liés au service
      - ✋ Commandes ou **paiements en cours**
      - ✋ Service référencé dans des **packages actifs**

      ### ✅ **Suppression AUTORISÉE :**
      - 🕒 Aucun rendez-vous futur programmé
      - 💰 Tous les paiements soldés
      - 📋 Service non utilisé dans des offres groupées

      ## 🔄 Processus de suppression

      1. **Vérification** des contraintes métier
      2. **Soft delete** → Service marqué inactif
      3. **Préservation** données historiques complètes
      4. **Notification** aux administrateurs

      ### ⚠️ Impact de la suppression

      \`\`\`json
      {
        "service": {
          "id": "uuid",
          "isActive": false,
          "deletedAt": "2024-01-15T10:30:00Z",
          "deletedBy": "admin-user-id"
        },
        "impact": {
          "futureAppointments": 0,
          "historicalAppointments": 42,
          "linkedStaff": 3,
          "dataPreserved": true
        }
      }
      \`\`\`

      ## 🔐 Permissions
      - **PLATFORM_ADMIN** : Suppression de tout service
      - **BUSINESS_OWNER** : Services de ses entreprises
      - **BUSINESS_ADMIN** : Services de son entreprise

      ## 🔄 Restauration possible
      Les services supprimés peuvent être **réactivés** par les administrateurs.
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service deleted successfully',
    type: DeleteServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to delete this service',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Cannot delete service with active appointments',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ): Promise<DeleteServiceResponseDto> {
    const request = {
      serviceId: id,
      requestingUserId: user.id,
    };

    await this.deleteServiceUseCase.execute(request);

    return {
      success: true,
      message: 'Service deleted successfully',
      serviceId: id,
    };
  }

  /**
   * 🔄 Private Helper: Map Service Entity to DTO
   */
  private mapServiceToDto(service: any): ServiceDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration,
      // ✅ Legacy price support (null for FREE services)
      price: service.pricing
        ? {
            amount: service.pricing.basePrice?.amount || 0,
            currency: service.pricing.basePrice?.currency || 'EUR',
          }
        : undefined,
      // ✅ NOUVEAU : PricingConfig flexible
      pricingConfig: {
        type: service.pricingConfig.type,
        visibility: service.pricingConfig.visibility,
        basePrice: service.pricingConfig.basePrice
          ? {
              amount: service.pricingConfig.basePrice.amount.toString(),
              currency: service.pricingConfig.basePrice.currency,
            }
          : undefined,
        rules: service.pricingConfig.rules || [],
        description: service.pricingConfig.description,
      },
      // ✅ NOUVEAU : Support packages
      packages: service.packages?.map((pkg: any) => ({
        name: pkg.name,
        description: pkg.description,
        sessionsIncluded: pkg.sessionsIncluded.toString(),
        packagePrice: {
          amount: pkg.packagePrice.amount.toString(),
          currency: pkg.packagePrice.currency,
        },
        validityDays: pkg.validityDays?.toString(),
      })),
      businessId: service.businessId,
      isActive: service.isActive,
      settings: service.settings
        ? {
            isOnlineBookingEnabled: service.settings.isOnlineBookingEnabled,
            requiresApproval: service.settings.requiresApproval,
            maxAdvanceBookingDays: service.settings.maxAdvanceBookingDays,
            minAdvanceBookingHours: service.settings.minAdvanceBookingHours,
            bufferTimeBefore: service.settings.bufferTimeBefore,
            bufferTimeAfter: service.settings.bufferTimeAfter,
            isGroupBookingAllowed: service.settings.isGroupBookingAllowed,
            maxGroupSize: service.settings.maxGroupSize,
          }
        : undefined,
      requirements: service.requirements
        ? {
            preparation: service.requirements.preparation,
            materials: service.requirements.materials,
            restrictions: service.requirements.restrictions,
            cancellationPolicy: service.requirements.cancellationPolicy,
          }
        : undefined,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
