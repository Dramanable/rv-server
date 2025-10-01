/**
 * 📊 GET APPOINTMENT STATISTICS USE CASE - Tests TDD
 *
 * Tests complets pour la fonctionnalité de statistiques d'appointments
 * Suit le cycle RED-GREEN-REFACTOR
 * Utilise l'implémentation TypeORM réelle avec mocking des dépendances TypeORM
 */

import {
  GetAppointmentStatsUseCase,
  GetAppointmentStatsRequest,
} from "../../../../application/use-cases/appointments/get-appointment-stats.use-case";
import { UserRole } from "../../../../shared/enums/user-role.enum";
import { PeriodType } from "../../../../domain/value-objects/statistics-period.vo";
import { AppointmentStatisticsData } from "../../../../domain/value-objects/appointment-statistics.vo";
import {
  AppointmentStatisticsCriteria,
  AppointmentRepository,
} from "../../../../domain/repositories/appointment.repository.interface";

// 🧪 Mock Repository - Défini directement dans les tests
class MockAppointmentStatisticsRepository {
  async getStatistics(
    criteria: AppointmentStatisticsCriteria,
  ): Promise<AppointmentStatisticsData> {
    // Mock data COHÉRENTES - les totaux doivent correspondre !
    const baseData: AppointmentStatisticsData = criteria.businessId
      ? {
          // Données pour business spécifique
          totalAppointments: 150,
          confirmedAppointments: 100, // 100
          pendingAppointments: 20, // + 20
          canceledAppointments: 15, // + 15
          completedAppointments: 10, // + 10
          noShowAppointments: 5, // + 5 = 150 ✅
          totalRevenue: 8500,
          averageAppointmentValue: 56.67,
        }
      : {
          // Données pour PLATFORM_ADMIN (tous les business)
          totalAppointments: 500,
          confirmedAppointments: 350, // 350
          pendingAppointments: 80, // + 80
          canceledAppointments: 40, // + 40
          completedAppointments: 25, // + 25
          noShowAppointments: 5, // + 5 = 500 ✅
          totalRevenue: 25000,
          averageAppointmentValue: 50.0,
        };

    return baseData;
  }
}

describe("GetAppointmentStatsUseCase", () => {
  let useCase: GetAppointmentStatsUseCase;
  let mockRepository: MockAppointmentStatisticsRepository;

  beforeEach(() => {
    mockRepository = new MockAppointmentStatisticsRepository();
    useCase = new GetAppointmentStatsUseCase(
      mockRepository as Partial<AppointmentRepository> as AppointmentRepository,
    );
  });

  describe("🔐 Authorization Tests", () => {
    it("should allow platform admin to view any statistics", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
    });

    it("should allow business owner to view own business statistics", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "80420cd1-44c2-421c-b5f5-45942624c010",
        userRole: UserRole.BUSINESS_OWNER,
        businessId: "2cf1b18e-3f83-4ec8-949c-3e0a80602546",
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
    });

    it("should reject business owner without business ID", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "bdb941f0-41a8-4443-bd54-829f1d08de79",
        userRole: UserRole.BUSINESS_OWNER,
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Business ID is required");
    });

    it("should allow practitioner to view own statistics", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "4ca6a342-776f-4a15-ba07-ce886dfb55cd",
        userRole: UserRole.PRACTITIONER,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61", // Practitioner needs businessId too
        staffId: "4ca6a342-776f-4a15-ba07-ce886dfb55cd",
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
    });

    it("should reject practitioner viewing other staff statistics", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "4ca6a342-776f-4a15-ba07-ce886dfb55cd",
        userRole: UserRole.PRACTITIONER,
        staffId: "staff-456", // Different staff ID
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("only view their own statistics");
    });

    it("should reject client access", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "ee4c8003-1ccb-4dff-b119-4a61f3214aa6",
        userRole: UserRole.REGULAR_CLIENT,
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Insufficient permissions");
    });
  });

  describe("📊 Statistics Content Tests", () => {
    it("should return complete statistics structure", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toMatchObject({
        statistics: expect.objectContaining({
          totalAppointments: expect.any(Number),
          confirmedAppointments: expect.any(Number),
          canceledAppointments: expect.any(Number),
          completedAppointments: expect.any(Number),
          pendingAppointments: expect.any(Number),
          noShowAppointments: expect.any(Number),
          totalRevenue: expect.any(Number),
          averageAppointmentValue: expect.any(Number),
        }),
        period: expect.objectContaining({
          type: PeriodType.MONTH,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          label: expect.any(String),
        }),
        criteria: expect.objectContaining({
          businessId: expect.any(Object),
          period: expect.any(Object),
        }),
      });
    });

    it("should calculate correct performance indicators", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      const stats = result.value!.statistics;

      // Vérification des propriétés calculées
      expect(stats.confirmationRate).toBeGreaterThanOrEqual(0);
      expect(stats.confirmationRate).toBeLessThanOrEqual(100);
      expect(stats.completionRate).toBeGreaterThanOrEqual(0);
      expect(stats.completionRate).toBeLessThanOrEqual(100);
      expect(stats.cancellationRate).toBeGreaterThanOrEqual(0);
      expect(stats.cancellationRate).toBeLessThanOrEqual(100);
    });
  });

  describe("📅 Period Management Tests", () => {
    it("should handle current week period", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        periodType: PeriodType.WEEK,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.period.type).toBe(PeriodType.WEEK);
      expect(result.value!.period.durationInDays).toBe(7); // Une semaine = exactement 7 jours
    });

    it("should handle custom period", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        periodType: PeriodType.CUSTOM,
        startDate,
        endDate,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.period.type).toBe(PeriodType.CUSTOM);
      expect(result.value!.period.startDate).toEqual(startDate);
      expect(result.value!.period.endDate).toEqual(endDate);
    });

    it("should reject custom period without dates", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        periodType: PeriodType.CUSTOM,
        // Missing startDate and endDate
      };

      const result = await useCase.execute(request);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Start date and end date are required");
    });
  });

  describe("🎯 Filtering Tests", () => {
    it("should build criteria with staff filter", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        staffId: "4ca6a342-776f-4a15-ba07-ce886dfb55cd",
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.criteria.staffId).toBeDefined();
    });

    it("should build criteria with service filter", async () => {
      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        serviceId: "5b1f8c2a-3e4d-4f5a-8b7c-8d9e0f1a2b3c", // UUID v4 valide (4ème partie commence par 8)
        periodType: PeriodType.MONTH,
      };

      const result = await useCase.execute(request);

      expect(result.isSuccess).toBe(true);
      expect(result.value!.criteria.serviceId).toBeDefined();
    });
  });

  describe("⚠️ Error Handling Tests", () => {
    it("should handle repository errors gracefully", async () => {
      // Mock repository to throw error
      const errorRepository = {
        getStatistics: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      };

      const errorUseCase = new GetAppointmentStatsUseCase(
        errorRepository as Partial<AppointmentRepository> as AppointmentRepository,
      );

      const request: GetAppointmentStatsRequest = {
        userId: "f1b252e7-fdf0-4791-ab6f-7f501d523bce",
        userRole: UserRole.PLATFORM_ADMIN,
        businessId: "6930e91e-24c6-4164-aa16-87b47cfcfa61",
        periodType: PeriodType.MONTH,
      };

      const result = await errorUseCase.execute(request);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Failed to get appointment statistics");
      expect(result.error).toContain("Database connection failed");
    });
  });
});
