import {
  CalendarTypeBuiltInModificationError,
  CalendarTypeValidationError,
} from '@domain/exceptions/calendar-type.exceptions';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { CalendarTypeId } from '@domain/value-objects/calendar-type-id.value-object';

/**
 * 📅 CalendarType Entity
 *
 * Represents a configurable calendar type in the business domain.
 * CalendarTypes define the different categories of calendars available
 * (Staff, Resource, Department, etc.) and are business-configurable.
 */
export class CalendarType {
  private constructor(
    private readonly _id: CalendarTypeId,
    private readonly _businessId: BusinessId,
    private _name: string,
    private readonly _code: string,
    private _description: string,
    private _icon: string,
    private _color: string,
    private readonly _isBuiltIn: boolean,
    private _isActive: boolean,
    private _sortOrder: number,
    private readonly _createdBy: string,
    private _updatedBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Create a new CalendarType
   */
  static create(params: {
    businessId: BusinessId;
    name: string;
    code: string;
    description: string;
    icon?: string; // ✅ OPTIONNEL - Valeur par défaut 'calendar'
    color: string;
    isBuiltIn?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    createdBy: string;
  }): CalendarType {
    // Validate required fields
    if (!params.name?.trim()) {
      throw new CalendarTypeValidationError('CalendarType name is required');
    }

    if (!params.code?.trim()) {
      throw new CalendarTypeValidationError('CalendarType code is required');
    }

    // Validate code format (uppercase alphanumeric with underscores)
    if (!/^[A-Z][A-Z0-9_]*$/.test(params.code)) {
      throw new CalendarTypeValidationError(
        'CalendarType code must be uppercase alphanumeric with underscores, starting with a letter',
      );
    }

    if (!params.description?.trim()) {
      throw new CalendarTypeValidationError(
        'CalendarType description is required',
      );
    }

    if (!params.color?.trim()) {
      throw new CalendarTypeValidationError('CalendarType color is required');
    }

    // Validate color format (hex color)
    if (!/^#[0-9A-Fa-f]{6}$/.test(params.color)) {
      throw new CalendarTypeValidationError(
        'CalendarType color must be a valid hex color',
      );
    }

    const now = new Date();
    const id = CalendarTypeId.generate();

    return new CalendarType(
      id,
      params.businessId,
      params.name.trim(),
      params.code.trim().toUpperCase(),
      params.description.trim(),
      (params.icon || 'calendar').trim(), // ✅ Valeur par défaut 'calendar'
      params.color.trim(),
      params.isBuiltIn ?? false,
      params.isActive ?? true,
      params.sortOrder ?? 0,
      params.createdBy,
      params.createdBy, // updatedBy = createdBy initially
      now,
      now,
    );
  }

  /**
   * Reconstruct CalendarType from persistence
   */
  static reconstruct(params: {
    id: CalendarTypeId;
    businessId: BusinessId;
    name: string;
    code: string;
    description: string;
    icon: string;
    color: string;
    isBuiltIn: boolean;
    isActive: boolean;
    sortOrder: number;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
  }): CalendarType {
    return new CalendarType(
      params.id,
      params.businessId,
      params.name,
      params.code,
      params.description,
      params.icon,
      params.color,
      params.isBuiltIn,
      params.isActive,
      params.sortOrder,
      params.createdBy,
      params.updatedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  /**
   * Update CalendarType
   */
  update(params: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    sortOrder?: number;
    updatedBy: string;
  }): void {
    // Cannot modify built-in calendar types
    if (this._isBuiltIn) {
      throw new CalendarTypeBuiltInModificationError(this._id.getValue());
    }

    // Validate optional fields
    if (params.name !== undefined) {
      if (!params.name.trim()) {
        throw new CalendarTypeValidationError(
          'CalendarType name cannot be empty',
        );
      }
      this._name = params.name.trim();
    }

    if (params.description !== undefined) {
      if (!params.description.trim()) {
        throw new CalendarTypeValidationError(
          'CalendarType description cannot be empty',
        );
      }
      this._description = params.description.trim();
    }

    if (params.icon !== undefined) {
      if (!params.icon.trim()) {
        throw new CalendarTypeValidationError(
          'CalendarType icon cannot be empty',
        );
      }
      this._icon = params.icon.trim();
    }

    if (params.color !== undefined) {
      if (!params.color.trim()) {
        throw new CalendarTypeValidationError(
          'CalendarType color cannot be empty',
        );
      }
      if (!/^#[0-9A-Fa-f]{6}$/.test(params.color)) {
        throw new CalendarTypeValidationError(
          'CalendarType color must be a valid hex color',
        );
      }
      this._color = params.color.trim();
    }

    if (params.isActive !== undefined) {
      this._isActive = params.isActive;
    }

    if (params.sortOrder !== undefined) {
      this._sortOrder = params.sortOrder;
    }

    this._updatedBy = params.updatedBy;
    this._updatedAt = new Date();
  }

  // Getters
  getId(): CalendarTypeId {
    return this._id;
  }

  getBusinessId(): BusinessId {
    return this._businessId;
  }

  getName(): string {
    return this._name;
  }

  getCode(): string {
    return this._code;
  }

  getDescription(): string {
    return this._description;
  }

  getIcon(): string {
    return this._icon;
  }

  getColor(): string {
    return this._color;
  }

  isBuiltIn(): boolean {
    return this._isBuiltIn;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getSortOrder(): number {
    return this._sortOrder;
  }

  getCreatedBy(): string {
    return this._createdBy;
  }

  getUpdatedBy(): string {
    return this._updatedBy;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id.getValue(),
      businessId: this._businessId.getValue(),
      name: this._name,
      code: this._code,
      description: this._description,
      icon: this._icon,
      color: this._color,
      isBuiltIn: this._isBuiltIn,
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
