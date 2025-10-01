import { User } from '@domain/entities/user.entity';
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { JwtAuthGuard } from '@presentation/security/guards/jwt-auth.guard';
import { TOKENS } from '@shared/constants/injection-tokens';

// DTOs - Import service DTOs
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

// Use Cases
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';

@ApiTags('💼 Services')
@Controller('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(
    @Inject(TOKENS.CREATE_SERVICE_USE_CASE)
    private readonly createServiceUseCase: CreateServiceUseCase,

    @Inject(TOKENS.GET_SERVICE_USE_CASE)
    private readonly getServiceUseCase: GetServiceUseCase,

    @Inject(TOKENS.UPDATE_SERVICE_USE_CASE)
    private readonly updateServiceUseCase: UpdateServiceUseCase,

    @Inject(TOKENS.DELETE_SERVICE_USE_CASE)
    private readonly deleteServiceUseCase: DeleteServiceUseCase,

    @Inject(TOKENS.LIST_SERVICES_USE_CASE)
    private readonly listServicesUseCase: ListServicesUseCase,
  ) {}

  @Post('list')
  @ApiOperation({
    summary: '🔍 Search services with advanced filters',
    description: 'Recherche avancée paginée des services avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Services found successfully',
    type: ListServicesResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async list(
    @Body() dto: ListServicesDto,
    @GetUser() user: User,
  ): Promise<ListServicesResponseDto> {
    const request = {
      requestingUserId: user.getId(),
      businessId: dto.businessId || 'default-business-id', // TODO: Récupérer depuis contexte utilisateur
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
        isActive: dto.isActive,
        categoryId: (dto as any).categoryId,
        businessId: dto.businessId,
        pricingType: (dto as any).pricingType,
        allowOnlineBooking: (dto as any).allowOnlineBooking,
      },
    };

    const response = await this.listServicesUseCase.execute(request);

    return response as unknown as ListServicesResponseDto;
  }

  @Get(':id')
  @ApiOperation({
    summary: '📄 Get service by ID',
    description: 'Récupère un service par son ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Service found successfully',
    type: ServiceDto,
  })
  async findById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<ServiceDto> {
    const request = {
      serviceId: id,
      requestingUserId: user.getId(),
    };

    const response = await this.getServiceUseCase.execute(request);

    return response as unknown as ServiceDto;
  }

  @Post()
  @ApiOperation({
    summary: '➕ Create new service',
    description: 'Créer un nouveau service',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Service created successfully',
    type: CreateServiceResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateServiceDto,
    @GetUser() user: User,
  ): Promise<CreateServiceResponseDto> {
    const request = {
      requestingUserId: user.getId(),
      businessId: dto.businessId,
      name: dto.name,
      description: dto.description,
      serviceTypeIds: dto.serviceTypeIds, // Utilisation de serviceTypeIds depuis DTO
      duration: dto.duration,
      price: dto.price || {
        amount: Number(dto.pricingConfig?.basePrice?.amount || 0),
        currency: dto.pricingConfig?.basePrice?.currency || 'EUR',
      },
      settings: {
        isOnlineBookingEnabled: (dto as any).allowOnlineBooking ?? false,
        requiresApproval: dto.settings?.requiresApproval,
        maxAdvanceBookingDays: dto.settings?.maxAdvanceBookingDays,
        minAdvanceBookingHours: dto.settings?.minAdvanceBookingHours,
        bufferTimeBefore: dto.settings?.bufferTimeBefore,
        bufferTimeAfter: dto.settings?.bufferTimeAfter,
        isGroupBookingAllowed: dto.settings?.isGroupBookingAllowed,
        maxGroupSize: dto.settings?.maxGroupSize,
      },
      requirements: dto.requirements,
      isActive: dto.isActive ?? true,
    };

    const response = await this.createServiceUseCase.execute(request);

    return response as unknown as CreateServiceResponseDto;
  }

  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update service',
    description: 'Mettre à jour un service',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Service updated successfully',
    type: UpdateServiceResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @GetUser() user: User,
  ): Promise<UpdateServiceResponseDto> {
    const request = {
      serviceId: id,
      requestingUserId: user.getId(),
      updates: {
        name: dto.name,
        description: dto.description,
        pricing: dto.pricingConfig
          ? {
              basePrice: dto.pricingConfig.basePrice?.amount,
              currency: dto.pricingConfig.basePrice?.currency,
            }
          : undefined,
        scheduling: dto.duration
          ? {
              duration: dto.duration,
            }
          : undefined,
        isActive: dto.isActive,
        settings: {
          isOnlineBookingEnabled: (dto as any).allowOnlineBooking,
          requiresApproval: dto.settings?.requiresApproval,
          maxAdvanceBookingDays: dto.settings?.maxAdvanceBookingDays,
          minAdvanceBookingHours: dto.settings?.minAdvanceBookingHours,
          bufferTimeBefore: dto.settings?.bufferTimeBefore,
          bufferTimeAfter: dto.settings?.bufferTimeAfter,
          isGroupBookingAllowed: dto.settings?.isGroupBookingAllowed,
          maxGroupSize: dto.settings?.maxGroupSize,
        },
        requirements: dto.requirements,
      } as any, // Casting temporaire pour compatibilité
    };

    const response = await this.updateServiceUseCase.execute(request);

    return response as unknown as UpdateServiceResponseDto;
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete service',
    description: 'Supprimer un service',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Service deleted successfully',
    type: DeleteServiceResponseDto,
  })
  async delete(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<DeleteServiceResponseDto> {
    const request = {
      serviceId: id,
      requestingUserId: user.getId(),
    };

    const response = await this.deleteServiceUseCase.execute(request);

    return response as unknown as DeleteServiceResponseDto;
  }
}
