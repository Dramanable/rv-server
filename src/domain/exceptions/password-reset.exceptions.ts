import { DomainException } from './domain.exception';

export class UserNotFoundForPasswordResetError extends DomainException {
  constructor(email: string) {
    super(
      `User not found for password reset: ${email}`,
      'DOMAIN.PASSWORD_RESET.USER_NOT_FOUND',
    );
  }
}

export class InvalidEmailForPasswordResetError extends DomainException {
  constructor(email: string) {
    super(
      `Invalid email for password reset: ${email}`,
      'DOMAIN.PASSWORD_RESET.INVALID_EMAIL',
    );
  }
}
