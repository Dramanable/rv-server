import { DomainException } from './domain.exception';

export class ServiceTypeException extends DomainException {
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, code, context);
  }
}

export class ServiceTypeValidationError extends ServiceTypeException {
  constructor(
    message: string,
    field?: string,
    context?: Record<string, unknown>,
  ) {
    const errorContext = { ...context, field };
    super(message, 'SERVICE_TYPE_VALIDATION_ERROR', errorContext);
  }
}

export class ServiceTypeNotFoundError extends ServiceTypeException {
  constructor(serviceTypeId: string, context?: Record<string, unknown>) {
    const errorContext = { ...context, serviceTypeId };
    super(
      `ServiceType with ID ${serviceTypeId} not found`,
      'SERVICE_TYPE_NOT_FOUND',
      errorContext,
    );
  }
}

export class ServiceTypeNameConflictError extends ServiceTypeException {
  constructor(
    name: string,
    businessId: string,
    context?: Record<string, unknown>,
  ) {
    const errorContext = { ...context, name, businessId };
    super(
      `ServiceType with name "${name}" already exists in business ${businessId}`,
      'SERVICE_TYPE_NAME_CONFLICT',
      errorContext,
    );
  }
}

export class ServiceTypeCodeConflictError extends ServiceTypeException {
  constructor(
    code: string,
    businessId: string,
    context?: Record<string, unknown>,
  ) {
    const errorContext = { ...context, code, businessId };
    super(
      `ServiceType with code "${code}" already exists in business ${businessId}`,
      'SERVICE_TYPE_CODE_CONFLICT',
      errorContext,
    );
  }
}

export class ServiceTypeInUseError extends ServiceTypeException {
  constructor(
    serviceTypeId: string,
    usage: string,
    context?: Record<string, unknown>,
  ) {
    const errorContext = { ...context, serviceTypeId, usage };
    super(
      `ServiceType ${serviceTypeId} cannot be deleted because it is in use: ${usage}`,
      'SERVICE_TYPE_IN_USE',
      errorContext,
    );
  }
}

export class ServiceTypeOperationNotAllowedError extends ServiceTypeException {
  constructor(
    operation: string,
    reason: string,
    context?: Record<string, unknown>,
  ) {
    const errorContext = { ...context, operation, reason };
    super(
      `ServiceType operation "${operation}" not allowed: ${reason}`,
      'SERVICE_TYPE_OPERATION_NOT_ALLOWED',
      errorContext,
    );
  }
}
