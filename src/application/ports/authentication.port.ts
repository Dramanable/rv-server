/**
 * 🔌 APPLICATION PORT - Authentication Service
 *
 * Interface pour l'authentification et gestion des tokens JWT
 */

import { User } from "../../domain/entities/user.entity";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticationService {
  /**
   * Génère des tokens JWT pour un utilisateur
   */
  generateTokens(user: User): Promise<AuthTokens>;

  /**
   * Valide un access token
   */
  validateAccessToken(token: string): Promise<TokenPayload>;

  /**
   * Valide un refresh token
   */
  validateRefreshToken(token: string): Promise<TokenPayload>;

  /**
   * Refresh les tokens à partir d'un refresh token
   */
  refreshTokens(refreshToken: string): Promise<AuthTokens>;

  /**
   * Révoque un refresh token
   */
  revokeRefreshToken(token: string): Promise<void>;

  /**
   * Révoque tous les tokens d'un utilisateur
   */
  revokeAllUserTokens(userId: string): Promise<void>;
}
