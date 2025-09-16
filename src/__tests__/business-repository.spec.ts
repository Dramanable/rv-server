import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmBusinessRepository } from '../infrastructure/database/repositories/sql/typeorm-business.repository';
import { BusinessRepository } from '../domain/repositories/business.repository.interface';
import { Business, BusinessSector, BusinessStatus } from '../domain/entities/business.entity';
import { BusinessId } from '../domain/value-objects/business-id.value-object';
import { BusinessName } from '../domain/value-objects/business-name.value-object';
import { Address } from '../domain/value-objects/address.value-object';
import { Email } from '../domain/value-objects/email.value-object';
import { Phone } from '../domain/value-objects/phone.value-object';

/**
 * 🧪 Business Repository Unit Tests
 * ✅ Tests unitaires avec base SQL de test
 * ✅ Clean Architecture compliant
 * ✅ SOLID principles
 * 🚫 No in-memory repositories - production-ready tests only
 */
describe('TypeOrmBusinessRepository', () => {
  let repository: BusinessRepository;
  let testBusiness: Business;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'BusinessRepository',
          useClass: TypeOrmBusinessRepository,
        },
      ],
    }).compile();

    repository = module.get<BusinessRepository>('BusinessRepository');
    
    // Create test business
    testBusiness = Business.create({
      name: 'Test Business',
      description: 'A test business',
      sector: BusinessSector.MEDICAL,
      address: Address.create({
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        latitude: 45.5017,
        longitude: -73.5673,
      }),
      contactInfo: {
        email: Email.create('test@business.com'),
        phone: Phone.create('+33123456789'),
        website: 'https://test-business.com',
      },
    });
  });

  describe('save', () => {
    it('should save a business successfully', async () => {
      await expect(repository.save(testBusiness)).resolves.not.toThrow();
    });
  });

  describe('findById', () => {
    it('should find a business by ID', async () => {
      await repository.save(testBusiness);
      
      const found = await repository.findById(testBusiness.id);
      
      expect(found).toBeDefined();
      expect(found?.id.equals(testBusiness.id)).toBe(true);
    });

    it('should return null for non-existent business', async () => {
      const nonExistentId = BusinessId.generate();
      
      const found = await repository.findById(nonExistentId);
      
      expect(found).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find a business by name', async () => {
      await repository.save(testBusiness);
      
      const found = await repository.findByName(testBusiness.name);
      
      expect(found).toBeDefined();
      expect(found?.name.equals(testBusiness.name)).toBe(true);
    });

    it('should return null for non-existent business name', async () => {
      const nonExistentName = BusinessName.create('Non Existent Business');
      
      const found = await repository.findByName(nonExistentName);
      
      expect(found).toBeNull();
    });
  });

  describe('existsByName', () => {
    it('should return true for existing business name', async () => {
      await repository.save(testBusiness);
      
      const exists = await repository.existsByName(testBusiness.name);
      
      expect(exists).toBe(true);
    });

    it('should return false for non-existing business name', async () => {
      const nonExistentName = BusinessName.create('Non Existent Business');
      
      const exists = await repository.existsByName(nonExistentName);
      
      expect(exists).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a business successfully', async () => {
      await repository.save(testBusiness);
      
      await repository.delete(testBusiness.id);
      
      const found = await repository.findById(testBusiness.id);
      expect(found).toBeNull();
    });
  });

  describe('findBySector', () => {
    it('should find businesses by sector', async () => {
      await repository.save(testBusiness);
      
      const businesses = await repository.findBySector(BusinessSector.MEDICAL);
      
      expect(businesses).toHaveLength(1);
      expect(businesses[0].sector).toBe(BusinessSector.MEDICAL);
    });

    it('should return empty array for sector with no businesses', async () => {
      const businesses = await repository.findBySector(BusinessSector.LEGAL);
      
      expect(businesses).toHaveLength(0);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Add multiple test businesses
      await repository.save(testBusiness);
      
      const business2 = Business.create({
        name: 'Another Business',
        description: 'Another test business',
        sector: BusinessSector.BEAUTY,
        address: Address.create({
          street: '456 Another St',
          city: 'Another City',
          postalCode: '67890',
          country: 'Another Country',
          latitude: 48.8566,
          longitude: 2.3522,
        }),
        contactInfo: {
          email: Email.create('another@business.com'),
          phone: Phone.create('+33987654321'),
          website: 'https://another-business.com',
        },
      });
      
      await repository.save(business2);
    });

    it('should search businesses by name', async () => {
      const result = await repository.search({ name: 'Test' });
      
      expect(result.businesses).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.businesses[0].name.getValue()).toContain('Test');
    });

    it('should search businesses by sector', async () => {
      const result = await repository.search({ sector: BusinessSector.BEAUTY });
      
      expect(result.businesses).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.businesses[0].sector).toBe(BusinessSector.BEAUTY);
    });

    it('should return all businesses without filters', async () => {
      const result = await repository.search({});
      
      expect(result.businesses).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply limit correctly', async () => {
      const result = await repository.search({ limit: 1 });
      
      expect(result.businesses).toHaveLength(1);
      expect(result.total).toBe(2); // Total should still be 2
    });
  });

  describe('findNearLocation', () => {
    it('should find businesses near location', async () => {
      await repository.save(testBusiness);
      
      const businesses = await repository.findNearLocation(
        45.5017, 
        -73.5673, 
        10, // 10km radius
        5   // limit
      );
      
      expect(businesses).toHaveLength(1);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics for a business', async () => {
      await repository.save(testBusiness);
      
      const stats = await repository.getStatistics(testBusiness.id);
      
      expect(stats).toEqual({
        totalAppointments: 0,
        totalClients: 0,
        totalStaff: 0,
        totalServices: 0,
        revenue: 0,
      });
    });
  });
});
