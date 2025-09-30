/**
 * 🌐 SERVICES CONTROLLER - TDD Tests
 *
 * Tests unitaires pour le contrôleur REST des Services
 * Phase RED → GREEN → REFACTOR
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from '../../../../presentation/controllers/services.controller';
import { CreateServiceUseCase } from '../../../../application/use-cases/services/create-service.use-case';
import { GetServiceUseCase } from '../../../../application/use-cases/services/get-service.use-case';
import { UpdateServiceUseCase } from '../../../../application/use-cases/services/update-service.use-case';
import { DeleteServiceUseCase } from '../../../../application/use-cases/service/delete-service.use-case';
import { ListServicesUseCase } from '../../../../application/use-cases/service/list-services.use-case';
import { Service } from '../../../../domain/entities/service.entity';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '../../../../domain/value-objects/service-type-id.value-object';

describe('ServicesController', () => {
  let controller: ServicesController;
  let mockCreateServiceUseCase: jest.Mocked<CreateServiceUseCase>;
  let mockGetServiceUseCase: jest.Mocked<GetServiceUseCase>;
  let mockUpdateServiceUseCase: jest.Mocked<UpdateServiceUseCase>;
  let mockDeleteServiceUseCase: jest.Mocked<DeleteServiceUseCase>;
  let mockListServicesUseCase: jest.Mocked<ListServicesUseCase>;

  const mockService = Service.create({
    businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: 'Test Service',
    description: 'Test service description',
    serviceTypeIds: [
      ServiceTypeId.fromString('550e8400-e29b-41d4-a716-446655440001'),
    ],
    basePrice: 100,
    currency: 'EUR',
    duration: 60,
    allowOnlineBooking: true,
    requiresApproval: false,
  });

  beforeEach(async () => {
    // Mock Use Cases
    mockCreateServiceUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetServiceUseCase = {
      execute: jest.fn(),
      executeList: jest.fn(),
    } as any;

    mockUpdateServiceUseCase = {
      execute: jest.fn(),
    } as any;

    mockDeleteServiceUseCase = {
      execute: jest.fn(),
    } as any;

    mockListServicesUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: CreateServiceUseCase,
          useValue: mockCreateServiceUseCase,
        },
        {
          provide: GetServiceUseCase,
          useValue: mockGetServiceUseCase,
        },
        {
          provide: UpdateServiceUseCase,
          useValue: mockUpdateServiceUseCase,
        },
        {
          provide: DeleteServiceUseCase,
          useValue: mockDeleteServiceUseCase,
        },
        {
          provide: ListServicesUseCase,
          useValue: mockListServicesUseCase,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  describe('🔴 RED Phase - POST /services', () => {
    it('should create service successfully', async () => {
      // Arrange
      const createServiceDto = {
        businessId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Service',
        description: 'New service description',
        serviceTypeIds: ['550e8400-e29b-41d4-a716-446655440001'],
        basePrice: 100,
        currency: 'EUR',
        duration: 60,
        allowOnlineBooking: true,
        requiresApproval: false,
      };

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      mockCreateServiceUseCase.execute.mockResolvedValue({
        service: mockService,
      });

      // Act
      const result = await controller.createService(
        createServiceDto,
        mockRequest,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockService.id.getValue());
      expect(result.name).toBe(mockService.name);
      expect(mockCreateServiceUseCase.execute).toHaveBeenCalledWith({
        requestingUserId: mockRequest.user.id,
        businessId: createServiceDto.businessId,
        name: createServiceDto.name,
        description: createServiceDto.description,
        serviceTypeIds: createServiceDto.serviceTypeIds,
        basePrice: createServiceDto.basePrice,
        currency: createServiceDto.currency,
        duration: createServiceDto.duration,
        allowOnlineBooking: createServiceDto.allowOnlineBooking,
        requiresApproval: createServiceDto.requiresApproval,
      });
    });

    it('should handle validation errors when creating service', async () => {
      // Arrange
      const invalidDto = {
        businessId: '',
        name: '',
        serviceTypeIds: [],
        duration: -1,
      };

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      // Act & Assert
      await expect(
        controller.createService(invalidDto as any, mockRequest),
      ).rejects.toThrow();
    });
  });

  describe('🔴 RED Phase - GET /services/:id', () => {
    it('should get service by ID successfully', async () => {
      // Arrange
      const serviceId = '550e8400-e29b-41d4-a716-446655440002';
      const businessId = '550e8400-e29b-41d4-a716-446655440000';

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      mockGetServiceUseCase.execute.mockResolvedValue({
        service: mockService,
      });

      // Act
      const result = await controller.getService(
        serviceId,
        businessId,
        mockRequest,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockService.id.getValue());
      expect(mockGetServiceUseCase.execute).toHaveBeenCalledWith({
        requestingUserId: mockRequest.user.id,
        serviceId: serviceId,
        businessId: businessId,
      });
    });

    it('should handle service not found', async () => {
      // Arrange
      const serviceId = '550e8400-e29b-41d4-a716-446655440999';
      const businessId = '550e8400-e29b-41d4-a716-446655440000';

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      mockGetServiceUseCase.execute.mockRejectedValue(
        new Error('Service not found'),
      );

      // Act & Assert
      await expect(
        controller.getService(serviceId, businessId, mockRequest),
      ).rejects.toThrow('Service not found');
    });
  });

  describe('🔴 RED Phase - GET /services', () => {
    it('should list services with pagination', async () => {
      // Arrange
      const query = {
        businessId: '550e8400-e29b-41d4-a716-446655440000',
        page: '1',
        limit: '10',
        sortBy: 'name',
        sortOrder: 'asc' as const,
        name: 'Test',
      };

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      mockListServicesUseCase.execute.mockResolvedValue({
        data: [
          {
            id: mockService.id.getValue(),
            name: mockService.name,
            description: mockService.description,
            businessId: mockService.businessId.getValue(),
            serviceTypeIds: mockService
              .getServiceTypeIds()
              .map((id) => id.getValue()),
            pricing: {
              basePrice: {
                amount: 100,
                currency: 'EUR',
              },
            },
            scheduling: {
              duration: 60,
              allowOnlineBooking: true,
              requiresApproval: false,
            },
            assignedStaffIds: [],
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      // Act
      const result = await controller.listServices(query, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(mockListServicesUseCase.execute).toHaveBeenCalledWith({
        requestingUserId: mockRequest.user.id,
        businessId: query.businessId,
        pagination: {
          page: 1,
          limit: 10,
        },
        sorting: {
          sortBy: 'name',
          sortOrder: 'asc',
        },
        filters: {
          name: 'Test',
        },
      });
    });
  });

  describe('🔴 RED Phase - PUT /services/:id', () => {
    it('should update service successfully', async () => {
      // Arrange
      const serviceId = '550e8400-e29b-41d4-a716-446655440002';
      const updateServiceDto = {
        businessId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Service',
        description: 'Updated description',
        basePrice: 150,
        duration: 90,
      };

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      mockUpdateServiceUseCase.execute.mockResolvedValue({
        service: mockService,
      });

      // Act
      const result = await controller.updateService(
        serviceId,
        updateServiceDto,
        mockRequest,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockService.id.getValue());
      expect(mockUpdateServiceUseCase.execute).toHaveBeenCalledWith({
        requestingUserId: mockRequest.user.id,
        serviceId: serviceId,
        businessId: updateServiceDto.businessId,
        name: updateServiceDto.name,
        description: updateServiceDto.description,
        basePrice: updateServiceDto.basePrice,
        duration: updateServiceDto.duration,
      });
    });
  });

  describe('🔴 RED Phase - DELETE /services/:id', () => {
    it('should delete service successfully', async () => {
      // Arrange
      const serviceId = '550e8400-e29b-41d4-a716-446655440002';
      const businessId = '550e8400-e29b-41d4-a716-446655440000';

      const mockRequest = {
        user: { id: '550e8400-e29b-41d4-a716-446655440099' },
      };

      mockDeleteServiceUseCase.execute.mockResolvedValue({
        success: true,
        serviceId: serviceId,
      });

      // Act
      const result = await controller.deleteService(
        serviceId,
        businessId,
        mockRequest,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.serviceId).toBe(serviceId);
      expect(mockDeleteServiceUseCase.execute).toHaveBeenCalledWith({
        requestingUserId: mockRequest.user.id,
        serviceId: serviceId,
      });
    });
  });
});
