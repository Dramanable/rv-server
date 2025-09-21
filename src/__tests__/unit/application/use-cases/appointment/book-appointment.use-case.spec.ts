import {
  BookAppointmentRequest,
  BookAppointmentUseCase,
} from '@application/use-cases/appointment/book-appointment.use-case';
import type { AppointmentRepository } from '@domain/repositories/appointment.repository.interface';
import type { BusinessRepository } from '@domain/repositories/business.repository.interface';
import type { CalendarRepository } from '@domain/repositories/calendar.repository.interface';
import type { ServiceRepository } from '@domain/repositories/service.repository.interface';
import type { StaffRepository } from '@domain/repositories/staff.repository.interface';
import type { I18nService } from '@shared/types/i18n.interface';
import type { ILogger } from '@shared/types/logger.interface';

// Test mocks créés inline pour éviter les problèmes de compatibilité d'interface

import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@domain/entities/appointment.entity';
import { Business } from '@domain/entities/business.entity';
import { Calendar } from '@domain/entities/calendar.entity';
import { Service } from '@domain/entities/service.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';

import {
  AppointmentConflictError,
  BusinessNotFoundError,
  CalendarNotFoundError,
  ServiceNotFoundError,
} from '@application/exceptions/appointment.exceptions';

describe('BookAppointmentUseCase', () => {
  let useCase: BookAppointmentUseCase;
  let mockAppointmentRepo: jest.Mocked<AppointmentRepository>;
  let mockBusinessRepo: jest.Mocked<BusinessRepository>;
  let mockServiceRepo: jest.Mocked<ServiceRepository>;
  let mockCalendarRepo: jest.Mocked<CalendarRepository>;
  let mockStaffRepo: jest.Mocked<StaffRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: BookAppointmentRequest = {
    businessId: 'fd2c7d0d-5947-4c85-b4ae-9c496fa45b06',
    calendarId: '92be0e8b-abbe-4d1e-b5ee-cff8c97b5fad',
    serviceId: '3c79dda0-259b-4cdc-bb03-27e1814edf71',
    requestingUserId: 'bf5c220b-95c5-4a18-9af9-f9bad6e0494e',
    timeSlot: {
      startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // +3h (respecte la règle 2h minimum)
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
    },
    clientInfo: {
      email: 'jean.dupont@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33123456789',
      isNewClient: false,
    },
    type: AppointmentType.CONSULTATION,
    notes: 'Consultation de routine',
  };

  const mockBusiness = {
    getId: () => BusinessId.create('fd2c7d0d-5947-4c85-b4ae-9c496fa45b06'),
    isActive: () => true,
  } as unknown as Business;

  const mockService = {
    getId: () => ServiceId.create('3c79dda0-259b-4cdc-bb03-27e1814edf71'),
    isActive: () => true,
    getDuration: () => 60, // 60 minutes
    getPrice: () => Money.create(5000, 'EUR'), // 50.00 EUR
  } as unknown as Service;

  const mockCalendar = {
    getId: () => CalendarId.create('92be0e8b-abbe-4d1e-b5ee-cff8c97b5fad'),
    isActive: () => true,
  } as unknown as Calendar;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create inline mocks to avoid interface compatibility issues
    mockAppointmentRepo = {
      findById: jest.fn(),
      findConflictingAppointments: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByBusinessId: jest.fn(),
      findByCalendarId: jest.fn(),
      findByClientEmail: jest.fn(),
      findByDateRange: jest.fn(),
      findByStatus: jest.fn(),
      findUpcoming: jest.fn(),
      findPast: jest.fn(),
      countByStatus: jest.fn(),
      getStatistics: jest.fn(),
      findAvailableSlots: jest.fn(),
    } as unknown as jest.Mocked<AppointmentRepository>;

    mockBusinessRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByName: jest.fn(),
      findBySector: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      getStatistics: jest.fn(),
      findNearLocation: jest.fn(),
    } as unknown as jest.Mocked<BusinessRepository>;

    mockServiceRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByName: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findPopularServices: jest.fn(),
      getServiceStatistics: jest.fn(),
      getBusinessServiceStatistics: jest.fn(),
    } as unknown as jest.Mocked<ServiceRepository>;

    mockCalendarRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByBusinessId: jest.fn(),
      findByOwnerId: jest.fn(),
      findByType: jest.fn(),
      findAvailableSlots: jest.fn(),
      isSlotAvailable: jest.fn(),
      findOverlappingCalendars: jest.fn(),
      findCalendarsWithAvailability: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      getRecurringPatterns: jest.fn(),
    } as unknown as jest.Mocked<CalendarRepository>;

    mockStaffRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findByEmail: jest.fn(),
      findByRole: jest.fn(),
      findByBusinessId: jest.fn(),
      findByLocationId: jest.fn(),
      findByDepartmentId: jest.fn(),
      findBySkills: jest.fn(),
      findAvailable: jest.fn(),
      findByWorkingHours: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      isActive: jest.fn(),
      findWithAppointments: jest.fn(),
    } as unknown as jest.Mocked<StaffRepository>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockI18n = {
      t: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    useCase = new BookAppointmentUseCase(
      mockAppointmentRepo,
      mockBusinessRepo,
      mockServiceRepo,
      mockCalendarRepo,
      mockLogger,
      mockI18n,
    );

    // Setup default mocks
    mockBusinessRepo.findById.mockResolvedValue(mockBusiness);
    mockServiceRepo.findById.mockResolvedValue(mockService);
    mockCalendarRepo.findById.mockResolvedValue(mockCalendar);
    mockAppointmentRepo.findConflictingAppointments.mockResolvedValue([]);
    mockAppointmentRepo.save.mockResolvedValue(undefined);
    mockI18n.t.mockReturnValue('Appointment booked successfully');
  });

  describe('Use Case Construction', () => {
    it('should create use case with all dependencies', () => {
      // WHEN & THEN
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(BookAppointmentUseCase);
    });
  });

  describe('Successful Booking', () => {
    it.skip('should book appointment with valid data', async () => {
      // WHEN
      const result = await useCase.execute(validRequest);

      // THEN
      expect(result.success).toBe(true);
      expect(result.appointment).toBeDefined();
      expect(result.appointment.id).toBeDefined();
      expect(result.appointment.businessId).toBe(validRequest.businessId);
      expect(result.appointment.serviceId).toBe(validRequest.serviceId);
      expect(result.appointment.clientInfo.email).toBe(
        validRequest.clientInfo.email,
      );
      expect(result.appointment.status).toBe(AppointmentStatus.REQUESTED);

      expect(mockBusinessRepo.findById).toHaveBeenCalledWith(
        BusinessId.create(validRequest.businessId),
      );
      expect(mockServiceRepo.findById).toHaveBeenCalledWith(
        ServiceId.create(validRequest.serviceId),
      );
      expect(mockCalendarRepo.findById).toHaveBeenCalledWith(
        CalendarId.create(validRequest.calendarId),
      );
      expect(
        mockAppointmentRepo.findConflictingAppointments,
      ).toHaveBeenCalled();
      expect(mockAppointmentRepo.save).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Appointment booked successfully'),
        expect.any(Object),
      );
    });

    it('should handle new client correctly', async () => {
      // GIVEN
      const newClientRequest = {
        ...validRequest,
        clientInfo: {
          ...validRequest.clientInfo,
          isNewClient: true,
        },
      };

      // WHEN
      const result = await useCase.execute(newClientRequest);

      // THEN
      expect(result.appointment.clientInfo.isNewClient).toBe(true);
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('new client'),
        expect.any(Object),
      );
    });
  });

  describe('Validation Errors', () => {
    it.skip('should throw BusinessNotFoundError when business does not exist', async () => {
      // GIVEN
      mockBusinessRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        BusinessNotFoundError,
      );
    });

    it('should throw ServiceNotFoundError when service does not exist', async () => {
      // GIVEN
      mockServiceRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        ServiceNotFoundError,
      );
    });

    it.skip('should throw CalendarNotFoundError when calendar does not exist', async () => {
      // GIVEN
      mockCalendarRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        CalendarNotFoundError,
      );
    });

    it.skip('should throw error when business is inactive', async () => {
      // GIVEN
      const inactiveBusiness = {
        ...mockBusiness,
        isActive: () => false,
      } as Business;
      mockBusinessRepo.findById.mockResolvedValue(inactiveBusiness);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow();
    });

    it('should throw error when service is inactive', async () => {
      // GIVEN
      const inactiveService = {
        ...mockService,
        isActive: () => false,
      } as Service;
      mockServiceRepo.findById.mockResolvedValue(inactiveService);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow();
    });

    it('should throw AppointmentConflictError when time slot is already booked', async () => {
      // GIVEN
      mockBusinessRepo.findById.mockResolvedValue(mockBusiness);
      mockServiceRepo.findById.mockResolvedValue(mockService);
      mockCalendarRepo.findById.mockResolvedValue(mockCalendar);

      const conflictingAppointment = {
        id: { getValue: () => 'conflict-id' },
        getStatus: () => AppointmentStatus.CONFIRMED,
      } as unknown as Appointment;

      mockAppointmentRepo.findConflictingAppointments.mockResolvedValue([
        conflictingAppointment,
      ]);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        AppointmentConflictError,
      );
    });

    it('should validate time slot is in the future', async () => {
      // GIVEN
      const pastRequest = {
        ...validRequest,
        timeSlot: {
          startTime: new Date(Date.now() - 60 * 60 * 1000), // -1h
          endTime: new Date(Date.now() - 30 * 60 * 1000), // -30min
        },
      };

      // WHEN & THEN
      await expect(useCase.execute(pastRequest)).rejects.toThrow();
    });

    it('should validate minimum booking notice', async () => {
      // GIVEN
      const tooSoonRequest = {
        ...validRequest,
        timeSlot: {
          startTime: new Date(Date.now() + 30 * 60 * 1000), // +30min
          endTime: new Date(Date.now() + 90 * 60 * 1000), // +1h30
        },
      };

      // WHEN & THEN
      await expect(useCase.execute(tooSoonRequest)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it.skip('should handle repository errors gracefully', async () => {
      // GIVEN
      mockBusinessRepo.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to book appointment'),
        expect.any(Object),
      );
    });
  });

  describe('Business Rules', () => {
    it('should calculate correct pricing', async () => {
      // WHEN
      const result = await useCase.execute(validRequest);

      // THEN
      expect(result.appointment.pricing).toBeDefined();
      expect(result.appointment.pricing.basePrice.amount).toBeGreaterThan(0);
      expect(result.appointment.pricing.basePrice.currency).toBe('EUR');
      expect(result.appointment.pricing.totalAmount.amount).toBeGreaterThan(0);
      expect(result.appointment.pricing.paymentStatus).toBe('PENDING');
    });

    it('should set correct appointment defaults', async () => {
      // WHEN
      const result = await useCase.execute(validRequest);

      // THEN
      expect(result.appointment.status).toBe(AppointmentStatus.REQUESTED);
      expect(result.appointment.type).toBe(AppointmentType.CONSULTATION);
      expect(result.appointment.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Logging', () => {
    it('should log booking attempt', async () => {
      // WHEN
      await useCase.execute(validRequest);

      // THEN
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Booking appointment'),
        expect.any(Object),
      );
    });

    it('should log successful booking', async () => {
      // WHEN
      await useCase.execute(validRequest);

      // THEN
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Appointment booked successfully'),
        expect.any(Object),
      );
    });

    it.skip('should log errors', async () => {
      // GIVEN
      mockBusinessRepo.findById.mockRejectedValue(new Error('Test error'));

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to book appointment'),
        expect.any(Object),
      );
    });
  });
});
