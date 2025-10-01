/**
 * 🚨 Global Exception Filter - Gestion centralisée des erreurs
 *
 * Capture toutes les exceptions non gérées et fournit :
 * - Logs détaillés en développement
 * - Réponses sécurisées en production
 * - Format de réponse cohérent
 */

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

interface SafeRequest {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  connection?: { remoteAddress?: string };
}

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request: SafeRequest = ctx.getRequest();
    const response = ctx.getResponse();

    // Déterminer le status HTTP
    const status = this.getHttpStatus(exception);

    // Extraire le message d'erreur
    const message = this.getErrorMessage(exception);

    // Détails de l'erreur (seulement en développement)
    const errorDetails = this.getErrorDetails(exception);

    // Log détaillé de l'erreur
    this.logError(exception, request, status, message);

    // Format de réponse standardisé
    const errorResponse = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      method: httpAdapter.getRequestMethod
        ? httpAdapter.getRequestMethod(request)
        : "UNKNOWN",
      ...(process.env.NODE_ENV === "development" && {
        details: errorDetails,
        stack: exception instanceof Error ? exception.stack : null,
      }),
    };

    httpAdapter.reply(response, errorResponse, status);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "string") {
        return response;
      }
      if (typeof response === "object" && response !== null) {
        // Type guard for message property
        if (
          "message" in response &&
          typeof (response as { message?: unknown }).message === "string"
        ) {
          return (response as { message?: string }).message as string;
        }
      }
      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return "Internal server error";
  }

  private getErrorDetails(
    exception: unknown,
  ): string | Record<string, unknown> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "string") {
        return response;
      }
      if (typeof response === "object" && response !== null) {
        return response as Record<string, unknown>;
      }
    }
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
      };
    }
    return { type: typeof exception, value: String(exception) };
  }

  private logError(
    exception: unknown,
    request: SafeRequest,
    status: number,
    message: string,
  ): void {
    const { httpAdapter } = this.httpAdapterHost;

    const userAgent =
      request.headers && typeof request.headers["user-agent"] === "string"
        ? request.headers["user-agent"]
        : Array.isArray(request.headers?.["user-agent"])
          ? request.headers?.["user-agent"][0]
          : "Unknown";
    const ip =
      request.ip ||
      (request.connection && request.connection.remoteAddress) ||
      "Unknown";

    const errorContext = {
      method: httpAdapter.getRequestMethod
        ? httpAdapter.getRequestMethod(request)
        : "UNKNOWN",
      url: httpAdapter.getRequestUrl(request),
      userAgent,
      ip,
      status,
      message,
    };

    if (status >= 500) {
      // Erreurs serveur - Log complet avec stack trace
      this.logger.error(
        `Internal Server Error: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
        errorContext,
      );
    } else if (status >= 400) {
      // Erreurs client - Log warning sans stack trace
      this.logger.warn(`Client Error: ${message}`, errorContext);
    } else {
      // Autres erreurs - Log info
      this.logger.log(`Error: ${message}`, errorContext);
    }
  }
}
