/**
 * ✅ Validation Exception Filter - Gestion des erreurs de validation HTTP
 *
 * Capture les erreurs de validation de class-validator et les convertit
 * en réponses HTTP structurées avec détails de validation
 */

import type { I18nService } from '@application/ports/i18n.port';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { TOKENS } from '@shared/constants/injection-tokens';
import type { FastifyRequest, FastifyReply } from 'fastify';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  constructor(
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const exceptionResponse = exception.getResponse();

    // Vérifier si c'est une erreur de validation
    if (this.isValidationError(exceptionResponse)) {
      this.handleValidationError(exceptionResponse, request, response);
    } else {
      this.handleGenericBadRequest(exception, request, response);
    }
  }

  private isValidationError(response: any): boolean {
    return (
      typeof response === 'object' &&
      response !== null &&
      Array.isArray(response.message) &&
      typeof response.error === 'string' &&
      response.error === 'Bad Request'
    );
  }

  private handleValidationError(
    exceptionResponse: any,
    request: FastifyRequest,
    response: FastifyReply,
  ): void {
    const validationErrors = this.parseValidationErrors(
      exceptionResponse.message,
    );

    this.logValidationError(validationErrors, request);

    const errorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: this.i18n.t('errors.validation.failed'),
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
        validationErrors: validationErrors,
      },
    };

    response.status(HttpStatus.BAD_REQUEST).send(errorResponse);
  }

  private handleGenericBadRequest(
    exception: BadRequestException,
    request: FastifyRequest,
    response: FastifyReply,
  ): void {
    const message = this.extractMessage(exception.getResponse());

    this.logger.warn(`Bad Request: ${message}`, {
      method: request.method,
      url: request.url,
      correlationId: this.getCorrelationId(request),
    });

    const errorResponse = {
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
      },
    };

    response.status(HttpStatus.BAD_REQUEST).send(errorResponse);
  }

  private parseValidationErrors(validationMessages: string[]): Array<{
    field: string;
    value: any;
    constraints: Record<string, string>;
  }> {
    // Les messages de validation de class-validator sont souvent sous forme de chaînes
    // Il faut les parser pour extraire les informations de champ et contrainte
    return validationMessages.map((message) => {
      // Essayer d'extraire le nom du champ de message d'erreur
      const fieldMatch = message.match(/^(\w+)\s/);
      const field = fieldMatch ? fieldMatch[1] : 'unknown';

      return {
        field: field,
        value: null, // La valeur n'est pas toujours disponible dans le message
        constraints: {
          validation: this.getLocalizedValidationMessage(message),
        },
      };
    });
  }

  private getLocalizedValidationMessage(originalMessage: string): string {
    // Mapper les messages de validation courants vers les clés i18n
    const validationMessageMap: Record<string, string> = {
      'should not be empty': 'errors.validation.required',
      'must be an email': 'errors.validation.invalid_email',
      'must be a string': 'errors.validation.must_be_string',
      'must be a number': 'errors.validation.must_be_number',
      'must be a boolean': 'errors.validation.must_be_boolean',
      'must be a UUID': 'errors.validation.must_be_uuid',
      'must be shorter than or equal to': 'errors.validation.max_length',
      'must be longer than or equal to': 'errors.validation.min_length',
    };

    // Chercher une correspondance
    for (const [pattern, i18nKey] of Object.entries(validationMessageMap)) {
      if (originalMessage.includes(pattern)) {
        const translatedMessage = this.i18n.t(i18nKey);
        return translatedMessage !== i18nKey
          ? translatedMessage
          : originalMessage;
      }
    }

    // Si aucune correspondance, retourner le message original
    return originalMessage;
  }

  private extractMessage(response: any): string {
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null) {
      return response.message || response.error || 'Bad Request';
    }

    return 'Bad Request';
  }

  private getCorrelationId(request: FastifyRequest): string {
    return (
      (request.headers['x-correlation-id'] as string | undefined) ||
      (request.headers['x-request-id'] as string | undefined) ||
      `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    );
  }

  private logValidationError(
    validationErrors: Array<{
      field: string;
      constraints: Record<string, string>;
    }>,
    request: FastifyRequest,
  ): void {
    const fields = validationErrors.map((err) => err.field).join(', ');

    this.logger.warn(`Validation Failed for fields: ${fields}`, {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      correlationId: this.getCorrelationId(request),
      validationErrors: validationErrors,
    });
  }
}
