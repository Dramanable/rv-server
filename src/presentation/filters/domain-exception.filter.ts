/**
 * 🏢 Domain Exception Filter - Gestion des exceptions métier
 *
 * Capture les exceptions de la couche Domain et les convertit
 * en réponses HTTP appropriées avec messages i18n
 */

import type { I18nService } from "@application/ports/i18n.port";
import { DomainException } from "@domain/exceptions/domain.exception";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
} from "@nestjs/common";
import { TOKENS } from "@shared/constants/injection-tokens";
import { Request, Response } from "express";

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  constructor(
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Déterminer le code de statut HTTP basé sur le type d'exception Domain
    const status = this.mapDomainExceptionToHttpStatus(exception);

    // Obtenir le message i18n
    const message = this.getI18nMessage(exception);

    // Log l'erreur métier
    this.logDomainError(exception, request);

    // Réponse standardisée
    const errorResponse = {
      success: false,
      error: {
        code: exception.code,
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
        ...(process.env.NODE_ENV === "development" && {
          domainDetails: {
            exceptionName: exception.name,
            originalTimestamp: exception.timestamp,
          },
        }),
      },
    };

    response.status(status).json(errorResponse);
  }

  private mapDomainExceptionToHttpStatus(exception: DomainException): number {
    const statusMap: Record<string, number> = {
      // User Domain Errors
      USER_NOT_FOUND: HttpStatus.NOT_FOUND,
      USER_EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
      USER_INVALID_EMAIL: HttpStatus.BAD_REQUEST,
      USER_INVALID_NAME: HttpStatus.BAD_REQUEST,
      USER_SELF_DELETION_FORBIDDEN: HttpStatus.FORBIDDEN,

      // Business Sector Domain Errors
      BUSINESS_SECTOR_NOT_FOUND: HttpStatus.NOT_FOUND,
      BUSINESS_SECTOR_CODE_ALREADY_EXISTS: HttpStatus.CONFLICT,
      BUSINESS_SECTOR_INVALID_CODE: HttpStatus.BAD_REQUEST,
      BUSINESS_SECTOR_INVALID_NAME: HttpStatus.BAD_REQUEST,

      // Business Domain Errors
      BUSINESS_NOT_FOUND: HttpStatus.NOT_FOUND,
      BUSINESS_INVALID_NAME: HttpStatus.BAD_REQUEST,
      BUSINESS_INVALID_EMAIL: HttpStatus.BAD_REQUEST,
      BUSINESS_INVALID_PHONE: HttpStatus.BAD_REQUEST,

      // Auth Domain Errors
      AUTH_INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
      AUTH_INSUFFICIENT_PERMISSIONS: HttpStatus.FORBIDDEN,
      AUTH_ROLE_ELEVATION_FORBIDDEN: HttpStatus.FORBIDDEN,

      // Generic Domain Errors
      DOMAIN_VALIDATION_FAILED: HttpStatus.BAD_REQUEST,
      DOMAIN_BUSINESS_RULE_VIOLATION: HttpStatus.UNPROCESSABLE_ENTITY,
    };

    return statusMap[exception.code] || HttpStatus.BAD_REQUEST;
  }

  private getI18nMessage(exception: DomainException): string {
    // Construire la clé i18n à partir du code d'erreur
    const i18nKey = `errors.${exception.code.toLowerCase().replace(/_/g, ".")}`;

    // Essayer d'obtenir la traduction, sinon utiliser le message par défaut
    const translatedMessage = this.i18n.t(i18nKey);

    // Si la traduction n'existe pas, utiliser le message original
    return translatedMessage !== i18nKey
      ? translatedMessage
      : exception.message;
  }

  private getCorrelationId(request: Request): string {
    return (
      (request.headers["x-correlation-id"] as string) ||
      (request.headers["x-request-id"] as string) ||
      `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private logDomainError(exception: DomainException, request: Request): void {
    const errorContext = {
      code: exception.code,
      exceptionName: exception.name,
      timestamp: exception.timestamp,
      method: request.method,
      url: request.url,
      userAgent: request.headers["user-agent"],
      ip: request.ip,
      correlationId: this.getCorrelationId(request),
    };

    // Les erreurs Domain sont des violations de règles métier, pas des erreurs système
    this.logger.warn(
      `Domain Exception: ${exception.code} - ${exception.message}`,
      errorContext,
    );
  }
}
