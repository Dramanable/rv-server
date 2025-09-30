/**
 * 🌐 SERVICES CONTROLLER - Presentation Layer
 *
 * Contrôleur REST pour la gestion des Services
 * Respecte les principes Clean Architecture
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { CreateServiceUseCase } from '../../application/use-cases/services/create-service.use-case';
import { GetServiceUseCase } from '../../application/use-cases/services/get-service.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/services/update-service.use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/service/delete-service.use-case';
import { ListServicesUseCase } from '../../application/use-cases/service/list-services.use-case';

// DTOs
export class CreateServiceDto {
  businessId!: string;
  name!: string;
  description?: string;
  serviceTypeIds!: string[];
  basePrice?: number;
  currency?: string;
  duration!: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
}

export class UpdateServiceDto {
  businessId!: string;
  name?: string;
  description?: string;
  serviceTypeIds?: string[];
  basePrice?: number;
  currency?: string;
  duration?: number;
  allowOnlineBooking?: boolean;
  requiresApproval?: boolean;
}

export class ListServicesQueryDto {
  businessId!: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  name?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  allowOnlineBooking?: boolean;
}

// Response DTOs
export class ServiceResponseDto {
  id!: string;
  businessId!: string;
  name!: string;
  description!: string;
  serviceTypeIds!: string[];
  pricing!: {
    basePrice?: {
      amount: number;
      currency: string;
    } | null;
  };
  scheduling!: {
    duration: number;
    allowOnlineBooking: boolean;
    requiresApproval: boolean;
  };
  assignedStaffIds!: string[];
  status!: string;
  imageUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ListServicesResponseDto {
  data!: ServiceResponseDto[];
  meta!: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class DeleteServiceResponseDto {
  success!: boolean;
  serviceId!: string;
}

@ApiTags('Services')
@Controller('services')
@ApiBearerAuth()
export class ServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
    private readonly listServicesUseCase: ListServicesUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async createService(
    @Body(ValidationPipe) createServiceDto: CreateServiceDto,
    @Request() req: any,
  ): Promise<ServiceResponseDto> {
    const result = await this.createServiceUseCase.execute({
      requestingUserId: req.user.id,
      businessId: createServiceDto.businessId,
      name: createServiceDto.name,
      description: createServiceDto.description || '',
      serviceTypeIds: createServiceDto.serviceTypeIds,
      basePrice: createServiceDto.basePrice || 0,
      currency: createServiceDto.currency || 'EUR',
      duration: createServiceDto.duration,
      allowOnlineBooking: createServiceDto.allowOnlineBooking,
      requiresApproval: createServiceDto.requiresApproval,
    });

    return this.mapServiceToResponse(result.service);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiQuery({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service retrieved successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async getService(
    @Param('id') serviceId: string,
    @Query('businessId') businessId: string,
    @Request() req: any,
  ): Promise<ServiceResponseDto> {
    const result = await this.getServiceUseCase.execute({
      requestingUserId: req.user.id,
      serviceId: serviceId,
      businessId: businessId,
    });

    return this.mapServiceToResponse(result.service);
  }

  @Get()
  @ApiOperation({ summary: 'List services with filters and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services retrieved successfully',
    type: ListServicesResponseDto,
  })
  async listServices(
    @Query() query: ListServicesQueryDto,
    @Request() req: any,
  ): Promise<ListServicesResponseDto> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);

    const result = await this.listServicesUseCase.execute({
      requestingUserId: req.user.id,
      businessId: query.businessId,
      pagination: {
        page,
        limit,
      },
      sorting: {
        sortBy: query.sortBy || 'name',
        sortOrder: query.sortOrder || 'asc',
      },
      filters: {
        name: query.name,
        isActive: query.isActive,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        duration: query.duration,
        allowOnlineBooking: query.allowOnlineBooking,
      },
    });

    return result as ListServicesResponseDto;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async updateService(
    @Param('id') serviceId: string,
    @Body(ValidationPipe) updateServiceDto: UpdateServiceDto,
    @Request() req: any,
  ): Promise<ServiceResponseDto> {
    const result = await this.updateServiceUseCase.execute({
      requestingUserId: req.user.id,
      serviceId: serviceId,
      businessId: updateServiceDto.businessId,
      name: updateServiceDto.name,
      description: updateServiceDto.description,
      serviceTypeIds: updateServiceDto.serviceTypeIds,
      basePrice: updateServiceDto.basePrice,
      currency: updateServiceDto.currency,
      duration: updateServiceDto.duration,
      allowOnlineBooking: updateServiceDto.allowOnlineBooking,
      requiresApproval: updateServiceDto.requiresApproval,
    });

    return this.mapServiceToResponse(result.service);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiQuery({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service deleted successfully',
    type: DeleteServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async deleteService(
    @Param('id') serviceId: string,
    @Query('businessId') businessId: string,
    @Request() req: any,
  ): Promise<DeleteServiceResponseDto> {
    const result = await this.deleteServiceUseCase.execute({
      requestingUserId: req.user.id,
      serviceId: serviceId,
    });

    return {
      success: result.success,
      serviceId: result.serviceId,
    };
  }

  /**
   * Mapper les entités Service vers DTO de réponse
   */
  private mapServiceToResponse(service: any): ServiceResponseDto {
    return {
      id: service.id.getValue(),
      businessId: service.businessId.getValue(),
      name: service.name,
      description: service.description,
      serviceTypeIds: service
        .getServiceTypeIds()
        .map((id: any) => id.getValue()),
      pricing: {
        basePrice: service.getBasePrice()
          ? {
              amount: service.getBasePrice().getAmount(),
              currency: service.getBasePrice().getCurrency(),
            }
          : null,
      },
      scheduling: {
        duration: service.scheduling.duration,
        allowOnlineBooking: service.scheduling.allowOnlineBooking,
        requiresApproval: service.scheduling.requiresApproval,
      },
      assignedStaffIds: service.assignedStaffIds.map((id: any) =>
        id.getValue(),
      ),
      status: service.status,
      imageUrl: service.imageUrl?.getUrl(),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
