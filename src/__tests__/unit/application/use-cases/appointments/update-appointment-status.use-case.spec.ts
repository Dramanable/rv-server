/**
 * 🧪 UPDATE APPOINTMENT STATUS USE CASE - UNIT TESTS
 * ✅ Tests unitaires pour la mise à jour de statut de rendez-vous
 * ✅ Clean Architecture - Application Layer Testing
 */

import {
  AppointmentException,
  AppointmentNotFoundError,
} from "../../../../../application/exceptions/appointment.exceptions";
import {
  UpdateAppointmentStatusRequest,
  UpdateAppointmentStatusUseCase,
} from "../../../../../application/use-cases/appointments/update-appointment-status.use-case";
import { AppointmentStatus } from "../../../../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../../../../domain/repositories/appointment.repository.interface";
import { AppointmentId } from "../../../../../domain/value-objects/appointment-id.value-object";

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

// ===== MOCK APPOINTMENT =====

const createMockAppointment = (
  status: AppointmentStatus = AppointmentStatus.REQUESTED,
): any => ({
  getId: jest.fn(() =>
    AppointmentId.create("c4da9818-789c-4c31-b5a5-4119f718b2ed"),
  ),
  getStatus: jest.fn(() => status),
  confirm: jest.fn(() => ({
    getId: jest.fn(() =>
      AppointmentId.create("c4da9818-789c-4c31-b5a5-4119f718b2ed"),
    ),
    getStatus: jest.fn(() => AppointmentStatus.CONFIRMED),
  })),
  cancel: jest.fn(() => ({
    getId: jest.fn(() =>
      AppointmentId.create("c4da9818-789c-4c31-b5a5-4119f718b2ed"),
    ),
    getStatus: jest.fn(() => AppointmentStatus.CANCELLED),
  })),
  complete: jest.fn(() => ({
    getId: jest.fn(() =>
      AppointmentId.create("c4da9818-789c-4c31-b5a5-4119f718b2ed"),
    ),
    getStatus: jest.fn(() => AppointmentStatus.COMPLETED),
  })),
  markNoShow: jest.fn(() => ({
    getId: jest.fn(() =>
      AppointmentId.create("c4da9818-789c-4c31-b5a5-4119f718b2ed"),
    ),
    getStatus: jest.fn(() => AppointmentStatus.NO_SHOW),
  })),
});

// ===== TESTS =====

describe("UpdateAppointmentStatusUseCase", () => {
  let useCase: UpdateAppointmentStatusUseCase;
  let mockAppointmentRepository: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    mockAppointmentRepository = createMockAppointmentRepository();
    useCase = new UpdateAppointmentStatusUseCase(mockAppointmentRepository);
  });

  describe("execute", () => {
    const validRequest: UpdateAppointmentStatusRequest = {
      appointmentId: "23fe658e-ebb5-4b2a-a584-c5a1c922e5f8",
      newStatus: AppointmentStatus.CONFIRMED,
      requestingUserId: "0872911d-3ec9-4f82-b53b-f3eae928c136",
      reason: "Client confirmed attendance",
      notes: "Confirmed via phone call",
      correlationId: "test-correlation-id-123",
    };
    it("should confirm appointment successfully", async () => {
      // Given
      const mockAppointment = createMockAppointment(
        AppointmentStatus.REQUESTED,
      );
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      // When
      const result = await useCase.execute(validRequest);

      // Then
      expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          _value: "23fe658e-ebb5-4b2a-a584-c5a1c922e5f8",
        }),
      );
      expect(mockAppointment.confirm).toHaveBeenCalled();
      expect(mockAppointmentRepository.save).toHaveBeenCalled();
      expect(result.previousStatus).toBe(AppointmentStatus.REQUESTED);
      expect(result.newStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(result.message).toBe("Appointment confirmed successfully");
    });

    it("should cancel appointment successfully", async () => {
      // Given
      const mockAppointment = createMockAppointment(
        AppointmentStatus.REQUESTED,
      );
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      const cancelRequest = {
        ...validRequest,
        newStatus: AppointmentStatus.CANCELLED,
        reason: "Client request",
      };

      // When
      const result = await useCase.execute(cancelRequest);

      // Then
      expect(mockAppointment.cancel).toHaveBeenCalledWith("Client request");
      expect(result.previousStatus).toBe(AppointmentStatus.REQUESTED);
      expect(result.newStatus).toBe(AppointmentStatus.CANCELLED);
    });

    it("should complete appointment successfully", async () => {
      // Given
      const mockAppointment = createMockAppointment(
        AppointmentStatus.CONFIRMED,
      );
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      const completeRequest = {
        ...validRequest,
        newStatus: AppointmentStatus.COMPLETED,
        notes: "Session completed successfully",
      };

      // When
      const result = await useCase.execute(completeRequest);

      // Then
      expect(mockAppointment.complete).toHaveBeenCalledWith(
        "Session completed successfully",
      );
      expect(result.previousStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(result.newStatus).toBe(AppointmentStatus.COMPLETED);
    });

    it("should mark appointment as no-show successfully", async () => {
      // Given
      const mockAppointment = createMockAppointment(
        AppointmentStatus.CONFIRMED,
      );
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      const noShowRequest = {
        ...validRequest,
        newStatus: AppointmentStatus.NO_SHOW,
        reason: "Client did not show up",
      };

      // When
      const result = await useCase.execute(noShowRequest);

      // Then
      expect(mockAppointment.markNoShow).toHaveBeenCalledWith(
        "Client did not show up",
      );
      expect(result.previousStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(result.newStatus).toBe(AppointmentStatus.NO_SHOW);
    });

    it("should throw error when appointment not found", async () => {
      // Given
      mockAppointmentRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        AppointmentNotFoundError,
      );
    });

    it("should throw error for invalid status transition", async () => {
      // Given - Appointment is already COMPLETED (final status)
      const mockAppointment = createMockAppointment(
        AppointmentStatus.COMPLETED,
      );
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      const invalidRequest = {
        ...validRequest,
        newStatus: AppointmentStatus.CONFIRMED, // Cannot go back from COMPLETED
      };

      // When & Then
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        AppointmentException,
      );
    });

    it("should throw error when trying to set same status", async () => {
      // Given
      const mockAppointment = createMockAppointment(
        AppointmentStatus.CONFIRMED,
      );
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      const sameStatusRequest = {
        ...validRequest,
        newStatus: AppointmentStatus.CONFIRMED, // Same as current status
      };

      // When & Then
      await expect(useCase.execute(sameStatusRequest)).rejects.toThrow(
        AppointmentException,
      );
    });

    it("should validate required fields", async () => {
      // When & Then
      await expect(
        useCase.execute({
          appointmentId: "",
          newStatus: AppointmentStatus.CONFIRMED,
          requestingUserId: "test-user-id",
          correlationId: "test-correlation-id",
        }),
      ).rejects.toThrow("Appointment ID is required");

      await expect(
        useCase.execute({
          appointmentId: "test-id",
          newStatus: null as any,
          requestingUserId: "test-user-id",
          correlationId: "test-correlation-id",
        }),
      ).rejects.toThrow("New status is required");

      await expect(
        useCase.execute({
          appointmentId: "test-id",
          newStatus: AppointmentStatus.CONFIRMED,
          requestingUserId: "",
          correlationId: "test-correlation-id",
        }),
      ).rejects.toThrow("Requesting user ID is required");
    });
  });
});
