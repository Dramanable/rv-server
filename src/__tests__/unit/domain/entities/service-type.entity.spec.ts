import { ServiceType } from '@domain/entities/service-type.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

describe('ServiceType Entity', () => {
  const validBusinessId = BusinessId.fromString(
    '550e8400-e29b-41d4-a716-446655440000',
  );

  describe('create', () => {
    it('should create a service type with valid data', () => {
      // Given
      const params = {
        businessId: validBusinessId,
        name: 'Consultation',
        code: 'CONSULT',
        description: 'Consultation services',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      };

      // When
      const serviceType = ServiceType.create(params);

      // Then
      expect(serviceType.getName()).toBe('Consultation');
      expect(serviceType.getCode()).toBe('CONSULT');
      expect(serviceType.getDescription()).toBe('Consultation services');
      expect(serviceType.isActive()).toBe(true);
      expect(serviceType.getSortOrder()).toBe(1);
      expect(serviceType.getCreatedBy()).toBe('user-123');
      expect(serviceType.getUpdatedBy()).toBe('user-123');
      expect(serviceType.getId()).toBeInstanceOf(ServiceTypeId);
      expect(serviceType.getBusinessId()).toBe(validBusinessId);
      expect(serviceType.getCreatedAt()).toBeInstanceOf(Date);
      expect(serviceType.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create service type with defaults when optional params omitted', () => {
      // Given
      const params = {
        businessId: validBusinessId,
        name: 'Basic Service',
        code: 'BASIC',
      };

      // When
      const serviceType = ServiceType.create(params);

      // Then
      expect(serviceType.getName()).toBe('Basic Service');
      expect(serviceType.getCode()).toBe('BASIC');
      expect(serviceType.getDescription()).toBeUndefined();
      expect(serviceType.isActive()).toBe(true);
      expect(serviceType.getSortOrder()).toBe(0);
      expect(serviceType.getCreatedBy()).toBeUndefined();
      expect(serviceType.getUpdatedBy()).toBeUndefined();
    });

    it('should convert code to uppercase', () => {
      // Given
      const params = {
        businessId: validBusinessId,
        name: 'Test Service',
        code: 'lowercase_code',
      };

      // When
      const serviceType = ServiceType.create(params);

      // Then
      expect(serviceType.getCode()).toBe('LOWERCASE_CODE');
    });
  });

  describe('update', () => {
    it('should update service type fields', () => {
      // Given
      const serviceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Original Name',
        code: 'ORIGINAL',
        createdBy: 'user-123',
      });
      const originalUpdatedAt = serviceType.getUpdatedAt();

      // When
      serviceType.update({
        name: 'Updated Name',
        code: 'UPDATED',
        description: 'New description',
        sortOrder: 5,
        updatedBy: 'user-456',
      });

      // Then
      expect(serviceType.getName()).toBe('Updated Name');
      expect(serviceType.getCode()).toBe('UPDATED');
      expect(serviceType.getDescription()).toBe('New description');
      expect(serviceType.getSortOrder()).toBe(5);
      expect(serviceType.getUpdatedBy()).toBe('user-456');
      expect(serviceType.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('business methods', () => {
    let serviceType: ServiceType;

    beforeEach(() => {
      serviceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Test Service',
        code: 'TEST',
        createdBy: 'user-123',
      });
    });

    it('should deactivate service type', () => {
      // When
      serviceType.deactivate('user-456');

      // Then
      expect(serviceType.isActive()).toBe(false);
      expect(serviceType.getUpdatedBy()).toBe('user-456');
    });

    it('should activate service type', () => {
      // Given
      serviceType.deactivate();

      // When
      serviceType.activate('user-789');

      // Then
      expect(serviceType.isActive()).toBe(true);
      expect(serviceType.getUpdatedBy()).toBe('user-789');
    });

    it('should check if belongs to business', () => {
      const otherBusinessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );

      // Then
      expect(serviceType.belongsTo(validBusinessId)).toBe(true);
      expect(serviceType.belongsTo(otherBusinessId)).toBe(false);
    });

    it('should validate code format', () => {
      // Given valid codes
      const validServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Valid',
        code: 'VALID_CODE123',
      });

      // Then
      expect(validServiceType.isValidCode()).toBe(true);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct service type from props', () => {
      // Given
      const id = ServiceTypeId.generate();
      const now = new Date();
      const props = {
        id,
        businessId: validBusinessId,
        name: 'Reconstructed',
        code: 'RECON',
        description: 'Reconstructed service type',
        isActive: true,
        sortOrder: 2,
        createdBy: 'user-123',
        updatedBy: 'user-456',
        createdAt: now,
        updatedAt: now,
      };

      // When
      const serviceType = ServiceType.reconstruct(props);

      // Then
      expect(serviceType.getId()).toBe(id);
      expect(serviceType.getBusinessId()).toBe(validBusinessId);
      expect(serviceType.getName()).toBe('Reconstructed');
      expect(serviceType.getCode()).toBe('RECON');
      expect(serviceType.getDescription()).toBe('Reconstructed service type');
      expect(serviceType.isActive()).toBe(true);
      expect(serviceType.getSortOrder()).toBe(2);
      expect(serviceType.getCreatedBy()).toBe('user-123');
      expect(serviceType.getUpdatedBy()).toBe('user-456');
      expect(serviceType.getCreatedAt()).toBe(now);
      expect(serviceType.getUpdatedAt()).toBe(now);
    });

    it('should throw error when reconstructing without ID', () => {
      // Given
      const props = {
        businessId: validBusinessId,
        name: 'No ID',
        code: 'NOID',
      };

      // When & Then
      expect(() => ServiceType.reconstruct(props as any)).toThrow(
        'ServiceType ID is required for reconstruction',
      );
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      // Given
      const serviceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'JSON Test',
        code: 'JSON',
        description: 'JSON serialization test',
        isActive: true,
        sortOrder: 3,
        createdBy: 'user-123',
      });

      // When
      const json = serviceType.toJSON();

      // Then
      expect(json).toMatchObject({
        id: serviceType.getId().getValue(),
        businessId: validBusinessId.getValue(),
        name: 'JSON Test',
        code: 'JSON',
        description: 'JSON serialization test',
        isActive: true,
        sortOrder: 3,
        createdBy: 'user-123',
        updatedBy: 'user-123',
      });
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });
  });
});
