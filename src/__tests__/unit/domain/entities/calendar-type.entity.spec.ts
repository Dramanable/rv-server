import { CalendarType } from '@domain/entities/calendar-type.entity';
import { CalendarTypeId } from '@domain/value-objects/calendar-type-id.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';

describe('CalendarType Entity', () => {
  describe('create', () => {
    it('should create calendar type with valid data', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const params = {
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act
      const calendarType = CalendarType.create(params);

      // Assert
      expect(calendarType).toBeDefined();
      expect(calendarType.getName()).toBe('Staff Calendar');
      expect(calendarType.getCode()).toBe('STAFF');
      expect(calendarType.getDescription()).toBe(
        'Individual staff member calendar',
      );
      expect(calendarType.getIcon()).toBe('👤');
      expect(calendarType.getColor()).toBe('#4CAF50');
      expect(calendarType.isBuiltIn()).toBe(false);
      expect(calendarType.isActive()).toBe(true);
      expect(calendarType.getBusinessId()).toEqual(businessId);
      expect(calendarType.getCreatedBy()).toBe('user-123');
      expect(calendarType.getUpdatedBy()).toBe('user-123');
    });

    it('should throw error when name is empty', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440002',
      );
      const params = {
        businessId,
        name: '',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act & Assert
      expect(() => CalendarType.create(params)).toThrow(
        'CalendarType name is required',
      );
    });

    it('should throw error when code is empty', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440003',
      );
      const params = {
        businessId,
        name: 'Staff Calendar',
        code: '',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act & Assert
      expect(() => CalendarType.create(params)).toThrow(
        'CalendarType code is required',
      );
    });

    it('should throw error when code contains invalid characters', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440004',
      );
      const params = {
        businessId,
        name: 'Staff Calendar',
        code: 'staff-calendar!',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act & Assert
      expect(() => CalendarType.create(params)).toThrow(
        'CalendarType code must be uppercase alphanumeric with underscores, starting with a letter',
      );
    });

    it('should throw error when description is empty', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440005',
      );
      const params = {
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: '',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act & Assert
      expect(() => CalendarType.create(params)).toThrow(
        'CalendarType description is required',
      );
    });

    it('should throw error when icon is empty', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440006',
      );
      const params = {
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act & Assert
      expect(() => CalendarType.create(params)).toThrow(
        'CalendarType icon is required',
      );
    });

    it('should throw error when color is invalid', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440007',
      );
      const params = {
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: 'invalid-color',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      };

      // Act & Assert
      expect(() => CalendarType.create(params)).toThrow(
        'CalendarType color must be a valid hex color',
      );
    });
  });

  describe('update', () => {
    it('should update calendar type with valid data', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440008',
      );
      const calendarType = CalendarType.create({
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      });

      // Act
      calendarType.update({
        name: 'Employee Calendar',
        description: 'Updated description',
        color: '#2196F3',
        isActive: false,
        updatedBy: 'admin-456',
      });

      // Assert
      expect(calendarType.getName()).toBe('Employee Calendar');
      expect(calendarType.getDescription()).toBe('Updated description');
      expect(calendarType.getColor()).toBe('#2196F3');
      expect(calendarType.isActive()).toBe(false);
      expect(calendarType.getUpdatedBy()).toBe('admin-456');
    });

    it('should not allow updating built-in calendar types', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440009',
      );
      const calendarType = CalendarType.create({
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: true, // Built-in type
        isActive: true,
        createdBy: 'system',
      });

      // Act & Assert
      expect(() =>
        calendarType.update({
          name: 'Modified Name',
          updatedBy: 'user-123',
        }),
      ).toThrow('Cannot modify built-in CalendarType');
    });

    it('should throw error when updating name to empty', () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440010',
      );
      const calendarType = CalendarType.create({
        businessId,
        name: 'Staff Calendar',
        code: 'STAFF',
        description: 'Individual staff member calendar',
        icon: '👤',
        color: '#4CAF50',
        isBuiltIn: false,
        isActive: true,
        createdBy: 'user-123',
      });

      // Act & Assert
      expect(() =>
        calendarType.update({
          name: '',
          updatedBy: 'user-123',
        }),
      ).toThrow('CalendarType name cannot be empty');
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct calendar type from persistence data', () => {
      // Arrange
      const id = CalendarTypeId.fromString(
        '550e8400-e29b-41d4-a716-446655440011',
      );
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440012',
      );
      const createdAt = new Date('2023-01-01T00:00:00Z');
      const updatedAt = new Date('2023-01-02T00:00:00Z');

      // Act
      const calendarType = CalendarType.reconstruct({
        id,
        businessId,
        name: 'Resource Calendar',
        code: 'RESOURCE',
        description: 'Equipment and facilities calendar',
        icon: '🛠️',
        color: '#FF9800',
        isBuiltIn: true,
        isActive: true,
        sortOrder: 10,
        createdBy: 'system',
        updatedBy: 'admin-123',
        createdAt,
        updatedAt,
      });

      // Assert
      expect(calendarType.getId()).toEqual(id);
      expect(calendarType.getBusinessId()).toEqual(businessId);
      expect(calendarType.getName()).toBe('Resource Calendar');
      expect(calendarType.getCode()).toBe('RESOURCE');
      expect(calendarType.getSortOrder()).toBe(10);
      expect(calendarType.getCreatedAt()).toEqual(createdAt);
      expect(calendarType.getUpdatedAt()).toEqual(updatedAt);
    });
  });
});
