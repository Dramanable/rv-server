/**
 * 🔐 TYPES POUR L'AUTHENTIFICATION
 *
 * Types centralisés pour le système d'authentification JWT
 * Gestion des tokens, cookies, et sessions sécurisées
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // en secondes
    refreshExpiresIn: number; // en secondes
  };
}

export interface GetCurrentUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken?: string; // Depuis cookie ou body
  deviceId?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface LogoutRequest {
  refreshToken?: string;
  logoutAll?: boolean; // Déconnecter tous les appareils
  userAgent?: string; // User-Agent pour traçage
  ipAddress?: string; // IP pour audit trail
}

export interface CookieConfig {
  accessTokenCookie: {
    name: string;
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    domain?: string;
    path: string;
  };
  refreshTokenCookie: {
    name: string;
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax" | "none";
    domain?: string;
    path: string;
  };
}

export interface JWTPayload {
  sub: string; // User ID
  email: string; // User Email
  iat?: number;
  exp?: number;
}

export interface DeviceSession {
  id: string;
  userId: string;
  deviceId?: string;
  userAgent?: string;
  ip?: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
}

export interface SecurityContext {
  requestId: string;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
  environment: "development" | "staging" | "production";
  securityHeaders?: Record<string, string>;
}
