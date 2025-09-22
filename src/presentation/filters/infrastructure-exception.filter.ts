/**
 * 🔧 Infrastructure Exception Filter - Gestion des exceptions de la couche Infrastructure
 *
 * Capture les exceptions liées à l'infrastructure (base de données, services externes)
 * et les convertit en réponses HTTP appropriées
 */

import type { I18nService } from '@application/ports/i18n.port';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { TOKENS } from '@shared/constants/injection-tokens';
import { Request, Response } from 'express';
import {
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
} from 'typeorm';

// Exception personnalisée pour les erreurs d'infrastructure
export class InfrastructureException extends Error {
  public readonly code: string;
  public readonly component: string;
  public readonly operation: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code: string,
    component: string,
    operation: string,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'InfrastructureException';
    this.code = code;
    this.component = component;
    this.operation = operation;
    this.originalError = originalError;
  }
}

@Catch(
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
  InfrastructureException,
  Error, // Capture les erreurs génériques qui pourraient venir de l'infra
)
export class InfrastructureExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(InfrastructureExceptionFilter.name);

  constructor(
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Déterminer le type d'erreur d'infrastructure
    const errorInfo = this.classifyInfrastructureError(exception);

    // Log l'erreur avec le niveau approprié
    this.logInfrastructureError(exception, request, errorInfo);

    // Réponse sécurisée (ne pas exposer les détails internes en production)
    const errorResponse = {
      success: false,
      error: {
        code: errorInfo.code,
        message: this.getPublicMessage(errorInfo),
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
        ...(process.env.NODE_ENV === 'development' && {
          infrastructureDetails: {
            component: errorInfo.component,
            operation: errorInfo.operation,
            originalMessage: errorInfo.originalMessage,
          },
        }),
      },
    };

    response.status(errorInfo.httpStatus).json(errorResponse);
  }

  private classifyInfrastructureError(exception: unknown): {
    code: string;
    component: string;
    operation: string;
    httpStatus: number;
    originalMessage: string;
    level: 'error' | 'warn' | 'info';
  } {
    // Exception infrastructure personnalisée
    if (exception instanceof InfrastructureException) {
      return {
        code: exception.code,
        component: exception.component,
        operation: exception.operation,
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        originalMessage: exception.message,
        level: 'error',
      };
    }

    // Erreurs TypeORM
    if (exception instanceof QueryFailedError) {
      const errorCode = this.getTypeORMErrorCode(exception);
      return {
        code: errorCode,
        component: 'database',
        operation: 'query',
        httpStatus: this.getHttpStatusForDatabaseError(errorCode),
        originalMessage: exception.message,
        level: errorCode.includes('CONSTRAINT') ? 'warn' : 'error',
      };
    }

    if (exception instanceof EntityNotFoundError) {
      return {
        code: 'DATABASE_ENTITY_NOT_FOUND',
        component: 'database',
        operation: 'find',
        httpStatus: HttpStatus.NOT_FOUND,
        originalMessage: exception.message,
        level: 'warn',
      };
    }

    if (exception instanceof CannotCreateEntityIdMapError) {
      return {
        code: 'DATABASE_ENTITY_ID_MAP_ERROR',
        component: 'database',
        operation: 'create',
        httpStatus: HttpStatus.BAD_REQUEST,
        originalMessage: exception.message,
        level: 'error',
      };
    }

    // Erreur générique - probablement infrastructure
    if (exception instanceof Error) {
      // Détecter les erreurs réseau
      if (this.isNetworkError(exception)) {
        return {
          code: 'NETWORK_ERROR',
          component: 'network',
          operation: 'request',
          httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
          originalMessage: exception.message,
          level: 'error',
        };
      }

      // Détecter les erreurs de connexion Redis
      if (this.isRedisError(exception)) {
        return {
          code: 'CACHE_SERVICE_ERROR',
          component: 'cache',
          operation: 'connection',
          httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
          originalMessage: exception.message,
          level: 'error',
        };
      }
    }

    // Erreur inconnue
    return {
      code: 'UNKNOWN_INFRASTRUCTURE_ERROR',
      component: 'unknown',
      operation: 'unknown',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      originalMessage:
        exception instanceof Error ? exception.message : String(exception),
      level: 'error',
    };
  }

  private getTypeORMErrorCode(error: QueryFailedError): string {
    const message = error.message.toLowerCase();

    // Erreurs PostgreSQL courantes
    if (
      message.includes('unique constraint') ||
      message.includes('duplicate key')
    ) {
      return 'DATABASE_UNIQUE_CONSTRAINT_VIOLATION';
    }
    if (message.includes('foreign key constraint')) {
      return 'DATABASE_FOREIGN_KEY_CONSTRAINT_VIOLATION';
    }
    if (message.includes('not null constraint')) {
      return 'DATABASE_NOT_NULL_CONSTRAINT_VIOLATION';
    }
    if (message.includes('check constraint')) {
      return 'DATABASE_CHECK_CONSTRAINT_VIOLATION';
    }
    if (message.includes('connection')) {
      return 'DATABASE_CONNECTION_ERROR';
    }
    if (message.includes('timeout')) {
      return 'DATABASE_TIMEOUT_ERROR';
    }

    return 'DATABASE_QUERY_ERROR';
  }

  private getHttpStatusForDatabaseError(errorCode: string): number {
    const statusMap: Record<string, number> = {
      DATABASE_UNIQUE_CONSTRAINT_VIOLATION: HttpStatus.CONFLICT,
      DATABASE_FOREIGN_KEY_CONSTRAINT_VIOLATION: HttpStatus.BAD_REQUEST,
      DATABASE_NOT_NULL_CONSTRAINT_VIOLATION: HttpStatus.BAD_REQUEST,
      DATABASE_CHECK_CONSTRAINT_VIOLATION: HttpStatus.BAD_REQUEST,
      DATABASE_CONNECTION_ERROR: HttpStatus.SERVICE_UNAVAILABLE,
      DATABASE_TIMEOUT_ERROR: HttpStatus.REQUEST_TIMEOUT,
    };

    return statusMap[errorCode] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'network error',
      'request timeout',
    ];

    return networkErrorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  private isRedisError(error: Error): boolean {
    const redisErrorPatterns = ['redis', 'connection to redis', 'ioredis'];

    return redisErrorPatterns.some((pattern) =>
      error.message.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  private getPublicMessage(errorInfo: { code: string }): string {
    // Messages publics sécurisés basés sur le code d'erreur
    const publicMessages: Record<string, string> = {
      DATABASE_UNIQUE_CONSTRAINT_VIOLATION: this.i18n.t(
        'errors.infrastructure.duplicate_resource',
      ),
      DATABASE_FOREIGN_KEY_CONSTRAINT_VIOLATION: this.i18n.t(
        'errors.infrastructure.invalid_reference',
      ),
      DATABASE_NOT_NULL_CONSTRAINT_VIOLATION: this.i18n.t(
        'errors.infrastructure.missing_required_field',
      ),
      DATABASE_CONNECTION_ERROR: this.i18n.t(
        'errors.infrastructure.service_unavailable',
      ),
      DATABASE_TIMEOUT_ERROR: this.i18n.t(
        'errors.infrastructure.request_timeout',
      ),
      NETWORK_ERROR: this.i18n.t('errors.infrastructure.network_error'),
      CACHE_SERVICE_ERROR: this.i18n.t(
        'errors.infrastructure.cache_service_error',
      ),
    };

    const message = publicMessages[errorInfo.code];
    return (
      message || this.i18n.t('errors.infrastructure.internal_server_error')
    );
  }

  private getCorrelationId(request: Request): string {
    return (
      (request.headers['x-correlation-id'] as string) ||
      (request.headers['x-request-id'] as string) ||
      `infra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private logInfrastructureError(
    exception: unknown,
    request: Request,
    errorInfo: ReturnType<typeof this.classifyInfrastructureError>,
  ): void {
    const errorContext = {
      code: errorInfo.code,
      component: errorInfo.component,
      operation: errorInfo.operation,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      correlationId: this.getCorrelationId(request),
      httpStatus: errorInfo.httpStatus,
    };

    // Log selon le niveau approprié
    if (errorInfo.level === 'error') {
      this.logger.error(
        `Infrastructure Exception: ${errorInfo.code} - ${errorInfo.originalMessage}`,
        exception instanceof Error ? exception.stack : undefined,
        errorContext,
      );
    } else if (errorInfo.level === 'warn') {
      this.logger.warn(
        `Infrastructure Exception: ${errorInfo.code} - ${errorInfo.originalMessage}`,
        errorContext,
      );
    } else {
      this.logger.log(
        `Infrastructure Exception: ${errorInfo.code} - ${errorInfo.originalMessage}`,
        errorContext,
      );
    }
  }
}
