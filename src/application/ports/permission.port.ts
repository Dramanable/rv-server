export interface IPermissionService {
  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  hasPermission(
    userId: string,
    permission: string,
    context?: Record<string, any>,
  ): Promise<boolean>;

  /**
   * Vérifier si un utilisateur peut gérer les prospects
   */
  canManageProspects(userId: string): Promise<boolean>;

  /**
   * Vérifier si un utilisateur peut voir tous les prospects ou seulement les siens
   */
  canViewAllProspects(userId: string): Promise<boolean>;

  /**
   * Obtenir les prospects visibles pour un utilisateur
   */
  getVisibleProspectFilters(userId: string): Promise<{
    canViewAll: boolean;
    assignedSalesRepFilter?: string;
  }>;
}
