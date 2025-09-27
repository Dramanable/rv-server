/**
 * 🧪 TDD TEST SUITE - SetPractitionerAvailabilityUseCase
 *
 * Simplified TDD Suite focused on core functionality
 * 🔴 RED → 🟢 GREEN → 🔵 REFACTOR
 */

import { I18nService } from "@application/ports/i18n.port";
import { IPermissionService } from "@application/ports/permission.service.interface";
import {
  InvalidAvailabilityDataError,
  PractitionerNotFoundError,
  SetPractitionerAvailabilityUseCase,
} from "@application/use-cases/practitioners/set-practitioner-availability.use-case";
import { AppointmentRepository } from "@domain/repositories/appointment.repository.interface";
import { IRoleAssignmentRepository } from "@domain/repositories/role-assignment.repository.interface";
import { StaffRepository } from "@domain/repositories/staff.repository.interface";
import { Permission } from "@shared/enums/user-role.enum";
import { ILogger } from "@shared/types/logger.interface";

describe("🧪 SetPractitionerAvailabilityUseCase - TDD Suite", () => {
  let useCase: SetPractitionerAvailabilityUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockRoleAssignmentRepository: jest.Mocked<IRoleAssignmentRepository>;
  let mockAppointmentRepository: jest.Mocked<AppointmentRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Test data - VALID UUIDs
  const practitionerId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const businessId = "f47ac10b-58cc-4372-a567-0e02b2c3d481";
  const correlationId = "correlation-abc";

  const baseAvailability = {
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-12-31"),
    availabilities: [
      {
        dayOfWeek: 1, // Monday
        isAvailable: true,
        timeSlots: [
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "14:00", endTime: "17:00" },
        ],
        breakPeriods: [{ startTime: "10:30", endTime: "10:45" }],
      },
    ],
    exceptions: [],
  };

  // Helper to create Staff mock with all required methods
  const createMockStaff = (
    options: {
      id?: string;
      isActive?: boolean;
      isPractitioner?: boolean;
    } = {},
  ) => ({
    getId: () => options.id || practitionerId,
    isActive: () => options.isActive !== false,
    isPractitioner: () => options.isPractitioner !== false,
  });

  beforeEach(() => {
    // Setup mocks with minimal implementation
    mockStaffRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByBusinessId: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockRoleAssignmentRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    } as any;

    mockAppointmentRepository = {
      findByStaffId: jest.fn().mockResolvedValue([]), // Default: no appointments
      save: jest.fn(),
    } as any;

    mockPermissionService = {
      hasPermission: jest.fn(),
      requirePermission: jest.fn(),
      getUserPermissions: jest.fn(),
    } as any;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockI18n = {
      translate: jest.fn((key: string) => `Translated: ${key}`),
    } as any;

    // Create use case instance
    useCase = new SetPractitionerAvailabilityUseCase(
      mockStaffRepository,
      mockAppointmentRepository,
      mockRoleAssignmentRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe("🟢 GREEN Phase - Happy Path Scenarios", () => {
    it("should successfully set practitioner availability", async () => {
      // Given - Valid request for practitioner setting own availability
      const request = {
        practitionerId,
        businessId,
        availability: baseAvailability,
        requestingUserId: practitionerId, // Same user
        correlationId,
      };

      // Mock successful validation flow
      mockStaffRepository.findById.mockResolvedValue(createMockStaff() as any);
      mockPermissionService.requirePermission.mockResolvedValue();

      // When
      const result = await useCase.execute(request);

      // Then - Should succeed with expected response
      expect(result).toEqual({
        success: true,
        practitionerId,
        availableSlots: 2, // 2 time slots from base availability
        conflictsDetected: 0,
        conflictsResolved: 0,
        message: "Availability updated successfully",
        notificationsSent: [], // Empty array initially
      });

      // Verify permission check was called correctly
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        practitionerId,
        Permission.SET_OWN_AVAILABILITY,
        { businessId, correlationId },
      );

      // Verify logging
      expect(mockLogger.log).toHaveBeenCalledWith(
        "Setting practitioner availability",
        expect.objectContaining({
          practitionerId,
          businessId,
          correlationId,
        }),
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        "Practitioner availability set successfully",
        expect.objectContaining({
          practitionerId,
          availableSlots: 2,
          conflictsDetected: 0,
          conflictsResolved: 0,
          correlationId,
        }),
      );
    });
  });

  describe("🔴 RED Phase - Error Scenarios", () => {
    it("should reject when practitioner is not found", async () => {
      // Given - Practitioner does not exist
      const request = {
        practitionerId,
        businessId,
        availability: baseAvailability,
        requestingUserId: practitionerId,
        correlationId,
      };

      mockStaffRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        PractitionerNotFoundError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Practitioner not found",
        expect.objectContaining({
          practitionerId,
          correlationId,
        }),
      );
    });

    it("should reject when practitioner is not active", async () => {
      // Given - Inactive practitioner
      const request = {
        practitionerId,
        businessId,
        availability: baseAvailability,
        requestingUserId: practitionerId,
        correlationId,
      };

      mockStaffRepository.findById.mockResolvedValue(
        createMockStaff({ isActive: false }) as any,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidAvailabilityDataError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Practitioner not active",
        expect.objectContaining({
          practitionerId,
          correlationId,
        }),
      );
    });

    it("should reject when user is not a practitioner", async () => {
      // Given - User is not a practitioner
      const request = {
        practitionerId,
        businessId,
        availability: baseAvailability,
        requestingUserId: practitionerId,
        correlationId,
      };

      mockStaffRepository.findById.mockResolvedValue(
        createMockStaff({ isPractitioner: false }) as any,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidAvailabilityDataError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "User is not a practitioner",
        expect.objectContaining({
          practitionerId,
          correlationId,
        }),
      );
    });

    it("should reject invalid date range", async () => {
      // Given - Invalid date range (end before start)
      const request = {
        practitionerId,
        businessId,
        availability: {
          ...baseAvailability,
          startDate: new Date("2025-12-31"),
          endDate: new Date("2025-10-01"), // End before start
        },
        requestingUserId: practitionerId,
        correlationId,
      };

      mockStaffRepository.findById.mockResolvedValue(createMockStaff() as any);
      mockPermissionService.requirePermission.mockResolvedValue();

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidAvailabilityDataError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Invalid date range",
        expect.objectContaining({
          correlationId,
        }),
      );
    });

    it("should reject invalid time slots", async () => {
      // Given - Invalid time slot (end before start)
      const request = {
        practitionerId,
        businessId,
        availability: {
          ...baseAvailability,
          availabilities: [
            {
              dayOfWeek: 1,
              isAvailable: true,
              timeSlots: [
                { startTime: "17:00", endTime: "09:00" }, // End before start
              ],
            },
          ],
        },
        requestingUserId: practitionerId,
        correlationId,
      };

      mockStaffRepository.findById.mockResolvedValue(createMockStaff() as any);
      mockPermissionService.requirePermission.mockResolvedValue();

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidAvailabilityDataError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Invalid time slot",
        expect.objectContaining({
          day: 1,
          startTime: "17:00",
          endTime: "09:00",
          correlationId,
        }),
      );
    });
  });
});
