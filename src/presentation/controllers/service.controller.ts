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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';

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

  @Post('list')
  @ApiOperation({
    summary: 'List Services with Advanced Search and Pagination',
    description: 'Advanced paginated search with flexible pricing support',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services retrieved successfully with pagination metadata',
    type: ListServicesResponseDto,
  })
  async list(
    @Body() dto: ListServicesDto,
    @GetUser() user: User,
  ): Promise<ListServicesResponseDto> {
    const request = {
      requestingUserId: user.id,
      businessId: dto.businessId || '',
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
        serviceTypeIds: dto.serviceTypeIds,
        isActive: dto.isActive,
        minPrice: dto.minPrice,
        maxPrice: dto.maxPrice,
        minDuration: dto.minDuration,
        maxDuration: dto.maxDuration,
      },
    };

    const response = await this.listServicesUseCase.execute(request);

    return {
      data: response.data.map((service) => this.mapServiceToDto(service)),
      meta: response.meta,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Service by ID with Complete Information',
    description: 'Retrieve detailed service information',
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

  @Post()
  @ApiOperation({
    summary: 'Create New Service with Flexible Pricing',
    description: 'Create service with advanced pricing configuration',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: CreateServiceResponseDto,
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
      serviceTypeIds: dto.serviceTypeIds,
      duration: dto.duration,
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
          : { amount: 0, currency: 'EUR' },
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

  @Put(':id')
  @ApiOperation({
    summary: 'Update Service with Flexible Pricing',
    description: 'Update existing service with pricing modification',
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
        serviceTypeIds: dto.serviceTypeIds,
        duration: dto.duration,
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

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Service (Soft Delete)',
    description: 'Soft delete service with business rule validation',
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

  @Get('health')
  @ApiOperation({
    summary: 'Service Health Check',
    description: 'Simple health check for the Service controller',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service controller is healthy',
  })
  async health(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  private mapServiceToDto(service: any): ServiceDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      serviceTypeIds:
        service.serviceTypeIds?.map((st: any) =>
          st.getValue ? st.getValue() : st,
        ) || [],
      duration: service.duration,
      price: service.pricing
        ? {
            amount: service.pricing.basePrice?.amount || 0,
            currency: service.pricing.basePrice?.currency || 'EUR',
          }
        : undefined,
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
