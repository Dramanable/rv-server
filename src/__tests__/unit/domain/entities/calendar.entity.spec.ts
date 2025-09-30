/**
 * 🧪 TDD: Calendar Entity Tests
 *
 * Tests pour l'entité Calendar avec support de CalendarType entity
 * Cyc    it('should require ownerId for STAFF calendars', () => {
      // Vérification préalable que notre CalendarType est correct
      expect(staffCalendarType.getCode()).toBe('STAFF');

      // Test de validation principal
      expect(() => {
        Calendar.create({
          businessId,
          type: staffCalendarType,
          name: 'Staff Calendar',
          description: 'Without owner'
          // Pas d'ownerId fourni
        });
      }).toThrow('calendar_owner_id');
    });

    it('should reject whitespace-only names', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: '   ', // Nom avec seulement des espaces
          description: 'Test'
        });
      }).toThrow('calendar_name');
    });

    it('should accept valid names with spaces', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: ' Valid Name ', // Nom valide avec espaces
          description: 'Test'
        });
      }).not.toThrow();
    });

    it('should validate settings constraints', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: 'Test Calendar',
          description: 'Test',
          settings: {
            defaultSlotDuration: 2 // Moins de 5 minutes - invalide
          }
        });
      }).toThrow('default_slot_duration');
    });

    it('should not require ownerId for BUSINESS calendars', () => {t('should not require ownerId for BUSINESS calendars', () => {
      // Les calendriers BUSINESS ne doivent pas exiger d'ownerId
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: 'Business Calendar',
          description: 'No owner needed'
          // Pas d'ownerId fourni - c'est normal pour BUSINESS
        });
      }).not.toThrow();
    });

    it('should validate settings constraints', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: 'Test Calendar',
          description: 'Test',
          settings: {
            defaultSlotDuration: 2 // Moins de 5 minutes - invalide
          }
        });
      }).toThrow('default_slot_duration');
    });
  });ACTOR
 */

import { CalendarType } from '../../../../domain/entities/calendar-type.entity';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../../domain/value-objects/user-id.value-object';

import { Calendar } from '../../../../domain/entities/calendar.entity';

describe('Calendar Entity', () => {
  let businessId: BusinessId;
  let businessCalendarType: CalendarType;
  let staffCalendarType: CalendarType;
  let userId: UserId;

  beforeEach(() => {
    businessId = BusinessId.generate();
    userId = UserId.generate();

    // Créer des CalendarType entities pour les tests
    businessCalendarType = CalendarType.create({
      businessId,
      name: 'Calendrier Principal',
      code: 'BUSINESS',
      description: "Calendrier principal de l'entreprise",
      color: '#2563eb',
      createdBy: 'system',
    });

    staffCalendarType = CalendarType.create({
      businessId,
      name: 'Calendrier Personnel',
      code: 'STAFF',
      description: "Calendrier personnel d'un membre du personnel",
      color: '#059669',
      createdBy: 'system',
    });
  });

  describe('🏗️ Calendar Creation', () => {
    it('should create a BUSINESS calendar successfully', () => {
      // Arrange & Act
      const calendar = Calendar.create({
        businessId,
        type: businessCalendarType,
        name: 'Test Calendar',
        description: 'Test',
      });

      // Assert
      expect(calendar).toBeDefined();
      expect(calendar.type.getCode()).toBe('BUSINESS');
      expect(calendar.type.getColor()).toBe('#2563eb');
      expect(calendar.type.getDescription()).toBe(
        "Calendrier principal de l'entreprise",
      );
    });

    it('should create a STAFF calendar with ownerId', () => {
      // Arrange & Act
      const calendar = Calendar.create({
        businessId,
        type: staffCalendarType,
        name: 'Staff Calendar',
        description: 'Personal calendar',
        ownerId: userId,
      });

      // Assert
      expect(calendar).toBeDefined();
      expect(calendar.type.getCode()).toBe('STAFF');
      expect(calendar.ownerId).toBe(userId);
    });
  });

  describe('� TDD GREEN: Calendar Validation Working', () => {
    it('should require name', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: '', // Nom vide - devrait déclencher validation
          description: 'Test',
        });
      }).toThrow('calendar_name');
    });

    it('should require ownerId for STAFF calendars', () => {
      // Vérification préalable que notre CalendarType est correct
      expect(staffCalendarType.getCode()).toBe('STAFF');

      // Test de validation principal
      expect(() => {
        Calendar.create({
          businessId,
          type: staffCalendarType,
          name: 'Staff Calendar',
          description: 'Without owner',
          // Pas d'ownerId fourni
        });
      }).toThrow('calendar_owner_id');
    });

    it('should reject whitespace-only names', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: '   ', // Nom avec seulement des espaces
          description: 'Test',
        });
      }).toThrow('calendar_name');
    });

    it('should accept valid names with spaces', () => {
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: ' Valid Name ', // Nom valide avec espaces
          description: 'Test',
        });
      }).not.toThrow();
    });

    it('should not require ownerId for BUSINESS calendars', () => {
      // Les calendriers BUSINESS ne doivent pas exiger d'ownerId
      expect(() => {
        Calendar.create({
          businessId,
          type: businessCalendarType,
          name: 'Business Calendar',
          description: 'No owner needed',
          // Pas d'ownerId - c'est OK pour BUSINESS
        });
      }).not.toThrow();
    });
  });

  describe('🟢 TDD GREEN: Business Rules', () => {
    it('should enforce correct type validation logic', () => {
      // Vérification que la logique de validation fonctionne correctement
      const staffCalendar = Calendar.create({
        businessId,
        type: staffCalendarType,
        name: 'Staff Calendar',
        description: 'With owner',
        ownerId: userId,
      });

      expect(staffCalendar.type.getCode()).toBe('STAFF');
      expect(staffCalendar.ownerId).toBeDefined();
    });

    it('should handle different calendar type codes', () => {
      // Test avec différents types
      expect(businessCalendarType.getCode()).toBe('BUSINESS');
      expect(staffCalendarType.getCode()).toBe('STAFF');
    });
  });

  describe('🔄 TDD REFACTOR: Clean Architecture', () => {
    it('should use CalendarType entity instead of enum', () => {
      // Vérifier que nous utilisons bien l'entity CalendarType
      const calendar = Calendar.create({
        businessId,
        type: businessCalendarType,
        name: 'Test',
        description: 'Test',
      });

      // L'entité CalendarType doit avoir des méthodes riches
      expect(typeof calendar.type.getCode).toBe('function');
      expect(typeof calendar.type.getColor).toBe('function');
      expect(typeof calendar.type.getDescription).toBe('function');
    });

    it('should maintain type safety with CalendarType entity', () => {
      const calendar = Calendar.create({
        businessId,
        type: staffCalendarType,
        name: 'Staff Calendar',
        description: 'Test',
        ownerId: userId,
      });

      // Type safety: le type doit être une instance de CalendarType
      expect(calendar.type).toBeInstanceOf(CalendarType);
      expect(calendar.type.getCode()).toBe('STAFF');
    });
  });
});
