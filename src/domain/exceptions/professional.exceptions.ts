/**
 * �‍⚕️ PROFESSIONAL EXCEPTIONS
 * ✅ Clean Architecture - Domain Layer
 *
 * Exceptions spécifiques aux règles métier des professionnels.
 */

export class ProfessionalException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'PROFESSIONAL_ERROR',
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ProfessionalException';
  }
}

export class ProfessionalValidationError extends ProfessionalException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'PROFESSIONAL_VALIDATION_ERROR', context);
    this.name = 'ProfessionalValidationError';
  }
}

export class ProfessionalNotFoundError extends ProfessionalException {
  constructor(professionalId: string) {
    super('Professional not found', 'PROFESSIONAL_NOT_FOUND', {
      professionalId,
    });
    this.name = 'ProfessionalNotFoundError';
  }
}

export class ProfessionalNotActiveError extends ProfessionalException {
  constructor(professionalId: string, context?: Record<string, unknown>) {
    super(
      `Professional with id ${professionalId} is not active`,
      'PROFESSIONAL_NOT_ACTIVE',
      { professionalId, ...context },
    );
    this.name = 'ProfessionalNotActiveError';
  }
}

export class ProfessionalNotVerifiedError extends ProfessionalException {
  constructor(professionalId: string, context?: Record<string, unknown>) {
    super(
      `Professional with id ${professionalId} is not verified`,
      'PROFESSIONAL_NOT_VERIFIED',
      { professionalId, ...context },
    );
    this.name = 'ProfessionalNotVerifiedError';
  }
}

export class ProfessionalNotInBusinessError extends ProfessionalException {
  constructor(
    professionalId: string,
    businessId: string,
    context?: Record<string, unknown>,
  ) {
    super(
      `Professional ${professionalId} does not belong to business ${businessId}`,
      'PROFESSIONAL_NOT_IN_BUSINESS',
      { professionalId, businessId, ...context },
    );
    this.name = 'ProfessionalNotInBusinessError';
  }
}

export class ProfessionalLicenseDuplicateError extends ProfessionalException {
  constructor(licenseNumber: string, context?: Record<string, unknown>) {
    super(
      `Professional license number ${licenseNumber} is already in use`,
      'PROFESSIONAL_LICENSE_DUPLICATE',
      { licenseNumber, ...context },
    );
    this.name = 'ProfessionalLicenseDuplicateError';
  }
}
