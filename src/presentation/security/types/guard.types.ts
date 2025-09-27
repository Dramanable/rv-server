/**
 * 🔐 Types pour les Guards de Sécurité
 *
 * Types TypeScript stricts pour l'authentification et l'autorisation
 * Élimination des warnings ESLint et garantie de type safety
 */

/**
 * Interface pour l'utilisateur authentifié dans les guards
 */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string | { value: string };
  readonly role: string;
  readonly isActive: boolean;
  readonly isVerified: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Interface pour les erreurs d'authentification
 */
export interface AuthenticationError {
  readonly message: string;
  readonly name: string;
  readonly code?: string;
  readonly details?: unknown;
}

/**
 * Type guard pour vérifier si un objet est un utilisateur authentifié valide
 */
export function isAuthenticatedUser(data: unknown): data is AuthenticatedUser {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    'role' in data &&
    'isActive' in data &&
    'isVerified' in data &&
    'createdAt' in data &&
    'updatedAt' in data &&
    typeof (data as { id: unknown }).id === 'string' &&
    (typeof (data as { email: unknown }).email === 'string' ||
      (typeof (data as { email: unknown }).email === 'object' &&
        (data as { email: unknown }).email !== null &&
        'value' in (data as { email: { value: unknown } }).email &&
        typeof (data as { email: { value: unknown } }).email.value ===
          'string')) &&
    typeof (data as { role: unknown }).role === 'string' &&
    typeof (data as { isActive: unknown }).isActive === 'boolean' &&
    typeof (data as { isVerified: unknown }).isVerified === 'boolean' &&
    (data as { createdAt: unknown }).createdAt instanceof Date &&
    (data as { updatedAt: unknown }).updatedAt instanceof Date
  );
}

/**
 * Type guard pour vérifier si un objet est une erreur d'authentification
 */
export function isAuthenticationError(
  error: unknown,
): error is AuthenticationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'name' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    typeof (error as { name: unknown }).name === 'string'
  );
}

/**
 * Interface pour le payload JWT décodé
 */
export interface JwtPayload {
  readonly sub: string; // User ID
  readonly email: string;
  readonly role: string;
  readonly iat: number;
  readonly exp: number;
}

/**
 * Type guard pour vérifier si un objet est un payload JWT valide
 */
export function isJwtPayload(data: unknown): data is JwtPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    'sub' in data &&
    'email' in data &&
    'role' in data &&
    'iat' in data &&
    'exp' in data &&
    typeof (data as { sub: unknown }).sub === 'string' &&
    typeof (data as { email: unknown }).email === 'string' &&
    typeof (data as { role: unknown }).role === 'string' &&
    typeof (data as { iat: unknown }).iat === 'number' &&
    typeof (data as { exp: unknown }).exp === 'number'
  );
}
