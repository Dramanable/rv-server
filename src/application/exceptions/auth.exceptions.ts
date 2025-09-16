/**
 * 🚨 Application Exceptions - Authentication Use Cases
 *
 * Exceptions spécifiques aux Use Cases d'authentification
 * Ces exceptions sont levées au niveau de la couche Application
 */

export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.context = context;
  }
}

export class InvalidRefreshTokenError extends AuthenticationError {
  constructor(
    message: string = 'Invalid refresh token',
    context?: Record<string, any>,
  ) {
    super(message, 'INVALID_REFRESH_TOKEN', context);
    this.name = 'InvalidRefreshTokenError';
  }
}

export class TokenRepositoryError extends AuthenticationError {
  constructor(
    message: string = 'Token repository operation failed',
    context?: Record<string, any>,
  ) {
    super(message, 'TOKEN_REPOSITORY_ERROR', context);
    this.name = 'TokenRepositoryError';
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(
    message: string = 'Token has expired',
    context?: Record<string, any>,
  ) {
    super(message, 'TOKEN_EXPIRED', context);
    this.name = 'TokenExpiredError';
  }
}

export class UserNotFoundError extends AuthenticationError {
  constructor(
    message: string = 'User not found',
    context?: Record<string, any>,
  ) {
    super(message, 'USER_NOT_FOUND', context);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(
    message: string = 'Invalid credentials',
    context?: Record<string, any>,
  ) {
    super(message, 'INVALID_CREDENTIALS', context);
    this.name = 'InvalidCredentialsError';
  }
}

export class ForbiddenError extends AuthenticationError {
  constructor(
    message: string = 'Access forbidden',
    context?: Record<string, any>,
  ) {
    super(message, 'FORBIDDEN', context);
    this.name = 'ForbiddenError';
  }
}
