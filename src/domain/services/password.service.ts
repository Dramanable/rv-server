/**
 * 🔐 Password Service
 * ✅ Clean Architecture - Domain Layer
 * ✅ Service métier PURE pour la logique des mots de passe
 * ✅ Pas de dépendances externes - logique métier uniquement
 */

import { HashedPassword } from '../value-objects/hashed-password.value-object';
import { DomainError } from '../exceptions/domain.error';

export class PasswordService {
  /**
   * Valide les règles métier d'un mot de passe en clair
   * ✅ DOMAIN LOGIC: Règles de complexité métier
   */
  static validatePlainPassword(plainPassword: string): void {
    if (!plainPassword) {
      throw new DomainError('Password is required');
    }

    if (plainPassword.length < 8) {
      throw new DomainError('Password must be at least 8 characters long');
    }

    if (plainPassword.length > 128) {
      throw new DomainError('Password must not exceed 128 characters');
    }

    // Règles métier de complexité
    const hasUpperCase = /[A-Z]/.test(plainPassword);
    const hasLowerCase = /[a-z]/.test(plainPassword);
    const hasNumbers = /\d/.test(plainPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(plainPassword);

    const complexityCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    if (complexityCount < 3) {
      throw new DomainError(
        'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters'
      );
    }
  }

  /**
   * Valide qu'un hash correspond aux règles métier
   * ✅ DOMAIN LOGIC: Validation métier du hash (pas technique)
   */
  static validateHashedPassword(hashedPassword: HashedPassword): void {
    if (!hashedPassword) {
      throw new DomainError('Hashed password is required');
    }

    // Validation métier : le hash ne doit pas être vide
    if (!hashedPassword.value || hashedPassword.value.trim().length === 0) {
      throw new DomainError('Hashed password cannot be empty');
    }
  }

  /**
   * Compare deux mots de passe hashés (logique métier)
   * ✅ DOMAIN LOGIC: Égalité métier
   */
  static arePasswordsEqual(password1: HashedPassword, password2: HashedPassword): boolean {
    if (!password1 || !password2) {
      return false;
    }

    return password1.equals(password2);
  }
}
