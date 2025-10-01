import { RequiredValueError } from '../exceptions/value-object.exceptions';
import { BusinessId } from '../value-objects/business-id.value-object';
import { CalendarTypeId } from '../value-objects/calendar-type-id.value-object';

export class CalendarType {
  constructor(
    private readonly _id: CalendarTypeId,
    private readonly _businessId: BusinessId,
    private readonly _name: string,
    private readonly _code: string,
    private readonly _description: string,
    private readonly _color: string,
    private readonly _createdBy: string,
    private readonly _sortOrder: number = 0,
    private readonly _isActive: boolean = true,
    private readonly _isBuiltIn: boolean = false,
    private readonly _icon?: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private readonly _updatedBy?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new RequiredValueError('calendar_type_name');
    }

    if (!this._code || this._code.trim().length === 0) {
      throw new RequiredValueError('calendar_type_code');
    }

    if (!this._color || this._color.trim().length === 0) {
      throw new RequiredValueError('calendar_type_color');
    }
  }

  // Getters
  getId(): CalendarTypeId {
    return this._id;
  }

  getBusinessId(): BusinessId {
    return this._businessId;
  }

  get businessId(): BusinessId {
    return this._businessId;
  }

  get id(): CalendarTypeId {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  get description(): string {
    return this._description;
  }

  get color(): string {
    return this._color;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Méthodes compatibles avec le code existant
  getName(): string {
    return this._name;
  }

  getCode(): string {
    return this._code;
  }

  getColor(): string {
    return this._color;
  }

  getDescription(): string {
    return this._description;
  }

  getIcon(): string {
    return this._icon || '';
  }

  getSortOrder(): number {
    return this._sortOrder;
  }

  isActive(): boolean {
    return this._isActive;
  }

  isBuiltIn(): boolean {
    return this._isBuiltIn;
  }

  getCreatedBy(): string {
    return this._createdBy;
  }

  getUpdatedBy(): string {
    return this._updatedBy || '';
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // Méthode de mise à jour
  update(data: {
    name?: string;
    code?: string;
    color?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    updatedBy?: string;
  }): void {
    // Empêcher la modification des types built-in
    if (this._isBuiltIn) {
      throw new Error('Cannot modify built-in CalendarType');
    }
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('CalendarType name cannot be empty');
      }
      (this as any)._name = data.name;
    }
    if (data.code !== undefined) {
      (this as any)._code = data.code;
    }
    if (data.color !== undefined) {
      (this as any)._color = data.color;
    }
    if (data.description !== undefined) {
      (this as any)._description = data.description;
    }
    if (data.icon !== undefined) {
      (this as any)._icon = data.icon;
    }
    if (data.sortOrder !== undefined) {
      (this as any)._sortOrder = data.sortOrder;
    }
    if (data.isActive !== undefined) {
      (this as any)._isActive = data.isActive;
    }
    if (data.updatedBy !== undefined) {
      (this as any)._updatedBy = data.updatedBy;
    }
    this._updatedAt = new Date();
    this.validate();
  }

  // Factory method pour créer un CalendarType
  static create(data: {
    businessId: BusinessId;
    name: string;
    code: string;
    description: string;
    color: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    isBuiltin?: boolean;
    createdBy?: string;
  }): CalendarType {
    const calendarType = new CalendarType(
      CalendarTypeId.generate(),
      data.businessId,
      data.name,
      data.code,
      data.description,
      data.color,
      data.createdBy || '',
      data.sortOrder || 0,
      data.isActive !== false,
      data.isBuiltin || false,
      data.icon,
    );

    calendarType.validate();
    return calendarType;
  }

  // Reconstruct method (pour les données venant de la base)
  static reconstruct(data: {
    id: string | CalendarTypeId;
    businessId: BusinessId;
    name: string;
    code: string;
    description: string;
    color: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    isBuiltIn?: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): CalendarType {
    return new CalendarType(
      typeof data.id === 'string'
        ? CalendarTypeId.fromString(data.id)
        : data.id,
      data.businessId,
      data.name,
      data.code,
      data.description,
      data.color,
      data.createdBy || '',
      data.sortOrder || 0,
      data.isActive !== false,
      data.isBuiltIn || false,
      data.icon || '',
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }
}
