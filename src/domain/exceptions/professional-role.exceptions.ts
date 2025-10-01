/**
 * 🏥 DOMAIN EXCEPTIONS - ProfessionalRole
 * Clean Architecture - Domain Layer
 * Exceptions métier pour les rôles professionnels
 */

export class ProfessionalRoleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfessionalRoleException";
  }
}

export class ProfessionalRoleNotFoundError extends ProfessionalRoleException {
  constructor(identifier: string) {
    super(`Professional role not found: ${identifier}`);
    this.name = "ProfessionalRoleNotFoundError";
  }
}

export class ProfessionalRoleCodeAlreadyExistsError extends ProfessionalRoleException {
  constructor(code: string) {
    super(`Professional role code already exists: ${code}`);
    this.name = "ProfessionalRoleCodeAlreadyExistsError";
  }
}

export class ProfessionalRoleValidationError extends ProfessionalRoleException {
  constructor(message: string) {
    super(`Professional role validation error: ${message}`);
    this.name = "ProfessionalRoleValidationError";
  }
}

export class ProfessionalRoleInUseError extends ProfessionalRoleException {
  constructor(roleCode: string) {
    super(
      `Cannot delete professional role ${roleCode}: it is currently in use`,
    );
    this.name = "ProfessionalRoleInUseError";
  }
}
