/**
 * 🔌 APPLICATION PORT - Audit Service Interface
 *
 * Interface pour l'audit trail des opérations critiques.
 * Obligatoire pour applications d'entreprise avec traçabilité complète.
 */

export interface AuditOperation {
  readonly operation: string; // Type d'opération (CREATE_SKILL, UPDATE_USER, etc.)
  readonly entityType: string; // Type d'entité affectée
  readonly entityId: string; // ID de l'entité
  readonly businessId?: string; // Context business (multi-tenant)
  readonly userId: string; // Utilisateur qui effectue l'action
  readonly correlationId: string; // ID de traçabilité unique
  readonly changes: {
    // Détails des changements
    readonly created?: any; // Données créées
    readonly updated?: {
      // Données mises à jour
      readonly before?: any;
      readonly after?: any;
    };
    readonly deleted?: any; // Données supprimées
  };
  readonly metadata?: {
    // Métadonnées contextuelles
    readonly clientIp?: string;
    readonly userAgent?: string;
    readonly sessionId?: string;
    readonly [key: string]: any;
  };
  readonly timestamp: Date; // Horodatage précis
}

export interface AuditQuery {
  readonly entityType?: string;
  readonly entityId?: string;
  readonly businessId?: string;
  readonly userId?: string;
  readonly operation?: string;
  readonly correlationId?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly limit?: number;
  readonly offset?: number;
}

export interface AuditEntry extends AuditOperation {
  readonly id: string; // ID unique de l'entrée d'audit
  readonly createdAt: Date; // Timestamp de création de l'audit
}

export interface IAuditService {
  /**
   * Enregistrer une opération d'audit
   */
  logOperation(operation: AuditOperation): Promise<void>;

  /**
   * Rechercher les entrées d'audit avec filtres
   */
  findAuditEntries(query: AuditQuery): Promise<{
    entries: AuditEntry[];
    total: number;
    hasMore: boolean;
  }>;

  /**
   * Récupérer l'historique complet d'une entité
   */
  getEntityHistory(entityType: string, entityId: string): Promise<AuditEntry[]>;

  /**
   * Récupérer les actions d'un utilisateur
   */
  getUserActions(
    userId: string,
    options?: {
      businessId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<AuditEntry[]>;

  /**
   * Vérifier l'intégrité de l'audit trail
   */
  verifyIntegrity(options?: {
    entityType?: string;
    businessId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    isValid: boolean;
    inconsistencies: Array<{
      type: string;
      description: string;
      affectedRecords: string[];
    }>;
  }>;

  /**
   * Archiver les anciennes entrées d'audit
   */
  archiveOldEntries(olderThan: Date): Promise<{
    archivedCount: number;
    remainingCount: number;
  }>;

  /**
   * Exporter les données d'audit pour compliance
   */
  exportAuditData(query: AuditQuery): Promise<{
    data: AuditEntry[];
    format: 'json' | 'csv';
    checksum: string;
  }>;
}
