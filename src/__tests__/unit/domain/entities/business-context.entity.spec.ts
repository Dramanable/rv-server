/**
 * 🧪 DOMAIN ENTITY TESTS - BusinessContext
 *
 * Tests unitaires pour l'entité BusinessContext suivant les principes TDD.
 * Tests de la logique métier pure de gestion des contextes hiérarchiques.
 */

import {
  BusinessContext,
  LocationContext,
  DepartmentContext,
} from "@domain/entities/business-context.entity";

describe("BusinessContext Entity", () => {
  const mockBusinessId = "business-123";
  const mockBusinessName = "Test Business Corp";

  const mockLocation1: LocationContext = {
    locationId: "location-456",
    locationName: "Downtown Office",
    departments: [
      {
        departmentId: "dept-001",
        departmentName: "Sales",
        isActive: true,
      },
      {
        departmentId: "dept-002",
        departmentName: "Marketing",
        isActive: true,
      },
      {
        departmentId: "dept-003",
        departmentName: "Inactive Dept",
        isActive: false,
      },
    ],
    isActive: true,
  };

  const mockLocation2: LocationContext = {
    locationId: "location-789",
    locationName: "Uptown Branch",
    departments: [
      {
        departmentId: "dept-004",
        departmentName: "Operations",
        isActive: true,
      },
    ],
    isActive: true,
  };

  const mockInactiveLocation: LocationContext = {
    locationId: "location-inactive",
    locationName: "Closed Location",
    departments: [],
    isActive: false,
  };

  describe("create", () => {
    it("should create business context with valid data", () => {
      // When
      const context = BusinessContext.create(mockBusinessId, mockBusinessName);

      // Then
      expect(context.getBusinessId()).toBe(mockBusinessId);
      expect(context.getBusinessName()).toBe(mockBusinessName);
      expect(context.getLocations()).toEqual([]);
      expect(context.isActiveContext()).toBe(true);
    });

    it("should create business context with locations", () => {
      // Given
      const locations = [mockLocation1, mockLocation2, mockInactiveLocation];

      // When
      const context = BusinessContext.create(
        mockBusinessId,
        mockBusinessName,
        locations,
      );

      // Then
      expect(context.getBusinessId()).toBe(mockBusinessId);
      expect(context.getBusinessName()).toBe(mockBusinessName);
      expect(context.getLocations()).toHaveLength(2); // Only active locations
      expect(context.getLocations()).toEqual(
        expect.arrayContaining([mockLocation1, mockLocation2]),
      );
    });

    it("should trim business name whitespace", () => {
      // Given
      const nameWithSpaces = "  Test Business  ";

      // When
      const context = BusinessContext.create(mockBusinessId, nameWithSpaces);

      // Then
      expect(context.getBusinessName()).toBe("Test Business");
    });

    it("should throw error for empty business ID", () => {
      // When & Then
      expect(() => {
        BusinessContext.create("", mockBusinessName);
      }).toThrow("Business ID is required");

      expect(() => {
        BusinessContext.create("   ", mockBusinessName);
      }).toThrow("Business ID is required");
    });

    it("should throw error for empty business name", () => {
      // When & Then
      expect(() => {
        BusinessContext.create(mockBusinessId, "");
      }).toThrow("Business name is required");

      expect(() => {
        BusinessContext.create(mockBusinessId, "   ");
      }).toThrow("Business name is required");
    });

    it("should throw error for business name too short", () => {
      // When & Then
      expect(() => {
        BusinessContext.create(mockBusinessId, "A");
      }).toThrow("Business name must be at least 2 characters long");
    });
  });

  describe("restore", () => {
    it("should restore business context from persistence data", () => {
      // Given
      const data = {
        businessId: mockBusinessId,
        businessName: mockBusinessName,
        locations: [mockLocation1, mockLocation2],
        isActive: true,
      };

      // When
      const context = BusinessContext.restore(data);

      // Then
      expect(context.getBusinessId()).toBe(mockBusinessId);
      expect(context.getBusinessName()).toBe(mockBusinessName);
      expect(context.getLocations()).toEqual([mockLocation1, mockLocation2]);
      expect(context.isActiveContext()).toBe(true);
    });

    it("should restore inactive business context", () => {
      // Given
      const data = {
        businessId: mockBusinessId,
        businessName: mockBusinessName,
        locations: [],
        isActive: false,
      };

      // When
      const context = BusinessContext.restore(data);

      // Then
      expect(context.isActiveContext()).toBe(false);
    });
  });

  describe("getLocation", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockLocation2,
        mockInactiveLocation,
      ]);
    });

    it("should return active location by ID", () => {
      // When
      const location = context.getLocation("location-456");

      // Then
      expect(location).toEqual(mockLocation1);
    });

    it("should return undefined for non-existent location", () => {
      // When
      const location = context.getLocation("non-existent");

      // Then
      expect(location).toBeUndefined();
    });

    it("should return undefined for inactive location", () => {
      // When
      const location = context.getLocation("location-inactive");

      // Then
      expect(location).toBeUndefined();
    });
  });

  describe("getDepartment", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
      ]);
    });

    it("should return active department in existing location", () => {
      // When
      const department = context.getDepartment("location-456", "dept-001");

      // Then
      expect(department).toEqual(mockLocation1.departments[0]);
    });

    it("should return undefined for department in non-existent location", () => {
      // When
      const department = context.getDepartment("non-existent", "dept-001");

      // Then
      expect(department).toBeUndefined();
    });

    it("should return undefined for non-existent department", () => {
      // When
      const department = context.getDepartment("location-456", "non-existent");

      // Then
      expect(department).toBeUndefined();
    });

    it("should return undefined for inactive department", () => {
      // When
      const department = context.getDepartment("location-456", "dept-003");

      // Then
      expect(department).toBeUndefined();
    });
  });

  describe("hasLocation and hasDepartment", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockInactiveLocation,
      ]);
    });

    it("should return true for existing active location", () => {
      // When & Then
      expect(context.hasLocation("location-456")).toBe(true);
    });

    it("should return false for non-existent location", () => {
      // When & Then
      expect(context.hasLocation("non-existent")).toBe(false);
    });

    it("should return false for inactive location", () => {
      // When & Then
      expect(context.hasLocation("location-inactive")).toBe(false);
    });

    it("should return true for existing active department", () => {
      // When & Then
      expect(context.hasDepartment("location-456", "dept-001")).toBe(true);
    });

    it("should return false for inactive department", () => {
      // When & Then
      expect(context.hasDepartment("location-456", "dept-003")).toBe(false);
    });
  });

  describe("getLocationDepartments", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
      ]);
    });

    it("should return active departments for existing location", () => {
      // When
      const departments = context.getLocationDepartments("location-456");

      // Then
      expect(departments).toHaveLength(2); // Only active departments
      expect(departments).toEqual(
        expect.arrayContaining([
          mockLocation1.departments[0], // Sales
          mockLocation1.departments[1], // Marketing
        ]),
      );
    });

    it("should return empty array for non-existent location", () => {
      // When
      const departments = context.getLocationDepartments("non-existent");

      // Then
      expect(departments).toEqual([]);
    });
  });

  describe("getAllDepartments", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockLocation2,
      ]);
    });

    it("should return all active departments with location info", () => {
      // When
      const departments = context.getAllDepartments();

      // Then
      expect(departments).toHaveLength(3); // 2 from location1 + 1 from location2

      // Check that location ID is included
      expect(departments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            departmentId: "dept-001",
            departmentName: "Sales",
            locationId: "location-456",
          }),
          expect.objectContaining({
            departmentId: "dept-002",
            departmentName: "Marketing",
            locationId: "location-456",
          }),
          expect.objectContaining({
            departmentId: "dept-004",
            departmentName: "Operations",
            locationId: "location-789",
          }),
        ]),
      );
    });
  });

  describe("getContextStats", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockLocation2,
        mockInactiveLocation,
      ]);
    });

    it("should return correct statistics", () => {
      // When
      const stats = context.getContextStats();

      // Then
      expect(stats).toEqual({
        totalLocations: 2, // Only active locations counted in create
        activeLocations: 2,
        totalDepartments: 4, // dept-001, dept-002, dept-003, dept-004
        activeDepartments: 3, // dept-003 is inactive but not in context
      });
    });
  });

  describe("searchLocationsByName", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockLocation2,
      ]);
    });

    it("should find locations by partial name (case insensitive)", () => {
      // When
      const results = context.searchLocationsByName("downtown");

      // Then
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockLocation1);
    });

    it("should find locations by partial name (different case)", () => {
      // When
      const results = context.searchLocationsByName("OFFICE");

      // Then
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockLocation1);
    });

    it("should return empty array when no matches", () => {
      // When
      const results = context.searchLocationsByName("nonexistent");

      // Then
      expect(results).toEqual([]);
    });

    it("should handle empty search term", () => {
      // When
      const results = context.searchLocationsByName("");

      // Then
      expect(results).toEqual([]); // Empty string should match nothing
    });
  });

  describe("searchDepartmentsByName", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockLocation2,
      ]);
    });

    it("should find departments by partial name (case insensitive)", () => {
      // When
      const results = context.searchDepartmentsByName("sales");

      // Then
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        departmentId: "dept-001",
        departmentName: "Sales",
        locationId: "location-456",
      });
    });

    it("should find multiple matching departments", () => {
      // When
      const results = context.searchDepartmentsByName("a"); // Should match "Sales", "Marketing", "Operations"

      // Then
      expect(results).toHaveLength(3);
    });
  });

  describe("isValidContext", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
      ]);
    });

    it("should validate business-only context", () => {
      // When & Then
      expect(context.isValidContext({ businessId: mockBusinessId })).toBe(true);
      expect(context.isValidContext({ businessId: "other-business" })).toBe(
        false,
      );
    });

    it("should validate location context", () => {
      // When & Then
      expect(
        context.isValidContext({
          businessId: mockBusinessId,
          locationId: "location-456",
        }),
      ).toBe(true);

      expect(
        context.isValidContext({
          businessId: mockBusinessId,
          locationId: "non-existent",
        }),
      ).toBe(false);
    });

    it("should validate department context", () => {
      // When & Then
      expect(
        context.isValidContext({
          businessId: mockBusinessId,
          locationId: "location-456",
          departmentId: "dept-001",
        }),
      ).toBe(true);

      expect(
        context.isValidContext({
          businessId: mockBusinessId,
          locationId: "location-456",
          departmentId: "non-existent",
        }),
      ).toBe(false);
    });

    it("should invalidate department without location", () => {
      // When & Then
      expect(
        context.isValidContext({
          businessId: mockBusinessId,
          departmentId: "dept-001",
        }),
      ).toBe(false);
    });
  });

  describe("addLocation", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
      ]);
    });

    it("should add new location successfully", () => {
      // When
      const updatedContext = context.addLocation(mockLocation2);

      // Then
      expect(updatedContext.getLocations()).toHaveLength(2);
      expect(updatedContext.hasLocation("location-789")).toBe(true);
      expect(context.getLocations()).toHaveLength(1); // Original unchanged
    });

    it("should throw error when adding duplicate location", () => {
      // When & Then
      expect(() => {
        context.addLocation(mockLocation1);
      }).toThrow("Location location-456 already exists");
    });
  });

  describe("addDepartmentToLocation", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
      ]);
    });

    it("should add department to existing location", () => {
      // Given
      const newDepartment: DepartmentContext = {
        departmentId: "dept-new",
        departmentName: "HR",
        isActive: true,
      };

      // When
      const updatedContext = context.addDepartmentToLocation(
        "location-456",
        newDepartment,
      );

      // Then
      expect(
        updatedContext.getLocationDepartments("location-456"),
      ).toHaveLength(3); // 2 + new one
      expect(updatedContext.hasDepartment("location-456", "dept-new")).toBe(
        true,
      );
    });

    it("should throw error for non-existent location", () => {
      // Given
      const newDepartment: DepartmentContext = {
        departmentId: "dept-new",
        departmentName: "HR",
        isActive: true,
      };

      // When & Then
      expect(() => {
        context.addDepartmentToLocation("non-existent", newDepartment);
      }).toThrow("Location non-existent not found");
    });

    it("should throw error for duplicate department", () => {
      // Given
      const duplicateDepartment: DepartmentContext = {
        departmentId: "dept-001", // Already exists
        departmentName: "Duplicate",
        isActive: true,
      };

      // When & Then
      expect(() => {
        context.addDepartmentToLocation("location-456", duplicateDepartment);
      }).toThrow("Department dept-001 already exists in location location-456");
    });
  });

  describe("getContextPath", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
      ]);
    });

    it("should return business name only for business-level context", () => {
      // When
      const path = context.getContextPath({});

      // Then
      expect(path).toBe(mockBusinessName);
    });

    it("should return business > location for location-level context", () => {
      // When
      const path = context.getContextPath({ locationId: "location-456" });

      // Then
      expect(path).toBe(`${mockBusinessName} > Downtown Office`);
    });

    it("should return full hierarchy for department-level context", () => {
      // When
      const path = context.getContextPath({
        locationId: "location-456",
        departmentId: "dept-001",
      });

      // Then
      expect(path).toBe(`${mockBusinessName} > Downtown Office > Sales`);
    });

    it("should handle non-existent location gracefully", () => {
      // When
      const path = context.getContextPath({ locationId: "non-existent" });

      // Then
      expect(path).toBe(mockBusinessName); // Only business name
    });
  });

  describe("toAuditData", () => {
    let context: BusinessContext;

    beforeEach(() => {
      context = BusinessContext.create(mockBusinessId, mockBusinessName, [
        mockLocation1,
        mockLocation2,
      ]);
    });

    it("should return comprehensive audit data", () => {
      // When
      const auditData = context.toAuditData();

      // Then
      expect(auditData).toEqual({
        businessId: mockBusinessId,
        businessName: mockBusinessName,
        locationsCount: 2,
        departmentsCount: 3,
        isActive: true,
      });
    });
  });
});
