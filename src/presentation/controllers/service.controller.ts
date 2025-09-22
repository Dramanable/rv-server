/**
 * 🎯 Service Controller - Clean Architecture Presentation Layer
 *
 * Contrôleur REST pour la gestion des services
 * ✅ Pattern CRUD standardisé avec recherche avancée
 * ✅ Alignement parfait avec les Use Cases
 * ✅ Validation, permissions, et documentation Swagger complètes
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@presentation/security/guards/jwt-auth.guard';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { User } from '@domain/entities/user.entity';

// Use Cases Imports
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';

// DTOs Imports
import {
  CreateServiceDto,
  UpdateServiceDto,
  ListServicesDto,
  ServiceDto,
  ListServicesResponseDto,
  CreateServiceResponseDto,
  UpdateServiceResponseDto,
  DeleteServiceResponseDto,
} from '@presentation/dtos/service.dto';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('api/v1/services')
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  /**
   * 🔍 LIST & SEARCH Services with Advanced Filtering
   */
  @Post('list')
  @ApiOperation({
    summary: 'List Services with Advanced Search and Pagination',
    description: `
      Provides comprehensive search, filtering, and pagination for services.
      
      **Features:**
      - ✅ Search by name or description
      - ✅ Filter by business, category, price range, duration
      - ✅ Sort by multiple fields (name, category, duration, price, createdAt)
      - ✅ Pagination with metadata
      - ✅ Permission-based access control
      
      **Permissions Required:**
      - PLATFORM_ADMIN: Can list all services
      - BUSINESS_OWNER: Can list services in their businesses
      - BUSINESS_ADMIN: Can list services in their business
      - LOCATION_MANAGER: Can list services in their location
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
    summary: 'Get Service by ID',
    description: `
      Retrieves a specific service by its unique identifier.
      
      **Permissions Required:**
      - PLATFORM_ADMIN: Can view any service
      - BUSINESS_OWNER: Can view services in their businesses
      - BUSINESS_ADMIN: Can view services in their business
      - LOCATION_MANAGER: Can view services in their location
      - PRACTITIONER: Can view services they provide
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
    summary: 'Create New Service',
    description: `
      Creates a new service for a business.
      
      **Business Rules:**
      - Service name must be unique within the business
      - Duration must be between 15 minutes and 8 hours
      - Price must be positive
      - Category is optional but recommended
      
      **Permissions Required:**
      - PLATFORM_ADMIN: Can create services for any business
      - BUSINESS_OWNER: Can create services for their businesses
      - BUSINESS_ADMIN: Can create services for their business
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
    summary: 'Update Service',
    description: `
      Updates an existing service with new information.
      
      **Business Rules:**
      - Only provided fields will be updated (partial update)
      - Service name must remain unique within the business
      - Cannot update businessId (services cannot be transferred)
      
      **Permissions Required:**
      - PLATFORM_ADMIN: Can update any service
      - BUSINESS_OWNER: Can update services in their businesses
      - BUSINESS_ADMIN: Can update services in their business
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
    summary: 'Delete Service',
    description: `
      Deletes a service (soft delete - marks as inactive).
      
      **Business Rules:**
      - Cannot delete services with active/future appointments
      - Service is marked as inactive, not physically deleted
      - Historical data and completed appointments are preserved
      
      **Permissions Required:**
      - PLATFORM_ADMIN: Can delete any service
      - BUSINESS_OWNER: Can delete services in their businesses
      - BUSINESS_ADMIN: Can delete services in their business
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
