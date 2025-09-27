import { ServiceRepository } from '@domain/repositories/service.repository.interface';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ServiceNotFoundError } from '@domain/exceptions/service.exceptions';
import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { Service } from '@domain/entities/service.entity';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { PricingConfig } from '@domain/value-objects/pricing-config.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

describe('GetServiceUseCase', () => {
  let useCase: GetServiceUseCase;
  let mockServiceRepository: Partial<ServiceRepository>;

  beforeEach(() => {
    mockServiceRepository = {
      findById: jest.fn(),
    };

    useCase = new GetServiceUseCase(mockServiceRepository as ServiceRepository);
  });

  describe('execute', () => {
    const validRequest = {
      serviceId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    };

    it('should throw ServiceNotFoundError when service does not exist', async () => {
      // Arrange
      (mockServiceRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(ServiceNotFoundError);
    });

    it('should throw ApplicationValidationError when request is null', async () => {
      // Act & Assert
      await expect(useCase.execute(null as any)).rejects.toThrow(ApplicationValidationError);
    });

    it('should throw ApplicationValidationError when serviceId is empty', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        serviceId: '',
      };

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(ApplicationValidationError);
    });
  });
});