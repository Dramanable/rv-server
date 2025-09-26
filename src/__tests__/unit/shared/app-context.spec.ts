/**
 * 🧪 Tests du AppContext
 *
 * Démontre l'utilisation et les avantages du pattern AppContext
 */

import { AppContextFactory } from '@shared/context/app-context';

describe('AppContext Pattern', () => {
  describe('Builder Pattern', () => {
    it('devrait créer un context simple avec opération', () => {
      // Act
      const context = AppContextFactory.simple('TestOperation', 'user-123');

      // Assert
      expect(context.operation).toBe('TestOperation');
      expect(context.requestingUserId).toBe('user-123');
      expect(context.correlationId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(context.operationId).toMatch(/^op_TestOperation_\d+_[a-z0-9]+$/);
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.startTime).toBeGreaterThan(0);
    });

    it('devrait créer un context auth avec informations client', () => {
      // Arrange
      const clientInfo = {
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        deviceId: 'device-abc123',
      };

      // Act
      const context = AppContextFactory.auth(
        'Login',
        'user@test.com',
        clientInfo,
      );

      // Assert
      expect(context.operation).toBe('Login');
      expect(context.ipAddress).toBe('192.168.1.100');
      expect(context.userAgent).toBe(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      );
      expect(context.deviceId).toBe('device-abc123');
      expect(context.metadata?.email).toBe('user@test.com');
    });

    it('devrait créer un context pour opération utilisateur', () => {
      // Act
      const context = AppContextFactory.userOperation(
        'UpdateUser',
        'admin-123',
        'user-456',
      );

      // Assert
      expect(context.operation).toBe('UpdateUser');
      expect(context.requestingUserId).toBe('admin-123');
      expect(context.targetUserId).toBe('user-456');
    });

    it('devrait permettre de construire un context complexe avec builder', () => {
      // Act
      const context = AppContextFactory.create()
        .operation('ComplexOperation')
        .requestingUser('user-123', 'ADMIN')
        .targetUser('user-456')
        .clientInfo('10.0.0.1', 'Chrome/91.0', 'mobile-device-789')
        .session('session-abc')
        .tenant('tenant-corp')
        .organization('org-enterprise')
        .metadata('priority', 'high')
        .metadata('source', 'web-app')
        .build();

      // Assert
      expect(context.operation).toBe('ComplexOperation');
      expect(context.requestingUserId).toBe('user-123');
      expect(context.userRole).toBe('ADMIN');
      expect(context.targetUserId).toBe('user-456');
      expect(context.ipAddress).toBe('10.0.0.1');
      expect(context.userAgent).toBe('Chrome/91.0');
      expect(context.deviceId).toBe('mobile-device-789');
      expect(context.sessionId).toBe('session-abc');
      expect(context.tenantId).toBe('tenant-corp');
      expect(context.organizationId).toBe('org-enterprise');
      expect(context.metadata?.priority).toBe('high');
      expect(context.metadata?.source).toBe('web-app');
    });
  });

  describe('Validation', () => {
    it('devrait rejeter un context sans opération', () => {
      // Act & Assert
      expect(() => {
        AppContextFactory.create().requestingUser('user-123').build();
      }).toThrow('Operation name is required');
    });
  });

  describe('Identifiants uniques', () => {
    it('devrait générer des correlationId uniques', () => {
      // Act
      const context1 = AppContextFactory.simple('Op1', 'user1');
      const context2 = AppContextFactory.simple('Op2', 'user2');

      // Assert
      expect(context1.correlationId).not.toBe(context2.correlationId);
    });

    it('devrait générer des operationId uniques même pour la même opération', () => {
      // Act
      const context1 = AppContextFactory.simple('SameOp', 'user1');
      const context2 = AppContextFactory.simple('SameOp', 'user2');

      // Assert
      expect(context1.operationId).not.toBe(context2.operationId);
      expect(context1.operationId).toContain('SameOp');
      expect(context2.operationId).toContain('SameOp');
    });
  });

  describe("Exemples d'utilisation pratique", () => {
    it('devrait créer un context pour audit de sécurité', () => {
      // Simulate: Admin user trying to delete another user from suspicious IP
      const context = AppContextFactory.create()
        .operation('DeleteUser')
        .requestingUser('admin-suspicious', 'SUPER_ADMIN')
        .targetUser('important-user-123')
        .clientInfo('198.51.100.42', 'Unknown Browser', 'unknown-device')
        .metadata('riskLevel', 'HIGH')
        .metadata('reason', 'suspicious_activity')
        .metadata('escalated', true)
        .build();

      // Ce context peut être utilisé pour:
      // 1. Logging détaillé de sécurité
      // 2. Alertes automatiques
      // 3. Audit trail forensique
      // 4. Blocage temporaire si nécessaire

      expect(context.metadata?.riskLevel).toBe('HIGH');
      expect(context.metadata?.escalated).toBe(true);
      expect(context.ipAddress).toBe('198.51.100.42');
    });

    it('devrait créer un context pour opération multi-tenant', () => {
      // Simulate: User in enterprise tenant performing bulk operation
      const context = AppContextFactory.create()
        .operation('BulkUserImport')
        .requestingUser('hr-manager-456', 'HR_MANAGER')
        .tenant('enterprise-corp')
        .organization('department-hr')
        .clientInfo('203.0.113.15', 'Chrome/99.0', 'workstation-hr-01')
        .metadata('batchSize', 500)
        .metadata('importSource', 'active_directory')
        .metadata('validationRules', ['email_required', 'unique_employee_id'])
        .build();

      // Ce context permet:
      // 1. Isolation des données par tenant
      // 2. Tracking des opérations bulk
      // 3. Audit par organisation
      // 4. Monitoring des performances

      expect(context.tenantId).toBe('enterprise-corp');
      expect(context.organizationId).toBe('department-hr');
      expect(context.metadata?.batchSize).toBe(500);
    });

    it('devrait créer un context pour debugging distribué', () => {
      // Simulate: Complex operation spanning multiple services
      const parentTraceId = 'trace-abc123-def456';

      const context = AppContextFactory.create()
        .operation('ProcessPayment')
        .requestingUser('customer-789')
        .clientInfo('192.168.1.50', 'Mobile App 2.1', 'phone-xyz')
        .session('session-payment-flow')
        .metadata('traceId', parentTraceId)
        .metadata('parentSpanId', 'span-payment-init')
        .metadata('serviceName', 'user-service')
        .metadata('serviceVersion', '1.2.3')
        .metadata('requestId', 'req-payment-789')
        .build();

      // Ce context permet:
      // 1. Correlation entre services
      // 2. Debugging distribué
      // 3. Performance monitoring
      // 4. Error tracking cross-service

      expect(context.metadata?.traceId).toBe(parentTraceId);
      expect(context.sessionId).toBe('session-payment-flow');
    });
  });

  describe('Intégration avec Use Cases', () => {
    it('devrait fournir un context riche pour logging', () => {
      // Arrange - Simuler une requête de modification de profil
      const context = AppContextFactory.create()
        .operation('UpdateUserProfile')
        .requestingUser('user-123', 'USER')
        .targetUser('user-123') // self-update
        .clientInfo('203.0.113.10', 'Firefox/88.0', 'laptop-work')
        .session('session-profile-edit')
        .metadata('fieldsToUpdate', ['name', 'email'])
        .metadata('previousEmail', 'old@example.com')
        .metadata('newEmail', 'new@example.com')
        .build();

      // Act - Ce qu'un logger pourrait capturer
      const logEntry = {
        timestamp: context.timestamp,
        correlationId: context.correlationId,
        operationId: context.operationId,
        operation: context.operation,
        userId: context.requestingUserId,
        userRole: context.userRole,
        targetUserId: context.targetUserId,
        clientInfo: {
          ip: context.ipAddress,
          userAgent: context.userAgent,
          device: context.deviceId,
        },
        session: context.sessionId,
        metadata: context.metadata,
        level: 'INFO',
        message: 'User profile update initiated',
      };

      // Assert - Le log contient toutes les informations nécessaires
      expect(logEntry.correlationId).toBeTruthy();
      expect(logEntry.operationId).toBeTruthy();
      expect(logEntry.operation).toBe('UpdateUserProfile');
      expect(logEntry.userId).toBe('user-123');
      expect(logEntry.targetUserId).toBe('user-123');
      expect(logEntry.clientInfo.ip).toBe('203.0.113.10');
      expect(logEntry.metadata?.fieldsToUpdate).toEqual(['name', 'email']);
    });
  });
});
