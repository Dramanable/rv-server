import type {
  IAuditService,
  AuditOperation,
  AuditQuery,
  AuditEntry,
} from '@application/ports/audit.port';

/**
 * 🚀 Mock Audit Service pour développement
 * ✅ Implémente IAuditService complète
 * ✅ Logging des opérations d'audit
 */
export class MockAuditService implements IAuditService {
  async logOperation(operation: AuditOperation): Promise<void> {
    // Pour le développement, on fait juste un console.log
    console.log('🔍 AUDIT LOG:', {
      operation: operation.operation,
      entityType: operation.entityType,
      entityId: operation.entityId,
      businessId: operation.businessId,
      userId: operation.userId,
      correlationId: operation.correlationId,
      changes: operation.changes,
      timestamp: operation.timestamp.toISOString(),
    });
  }

  async findAuditEntries(query: AuditQuery): Promise<{
    entries: AuditEntry[];
    total: number;
    hasMore: boolean;
  }> {
    console.log('🔍 Mock findAuditEntries called with:', query);
    return {
      entries: [],
      total: 0,
      hasMore: false,
    };
  }

  async getEntityHistory(
    entityType: string,
    entityId: string,
  ): Promise<AuditEntry[]> {
    console.log('🔍 Mock getEntityHistory called for:', {
      entityType,
      entityId,
    });
    return [];
  }

  async getUserActions(
    userId: string,
    options?: {
      businessId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<AuditEntry[]> {
    console.log('🔍 Mock getUserActions called for:', { userId, options });
    return [];
  }

  async verifyIntegrity(options?: {
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
  }> {
    console.log('🔍 Mock verifyIntegrity called with:', options);
    return {
      isValid: true,
      inconsistencies: [],
    };
  }

  async archiveOldEntries(olderThan: Date): Promise<{
    archivedCount: number;
    remainingCount: number;
  }> {
    console.log('🔍 Mock archiveOldEntries called for date:', olderThan);
    return {
      archivedCount: 0,
      remainingCount: 0,
    };
  }

  async exportAuditData(query: AuditQuery): Promise<{
    data: AuditEntry[];
    format: 'json' | 'csv';
    checksum: string;
  }> {
    console.log('🔍 Mock exportAuditData called with:', query);
    return {
      data: [],
      format: 'json',
      checksum: 'mock-checksum',
    };
  }
}
