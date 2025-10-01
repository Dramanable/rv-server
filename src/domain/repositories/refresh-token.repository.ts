/**
 * 🔐 DOMAIN REPOSITORY - Refresh Token Repository Interface
 *
 * Interface repository pour la gestion des tokens de rafraîchissement JWT.
 * Définit les contrats de persistance pour l'authentification sécurisée.
 *
 * CLEAN ARCHITECTURE :
 * - Interface domaine pure (indépendante de l'infrastructure)
 * - Implémentation dans la couche infrastructure
 * - Utilisée par les Use Cases via injection de dépendance
 */

import { RefreshToken } from "../entities/refresh-token.entity";

export const REFRESH_TOKEN_REPOSITORY = "REFRESH_TOKEN_REPOSITORY";

export interface RefreshTokenRepository {
  /**
   * Sauvegarde un refresh token
   */
  save(token: RefreshToken): Promise<RefreshToken>;

  /**
   * Trouve un token par sa valeur hashée
   */
  findByToken(tokenHash: string): Promise<RefreshToken | null>;

  /**
   * Trouve tous les tokens d'un utilisateur
   */
  findByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * Révoque tous les tokens d'un utilisateur
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Révoque tous les tokens d'un utilisateur (alias pour deleteByUserId)
   */
  revokeAllByUserId(userId: string): Promise<void>;

  /**
   * Révoque un token spécifique
   */
  revokeByToken(tokenHash: string): Promise<void>;

  /**
   * Supprime tous les tokens expirés et révoqués
   * @returns Nombre de tokens supprimés
   */
  deleteExpiredTokens(): Promise<number>;
}
