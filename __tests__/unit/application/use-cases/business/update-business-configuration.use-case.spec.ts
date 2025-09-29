/**
 * 🧪 Tests for Update Business Configuration Use Case
 *
 * Test-Driven Development approach for business configuration update logic
 */

import { UpdateBusinessConfigurationUseCase } from '@application/use-cases/business/update-business-configuration.use-case';
import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { BusinessConfiguration } from '@domain/value-objects/business-configuration.value-object';
import { Business } from '@domain/entities/business.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';

// Test mocks
const mockBusinessRepository = {
  findById: jest.fn(),
  save: jest.fn(),
};

const mockI18nService = {
  translate: jest.fn((key: string) => key),
};

const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
};

describe('UpdateBusinessConfigurationUseCase', () => {
  let useCase: UpdateBusinessConfigurationUseCase;
  let mockBusiness: jest.Mocked<Business>;

  beforeEach(() => {
    useCase = new UpdateBusinessConfigurationUseCase(
      mockBusinessRepository as any,
      mockI18nService as any,
      mockLogger as any,
    );

    // Reset mocks
    jest.clearAllMocks();

    // Mock business with current configuration
    const currentConfig = BusinessConfiguration.createDefault();
    mockBusiness = {
      id: { getValue: () => 'business-123' } as BusinessId,
      configuration: currentConfig,
      updateConfiguration: jest.fn((config) => ({
        ...mockBusiness,
        configuration: config,
      })),
    } as any;

    mockBusinessRepository.findById.mockResolvedValue(mockBusiness);
    mockBusinessRepository.save.mockResolvedValue(mockBusiness);
  });

  describe('Request Validation', () => {
    it('should throw error for missing business ID', async () => {
      const request = {
        businessId: '',
        requestingUserId: 'user-123',
        timezone: 'Europe/London',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw error for missing requesting user ID', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: '',
        timezone: 'Europe/London',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for invalid first day of week', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        firstDayOfWeek: 7, // Invalid
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for empty business week days', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        businessWeekDays: [], // Empty
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Business Retrieval', () => {
    it('should throw error when business not found', async () => {
      mockBusinessRepository.findById.mockResolvedValue(null);

      const request = {
        businessId: 'non-existent',
        requestingUserId: 'user-123',
        timezone: 'Europe/London',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ getValue: expect.any(Function) }),
      );
    });

    it('should retrieve business with correct business ID', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'Europe/London',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await useCase.execute(request);

      expect(mockBusinessRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({ getValue: expect.any(Function) }),
      );
    });
  });

  describe('Configuration Updates', () => {
    it('should update timezone only', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      const result = await useCase.execute(request);

      expect(result.configuration.getTimezone().getValue()).toBe(
        'America/New_York',
      );
      expect(result.configuration.getCurrency().getCode()).toBe('EUR'); // Unchanged
      expect(result.configuration.getLocale()).toBe('fr-FR'); // Unchanged
      expect(mockBusiness.updateConfiguration).toHaveBeenCalled();
      expect(mockBusinessRepository.save).toHaveBeenCalled();
    });

    it('should update currency only', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        currency: 'USD',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      const result = await useCase.execute(request);

      expect(result.configuration.getCurrency().getCode()).toBe('USD');
      expect(result.configuration.getTimezone().getValue()).toBe(
        'Europe/Paris',
      ); // Unchanged
      expect(result.configuration.getLocale()).toBe('fr-FR'); // Unchanged
    });

    it('should update locale only', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        locale: 'en-US',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      const result = await useCase.execute(request);

      expect(result.configuration.getLocale()).toBe('en-US');
      expect(result.configuration.getTimezone().getValue()).toBe(
        'Europe/Paris',
      ); // Unchanged
      expect(result.configuration.getCurrency().getCode()).toBe('EUR'); // Unchanged
    });

    it('should update multiple configuration values', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        currency: 'USD',
        locale: 'en-US',
        firstDayOfWeek: 0, // Sunday
        businessWeekDays: [1, 2, 3, 4, 5], // Mon-Fri
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      const result = await useCase.execute(request);

      expect(result.configuration.getTimezone().getValue()).toBe(
        'America/New_York',
      );
      expect(result.configuration.getCurrency().getCode()).toBe('USD');
      expect(result.configuration.getLocale()).toBe('en-US');
      expect(result.configuration.getFirstDayOfWeek()).toBe(0);
      expect(result.configuration.getBusinessWeekDays()).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    it('should preserve unchanged values', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York', // Only changing timezone
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      const result = await useCase.execute(request);

      // Changed
      expect(result.configuration.getTimezone().getValue()).toBe(
        'America/New_York',
      );

      // Preserved from default
      expect(result.configuration.getCurrency().getCode()).toBe('EUR');
      expect(result.configuration.getLocale()).toBe('fr-FR');
      expect(result.configuration.getFirstDayOfWeek()).toBe(1);
      expect(result.configuration.getBusinessWeekDays()).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log successful configuration update', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        currency: 'USD',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting business configuration update',
        expect.objectContaining({
          businessId: 'business-123',
          requestingUserId: 'user-123',
          correlationId: 'corr-123',
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Business configuration updated successfully',
        expect.objectContaining({
          businessId: 'business-123',
          correlationId: 'corr-123',
          changes: expect.any(Object),
        }),
      );
    });

    it('should log error on failure', async () => {
      mockBusinessRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow('Database error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update business configuration',
        expect.any(Error),
      );
    });

    it('should track configuration changes', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        currency: 'USD',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await useCase.execute(request);

      const logCall = mockLogger.info.mock.calls.find(
        (call) => call[0] === 'Business configuration updated successfully',
      );

      expect(logCall[1].changes).toHaveProperty('timezone');
      expect(logCall[1].changes).toHaveProperty('currency');
      expect(logCall[1].changes.timezone).toEqual({
        from: 'Europe/Paris',
        to: 'America/New_York',
      });
      expect(logCall[1].changes.currency).toEqual({
        from: 'EUR',
        to: 'USD',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid timezone gracefully', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'Invalid/Timezone',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid currency gracefully', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        currency: 'INVALID',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid locale gracefully', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        locale: 'invalid-locale',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      mockBusinessRepository.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should return correct response format', async () => {
      const request = {
        businessId: 'business-123',
        requestingUserId: 'user-123',
        timezone: 'America/New_York',
        correlationId: 'corr-123',
        timestamp: new Date(),
      };

      const result = await useCase.execute(request);

      expect(result).toHaveProperty('configuration');
      expect(result).toHaveProperty('updatedAt');
      expect(result.configuration).toBeInstanceOf(BusinessConfiguration);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
