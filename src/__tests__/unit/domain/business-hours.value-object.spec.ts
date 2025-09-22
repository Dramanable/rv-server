/**
 * 🧪 Tests unitaires pour BusinessHours Value Object
 *
 * Tests complets pour la gestion flexible des horaires :
 * - Création et validation
 * - Gestion des jours fermés
 * - Horaires différents par jour
 * - Dates spéciales
 * - Méthodes business
 */

import {
  BusinessHours,
  DaySchedule,
  SpecialDate,
} from '../../../domain/value-objects/business-hours.value-object';

describe('BusinessHours Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create valid business hours', () => {
      const weeklySchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] }, // Dimanche fermé
        {
          dayOfWeek: 1,
          isOpen: true,
          timeSlots: [{ start: '09:00', end: '18:00' }],
        }, // Lundi
        {
          dayOfWeek: 2,
          isOpen: true,
          timeSlots: [{ start: '09:00', end: '18:00' }],
        }, // Mardi
        {
          dayOfWeek: 3,
          isOpen: true,
          timeSlots: [{ start: '09:00', end: '18:00' }],
        }, // Mercredi
        {
          dayOfWeek: 4,
          isOpen: true,
          timeSlots: [{ start: '09:00', end: '18:00' }],
        }, // Jeudi
        {
          dayOfWeek: 5,
          isOpen: true,
          timeSlots: [{ start: '09:00', end: '18:00' }],
        }, // Vendredi
        { dayOfWeek: 6, isOpen: false, timeSlots: [] }, // Samedi fermé
      ];

      const businessHours = new BusinessHours(weeklySchedule);

      expect(businessHours).toBeDefined();
      expect(businessHours.getOpenDaysCount()).toBe(5);
      expect(businessHours.getOpenDays()).toEqual([1, 2, 3, 4, 5]);
      expect(businessHours.getClosedDays()).toEqual([0, 6]);
    });

    it('should throw error for invalid weekly schedule length', () => {
      const invalidSchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] }, // Seulement 1 jour
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Weekly schedule must contain exactly 7 days',
      );
    });

    it('should throw error for wrong day order', () => {
      const invalidSchedule: DaySchedule[] = [
        { dayOfWeek: 1, isOpen: false, timeSlots: [] }, // Devrait être 0
        { dayOfWeek: 1, isOpen: false, timeSlots: [] },
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Day at index 0 must have dayOfWeek = 0',
      );
    });

    it('should throw error for closed day with time slots', () => {
      const invalidSchedule: DaySchedule[] = [
        {
          dayOfWeek: 0,
          isOpen: false,
          timeSlots: [{ start: '09:00', end: '17:00' }],
        }, // Fermé avec créneaux
        { dayOfWeek: 1, isOpen: false, timeSlots: [] },
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Closed day cannot have time slots',
      );
    });

    it('should throw error for open day without time slots', () => {
      const invalidSchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] },
        { dayOfWeek: 1, isOpen: true, timeSlots: [] }, // Ouvert sans créneaux
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Open day must have at least one time slot',
      );
    });

    it('should throw error for invalid time format', () => {
      const invalidSchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] },
        {
          dayOfWeek: 1,
          isOpen: true,
          timeSlots: [{ start: '25:00', end: '17:00' }],
        }, // 25:00 invalide
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Invalid start time format: 25:00. Use HH:MM',
      );
    });

    it('should throw error for start time after end time', () => {
      const invalidSchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] },
        {
          dayOfWeek: 1,
          isOpen: true,
          timeSlots: [{ start: '18:00', end: '09:00' }],
        }, // Fin avant début
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Start time 18:00 must be before end time 09:00',
      );
    });

    it('should throw error for overlapping time slots', () => {
      const invalidSchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] },
        {
          dayOfWeek: 1,
          isOpen: true,
          timeSlots: [
            { start: '09:00', end: '13:00' },
            { start: '12:00', end: '18:00' }, // Chevauchement
          ],
        },
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      expect(() => new BusinessHours(invalidSchedule)).toThrow(
        'Time slots overlap: 09:00-13:00 and 12:00-18:00',
      );
    });
  });

  describe('Factory Methods', () => {
    it('should create standard week (Mon-Fri 9-17)', () => {
      const businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );

      expect(businessHours.getOpenDaysCount()).toBe(5);
      expect(businessHours.getOpenDays()).toEqual([1, 2, 3, 4, 5]);
      expect(businessHours.isOpenOnDay(1)).toBe(true);
      expect(businessHours.isOpenOnDay(0)).toBe(false);
      expect(businessHours.isOpenOnDay(6)).toBe(false);

      const mondaySlots = businessHours.getTimeSlotsForDay(1);
      expect(mondaySlots).toEqual([{ start: '09:00', end: '17:00' }]);
    });

    it('should create standard week with lunch break', () => {
      const businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '18:00',
        { start: '12:00', end: '13:00' },
      );

      const mondaySlots = businessHours.getTimeSlotsForDay(1);
      expect(mondaySlots).toEqual([
        { start: '09:00', end: '12:00', name: 'Matin' },
        { start: '13:00', end: '18:00', name: 'Après-midi' },
      ]);
    });

    it('should create always closed schedule', () => {
      const businessHours = BusinessHours.createAlwaysClosed();

      expect(businessHours.getOpenDaysCount()).toBe(0);
      expect(businessHours.getClosedDays()).toEqual([0, 1, 2, 3, 4, 5, 6]);

      for (let day = 0; day < 7; day++) {
        expect(businessHours.isOpenOnDay(day)).toBe(false);
        expect(businessHours.getTimeSlotsForDay(day)).toEqual([]);
      }
    });

    it('should create 24h schedule', () => {
      const businessHours = BusinessHours.create24Hours([0, 1, 2, 3, 4, 5, 6]); // Dimanche à Samedi

      expect(businessHours.getOpenDaysCount()).toBe(7);

      const mondaySlots = businessHours.getTimeSlotsForDay(1);
      expect(mondaySlots).toEqual([
        { start: '00:00', end: '23:59', name: '24h/24' },
      ]);
    });
  });

  describe('Business Logic', () => {
    let businessHours: BusinessHours;

    beforeEach(() => {
      businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );
    });

    it('should check if open on specific day', () => {
      expect(businessHours.isOpenOnDay(1)).toBe(true); // Lundi
      expect(businessHours.isOpenOnDay(0)).toBe(false); // Dimanche
      expect(businessHours.isOpenOnDay(6)).toBe(false); // Samedi
    });

    it('should get time slots for specific day', () => {
      const mondaySlots = businessHours.getTimeSlotsForDay(1);
      expect(mondaySlots).toEqual([{ start: '09:00', end: '17:00' }]);

      const sundaySlots = businessHours.getTimeSlotsForDay(0);
      expect(sundaySlots).toEqual([]);
    });

    it('should check if open at specific time', () => {
      const monday = new Date('2024-01-01'); // Lundi (1er janvier 2024 est un lundi)

      expect(businessHours.isOpenAt(monday, '10:00')).toBe(true);
      expect(businessHours.isOpenAt(monday, '08:00')).toBe(false);
      expect(businessHours.isOpenAt(monday, '18:00')).toBe(false);
    });

    it('should calculate total open minutes', () => {
      expect(businessHours.getTotalOpenMinutesForDay(1)).toBe(480); // 8 heures = 480 minutes
      expect(businessHours.getTotalOpenMinutesForDay(0)).toBe(0); // Fermé
      expect(businessHours.getTotalOpenMinutesForWeek()).toBe(2400); // 5 jours * 480 minutes
    });

    it('should calculate average open hours per day', () => {
      expect(businessHours.getAverageOpenHoursPerDay()).toBe(5.71); // 2400 minutes / 7 jours / 60 minutes
    });
  });

  describe('Special Dates', () => {
    let businessHours: BusinessHours;
    let christmasDate: Date;
    let specialWorkingDate: Date;

    beforeEach(() => {
      businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );
      christmasDate = new Date('2024-12-25');
      specialWorkingDate = new Date('2024-12-21'); // Samedi spécial
    });

    it('should handle closed special date', () => {
      const specialDate: SpecialDate = {
        date: christmasDate,
        isOpen: false,
        reason: 'Noël',
      };

      const updatedHours = businessHours.withSpecialDate(specialDate);

      expect(updatedHours.isOpenOnDate(christmasDate)).toBe(false);
      expect(updatedHours.getTimeSlotsForDate(christmasDate)).toEqual([]);
    });

    it('should handle open special date with specific hours', () => {
      const specialDate: SpecialDate = {
        date: specialWorkingDate,
        isOpen: true,
        timeSlots: [{ start: '10:00', end: '14:00' }],
        reason: 'Ouverture exceptionnelle',
      };

      const updatedHours = businessHours.withSpecialDate(specialDate);

      expect(updatedHours.isOpenOnDate(specialWorkingDate)).toBe(true);
      expect(updatedHours.getTimeSlotsForDate(specialWorkingDate)).toEqual([
        { start: '10:00', end: '14:00' },
      ]);
    });

    it('should prioritize special dates over regular schedule', () => {
      const monday = new Date('2024-01-01'); // 1er janvier 2024 est un lundi

      const specialDate: SpecialDate = {
        date: monday,
        isOpen: false,
        reason: 'Jour férié',
      };

      const updatedHours = businessHours.withSpecialDate(specialDate);

      // Normalement ouvert le lundi, mais fermé pour cette date spéciale
      expect(businessHours.isOpenOnDate(monday)).toBe(true);
      expect(updatedHours.isOpenOnDate(monday)).toBe(false);
    });

    it('should remove special date', () => {
      const specialDate: SpecialDate = {
        date: christmasDate,
        isOpen: false,
        reason: 'Noël',
      };

      const withSpecial = businessHours.withSpecialDate(specialDate);
      const withoutSpecial = withSpecial.withoutSpecialDate(christmasDate);

      expect(withSpecial.getSpecialDates()).toHaveLength(1);
      expect(withoutSpecial.getSpecialDates()).toHaveLength(0);
    });

    it('should validate special dates', () => {
      const invalidSpecialDate: SpecialDate = {
        date: new Date('2024-12-25'),
        isOpen: true,
        timeSlots: [], // Ouvert sans créneaux
        reason: 'Invalid',
      };

      expect(() => businessHours.withSpecialDate(invalidSpecialDate)).toThrow(
        'Open special date must have time slots',
      );
    });
  });

  describe('Modification Methods', () => {
    let businessHours: BusinessHours;

    beforeEach(() => {
      businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );
    });

    it('should update specific day schedule', () => {
      const newSaturdaySchedule = {
        isOpen: true,
        timeSlots: [{ start: '10:00', end: '16:00' }],
        specialNote: 'Ouverture samedi',
      };

      const updatedHours = businessHours.withUpdatedDay(6, newSaturdaySchedule);

      expect(businessHours.isOpenOnDay(6)).toBe(false); // Original fermé
      expect(updatedHours.isOpenOnDay(6)).toBe(true); // Modifié ouvert
      expect(updatedHours.getTimeSlotsForDay(6)).toEqual([
        { start: '10:00', end: '16:00' },
      ]);
    });

    it('should maintain immutability', () => {
      const originalOpenDays = businessHours.getOpenDaysCount();

      const updatedHours = businessHours.withUpdatedDay(6, {
        isOpen: true,
        timeSlots: [{ start: '10:00', end: '16:00' }],
      });

      expect(businessHours.getOpenDaysCount()).toBe(originalOpenDays); // Original inchangé
      expect(updatedHours.getOpenDaysCount()).toBe(originalOpenDays + 1); // Nouveau modifié
    });
  });

  describe('Formatting and Display', () => {
    let businessHours: BusinessHours;

    beforeEach(() => {
      businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '18:00',
        { start: '12:00', end: '13:00' },
      );
    });

    it('should format single day', () => {
      expect(businessHours.formatDay(0)).toBe('Dimanche: Fermé');
      expect(businessHours.formatDay(1)).toBe(
        'Lundi: 09:00-12:00 (Matin), 13:00-18:00 (Après-midi)',
      );
    });

    it('should format full week', () => {
      const weekFormat = businessHours.formatWeek();

      expect(weekFormat).toContain('Dimanche: Fermé');
      expect(weekFormat).toContain(
        'Lundi: 09:00-12:00 (Matin), 13:00-18:00 (Après-midi)',
      );
      expect(weekFormat).toContain('Samedi: Fermé');
    });

    it('should format special dates', () => {
      const specialDate: SpecialDate = {
        date: new Date('2024-12-25'),
        isOpen: false,
        reason: 'Noël',
      };

      const withSpecial = businessHours.withSpecialDate(specialDate);
      const specialFormat = withSpecial.formatSpecialDates();

      expect(specialFormat).toContain('25/12/2024: Fermé (Noël)');
    });
  });

  describe('Comparison and Equality', () => {
    let businessHours1: BusinessHours;
    let businessHours2: BusinessHours;

    beforeEach(() => {
      businessHours1 = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );
      businessHours2 = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );
    });

    it('should detect equal business hours', () => {
      expect(businessHours1.equals(businessHours2)).toBe(true);
    });

    it('should detect different business hours', () => {
      const different = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '08:00',
        '16:00',
      );
      expect(businessHours1.equals(different)).toBe(false);
    });

    it('should have meaningful toString', () => {
      const toString = businessHours1.toString();

      expect(toString).toContain('BusinessHours');
      expect(toString).toContain('5 jours ouverts');
      expect(toString).toContain('h/jour en moyenne');
    });
  });

  describe('Edge Cases', () => {
    it('should handle day of week validation', () => {
      const businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );

      expect(() => businessHours.isOpenOnDay(-1)).toThrow(
        'dayOfWeek must be between 0 and 6',
      );
      expect(() => businessHours.isOpenOnDay(7)).toThrow(
        'dayOfWeek must be between 0 and 6',
      );
      expect(() => businessHours.getTimeSlotsForDay(-1)).toThrow(
        'dayOfWeek must be between 0 and 6',
      );
      expect(() => businessHours.getTimeSlotsForDay(7)).toThrow(
        'dayOfWeek must be between 0 and 6',
      );
    });

    it('should handle invalid time format in isOpenAt', () => {
      const businessHours = BusinessHours.createStandardWeek(
        [1, 2, 3, 4, 5],
        '09:00',
        '17:00',
      );
      const monday = new Date('2024-01-01'); // 1er janvier 2024 est un lundi

      expect(() => businessHours.isOpenAt(monday, '25:00')).toThrow(
        'Invalid time format: 25:00. Use HH:MM',
      );
      expect(() => businessHours.isOpenAt(monday, '9:0')).toThrow(
        'Invalid time format: 9:0. Use HH:MM',
      );
    });

    it('should handle multiple time slots correctly', () => {
      const weeklySchedule: DaySchedule[] = [
        { dayOfWeek: 0, isOpen: false, timeSlots: [] },
        {
          dayOfWeek: 1,
          isOpen: true,
          timeSlots: [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '18:00' },
            { start: '20:00', end: '22:00' },
          ],
        },
        { dayOfWeek: 2, isOpen: false, timeSlots: [] },
        { dayOfWeek: 3, isOpen: false, timeSlots: [] },
        { dayOfWeek: 4, isOpen: false, timeSlots: [] },
        { dayOfWeek: 5, isOpen: false, timeSlots: [] },
        { dayOfWeek: 6, isOpen: false, timeSlots: [] },
      ];

      const businessHours = new BusinessHours(weeklySchedule);
      const monday = new Date('2024-01-01'); // 1er janvier 2024 est un lundi

      expect(businessHours.isOpenAt(monday, '10:00')).toBe(true); // Premier créneau
      expect(businessHours.isOpenAt(monday, '13:00')).toBe(false); // Entre créneaux
      expect(businessHours.isOpenAt(monday, '16:00')).toBe(true); // Deuxième créneau
      expect(businessHours.isOpenAt(monday, '19:00')).toBe(false); // Entre créneaux
      expect(businessHours.isOpenAt(monday, '21:00')).toBe(true); // Troisième créneau
      expect(businessHours.isOpenAt(monday, '23:00')).toBe(false); // Après fermeture
    });
  });
});
