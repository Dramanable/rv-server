/**
 * 💾 User Cache Port - Application Layer
 * ✅ Interface pour le stockage des utilisateurs en cache
 * ✅ Clean Architecture - Port pour l'infrastructure
 */

import type { User } from '../../domain/entities/user.entity';

export interface IUserCache {
  /**
   * 💾 Stocker un utilisateur en cache
   * @param userId - ID de l'utilisateur
   * @param user - Entité utilisateur à stocker
   * @param ttlMinutes - Durée de vie en minutes (optionnel)
   */
  storeUser(userId: string, user: User, ttlMinutes?: number): Promise<void>;

  /**
   * 🔍 Récupérer un utilisateur du cache
   * @param userId - ID de l'utilisateur
   * @returns Utilisateur ou null si non trouvé
   */
  getUser(userId: string): Promise<User | null>;

  /**
   * 🗑️ Supprimer un utilisateur du cache
   * @param userId - ID de l'utilisateur
   */
  removeUser(userId: string): Promise<void>;

  /**
   * 🔄 Rafraîchir TTL d'un utilisateur en cache
   * @param userId - ID de l'utilisateur
   * @param ttlMinutes - Nouvelle durée de vie en minutes
   */
  refreshUserTTL(userId: string, ttlMinutes?: number): Promise<boolean>;

  /**
   * ⚡ Vérifier si un utilisateur existe en cache
   * @param userId - ID de l'utilisateur
   */
  exists(userId: string): Promise<boolean>;

  /**
   * 🧹 Nettoyer le cache (pour les tests)
   */
  clear(): Promise<void>;
}
