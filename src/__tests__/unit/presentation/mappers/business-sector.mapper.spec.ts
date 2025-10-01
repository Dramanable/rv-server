/**
 * 🧪 Business Sector Mapper Tests
 *
 * Tests unitaires pour les mappers de conversion entre DTOs et Use Cases
 */

import {
  CreateBusinessSectorResponse,
  DeleteBusinessSectorResponse,
  UpdateBusinessSectorResponse,
} from "@application/use-cases/business-sectors/business-sector.types";
import { BusinessSector } from "@domain/entities/business-sector.entity";
import {
  CreateBusinessSectorDto,
  DeleteBusinessSectorDto,
  ListBusinessSectorsDto,
  UpdateBusinessSectorDto,
} from "@presentation/dtos/business-sector.dto";
import { BusinessSectorMapper } from "@presentation/mappers/business-sector.mapper";

describe("BusinessSectorMapper", () => {
  const mockUserId = "user-123";
  const mockSectorId = "sector-456";

  const mockBusinessSector = BusinessSector.restore(
    mockSectorId,
    "Information Technology",
    "Software development and IT consulting services",
    "IT_SERVICES",
    true,
    new Date("2024-01-01T10:00:00Z"),
    "creator-123",
    new Date("2024-01-15T14:30:00Z"),
    "updater-456",
  );

  // ═══════════════════════════════════════════════════════════════
  // 📥 DTO → Use Case Request Mappings
  // ═══════════════════════════════════════════════════════════════

  describe("DTO to Use Case Request mappings", () => {
    it("should convert CreateBusinessSectorDto to request", () => {
      // 🎯 Arrange
      const dto: CreateBusinessSectorDto = {
        name: "Healthcare Services",
        description: "Medical and healthcare related services",
        code: "HEALTHCARE",
      };

      // 🚀 Act
      const request = BusinessSectorMapper.toCreateRequest(dto, mockUserId);

      // ✅ Assert
      expect(request).toEqual({
        name: "Healthcare Services",
        description: "Medical and healthcare related services",
        code: "HEALTHCARE",
        requestingUserId: mockUserId,
      });
    });

    it("should convert UpdateBusinessSectorDto to request", () => {
      // 🎯 Arrange
      const dto: UpdateBusinessSectorDto = {
        name: "Updated Healthcare Services",
        description: "Updated medical services description",
      };

      // 🚀 Act
      const request = BusinessSectorMapper.toUpdateRequest(
        mockSectorId,
        dto,
        mockUserId,
      );

      // ✅ Assert
      expect(request).toEqual({
        id: mockSectorId,
        name: "Updated Healthcare Services",
        description: "Updated medical services description",
        requestingUserId: mockUserId,
      });
    });

    it("should convert ListBusinessSectorsDto to request", () => {
      // 🎯 Arrange
      const dto: ListBusinessSectorsDto = {
        pagination: { page: 2, limit: 50 },
      };

      // 🚀 Act
      const request = BusinessSectorMapper.toListRequest(dto, mockUserId);

      // ✅ Assert
      expect(request).toEqual({
        requestingUserId: mockUserId,
        page: 2,
        limit: 50,
      });
    });

    it("should convert DeleteBusinessSectorDto to request", () => {
      // 🎯 Arrange
      const dto: DeleteBusinessSectorDto = {
        force: true,
      };

      // 🚀 Act
      const request = BusinessSectorMapper.toDeleteRequest(
        mockSectorId,
        dto,
        mockUserId,
      );

      // ✅ Assert
      expect(request).toEqual({
        id: mockSectorId,
        requestingUserId: mockUserId,
        force: true,
      });
    });

    it("should handle empty DTOs with defaults", () => {
      // 🎯 Arrange
      const emptyListDto: ListBusinessSectorsDto = {};
      const emptyDeleteDto: DeleteBusinessSectorDto = {};

      // 🚀 Act
      const listRequest = BusinessSectorMapper.toListRequest(
        emptyListDto,
        mockUserId,
      );
      const deleteRequest = BusinessSectorMapper.toDeleteRequest(
        mockSectorId,
        emptyDeleteDto,
        mockUserId,
      );

      // ✅ Assert
      expect(listRequest).toEqual({
        requestingUserId: mockUserId,
        page: 1,
        limit: 20,
      });
      expect(deleteRequest.force).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📤 Use Case Response → DTO Mappings
  // ═══════════════════════════════════════════════════════════════

  describe("Use Case Response to DTO mappings", () => {
    it("should convert CreateBusinessSectorResponse to DTO", () => {
      // 🎯 Arrange
      const response: CreateBusinessSectorResponse = {
        id: mockSectorId,
        name: "Healthcare Services",
        description: "Medical services",
        code: "HEALTHCARE",
        isActive: true,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        createdBy: "creator-123",
      };

      // 🚀 Act
      const dto = BusinessSectorMapper.toCreateResponseDto(response);

      // ✅ Assert
      expect(dto).toEqual({
        success: true,
        message: "Business sector created successfully",
        data: {
          id: mockSectorId,
          name: "Healthcare Services",
          description: "Medical services",
          code: "HEALTHCARE",
          isActive: true,
          createdAt: new Date("2024-01-01T10:00:00Z"),
          createdBy: "creator-123",
          updatedAt: undefined,
          updatedBy: undefined,
        },
      });
    });

    it("should convert UpdateBusinessSectorResponse to DTO", () => {
      // 🎯 Arrange
      const response: UpdateBusinessSectorResponse = {
        id: mockSectorId,
        name: "Updated Healthcare",
        description: "Updated medical services",
        code: "HEALTHCARE",
        isActive: true,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        updatedAt: new Date("2024-01-15T14:30:00Z"),
      };

      // 🚀 Act
      const dto = BusinessSectorMapper.toUpdateResponseDto(response);

      // ✅ Assert
      expect(dto).toEqual({
        success: true,
        message: "Business sector updated successfully",
        data: {
          id: mockSectorId,
          name: "Updated Healthcare",
          description: "Updated medical services",
          code: "HEALTHCARE",
          isActive: true,
          createdAt: new Date("2024-01-01T10:00:00Z"),
          createdBy: "",
          updatedAt: new Date("2024-01-15T14:30:00Z"),
          updatedBy: undefined,
        },
      });
    });

    it("should convert DeleteBusinessSectorResponse to DTO", () => {
      // 🎯 Arrange
      const response: DeleteBusinessSectorResponse = {
        success: true,
        message: "Business sector deactivated successfully",
        deletedAt: new Date("2024-01-15T14:30:00Z"),
        sectorId: mockSectorId,
        sectorName: "Healthcare Services",
        wasForced: false,
      };

      // 🚀 Act
      const dto = BusinessSectorMapper.toDeleteResponseDto(response);

      // ✅ Assert
      expect(dto).toEqual({
        success: true,
        message: "Business sector deactivated successfully",
        deletedAt: new Date("2024-01-15T14:30:00Z"),
        sectorId: mockSectorId,
        sectorName: "Healthcare Services",
        wasForced: false,
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏢 Entity → DTO Mappings
  // ═══════════════════════════════════════════════════════════════

  describe("Entity to DTO mappings", () => {
    it("should convert BusinessSector entity to DTO", () => {
      // 🚀 Act
      const dto = BusinessSectorMapper.toDto(mockBusinessSector);

      // ✅ Assert
      expect(dto).toEqual({
        id: mockSectorId,
        name: "Information Technology",
        description: "Software development and IT consulting services",
        code: "IT_SERVICES",
        isActive: true,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        createdBy: "creator-123",
        updatedAt: new Date("2024-01-15T14:30:00Z"),
        updatedBy: "updater-456",
      });
    });

    it("should convert array of BusinessSector entities to DTOs", () => {
      // 🎯 Arrange
      const entities = [mockBusinessSector];

      // 🚀 Act
      const dtos = BusinessSectorMapper.toDtos(entities);

      // ✅ Assert
      expect(dtos).toHaveLength(1);
      expect(dtos[0]).toEqual({
        id: mockSectorId,
        name: "Information Technology",
        description: "Software development and IT consulting services",
        code: "IT_SERVICES",
        isActive: true,
        createdAt: new Date("2024-01-01T10:00:00Z"),
        createdBy: "creator-123",
        updatedAt: new Date("2024-01-15T14:30:00Z"),
        updatedBy: "updater-456",
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔧 Helper Methods
  // ═══════════════════════════════════════════════════════════════

  describe("Helper methods", () => {
    it("should validate CreateDto correctly", () => {
      // 🎯 Arrange
      const validDto: CreateBusinessSectorDto = {
        name: "Valid Name",
        description: "Valid description",
        code: "VALID_CODE",
      };

      const invalidDto = {
        name: "",
        description: "",
        code: "",
      } as CreateBusinessSectorDto;

      // 🚀 Act & Assert
      expect(BusinessSectorMapper.isValidCreateDto(validDto)).toBe(true);
      expect(BusinessSectorMapper.isValidCreateDto(invalidDto)).toBe(false);
    });

    it("should validate UpdateDto correctly", () => {
      // 🎯 Arrange
      const validDto: UpdateBusinessSectorDto = {
        name: "Valid Name",
      };

      const invalidDto = {} as UpdateBusinessSectorDto;

      // 🚀 Act & Assert
      expect(BusinessSectorMapper.isValidUpdateDto(validDto)).toBe(true);
      expect(BusinessSectorMapper.isValidUpdateDto(invalidDto)).toBe(false);
    });

    it("should normalize pagination correctly", () => {
      // 🎯 Arrange
      const pagination = { page: -1, limit: 200 };

      // 🚀 Act
      const normalized = BusinessSectorMapper.normalizePagination(pagination);

      // ✅ Assert
      expect(normalized).toEqual({
        page: 1, // Minimum 1
        limit: 100, // Maximum 100
      });
    });

    it("should normalize sort correctly", () => {
      // 🎯 Arrange
      const sort = { field: "invalid" as any, direction: "INVALID" as any };

      // 🚀 Act
      const normalized = BusinessSectorMapper.normalizeSort(sort);

      // ✅ Assert
      expect(normalized).toEqual({
        field: "name", // Default fallback
        direction: "ASC", // Default fallback
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🧪 Test Helpers
  // ═══════════════════════════════════════════════════════════════

  describe("Test helpers", () => {
    it("should create test DTOs correctly", () => {
      // 🚀 Act
      const createDto = BusinessSectorMapper.createTestDto();
      const updateDto = BusinessSectorMapper.createTestUpdateDto();
      const listDto = BusinessSectorMapper.createTestListDto();

      // ✅ Assert
      expect(createDto.name).toBe("Test Sector");
      expect(createDto.code).toBe("TEST_SECTOR");
      expect(updateDto.name).toBe("Updated Test Sector");
      expect(listDto.pagination?.page).toBe(1);
      expect(listDto.sort?.field).toBe("name");
    });
  });
});
