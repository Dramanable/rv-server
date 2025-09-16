/**
 * 🚨 APPLICATION EXCEPTIONS
 *
 * Exceptions spécifiques à la couche Application
 * Gèrent les erreurs d'orchestration et de services
 */

export abstract class ApplicationException extends Error {
  public readonly code: string;
  public readonly i18nKey: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code?: string,
    i18nKey?: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || 'APPLICATION_ERROR';
    this.i18nKey = i18nKey || 'errors.application.general_error';
    this.context = context;
  }
}

/**
 * 🔐 Exception : Échec de génération de mot de passe
 */
export class PasswordGenerationError extends ApplicationException {
  constructor(reason: string, context?: Record<string, any>) {
    super(
      `Password generation failed: ${reason}`,
      'PASSWORD_GENERATION_FAILED',
      'errors.application.password_generation_failed',
      context,
    );
  }
}

/**
 * 📧 Exception : Service d'email indisponible (critique)
 */
export class EmailServiceUnavailableError extends ApplicationException {
  constructor(serviceName: string, error: Error) {
    super(
      `Email service ${serviceName} is unavailable: ${error.message}`,
      'EMAIL_SERVICE_UNAVAILABLE',
      'errors.application.email_service_unavailable',
      { serviceName, originalError: error.message },
    );
  }
}

/**
 * 📋 Exception : Configuration du service d'application invalide
 */
export class ServiceConfigurationError extends ApplicationException {
  constructor(serviceName: string, missingConfig: string[]) {
    super(
      `Service ${serviceName} is misconfigured. Missing: ${missingConfig.join(', ')}`,
      'SERVICE_CONFIGURATION_ERROR',
      'errors.application.service_configuration_error',
      { serviceName, missingConfig },
    );
  }
}

/**
 * 🔄 Exception : Échec d'orchestration de workflow
 */
export class WorkflowOrchestrationError extends ApplicationException {
  constructor(
    workflowName: string,
    step: string,
    reason: string,
    context?: Record<string, any>,
  ) {
    super(
      `Workflow ${workflowName} failed at step ${step}: ${reason}`,
      'WORKFLOW_ORCHESTRATION_ERROR',
      'errors.application.workflow_orchestration_error',
      { workflowName, step, reason, ...context },
    );
  }
}

/**
 * 🎯 Exception : Use Case non trouvé ou invalide
 */
export class UseCaseExecutionError extends ApplicationException {
  constructor(useCaseName: string, reason: string, originalError?: Error) {
    super(
      `UseCase ${useCaseName} execution failed: ${reason}`,
      'USE_CASE_EXECUTION_ERROR',
      'errors.application.use_case_execution_error',
      {
        useCaseName,
        reason,
        originalError: originalError?.message,
        stack: originalError?.stack,
      },
    );
  }
}

/**
 * 🌐 Exception : Externe service timeout ou indisponible
 */
export class ExternalServiceError extends ApplicationException {
  constructor(
    serviceName: string,
    operation: string,
    error: Error,
    retryAttempts?: number,
  ) {
    super(
      `External service ${serviceName} failed during ${operation}: ${error.message}`,
      'EXTERNAL_SERVICE_ERROR',
      'errors.application.external_service_error',
      {
        serviceName,
        operation,
        originalError: error.message,
        retryAttempts: retryAttempts ?? 0,
      },
    );
  }
}

/**
 * 📊 Exception : Validation des données d'application
 */
export class ApplicationValidationError extends ApplicationException {
  constructor(field: string, value: unknown, rule: string) {
    const valueStr = String(value);
    super(
      `Application validation failed for field ${field} with value ${valueStr}: ${rule}`,
      'APPLICATION_VALIDATION_ERROR',
      'errors.application.validation_error',
      { field, value: valueStr, rule },
    );
  }
}

/**
 * 🔒 Exception : Autorisation au niveau application
 */
export class ApplicationAuthorizationError extends ApplicationException {
  constructor(
    resource: string,
    action: string,
    userId: string,
    reason?: string,
  ) {
    super(
      `Application authorization failed: user ${userId} cannot ${action} on ${resource}${reason ? `: ${reason}` : ''}`,
      'APPLICATION_AUTHORIZATION_ERROR',
      'errors.application.authorization_error',
      { resource, action, userId, reason },
    );
  }
}

/**
 * 🎨 Exception : Dépendance manquante ou invalide
 */
export class DependencyInjectionError extends ApplicationException {
  constructor(dependencyName: string, reason: string) {
    super(
      `Dependency injection failed for ${dependencyName}: ${reason}`,
      'DEPENDENCY_INJECTION_ERROR',
      'errors.application.dependency_injection_error',
      { dependencyName, reason },
    );
  }
}

/**
 * 🔐 Exception : Permissions insuffisantes
 */
export class InsufficientPermissionsError extends ApplicationException {
  constructor(
    userId: string,
    requiredPermission: string,
    resource?: string,
    context?: Record<string, any>,
  ) {
    super(
      `User ${userId} lacks permission ${requiredPermission}${resource ? ` for resource ${resource}` : ''}`,
      'INSUFFICIENT_PERMISSIONS',
      'errors.application.insufficient_permissions',
      { userId, requiredPermission, resource, ...context },
    );
  }
}

/**
 * 🏢 Exception : Validation métier Business
 */
export class BusinessValidationError extends ApplicationException {
  constructor(
    field: string,
    value: unknown,
    rule: string,
    businessId?: string,
  ) {
    const valueStr = String(value);
    super(
      `Business validation failed for field ${field} with value ${valueStr}: ${rule}`,
      'BUSINESS_VALIDATION_ERROR',
      'errors.application.business_validation_error',
      { field, value: valueStr, rule, businessId },
    );
  }
}

/**
 * 🏢 Exception : Business non trouvé
 */
export class BusinessNotFoundError extends ApplicationException {
  constructor(
    identifier: string,
    identifierType: 'id' | 'name' | 'email' | 'other' = 'id',
    context?: Record<string, any>,
  ) {
    super(
      `Business not found with ${identifierType}: ${identifier}`,
      'BUSINESS_NOT_FOUND',
      'errors.application.business_not_found',
      { identifier, identifierType, ...context },
    );
  }
}

/**
 * 🏢 Exception : Business existe déjà
 */
export class BusinessAlreadyExistsError extends ApplicationException {
  constructor(
    identifier: string,
    identifierType: 'email' | 'name' | 'siret' | 'other' = 'other',
    context?: Record<string, any>,
  ) {
    super(
      `Business already exists with ${identifierType}: ${identifier}`,
      'BUSINESS_ALREADY_EXISTS',
      'errors.application.business_already_exists',
      { identifier, identifierType, ...context },
    );
  }
}

/**
 * 👥 Exception : Staff validation error
 */
export class StaffValidationError extends ApplicationException {
  constructor(
    field: string,
    value: unknown,
    rule: string,
    staffId?: string,
  ) {
    const valueStr = String(value);
    super(
      `Staff validation failed for field ${field} with value ${valueStr}: ${rule}`,
      'STAFF_VALIDATION_ERROR',
      'errors.application.staff_validation_error',
      { field, value: valueStr, rule, staffId },
    );
  }
}

/**
 * 🛎️ Exception : Service validation error
 */
export class ServiceValidationError extends ApplicationException {
  constructor(
    field: string,
    value: unknown,
    rule: string,
    serviceId?: string,
  ) {
    const valueStr = String(value);
    super(
      `Service validation failed for field ${field} with value ${valueStr}: ${rule}`,
      'SERVICE_VALIDATION_ERROR',
      'errors.application.service_validation_error',
      { field, value: valueStr, rule, serviceId },
    );
  }
}

/**
 * 📅 Exception : Calendar validation error
 */
export class CalendarValidationError extends ApplicationException {
  constructor(
    field: string,
    value: unknown,
    rule: string,
    calendarId?: string,
  ) {
    const valueStr = String(value);
    super(
      `Calendar validation failed for field ${field} with value ${valueStr}: ${rule}`,
      'CALENDAR_VALIDATION_ERROR',
      'errors.application.calendar_validation_error',
      { field, value: valueStr, rule, calendarId },
    );
  }
}

/**
 * 📅 Exception : Appointment validation error
 */
export class AppointmentValidationError extends ApplicationException {
  constructor(
    field: string,
    value: unknown,
    rule: string,
    appointmentId?: string,
  ) {
    const valueStr = String(value);
    super(
      `Appointment validation failed for field ${field} with value ${valueStr}: ${rule}`,
      'APPOINTMENT_VALIDATION_ERROR',
      'errors.application.appointment_validation_error',
      { field, value: valueStr, rule, appointmentId },
    );
  }
}

/**
 * 🔒 Exception : Resource not found
 */
export class ResourceNotFoundError extends ApplicationException {
  constructor(
    resourceType: string,
    resourceId: string,
    context?: Record<string, any>,
  ) {
    super(
      `${resourceType} with ID ${resourceId} not found`,
      'RESOURCE_NOT_FOUND',
      'errors.application.resource_not_found',
      { resourceType, resourceId, ...context },
    );
  }
}

/**
 * ⚠️ Exception : Resource conflict
 */
export class ResourceConflictError extends ApplicationException {
  constructor(
    resourceType: string,
    resourceId: string,
    conflictReason: string,
    context?: Record<string, any>,
  ) {
    super(
      `${resourceType} ${resourceId} conflict: ${conflictReason}`,
      'RESOURCE_CONFLICT',
      'errors.application.resource_conflict',
      { resourceType, resourceId, conflictReason, ...context },
    );
  }
}
