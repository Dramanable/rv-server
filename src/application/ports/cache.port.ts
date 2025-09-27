/**
 * 🗄️ CACHE PORT - Interface pour le service de cache
 */

export interface ICacheService {
  /**
   * Stocke une valeur dans le cache avec une durée d'expiration
   */
  set(key: string, value: string, ttlSeconds: number): Promise<void>;

  /**
   * Récupère une valeur du cache
   */
  get(key: string): Promise<string | null>;

  /**
   * Supprime une clé du cache
   */
  delete(key: string): Promise<void>;

  /**
   * Vérifie si une clé existe dans le cache
   */
  exists(key: string): Promise<boolean>;

  /**
   * Supprime toutes les clés correspondant au pattern
   */
  deletePattern(pattern: string): Promise<void>;

  /**
   * Invalide tout le cache d'un utilisateur spécifique
   */
  invalidateUserCache(userId: string): Promise<void>;
}
