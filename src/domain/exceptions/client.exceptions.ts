/**
 * 👤 CLIENT EXCEPTIONS
 * ✅ Clean Architecture - Domain Layer
 *
 * Exceptions spécifiques aux règles métier des clients.
 */

export class ClientException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'CLIENT_ERROR',
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ClientException';
  }
}

export class ClientValidationError extends ClientException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CLIENT_VALIDATION_ERROR', context);
    this.name = 'ClientValidationError';
  }
}

export class ClientNotFoundError extends ClientException {
  constructor(clientId: string, context?: Record<string, unknown>) {
    super(`Client with id ${clientId} not found`, 'CLIENT_NOT_FOUND', {
      clientId,
      ...context,
    });
    this.name = 'ClientNotFoundError';
  }
}

export class ClientBusinessRuleError extends ClientException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CLIENT_BUSINESS_RULE_ERROR', context);
    this.name = 'ClientBusinessRuleError';
  }
}

export class ClientAlreadyExistsError extends ClientException {
  constructor(
    email: string,
    businessId: string,
    context?: Record<string, unknown>,
  ) {
    super(
      `Client with email ${email} already exists for business ${businessId}`,
      'CLIENT_ALREADY_EXISTS',
      { email, businessId, ...context },
    );
    this.name = 'ClientAlreadyExistsError';
  }
}
