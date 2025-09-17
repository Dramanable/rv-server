import { BusinessName } from '../../../../domain/value-objects/business-name.value-object';

/**
 * 🧪 BusinessName Value Object Unit Tests
 * ✅ Tests unitaires seulement
 * ✅ Clean Architecture compliant
 * ✅ SOLID principles
 */
describe('BusinessName', () => {
  describe('create', () => {
    it('should create a valid business name', () => {
      const name = BusinessName.create('Valid Business Name');

      expect(name).toBeInstanceOf(BusinessName);
      expect(name.getValue()).toBe('Valid Business Name');
    });

    it('should trim whitespace', () => {
      const name = BusinessName.create('  Business Name  ');

      expect(name.getValue()).toBe('Business Name');
    });

    it('should throw error for empty name', () => {
      expect(() => BusinessName.create('')).toThrow(
        'Business name cannot be empty',
      );
    });

    it('should throw error for whitespace only', () => {
      expect(() => BusinessName.create('   ')).toThrow(
        'Business name cannot be empty',
      );
    });

    it('should throw error for name too short', () => {
      expect(() => BusinessName.create('A')).toThrow(
        'Business name must be at least 2 characters long',
      );
    });

    it('should throw error for name too long', () => {
      const longName = 'A'.repeat(101);
      expect(() => BusinessName.create(longName)).toThrow(
        'Business name cannot exceed 100 characters',
      );
    });

    it('should throw error for forbidden characters', () => {
      expect(() => BusinessName.create('Business<Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business>Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business{Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business}Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business[Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business]Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business\\Name')).toThrow(
        'Business name contains forbidden characters',
      );
      expect(() => BusinessName.create('Business/Name')).toThrow(
        'Business name contains forbidden characters',
      );
    });
  });

  describe('getValue', () => {
    it('should return the trimmed name', () => {
      const name = BusinessName.create('Business Name');

      expect(name.getValue()).toBe('Business Name');
    });
  });

  describe('getSlug', () => {
    it('should create a valid slug', () => {
      const name = BusinessName.create('My Business Name');

      expect(name.getSlug()).toBe('my-business-name');
    });

    it('should handle special characters', () => {
      const name = BusinessName.create('My Business & Co.');

      expect(name.getSlug()).toBe('my-business-co');
    });

    it('should handle multiple spaces', () => {
      const name = BusinessName.create('My   Business   Name');

      expect(name.getSlug()).toBe('my-business-name');
    });

    it('should handle multiple dashes', () => {
      const name = BusinessName.create('My--Business--Name');

      expect(name.getSlug()).toBe('my-business-name');
    });
  });

  describe('equals', () => {
    it('should return true for same name (case insensitive)', () => {
      const name1 = BusinessName.create('Business Name');
      const name2 = BusinessName.create('business name');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return true for same name with different whitespace', () => {
      const name1 = BusinessName.create('Business Name');
      const name2 = BusinessName.create('  Business Name  ');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different names', () => {
      const name1 = BusinessName.create('Business Name');
      const name2 = BusinessName.create('Another Business');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the trimmed name as string', () => {
      const name = BusinessName.create('  Business Name  ');

      expect(name.toString()).toBe('Business Name');
    });
  });
});
