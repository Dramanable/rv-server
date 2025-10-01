/**
 * 🎯 Application Context
 *
 * Contexte d'application pour tracer les requêtes et opérations
 */

import { OperationNameRequiredError } from "../exceptions/shared.exceptions";

export interface AppContext {
  // Identifiants uniques
  correlationId: string; // ID unique pour tracer la requête
  operationId?: string; // ID unique pour l'opération

  // Information de l'opération
  operation: string; // Nom de l'opération (CreateUser, Login, etc.)
  timestamp: Date; // Moment de début de l'opération

  // Utilisateur et permissions
  requestingUserId?: string; // Qui fait la requête
  targetUserId?: string; // Sur qui porte l'opération
  userRole?: string; // Rôle de l'utilisateur demandeur

  // Context technique
  ipAddress?: string; // Adresse IP du client
  userAgent?: string; // User agent du navigateur
  deviceId?: string; // ID unique du device
  sessionId?: string; // ID de session

  // Context métier
  tenantId?: string; // Multi-tenant ID
  organizationId?: string; // Organisation (pour B2B)

  // Performance et debug
  startTime?: number; // Timestamp de début (pour mesurer durée)
  traceId?: string; // ID de trace distribué

  // Données spécifiques à l'opération
  metadata?: Record<string, any>; // Données additionnelles flexibles
}

export interface AppContextBuilder {
  operation(name: string): AppContextBuilder;
  requestingUser(userId: string, role?: string): AppContextBuilder;
  targetUser(userId: string): AppContextBuilder;
  clientInfo(
    ipAddress?: string,
    userAgent?: string,
    deviceId?: string,
  ): AppContextBuilder;
  session(sessionId: string): AppContextBuilder;
  tenant(tenantId: string): AppContextBuilder;
  organization(orgId: string): AppContextBuilder;
  metadata(key: string, value: unknown): AppContextBuilder;
  build(): AppContext;
}

class AppContextBuilderImpl implements AppContextBuilder {
  private readonly context: Partial<AppContext> = {
    correlationId: this.generateCorrelationId(),
    timestamp: new Date(),
    startTime: Date.now(),
  };

  operation(name: string): AppContextBuilder {
    this.context.operation = name;
    this.context.operationId = this.generateOperationId(name);
    return this;
  }

  requestingUser(userId: string, role?: string): AppContextBuilder {
    this.context.requestingUserId = userId;
    this.context.userRole = role;
    return this;
  }

  targetUser(userId: string): AppContextBuilder {
    this.context.targetUserId = userId;
    return this;
  }

  clientInfo(
    ipAddress?: string,
    userAgent?: string,
    deviceId?: string,
  ): AppContextBuilder {
    this.context.ipAddress = ipAddress;
    this.context.userAgent = userAgent;
    this.context.deviceId = deviceId;
    return this;
  }

  session(sessionId: string): AppContextBuilder {
    this.context.sessionId = sessionId;
    return this;
  }

  tenant(tenantId: string): AppContextBuilder {
    this.context.tenantId = tenantId;
    return this;
  }

  organization(orgId: string): AppContextBuilder {
    this.context.organizationId = orgId;
    return this;
  }

  metadata(key: string, value: unknown): AppContextBuilder {
    if (!this.context.metadata) {
      this.context.metadata = {};
    }
    this.context.metadata[key] = value;
    return this;
  }

  build(): AppContext {
    if (!this.context.operation) {
      throw new OperationNameRequiredError();
    }
    return this.context as AppContext;
  }

  private generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOperationId(operation: string): string {
    return `op_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}

export class AppContextFactory {
  static create(): AppContextBuilder {
    return new AppContextBuilderImpl();
  }

  /**
   * Crée un context simple pour les opérations basiques
   */
  static simple(operation: string, requestingUserId?: string): AppContext {
    const builder = new AppContextBuilderImpl().operation(operation);

    if (requestingUserId) {
      builder.requestingUser(requestingUserId);
    }

    return builder.build();
  }

  /**
   * Crée un context pour les opérations d'authentification
   */
  static auth(
    operation: string,
    email: string,
    clientInfo?: {
      ipAddress?: string;
      userAgent?: string;
      deviceId?: string;
    },
  ): AppContext {
    const builder = new AppContextBuilderImpl()
      .operation(operation)
      .metadata("email", email);

    if (clientInfo) {
      builder.clientInfo(
        clientInfo.ipAddress,
        clientInfo.userAgent,
        clientInfo.deviceId,
      );
    }

    return builder.build();
  }

  /**
   * Crée un context pour les opérations CRUD sur utilisateurs
   */
  static userOperation(
    operation: string,
    requestingUserId: string,
    targetUserId?: string,
  ): AppContext {
    const builder = new AppContextBuilderImpl()
      .operation(operation)
      .requestingUser(requestingUserId);

    if (targetUserId) {
      builder.targetUser(targetUserId);
    }

    return builder.build();
  }
}
