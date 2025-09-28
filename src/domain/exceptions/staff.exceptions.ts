/**
 * 🚨 Staff Domain Exceptions
 *
 * Exceptions spécifiques au domaine Staff
 * Couche Domain - Erreurs métier pures
 */

export class StaffNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StaffNotFoundError';
  }
}

export class StaffAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StaffAlreadyExistsError';
  }
}

export class InvalidStaffOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStaffOperationError';
  }
}

export class StaffPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StaffPermissionError';
  }
}
