import { ServiceTypeId } from '../value-objects/service-type-id.value-object';
import { BusinessId } from '../value-objects/business-id.value-object';

export interface ServiceTypeProps {
  readonly id?: ServiceTypeId;
  readonly businessId: BusinessId;
  readonly name: string;
  readonly code: string;
  readonly description?: string;
  readonly isActive?: boolean;
  readonly sortOrder?: number;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class ServiceType {
  private constructor(
    private readonly _id: ServiceTypeId,
    private readonly _businessId: BusinessId,
    private _name: string,
    private _code: string,
    private _description?: string,
    private _isActive: boolean = true,
    private _sortOrder: number = 0,
    private readonly _createdBy?: string,
    private _updatedBy?: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static create(params: {
    businessId: BusinessId;
    name: string;
    code: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    createdBy?: string;
  }): ServiceType {
    const id = ServiceTypeId.generate();
    const now = new Date();

    return new ServiceType(
      id,
      params.businessId,
      params.name,
      params.code.toUpperCase(),
      params.description,
      params.isActive ?? true,
      params.sortOrder ?? 0,
      params.createdBy,
      params.createdBy, // updatedBy = createdBy initially
      now,
      now,
    );
  }

  static reconstruct(props: ServiceTypeProps): ServiceType {
    if (!props.id) {
      throw new Error('ServiceType ID is required for reconstruction');
    }

    return new ServiceType(
      props.id,
      props.businessId,
      props.name,
      props.code,
      props.description,
      props.isActive ?? true,
      props.sortOrder ?? 0,
      props.createdBy,
      props.updatedBy,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  // Getters
  getId(): ServiceTypeId {
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

  getDescription(): string | undefined {
    return this._description;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getSortOrder(): number {
    return this._sortOrder;
  }

  getCreatedBy(): string | undefined {
    return this._createdBy;
  }

  getUpdatedBy(): string | undefined {
    return this._updatedBy;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  update(params: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    updatedBy?: string;
  }): void {
    if (params.name !== undefined) this._name = params.name;
    if (params.code !== undefined) this._code = params.code.toUpperCase();
    if (params.description !== undefined)
      this._description = params.description;
    if (params.isActive !== undefined) this._isActive = params.isActive;
    if (params.sortOrder !== undefined) this._sortOrder = params.sortOrder;
    if (params.updatedBy !== undefined) this._updatedBy = params.updatedBy;

    this._updatedAt = new Date();
  }

  deactivate(updatedBy?: string): void {
    this._isActive = false;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  activate(updatedBy?: string): void {
    this._isActive = true;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  belongsTo(businessId: BusinessId): boolean {
    return this._businessId.equals(businessId);
  }

  // Validation methods
  isValidName(): boolean {
    return this._name.length >= 2 && this._name.length <= 100;
  }

  isValidCode(): boolean {
    return (
      this._code.length >= 2 &&
      this._code.length <= 20 &&
      /^[A-Z0-9_]+$/.test(this._code)
    );
  }

  canBeDeactivated(): boolean {
    // Business rule: can always be deactivated
    return true;
  }

  canBeUpdated(): boolean {
    // Business rule: can be updated if active or inactive
    return true;
  }

  // Serialization
  toJSON(): object {
    return {
      id: this._id.getValue(),
      businessId: this._businessId.getValue(),
      name: this._name,
      code: this._code,
      description: this._description,
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
