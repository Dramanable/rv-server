// ✅ TESTS UNITAIRES COMPLETS - RescheduleAppointmentUseCase
import { RescheduleAppointmentUseCase } from '../../../../../application/use-cases/appointments/reschedule-appointment-v2.use-case';
import { AppointmentRepository } from '../../../../../domain/repositories/appointment.repository.interface';
import { Appointment } from '../../../../../domain/entities/appointment.entity';
import { AppointmentNotFoundError } from '../../../../../application/exceptions/appointment.exceptions';
import { AppointmentId } from '../../../../../domain/value-objects/appointment-id.value-object';

describe('RescheduleAppointmentUseCase', () => {
  let rescheduleAppointmentUseCase: RescheduleAppointmentUseCase;
  let mockAppointmentRepository: jest.Mocked<IAppointmentRepository>;

  beforeEach(() => {
    // ✅ Setup des mocks
    mockAppointmentRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findByClient: jest.fn(),
      findByStaff: jest.fn(),
      findByDateRange: jest.fn(),
      getAvailableSlots: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      countByStaff: jest.fn(),
    };

    rescheduleAppointmentUseCase = new RescheduleAppointmentUseCase(
      mockAppointmentRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should reschedule appointment successfully', async () => {
      // ✅ Given - Données de test valides
      const appointmentId = 'a0b1c2d3-e4f5-4321-8765-0123456789ab';
      const request = {
        appointmentId,
        newDate: '2024-12-30',
        newStartTime: '14:00',
        newEndTime: '15:00',
        reason: 'Client requested reschedule',
        requestingUserId: 'b1c2d3e4-f5a6-4321-8765-0123456789bc',
        correlationId: 'corr-001',
      };

      // ✅ Mock appointment existant
      const mockAppointment = {
        getId: jest.fn().mockReturnValue({
          getValue: jest.fn().mockReturnValue(appointmentId),
        }),
        getDate: jest.fn().mockReturnValue('2024-12-25'),
        getStartTime: jest.fn().mockReturnValue('10:00'),
        getEndTime: jest.fn().mockReturnValue('11:00'),
        getStatus: jest.fn().mockReturnValue('CONFIRMED'),
        reschedule: jest.fn(),
      } as unknown as Appointment;

      // ✅ Mock repository responses
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.save.mockResolvedValue(mockAppointment);

      // ✅ When
      const result = await rescheduleAppointmentUseCase.execute(request);

      // ✅ Then
      expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
      expect(mockAppointment.reschedule).toHaveBeenCalledWith({
        newDate: request.newDate,
        newStartTime: request.newStartTime,
        newEndTime: request.newEndTime,
        reason: request.reason,
      });
      expect(mockAppointmentRepository.save).toHaveBeenCalledWith(
        mockAppointment,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Appointment rescheduled successfully');
    });

    it('should throw error when appointment not found', async () => {
      // ✅ Given
      const request = {
        appointmentId: 'a0b1c2d3-e4f5-4321-8765-0123456789ab',
        newDate: '2024-12-30',
        newStartTime: '14:00',
        newEndTime: '15:00',
        reason: 'Client requested reschedule',
        requestingUserId: 'b1c2d3e4-f5a6-4321-8765-0123456789bc',
        correlationId: 'corr-002',
      };

      // ✅ Mock repository returning null
      mockAppointmentRepository.findById.mockResolvedValue(null);

      // ✅ When/Then
      await expect(
        rescheduleAppointmentUseCase.execute(request),
      ).rejects.toThrow(AppointmentNotFoundError);

      expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
      expect(mockAppointmentRepository.save).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      // ✅ Test validation des champs requis
      const invalidRequest = {
        appointmentId: '', // Invalid
        newDate: '2024-12-30',
        newStartTime: '14:00',
        newEndTime: '15:00',
        reason: 'Client requested reschedule',
        requestingUserId: 'b1c2d3e4-f5a6-4321-8765-0123456789bc',
        correlationId: 'corr-003',
      };

      await expect(
        rescheduleAppointmentUseCase.execute(invalidRequest),
      ).rejects.toThrow();
    });

    it('should validate time logic (end after start)', async () => {
      // ✅ Test validation logique temporelle
      const invalidTimeRequest = {
        appointmentId: 'a0b1c2d3-e4f5-4321-8765-0123456789ab',
        newDate: '2024-12-30',
        newStartTime: '15:00', // After end time
        newEndTime: '14:00', // Before start time
        reason: 'Client requested reschedule',
        requestingUserId: 'b1c2d3e4-f5a6-4321-8765-0123456789bc',
        correlationId: 'corr-004',
      };

      await expect(
        rescheduleAppointmentUseCase.execute(invalidTimeRequest),
      ).rejects.toThrow();
    });
  });
});
