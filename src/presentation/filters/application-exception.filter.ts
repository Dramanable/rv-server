/**
 * 💼 Application Exception Filter - Gestion des exceptions de la couche Application
 *
 * Capture les exceptions ApplicationException et les convertit
 * en réponses HTTP appropriées avec contexte complet
 */

import { ApplicationException } from "@application/exceptions/application.exceptions";
import type { I18nService } from "@application/ports/i18n.port";
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

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApplicationExceptionFilter.name);

  constructor(
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  catch(exception: ApplicationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Déterminer le code de statut HTTP basé sur le type d'exception Application
    const status = this.mapApplicationExceptionToHttpStatus(exception);

    // Obtenir le message i18n
    const message = this.getI18nMessage(exception);

    // Log l'erreur applicative
    this.logApplicationError(exception, request, status);

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
          applicationDetails: {
            context: exception.context,
            originalError: exception.message,
            i18nKey: exception.i18nKey,
          },
        }),
      },
    };

    response.status(status).json(errorResponse);
  }

  private mapApplicationExceptionToHttpStatus(
    exception: ApplicationException,
  ): number {
    const statusMap: Record<string, number> = {
      // Authentication & Authorization
      INSUFFICIENT_PERMISSIONS: HttpStatus.FORBIDDEN,
      APPLICATION_AUTHORIZATION_ERROR: HttpStatus.FORBIDDEN,

      // Resource Management
      RESOURCE_NOT_FOUND: HttpStatus.NOT_FOUND,
      BUSINESS_NOT_FOUND: HttpStatus.NOT_FOUND,
      SERVICE_NOT_FOUND: HttpStatus.NOT_FOUND,
      USER_NOT_FOUND: HttpStatus.NOT_FOUND,

      // Validation Errors
      APPLICATION_VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
      BUSINESS_VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
      STAFF_VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
      SERVICE_VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
      CALENDAR_VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
      APPOINTMENT_VALIDATION_ERROR: HttpStatus.BAD_REQUEST,

      // Conflicts
      RESOURCE_CONFLICT: HttpStatus.CONFLICT,
      BUSINESS_ALREADY_EXISTS: HttpStatus.CONFLICT,

      // Use Case & Workflow Errors
      USE_CASE_EXECUTION_ERROR: HttpStatus.UNPROCESSABLE_ENTITY,
      WORKFLOW_ORCHESTRATION_ERROR: HttpStatus.UNPROCESSABLE_ENTITY,

      // Service Configuration & External Services
      SERVICE_CONFIGURATION_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      EXTERNAL_SERVICE_ERROR: HttpStatus.SERVICE_UNAVAILABLE,
      EMAIL_SERVICE_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,

      // System Errors
      DEPENDENCY_INJECTION_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
      PASSWORD_GENERATION_FAILED: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    return statusMap[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getI18nMessage(exception: ApplicationException): string {
    // Utiliser la clé i18n fournie par l'exception
    const translatedMessage = this.i18n.t(exception.i18nKey, exception.context);

    // Si la traduction n'existe pas, utiliser le message original
    return translatedMessage !== exception.i18nKey
      ? translatedMessage
      : exception.message;
  }

  private getCorrelationId(request: Request): string {
    return (
      (request.headers["x-correlation-id"] as string) ||
      (request.headers["x-request-id"] as string) ||
      `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private logApplicationError(
    exception: ApplicationException,
    request: Request,
    status: number,
  ): void {
    const errorContext = {
      code: exception.code,
      i18nKey: exception.i18nKey,
      context: exception.context,
      method: request.method,
      url: request.url,
      userAgent: request.headers["user-agent"],
      ip: request.ip,
      correlationId: this.getCorrelationId(request),
      httpStatus: status,
    };

    if (status >= 500) {
      // Erreurs serveur/configuration - Log error avec détails complets
      this.logger.error(
        `Application Exception (Server Error): ${exception.code} - ${exception.message}`,
        exception.stack,
        errorContext,
      );
    } else if (status >= 400) {
      // Erreurs client/validation - Log warning
      this.logger.warn(
        `Application Exception (Client Error): ${exception.code} - ${exception.message}`,
        errorContext,
      );
    } else {
      // Autres cas - Log info
      this.logger.log(
        `Application Exception: ${exception.code} - ${exception.message}`,
        errorContext,
      );
    }
  }
}
