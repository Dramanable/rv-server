import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

import { Service } from '@domain/entities/service.entity';

describe('Service Entity - Many-to-Many ServiceTypes', () => {
  let businessId: BusinessId;
  let serviceTypeId1: ServiceTypeId;
  let serviceTypeId2: ServiceTypeId;
  let serviceTypeId3: ServiceTypeId;

  beforeEach(() => {
    businessId = BusinessId.fromString('550e8400-e29b-41d4-a716-446655440000');
    serviceTypeId1 = ServiceTypeId.fromString(
      '550e8400-e29b-41d4-a716-446655440001',
    );
    serviceTypeId2 = ServiceTypeId.fromString(
      '550e8400-e29b-41d4-a716-446655440002',
    );
    serviceTypeId3 = ServiceTypeId.fromString(
      '550e8400-e29b-41d4-a716-446655440003',
    );
  });

  describe('🔴 RED - Service creation with multiple ServiceTypes', () => {
    it('should create service with multiple ServiceTypes', () => {
      const service = Service.create({
        businessId,
        name: 'Massage Relaxant',
        description: 'Massage de détente profonde',
        serviceTypeIds: [serviceTypeId1, serviceTypeId2], // ✅ Many-to-many
        basePrice: 50,
        currency: 'EUR',
        duration: 60,
        allowOnlineBooking: true,
        requiresApproval: false,
      });

      expect(service).toBeDefined();
      expect(service.name).toBe('Massage Relaxant');
      expect(service.getServiceTypeIds()).toHaveLength(2);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId1);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId2);
    });

    it('should create service with single ServiceType (backward compatibility)', () => {
      const service = Service.create({
        businessId,
        name: 'Consultation Simple',
        description: 'Consultation médicale',
        serviceTypeIds: [serviceTypeId1], // Un seul type
        basePrice: 80,
        currency: 'EUR',
        duration: 30,
        allowOnlineBooking: true,
      });

      expect(service.getServiceTypeIds()).toHaveLength(1);
      expect(service.getServiceTypeIds()[0]).toEqual(serviceTypeId1);
    });

    it('should throw error when creating service with no ServiceTypes', () => {
      expect(() => {
        Service.create({
          businessId,
          name: 'Service Sans Type',
          description: 'Description',
          serviceTypeIds: [], // ❌ Vide - doit générer une erreur
          basePrice: 100,
          currency: 'EUR',
          duration: 45,
        });
      }).toThrow('Service must have at least one ServiceType');
    });
  });

  describe('🔴 RED - ServiceType management methods', () => {
    let service: Service;

    beforeEach(() => {
      service = Service.create({
        businessId,
        name: 'Service Test',
        description: 'Test Description',
        serviceTypeIds: [serviceTypeId1],
        basePrice: 50,
        currency: 'EUR',
        duration: 60,
      });
    });

    it('should add new ServiceType', () => {
      // 🔴 RED - Cette méthode n'existe pas encore
      service.addServiceType(serviceTypeId2);

      expect(service.getServiceTypeIds()).toHaveLength(2);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId1);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId2);
    });

    it('should not add duplicate ServiceType', () => {
      service.addServiceType(serviceTypeId1); // Déjà existant

      expect(service.getServiceTypeIds()).toHaveLength(1);
      expect(service.getServiceTypeIds()[0]).toEqual(serviceTypeId1);
    });

    it('should remove ServiceType', () => {
      // Ajouter d'abord plusieurs types
      service.addServiceType(serviceTypeId2);
      service.addServiceType(serviceTypeId3);

      expect(service.getServiceTypeIds()).toHaveLength(3);

      // 🔴 RED - Cette méthode n'existe pas encore
      service.removeServiceType(serviceTypeId2);

      expect(service.getServiceTypeIds()).toHaveLength(2);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId1);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId3);
      expect(service.getServiceTypeIds()).not.toContain(serviceTypeId2);
    });

    it('should throw error when removing last ServiceType', () => {
      expect(() => {
        service.removeServiceType(serviceTypeId1);
      }).toThrow('Service must have at least one ServiceType');
    });

    it('should replace all ServiceTypes', () => {
      const newServiceTypes = [serviceTypeId2, serviceTypeId3];

      // 🔴 RED - Cette méthode n'existe pas encore
      service.updateServiceTypes(newServiceTypes);

      expect(service.getServiceTypeIds()).toHaveLength(2);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId2);
      expect(service.getServiceTypeIds()).toContain(serviceTypeId3);
      expect(service.getServiceTypeIds()).not.toContain(serviceTypeId1);
    });

    it('should check if service has specific ServiceType', () => {
      service.addServiceType(serviceTypeId2);

      // 🔴 RED - Cette méthode n'existe pas encore
      expect(service.hasServiceType(serviceTypeId1)).toBe(true);
      expect(service.hasServiceType(serviceTypeId2)).toBe(true);
      expect(service.hasServiceType(serviceTypeId3)).toBe(false);
    });

    it('should throw error when replacing with empty ServiceTypes', () => {
      expect(() => {
        service.updateServiceTypes([]);
      }).toThrow('Service must have at least one ServiceType');
    });
  });
});
