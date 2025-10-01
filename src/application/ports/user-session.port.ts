/**
 * 👤 USER SESSION PORT - Interface pour la gestion des sessions utilisateur
 */

import { User } from "../../domain/entities/user.entity";

export interface IUserSessionService {
  /**
   * Stocke un utilisateur en session Redis
   */
  storeUserSession(userId: string, user: User): Promise<void>;

  /**
   * Récupère un utilisateur depuis Redis
   */
  getUserSession(userId: string): Promise<User | null>;

  /**
   * Supprime la session d'un utilisateur
   */
  removeUserSession(userId: string): Promise<void>;

  /**
   * Supprime toutes les sessions d'un utilisateur (multi-device)
   */
  removeAllUserSessions(userId: string): Promise<void>;

  /**
   * Vérifie si une session utilisateur existe
   */
  hasUserSession(userId: string): Promise<boolean>;

  /**
   * Met à jour l'expiration d'une session
   */
  refreshUserSession(userId: string): Promise<void>;
}
