/**
 * 🧪 CONFIRM APPOINTMENT USE CASE - UNIT TESTS
 * ✅ Tests unitaires pour la confirmation de rendez-vous
 * ✅ Clean Architecture - Application Layer Testing
 */

import {
  ConfirmAppointmentRequest,
  ConfirmAppointmentUseCase,
} from '../../../../../application/use-cases/appointments/confirm-appointment.use-case';
import { AppointmentRepository } from '../../../../../domain/repositories/appointment.repository.interface';

// ===== TESTS =====

describe('ConfirmAppointmentUseCase', () => {
  let useCase: ConfirmAppointmentUseCase;
  let mockRepository: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    mockRepository = createMockAppointmentRepository();
    useCase = new ConfirmAppointmentUseCase(mockRepository);
  });

  describe('execute', () => {
    const validRequest: ConfirmAppointmentRequest = {
      appointmentId: '7a0c5a6f-786d-4b7a-bb67-4fb939680030',
      requestingUserId: 'ec94a1d8-a954-4cfb-b2e6-cbfb5099e4f0',
      confirmationMethod: 'EMAIL' as const,
      notes: 'Client called to confirm',
    };

    it('should throw error when appointment not found', async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        'Appointment with ID 7a0c5a6f-786d-4b7a-bb67-4fb939680030 not found',
      );
    });

    // TODO: Tests à implémenter une fois la logique métier complète
    //
    // it('should confirm appointment successfully', async () => {
    //   // Given
    //   const appointment = createMockAppointment({ status: 'REQUESTED' });
    //   mockRepository.findById.mockResolvedValue(appointment);
    //   mockRepository.save.mockResolvedValue();
    //
    //   // When
    //   const result = await useCase.execute(validRequest);
    //
    //   // Then
    //   expect(result.appointment.getStatus()).toBe('CONFIRMED');
    //   expect(result.confirmationSent).toBe(true);
    //   expect(mockRepository.save).toHaveBeenCalledWith(appointment);
    // });
    //
    // it('should throw error when appointment is not in REQUESTED status', async () => {
    //   // Given
    //   const appointment = createMockAppointment({ status: 'CONFIRMED' });
    //   mockRepository.findById.mockResolvedValue(appointment);
    //
    //   // When & Then
    //   await expect(useCase.execute(validRequest))
    //     .rejects
    //     .toThrow('Cannot confirm appointment not in REQUESTED status');
    // });
  });
});
