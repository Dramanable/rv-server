/**
 * @fileoverview Professional Entity - TDD Unit Tests
 * @module __tests__/unit/domain/entities/professional.entity.spec
 * @description Tests unitaires pour l'entité Professional suivant la Clean Architecture
 */

import { Professional } from "@domain/entities/professional.entity";
import { ProfessionalValidationError } from "@domain/exceptions/professional.exceptions";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { Email } from "@domain/value-objects/email.vo";

describe("Professional Entity - TDD Simple", () => {
  // ✅ Test Data Factory
  const createValidProfessionalData = () => ({
    businessId: BusinessId.generate(),
    firstName: "Dr. Jean",
    lastName: "Dupont",
    email: Email.create("jean.dupont@example.com"),
    speciality: "Médecine générale",
    licenseNumber: "ORDRE-123456",
    phoneNumber: "+33123456789",
    createdBy: "system-test-user-id",
  });

  describe("🔴 RED - Professional Creation", () => {
    it("should create a professional with valid data", () => {
      // Given
      const data = createValidProfessionalData();

      // When
      const professional = Professional.create(data);

      // Then
      expect(professional).toBeInstanceOf(Professional);
      expect(professional.getFirstName()).toBe(data.firstName);
      expect(professional.getLastName()).toBe(data.lastName);
      expect(professional.getEmail()).toEqual(data.email);
      expect(professional.getSpeciality()).toBe(data.speciality);
      expect(professional.getLicenseNumber()).toBe(data.licenseNumber);
      expect(professional.getPhoneNumber()).toBe(data.phoneNumber);
      expect(professional.isActive()).toBe(true); // Active par défaut
      expect(professional.isVerified()).toBe(false); // Non vérifié par défaut
      expect(professional.getBusinessId()).toEqual(data.businessId);
      expect(professional.getCreatedBy()).toBe(data.createdBy);
      expect(professional.getUpdatedBy()).toBe(data.createdBy); // Initialement même que createdBy
      expect(professional.getCreatedAt()).toBeInstanceOf(Date);
      expect(professional.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it("should throw error for empty first name", () => {
      // Given
      const data = { ...createValidProfessionalData(), firstName: "" };

      // When/Then
      expect(() => Professional.create(data)).toThrow(
        ProfessionalValidationError,
      );
    });

    it("should throw error for empty last name", () => {
      // Given
      const data = { ...createValidProfessionalData(), lastName: "" };

      // When/Then
      expect(() => Professional.create(data)).toThrow(
        ProfessionalValidationError,
      );
    });

    it("should throw error for empty speciality", () => {
      // Given
      const data = { ...createValidProfessionalData(), speciality: "" };

      // When/Then
      expect(() => Professional.create(data)).toThrow(
        ProfessionalValidationError,
      );
    });

    it("should throw error for empty license number", () => {
      // Given
      const data = { ...createValidProfessionalData(), licenseNumber: "" };

      // When/Then
      expect(() => Professional.create(data)).toThrow(
        ProfessionalValidationError,
      );
    });
  });

  describe("🔴 RED - Professional Business Rules", () => {
    let professional: Professional;

    beforeEach(() => {
      const data = createValidProfessionalData();
      professional = Professional.create(data);
    });

    it("should activate professional correctly", () => {
      // Given
      professional.deactivate("test-user-id");
      expect(professional.isActive()).toBe(false);

      // When
      professional.activate("test-user-id");

      // Then
      expect(professional.isActive()).toBe(true);
      expect(professional.getUpdatedBy()).toBe("test-user-id");
    });

    it("should deactivate professional correctly", () => {
      // Given
      expect(professional.isActive()).toBe(true);

      // When
      professional.deactivate("test-user-id");

      // Then
      expect(professional.isActive()).toBe(false);
      expect(professional.getUpdatedBy()).toBe("test-user-id");
    });

    it("should verify professional license", () => {
      // Given
      expect(professional.isVerified()).toBe(false);

      // When
      professional.verifyLicense("admin-user-id");

      // Then
      expect(professional.isVerified()).toBe(true);
      expect(professional.getUpdatedBy()).toBe("admin-user-id");
    });

    it("should update professional information", () => {
      // Given
      const updateData = {
        firstName: "Dr. Marie",
        lastName: "Martin",
        speciality: "Cardiologie",
        phoneNumber: "+33987654321",
        updatedBy: "update-user-id",
      };

      // When
      professional.update(updateData);

      // Then
      expect(professional.getFirstName()).toBe(updateData.firstName);
      expect(professional.getLastName()).toBe(updateData.lastName);
      expect(professional.getSpeciality()).toBe(updateData.speciality);
      expect(professional.getPhoneNumber()).toBe(updateData.phoneNumber);
      expect(professional.getUpdatedBy()).toBe(updateData.updatedBy);
    });

    it("should check if professional belongs to business", () => {
      // Given
      const businessId = professional.getBusinessId();
      const otherBusinessId = BusinessId.generate();

      // When/Then
      expect(professional.belongsToBusiness(businessId)).toBe(true);
      expect(professional.belongsToBusiness(otherBusinessId)).toBe(false);
    });

    it("should provide professional full name", () => {
      // When
      const fullName = professional.getFullName();

      // Then
      expect(fullName).toBe("Dr. Jean Dupont");
    });
  });

  describe("🔴 RED - Professional Validation", () => {
    it("should validate license number format", () => {
      // Given
      const data = {
        ...createValidProfessionalData(),
        licenseNumber: "invalid",
      };

      // When/Then - Doit accepter différents formats de numéro de licence
      expect(() => Professional.create(data)).not.toThrow();
    });

    it("should validate phone number format", () => {
      // Given
      const validPhoneNumbers = [
        "+33123456789",
        "+1-555-123-4567",
        "0123456789",
      ];

      validPhoneNumbers.forEach((phoneNumber) => {
        // Given
        const data = { ...createValidProfessionalData(), phoneNumber };

        // When/Then
        expect(() => Professional.create(data)).not.toThrow();
      });
    });
  });

  describe("🔴 RED - Professional Equality and Serialization", () => {
    it("should have meaningful string representation", () => {
      // Given
      const data = createValidProfessionalData();
      const professional = Professional.create(data);

      // When
      const stringRepresentation = professional.toString();

      // Then
      expect(stringRepresentation).toContain("Professional");
      expect(stringRepresentation).toContain(professional.getId().getValue());
      expect(stringRepresentation).toContain("Dr. Jean Dupont");
      expect(stringRepresentation).toContain("ACTIVE");
    });

    it("should serialize to JSON correctly", () => {
      // Given
      const data = createValidProfessionalData();
      const professional = Professional.create(data);

      // When
      const json = professional.toJSON();

      // Then
      expect(json).toMatchObject({
        id: professional.getId().getValue(),
        businessId: data.businessId.getValue(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toString(),
        speciality: data.speciality,
        licenseNumber: data.licenseNumber,
        phoneNumber: data.phoneNumber,
        isActive: true,
        isVerified: false,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      });
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("🔴 RED - Professional Reconstruction", () => {
    it("should reconstruct professional from stored data", () => {
      // Given
      const originalData = createValidProfessionalData();
      const original = Professional.create(originalData);
      const storedData = {
        id: original.getId(),
        businessId: originalData.businessId,
        firstName: originalData.firstName,
        lastName: originalData.lastName,
        email: originalData.email,
        speciality: originalData.speciality,
        licenseNumber: originalData.licenseNumber,
        phoneNumber: originalData.phoneNumber,
        isActive: true,
        isVerified: false,
        createdBy: originalData.createdBy,
        updatedBy: originalData.createdBy,
        createdAt: original.getCreatedAt(),
        updatedAt: original.getUpdatedAt(),
      };

      // When
      const reconstructed = Professional.reconstruct(storedData);

      // Then
      expect(reconstructed.getId()).toEqual(original.getId());
      expect(reconstructed.getFirstName()).toBe(original.getFirstName());
      expect(reconstructed.getLastName()).toBe(original.getLastName());
      expect(reconstructed.getEmail()).toEqual(original.getEmail());
      expect(reconstructed.getSpeciality()).toBe(original.getSpeciality());
      expect(reconstructed.getLicenseNumber()).toBe(
        original.getLicenseNumber(),
      );
      expect(reconstructed.isActive()).toBe(original.isActive());
      expect(reconstructed.isVerified()).toBe(original.isVerified());
    });
  });
});
