/**
 * 🧪 RESCHEDULE APPOINTMENT USE CASE - UNIT TESTS
 * ✅ Tests unitaires pour la reprogrammation de rendez-vous
 * ✅ Clean Architecture - Application Layer Testing
 */

import { RescheduleAppointmentUseCase } from '../../../../../application/use-cases/appointments/reschedule-appointment.use-case';
import { AppointmentRepository } from '../../../../../domain/repositories/appointment.repository.interface';

// ===== MOCK REPOSITORY =====

const createMockAppointmentRepository =
  (): jest.Mocked<AppointmentRepository> => ({
    findById: jest.fn(),
    findByBusinessId: jest.fn(),
    findByCalendarId: jest.fn(),
    findByServiceId: jest.fn(),
    findByClientEmail: jest.fn(),
    findByStaffId: jest.fn(),
    findByStatus: jest.fn(),
    search: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    findConflictingAppointments: jest.fn(),
    findAvailableSlots: jest.fn(),
    getStatistics: jest.fn(),
    getUpcomingAppointments: jest.fn(),
    getOverdueAppointments: jest.fn(),
    findRecurringAppointments: jest.fn(),
    getAppointmentsForReminders: jest.fn(),
    bulkUpdateStatus: jest.fn(),
    bulkCancel: jest.fn(),
    getClientHistory: jest.fn(),
    findAppointmentsNeedingFollowUp: jest.fn(),
    getCalendarUtilization: jest.fn(),
    count: jest.fn(),
    export: jest.fn(),
  });

// ===== TESTS =====

describe('RescheduleAppointmentUseCase', () => {
  let useCase: RescheduleAppointmentUseCase;
  let mockRepository: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    mockRepository = createMockAppointmentRepository();
    useCase = new RescheduleAppointmentUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should validate past time correctly', async () => {
      // ✅ TEST - Validation des dates passées
      const pastRequest = {
        appointmentId: 'appointment-id-123',
        requestingUserId: 'user-id-456',
        newStartTime: new Date('2020-01-01T10:00:00Z'), // Date passée
        newEndTime: new Date('2020-01-01T11:00:00Z'),
        reason: 'Client requested change',
      };

      expect(() => useCase.execute(pastRequest)).rejects.toThrow(
        'Cannot reschedule appointment to a past time',
      );
    });

    // TODO: Tests à implémenter une fois la logique métier complète
    //
    // it('should reschedule appointment successfully', async () => {
    //   // Given
    //   const appointment = createMockAppointment();
    //   mockRepository.findById.mockResolvedValue(appointment);
    //   mockRepository.save.mockResolvedValue();
    //
    //   // When
    //   const result = await useCase.execute(validRequest);
    //
    //   // Then
    //   expect(result.appointment).toBe(appointment);
    //   expect(result.message).toBe('Appointment rescheduled successfully');
    //   expect(mockRepository.save).toHaveBeenCalledWith(appointment);
    // });
    //
    // it('should throw AppointmentNotFoundError when appointment does not exist', async () => {
    //   // Given
    //   mockRepository.findById.mockResolvedValue(null);
    //
    //   // When & Then
    //   await expect(useCase.execute(validRequest))
    //     .rejects
    //     .toThrow(AppointmentNotFoundError);
    // });
    //
    // it('should validate permissions before rescheduling', async () => {
    //   // TODO: Test des permissions une fois implémentées
    // });
  });
});
