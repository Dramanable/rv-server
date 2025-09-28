/**
 * Permission Entity
 * Represents a permission in the domain layer
 * Clean Architecture - Domain Layer - Pure business logic
 */

export interface CreatePermissionProps {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: string;
  readonly isSystemPermission: boolean;
}

export interface UpdatePermissionProps {
  readonly displayName?: string;
  readonly description?: string;
  readonly isActive?: boolean;
}

export interface PermissionJSON {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly category: string;
  readonly isSystemPermission: boolean;
  readonly isActive: boolean;
  readonly canBeDeleted: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class Permission {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private _displayName: string,
    private _description: string,
    private readonly _category: string,
    private readonly _isSystemPermission: boolean,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    this.validateBusinessRules();
  }

  /**
   * Creates a new Permission
   */
  static create(props: CreatePermissionProps): Permission {
    const now = new Date();

    return new Permission(
      props.id,
      props.name,
      props.displayName,
      props.description,
      props.category,
      props.isSystemPermission,
      true, // Always active by default
      now,
      now,
    );
  }

  /**
   * Reconstructs Permission from persistence
   */
  static reconstruct(
    id: string,
    name: string,
    displayName: string,
    description: string,
    category: string,
    isSystemPermission: boolean,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): Permission {
    return new Permission(
      id,
      name,
      displayName,
      description,
      category,
      isSystemPermission,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  /**
   * Updates permission properties
   */
  update(props: UpdatePermissionProps): void {
    if (this._isSystemPermission && props.isActive === false) {
      throw new Error('System permissions cannot be deactivated');
    }

    if (props.displayName !== undefined) {
      this.validateDisplayName(props.displayName);
      this._displayName = props.displayName;
    }

    if (props.description !== undefined) {
      this.validateDescription(props.description);
      this._description = props.description;
    }

    if (props.isActive !== undefined) {
      this._isActive = props.isActive;
    }

    this._updatedAt = new Date();
  }

  /**
   * Activates the permission
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivates the permission
   */
  deactivate(): void {
    if (this._isSystemPermission) {
      throw new Error('System permissions cannot be deactivated');
    }

    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Checks if permission belongs to a specific category
   */
  belongsToCategory(category: string): boolean {
    return this._category === category;
  }

  /**
   * Checks if permission can be deleted
   */
  canBeDeleted(): boolean {
    return !this._isSystemPermission;
  }

  /**
   * Validates all business rules
   */
  private validateBusinessRules(): void {
    this.validateName(this._name);
    this.validateDisplayName(this._displayName);
    this.validateDescription(this._description);
    this.validateCategory(this._category);
  }

  /**
   * Validates permission name
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Permission name must be between 2 and 100 characters');
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      throw new Error('Permission name must be between 2 and 100 characters');
    }

    // Permission names should be uppercase with underscores
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
      throw new Error(
        'Permission name must be uppercase with underscores (e.g., MANAGE_APPOINTMENTS)',
      );
    }
  }

  /**
   * Validates display name
   */
  private validateDisplayName(displayName: string): void {
    if (!displayName || displayName.trim().length === 0) {
      throw new Error(
        'Permission display name must be between 2 and 200 characters',
      );
    }

    if (displayName.trim().length < 2 || displayName.trim().length > 200) {
      throw new Error(
        'Permission display name must be between 2 and 200 characters',
      );
    }
  }

  /**
   * Validates description
   */
  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Permission description is required');
    }

    if (description.trim().length < 5 || description.trim().length > 500) {
      throw new Error(
        'Permission description must be between 5 and 500 characters',
      );
    }
  }

  /**
   * Validates category
   */
  private validateCategory(category: string): void {
    if (!category || category.trim().length === 0) {
      throw new Error('Permission category is required');
    }

    if (category.trim().length < 2 || category.trim().length > 50) {
      throw new Error(
        'Permission category must be between 2 and 50 characters',
      );
    }
  }

  /**
   * Converts to JSON representation
   */
  toJSON(): PermissionJSON {
    return {
      id: this._id,
      name: this._name,
      displayName: this._displayName,
      description: this._description,
      category: this._category,
      isSystemPermission: this._isSystemPermission,
      isActive: this._isActive,
      canBeDeleted: this.canBeDeleted(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  // Getters
  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getDisplayName(): string {
    return this._displayName;
  }

  getDescription(): string {
    return this._description;
  }

  getCategory(): string {
    return this._category;
  }

  isSystemPermission(): boolean {
    return this._isSystemPermission;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }
}
