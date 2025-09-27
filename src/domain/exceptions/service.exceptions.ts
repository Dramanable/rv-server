import { DomainException } from "./domain.exception";

/**
 * 🏢 DOMAIN EXCEPTION - Service Related Errors
 *
 * Service domain-specific exceptions
 */

export class ServiceError extends DomainException {
  constructor(message: string, code: string = "SERVICE_ERROR") {
    super(message, code);
  }
}

export class ServiceNotFoundError extends ServiceError {
  constructor(message: string = "Service not found") {
    super(message, "SERVICE_NOT_FOUND");
  }
}

export class ServiceAlreadyExistsError extends ServiceError {
  constructor(message: string = "Service already exists") {
    super(message, "SERVICE_ALREADY_EXISTS");
  }
}

export class ServiceValidationError extends ServiceError {
  constructor(message: string = "Service validation error") {
    super(message, "SERVICE_VALIDATION_ERROR");
  }
}

export class ServiceInactiveError extends ServiceError {
  constructor(message: string = "Service is inactive") {
    super(message, "SERVICE_INACTIVE");
  }
}

export class ServiceNotBookableError extends ServiceError {
  constructor(message: string = "Service is not bookable") {
    super(message, "SERVICE_NOT_BOOKABLE");
  }
}

export class ServiceRequirementsNotMetError extends ServiceError {
  constructor(message: string = "Service requirements not met") {
    super(message, "SERVICE_REQUIREMENTS_NOT_MET");
  }
}

export class ServiceStaffAssignmentError extends ServiceError {
  constructor(message: string = "Service staff assignment error") {
    super(message, "SERVICE_STAFF_ASSIGNMENT_ERROR");
  }
}
