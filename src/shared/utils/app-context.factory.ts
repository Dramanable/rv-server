/**
 * 🏭 APP CONTEXT FACTORY
 *
 * Factory pour créer des contextes d'application structurés
 * Utilisé pour le logging, l'audit trail et le tracing
 */

import { v4 as uuidv4 } from 'uuid';
import { OperationRequiredError } from '../exceptions/shared.exceptions';

export interface AppContext {
  correlationId: string;
  operation: string;
  timestamp: string;
  requestingUser?: {
    id: string;
    role?: string;
  };
  clientInfo?: {
    ip: string;
    userAgent?: string;
  };
  metadata?: Record<string, any>;
}

export class AppContextFactory {
  private readonly context: Partial<AppContext> = {
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
  };

  static create(): AppContextFactory {
    return new AppContextFactory();
  }

  operation(operation: string): AppContextFactory {
    this.context.operation = operation;
    return this;
  }

  requestingUser(userId?: string, role?: string): AppContextFactory {
    if (userId) {
      this.context.requestingUser = {
        id: userId,
        role,
      };
    }
    return this;
  }

  clientInfo(ip: string, userAgent?: string): AppContextFactory {
    this.context.clientInfo = {
      ip,
      userAgent,
    };
    return this;
  }

  metadata(metadata: Record<string, any>): AppContextFactory {
    this.context.metadata = {
      ...this.context.metadata,
      ...metadata,
    };
    return this;
  }

  build(): AppContext {
    if (!this.context.operation) {
      throw new OperationRequiredError();
    }

    return {
      correlationId: this.context.correlationId!,
      operation: this.context.operation,
      timestamp: this.context.timestamp!,
      requestingUser: this.context.requestingUser,
      clientInfo: this.context.clientInfo,
      metadata: this.context.metadata,
    };
  }
}
