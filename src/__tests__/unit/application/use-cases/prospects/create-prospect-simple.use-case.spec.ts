/**
 * 🧪 TESTS - CreateProspectSimpleUseCase
 * ✅ TDD - Tests AVANT implémentation
 */

import {
  CreateProspectSimpleUseCase,
  CreateProspectRequest,
  CreateProspectResponse,
} from "@application/use-cases/prospects/create-prospect-simple.use-case";
import { IProspectRepository } from "@domain/repositories/prospect.repository.interface";
import { ISimplePermissionService } from "@application/ports/simple-permission.port";
import { Logger } from "@application/ports/logger.port";
import { I18nService } from "@application/ports/i18n.port";
import { UserRole } from "@shared/enums/user-role.enum";
import { BusinessSizeEnum } from "@domain/enums/business-size.enum";
import { Prospect } from "@domain/entities/prospect.entity";
import { ProspectId } from "@domain/value-objects/prospect-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { Phone } from "@domain/value-objects/phone.value-object";
import { Money } from "@domain/value-objects/money.value-object";
import { ProspectStatus } from "@domain/value-objects/prospect-status.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";

import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';
describe("CreateProspectSimpleUseCase", () => {
  let useCase: CreateProspectSimpleUseCase;
  let mockProspectRepository: jest.Mocked<IProspectRepository>;
  let mockPermissionService: jest.Mocked<ISimplePermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    mockProspectRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    mockPermissionService = {
      hasPermission: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    mockI18n = {
      translate: jest.fn().mockReturnValue("Translated message"),
    };

    useCase = new CreateProspectSimpleUseCase(
      mockProspectRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  const validRequest: CreateProspectRequest = {
    businessName: "Tech Startup",
    contactEmail: "contact@techstartup.com",
    contactPhone: "+33123456789",
    contactName: "John Doe",
    assignedSalesRep: "b2c3d4e5-f6a7-4890-bcd1-23456789abcd",
    estimatedValue: 5000,
    currency: "EUR",
    businessSize: BusinessSizeEnum.SMALL,
    staffCount: 10,
    notes: "Prospect prometteur",
    source: "WEBSITE",
    requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def",
    requestingUserRole: UserRole.SUPER_ADMIN,
    correlationId: "corr-123",
    timestamp: new Date(),
  };

  describe("🔐 Permission Validation", () => {
    it("should allow SUPER_ADMIN to create prospect", async () => {
      // Arrange
      const prospect = createMockProspect();
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockProspectRepository.save.mockResolvedValue(prospect);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        "a1b2c3d4-e5f6-4789-abc1-234567890def",
        UserRole.SUPER_ADMIN,
        "CREATE",
        "PROSPECT",
        null,
      );
      expect(result).toBeDefined();
      expect(result.businessName).toBe("Tech Startup");
    });

    it("should deny creation if permission check fails", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow();
      expect(mockProspectRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("✅ Business Rules Validation", () => {
    it("should validate required business name", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      const invalidRequest = { ...validRequest, businessName: "" };

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow();
    });

    it("should validate email format", async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      const invalidRequest = { ...validRequest, contactEmail: "invalid-email" };

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow();
    });
  });

  describe("✅ Successful Creation", () => {
    it("should create prospect with valid data", async () => {
      // Arrange
      const prospect = createMockProspect();
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockProspectRepository.save.mockResolvedValue(prospect);

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockProspectRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        businessName: "Tech Startup",
        contactEmail: "contact@techstartup.com",
        contactPhone: "+33123456789",
        contactName: "John Doe",
        assignedSalesRep: "b2c3d4e5-f6a7-4890-bcd1-23456789abcd",
        estimatedValue: 5000,
        currency: "EUR",
        status: "NEW",
        businessSize: BusinessSizeEnum.SMALL,
        staffCount: 10,
        source: "WEBSITE",
        notes: "Prospect prometteur",
        currentSolution: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  function createMockProspect(): Prospect {
    return Prospect.reconstruct({
      id: ProspectId.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d479"),
      businessName: "Tech Startup",
      contactEmail: Email.create("contact@techstartup.com"),
      contactPhone: Phone.create("+33123456789"),
      contactName: "John Doe",
      status: ProspectStatus.lead(),
      assignedSalesRep: UserId.create("a1b2c3d4-e5f6-4789-abc1-234567890def"),
      estimatedValue: Money.create(5000, "EUR"),
      notes: "Prospect prometteur",
      source: "WEBSITE",
      businessSize: BusinessSizeEnum.SMALL,
      staffCount: 10,
      currentSolution: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      convertedAt: undefined,
    });
  }
});
