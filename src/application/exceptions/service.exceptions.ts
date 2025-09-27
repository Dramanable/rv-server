/**
 * 🛎️ Service Domain Exceptions
 *
 * Exceptions spécifiques au domaine Service avec support i18n
 */

export class InvalidServiceDataError extends Error {
  public readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'InvalidServiceDataError';
    this.field = field;
  }
}

export class ServiceNotFoundError extends Error {
  public readonly serviceId: string;

  constructor(serviceId: string) {
    super(`Service with ID '${serviceId}' not found`);
    this.name = 'ServiceNotFoundError';
    this.serviceId = serviceId;
  }
}

export class ServiceAlreadyExistsError extends Error {
  public readonly serviceName: string;
  public readonly businessId: string;

  constructor(serviceName: string, businessId: string) {
    super(
      `Service '${serviceName}' already exists in business '${businessId}'`,
    );
    this.name = 'ServiceAlreadyExistsError';
    this.serviceName = serviceName;
    this.businessId = businessId;
  }
}

export class ServiceInactiveError extends Error {
  public readonly serviceId: string;

  constructor(serviceId: string) {
    super(`Service with ID '${serviceId}' is inactive`);
    this.name = 'ServiceInactiveError';
    this.serviceId = serviceId;
  }
}

export class InvalidPricingError extends Error {
  public readonly amount: number;
  public readonly currency: string;

  constructor(amount: number, currency: string, reason?: string) {
    const message = reason
      ? `Invalid pricing ${amount} ${currency}: ${reason}`
      : `Invalid pricing: ${amount} ${currency}`;
    super(message);
    this.name = 'InvalidPricingError';
    this.amount = amount;
    this.currency = currency;
  }
}

export class ServiceUnavailableError extends Error {
  public readonly serviceId: string;
  public readonly requestedDate: Date;

  constructor(serviceId: string, requestedDate: Date, reason?: string) {
    const message = reason
      ? `Service '${serviceId}' unavailable on ${requestedDate.toISOString()}: ${reason}`
      : `Service '${serviceId}' unavailable on ${requestedDate.toISOString()}`;
    super(message);
    this.name = 'ServiceUnavailableError';
    this.serviceId = serviceId;
    this.requestedDate = requestedDate;
  }
}
