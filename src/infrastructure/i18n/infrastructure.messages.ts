/**
 * 🌍 INFRASTRUCTURE I18N - Messages pour les opérations d'infrastructure
 */

export const infrastructureMessages = {
  en: {
    infrastructure: {
      cache: {
        connection_established: 'Cache connection established successfully',
        connection_failed: 'Failed to establish cache connection',
        reconnecting: 'Attempting to reconnect to cache',
        operation_success: 'Cache operation completed successfully',
        operation_failed: 'Cache operation failed',
        set_success: 'Value stored in cache successfully',
        set_failed: 'Failed to store value in cache',
        get_success: 'Value retrieved from cache successfully',
        get_failed: 'Failed to retrieve value from cache',
        delete_success: 'Key deleted from cache successfully',
        delete_failed: 'Failed to delete key from cache',
        pattern_delete_success: 'Pattern deleted from cache successfully',
        pattern_delete_failed: 'Failed to delete pattern from cache',
        user_cache_invalidated: 'User cache invalidated successfully',
        user_cache_invalidation_failed: 'Failed to invalidate user cache',
        invalid_user_id: 'Invalid user ID provided for cache operation',
      },
    },
  },
  fr: {
    infrastructure: {
      cache: {
        connection_established: 'Connexion au cache établie avec succès',
        connection_failed: 'Échec de la connexion au cache',
        reconnecting: 'Tentative de reconnexion au cache',
        operation_success: 'Opération de cache terminée avec succès',
        operation_failed: "Échec de l'opération de cache",
        set_success: 'Valeur stockée dans le cache avec succès',
        set_failed: 'Échec du stockage de la valeur dans le cache',
        get_success: 'Valeur récupérée du cache avec succès',
        get_failed: 'Échec de la récupération de la valeur du cache',
        delete_success: 'Clé supprimée du cache avec succès',
        delete_failed: 'Échec de la suppression de la clé du cache',
        pattern_delete_success: 'Pattern supprimé du cache avec succès',
        pattern_delete_failed: 'Échec de la suppression du pattern du cache',
        user_cache_invalidated: 'Cache utilisateur invalidé avec succès',
        user_cache_invalidation_failed:
          "Échec de l'invalidation du cache utilisateur",
        invalid_user_id:
          "ID utilisateur invalide fourni pour l'opération de cache",
      },
    },
  },
} as const;
