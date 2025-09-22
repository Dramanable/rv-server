import {
  BookAppointmentRequest,
  BookAppointmentUseCase,
} from '@application/use-cases/appointments/book-appointment.use-case';
import type { AppointmentRepository } from '@domain/repositories/appointment.repository.interface';
import type { BusinessRepository } from '@domain/repositories/business.repository.interface';
import type { CalendarRepository } from '@domain/repositories/calendar.repository.interface';
import type { ServiceRepository } from '@domain/repositories/service.repository.interface';
import type { StaffRepository } from '@domain/repositories/staff.repository.interface';
import type { I18nService } from '@application/ports/i18n.port';
import type { Logger } from '@application/ports/logger.port';

// Test mocks créés inline pour éviter les problèmes de compatibilité d'interface

import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '@domain/entities/appointment.entity';
import { Business } from '@domain/entities/business.entity';
import { Calendar } from '@domain/entities/calendar.entity';
import { Service } from '@domain/entities/service.entity';
import { Staff } from '@domain/entities/staff.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarId } from '@domain/value-objects/calendar-id.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { ServiceId } from '@domain/value-objects/service-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';

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
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: BookAppointmentRequest = {
    businessId: 'fd2c7d0d-5947-4c85-b4ae-9c496fa45b06',
    calendarId: '92be0e8b-abbe-4d1e-b5ee-cff8c97b5fad',
    serviceId: '3c79dda0-259b-4cdc-bb03-27e1814edf71',
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // +3h (respecte la règle 2h minimum)
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
    clientInfo: {
      email: 'jean.dupont@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33123456789',
      isNewClient: false,
    },
    type: AppointmentType.CONSULTATION,
    source: 'ONLINE',
  };

  const mockBusiness = {
    getId: () => BusinessId.create('fd2c7d0d-5947-4c85-b4ae-9c496fa45b06'),
    getName: () => 'Test Business',
    getAddress: () => ({ toString: () => 'Test Address, 75001 Paris' }),
    isActive: () => true,
  } as unknown as Business;

  const mockService = {
    getId: () => ServiceId.create('3c79dda0-259b-4cdc-bb03-27e1814edf71'),
    getName: () => 'Test Service',
    isActive: () => true,
    isBookable: () => true, // ✅ Service autorise la prise de rendez-vous en ligne
    getDuration: () => 60, // 60 minutes
    getPrice: () => Money.create(5000, 'EUR'), // 50.00 EUR
    getBasePrice: () => Money.create(5000, 'EUR'), // 50.00 EUR - ajouté pour le use case
  } as unknown as Service;

  const mockCalendar = {
    getId: () => CalendarId.create('92be0e8b-abbe-4d1e-b5ee-cff8c97b5fad'),
    isActive: () => true,
  } as unknown as Calendar;

  const mockStaff = {
    getId: () => UserId.create('staff-123'),
    getProfile: () => ({
      firstName: 'Dr Jean',
      lastName: 'Martin',
    }),
    isActive: () => true,
  } as unknown as Staff;

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
      findById: jest.fn().mockResolvedValue(null), // Par défaut pas de staff
      save: jest.fn(),
      findByBusinessId: jest.fn(),
      findByRole: jest.fn(),
      findBySpecialty: jest.fn(),
      findAvailableStaff: jest.fn(),
      findByName: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      getStaffStatistics: jest.fn(),
      findActiveStaff: jest.fn(),
    } as unknown as jest.Mocked<StaffRepository>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockI18n = {
      translate: jest.fn(),
      t: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    useCase = new BookAppointmentUseCase(
      mockAppointmentRepo,
      mockServiceRepo,
      mockCalendarRepo,
      mockStaffRepo,
      mockBusinessRepo,
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
    mockI18n.translate.mockReturnValue('Test translated message');
  });

  describe('Use Case Construction', () => {
    it('should create use case with all dependencies', () => {
      // WHEN & THEN
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(BookAppointmentUseCase);
    });
  });

  describe('Successful Booking', () => {
    it('should book appointment with valid data', async () => {
      // GIVEN - Setup proper request with all required fields
      const completeRequest = {
        ...validRequest,
        source: 'ONLINE' as const,
        language: 'fr',
      };

      // WHEN
      const result = await useCase.execute(completeRequest);

      // THEN
      expect(result.success).toBe(true);
      expect(result.appointmentId).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.clientInfo).toBeDefined();
      expect(result.clientInfo.fullName).toBe('Jean Dupont');

      expect(mockBusinessRepo.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          value: completeRequest.businessId,
        }),
      );
      expect(mockServiceRepo.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          value: completeRequest.serviceId,
        }),
      );
      expect(mockCalendarRepo.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          value: completeRequest.calendarId,
        }),
      );
      expect(
        mockAppointmentRepo.findConflictingAppointments,
      ).toHaveBeenCalled();
      expect(mockAppointmentRepo.save).toHaveBeenCalled();
    });

    it('should handle new client correctly', async () => {
      // GIVEN
      const newClientRequest = {
        ...validRequest,
        source: 'ONLINE' as const,
        language: 'fr',
        clientInfo: {
          ...validRequest.clientInfo,
          isNewClient: true,
        },
      };

      // WHEN
      const result = await useCase.execute(newClientRequest);

      // THEN
      expect(result.success).toBe(true);
      expect(result.clientInfo.fullName).toBe('Jean Dupont');
    });
  });

  describe('Validation Errors', () => {
    it('should throw BusinessNotFoundError when business does not exist', async () => {
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

    it('should throw CalendarNotFoundError when calendar does not exist', async () => {
      // GIVEN
      mockCalendarRepo.findById.mockResolvedValue(null);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        CalendarNotFoundError,
      );
    });

    it('should throw error when business is inactive', async () => {
      // GIVEN - Business inactif
      const inactiveBusiness = {
        ...mockBusiness,
        isActive: () => false, // ✅ Business inactif
      } as unknown as Business;

      mockBusinessRepo.findById.mockResolvedValue(inactiveBusiness);
      mockServiceRepo.findById.mockResolvedValue(mockService);
      mockCalendarRepo.findById.mockResolvedValue(mockCalendar);
      mockAppointmentRepo.findConflictingAppointments.mockResolvedValue([]);

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

    it('should throw error when service does not allow online booking', async () => {
      // GIVEN
      const nonBookableService = {
        ...mockService,
        isActive: () => true,
        isBookable: () => false, // ❌ Service n'autorise pas la prise de rendez-vous en ligne
      } as Service;
      mockServiceRepo.findById.mockResolvedValue(nonBookableService);

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Service 3c79dda0-259b-4cdc-bb03-27e1814edf71 does not allow online booking',
      );
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
        startTime: new Date(Date.now() - 60 * 60 * 1000), // -1h
        endTime: new Date(Date.now() - 30 * 60 * 1000), // -30min
      };

      // WHEN & THEN
      await expect(useCase.execute(pastRequest)).rejects.toThrow();
    });

    it('should validate minimum booking notice', async () => {
      // GIVEN
      const tooSoonRequest = {
        ...validRequest,
        startTime: new Date(Date.now() + 30 * 60 * 1000), // +30min (< 2h de préavis)
        endTime: new Date(Date.now() + 90 * 60 * 1000), // +1h30
      };

      // WHEN & THEN
      await expect(useCase.execute(tooSoonRequest)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // GIVEN
      mockBusinessRepo.findById.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String), // Message traduit
        expect.anything(), // Peut être Error ou Object
        expect.any(Object), // Contexte supplémentaire
      );
    });
  });

  describe('Business Rules', () => {
    it('should calculate correct pricing', async () => {
      // WHEN
      const result = await useCase.execute(validRequest);

      // THEN
      expect(result.appointmentDetails.price).toBeGreaterThan(0);
      expect(result.appointmentDetails.currency).toBe('EUR');
    });

    it('should set correct appointment defaults', async () => {
      // WHEN
      const result = await useCase.execute(validRequest);

      // THEN
      expect(result.status).toBe('REQUESTED');
      expect(result.appointmentDetails.startTime).toBeInstanceOf(Date);
      expect(result.appointmentDetails.endTime).toBeInstanceOf(Date);
    });
  });

  describe('Logging', () => {
    it('should log booking attempt', async () => {
      // WHEN
      await useCase.execute(validRequest);

      // THEN
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String), // Message traduit
        expect.any(Object),
      );
    });

    it('should log successful booking', async () => {
      // WHEN
      await useCase.execute(validRequest);

      // THEN
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String), // Message traduit
        expect.any(Object),
      );
    });

    it('should log errors', async () => {
      // GIVEN
      mockBusinessRepo.findById.mockRejectedValue(new Error('Test error'));

      // WHEN & THEN
      await expect(useCase.execute(validRequest)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String), // Message traduit
        expect.anything(), // Peut être Error ou Object
        expect.any(Object), // Contexte supplémentaire
      );
    });
  });

  // TODO: Ajouter tests pour family member booking après migration interface
});
