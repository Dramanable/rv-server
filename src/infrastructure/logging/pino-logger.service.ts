/**
 * 🏗️ INFRASTRUCTURE - Pino Logger Service
 *
 * Implémentation du Logger Port avec Pino pour NestJS
 * Support i18n et contexte Clean Architecture
 */

import { Logger } from '@application/ports/logger.port';
import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PinoLoggerService implements Logger {
  constructor(
    @Inject(PinoLogger)
    private readonly pinoLogger: PinoLogger,
  ) {}

  /**
   * 📝 Log niveau INFO
   * Utilisé pour les opérations normales et succès
   */
  info(message: string, context?: Record<string, any>): void {
    this.pinoLogger.info(context || {}, message);
  }

  /**
   * 🐛 Log niveau DEBUG
   * Utilisé pour le debugging et informations détaillées
   */
  debug(message: string, context?: Record<string, any>): void {
    this.pinoLogger.debug(context || {}, message);
  }

  /**
   * ⚠️ Log niveau WARN
   * Utilisé pour les avertissements et situations inhabituelles
   */
  warn(message: string, context?: Record<string, any>): void {
    this.pinoLogger.warn(context || {}, message);
  }

  /**
   * ❌ Log niveau ERROR
   * Utilisé pour les erreurs avec stack trace
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      }),
    };

    this.pinoLogger.error(errorContext, message);
  }

  /**
   * 🎯 Log avec niveau personnalisé
   * Permet de spécifier le niveau dynamiquement
   */
  log(
    level: 'info' | 'debug' | 'warn' | 'error',
    message: string,
    context?: Record<string, any>,
  ): void {
    switch (level) {
      case 'info':
        this.info(message, context);
        break;
      case 'debug':
        this.debug(message, context);
        break;
      case 'warn':
        this.warn(message, context);
        break;
      case 'error':
        this.error(message, undefined, context);
        break;
    }
  }

  /**
   * 🌍 Log avec contexte i18n enrichi
   * Ajoute automatiquement le contexte d'opération
   */
  logWithOperation(
    level: 'info' | 'debug' | 'warn' | 'error',
    message: string,
    operation: string,
    additionalContext?: Record<string, any>,
  ): void {
    const enrichedContext = {
      operation,
      timestamp: new Date().toISOString(),
      ...additionalContext,
    };

    this.log(level, message, enrichedContext);
  }

  /**
   * 🔍 Log d'audit pour les opérations sensibles
   * Niveau INFO avec marquage spécial pour l'audit
   */
  audit(action: string, userId: string, context?: Record<string, any>): void {
    const auditContext = {
      ...context,
      type: 'AUDIT',
      action,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.info(`🔍 AUDIT: ${action} by user ${userId}`, auditContext);
  }

  /**
   * 👶 Crée un logger enfant avec contexte pré-rempli
   * Permet de propager le contexte à travers les opérations
   */
  child(context: Record<string, any>): Logger {
    const childLogger = this.pinoLogger.logger.child(context);

    return {
      info: (message: string, additionalContext?: Record<string, any>) => {
        childLogger.info({ ...additionalContext }, message);
      },
      debug: (message: string, additionalContext?: Record<string, any>) => {
        childLogger.debug({ ...additionalContext }, message);
      },
      warn: (message: string, additionalContext?: Record<string, any>) => {
        childLogger.warn({ ...additionalContext }, message);
      },
      error: (
        message: string,
        error?: Error,
        additionalContext?: Record<string, any>,
      ) => {
        const errorContext = {
          ...additionalContext,
          ...(error && {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }),
        };
        childLogger.error(errorContext, message);
      },
      audit: (
        action: string,
        userId: string,
        additionalContext?: Record<string, any>,
      ) => {
        const auditContext = {
          ...additionalContext,
          type: 'AUDIT',
          action,
          userId,
          timestamp: new Date().toISOString(),
        };
        childLogger.info(auditContext, `🔍 AUDIT: ${action} by user ${userId}`);
      },
      child: (nestedContext: Record<string, any>) => {
        return this.child({ ...context, ...nestedContext });
      },
    };
  }

  /**
   * 📊 Log de performance avec timing
   * Pour mesurer les performances des opérations
   */
  performance(
    operation: string,
    duration: number,
    context?: Record<string, any>,
  ): void {
    const perfContext = {
      ...context,
      type: 'PERFORMANCE',
      operation,
      duration,
      unit: 'ms',
      timestamp: new Date().toISOString(),
    };

    this.info(
      `⏱️ Operation ${operation} completed in ${duration}ms`,
      perfContext,
    );
  }

  /**
   * 🚀 Log de démarrage d'opération
   * Utilisé au début des use cases
   */
  startOperation(operation: string, context?: Record<string, any>): void {
    const startContext = {
      ...context,
      operation,
      phase: 'START',
      timestamp: new Date().toISOString(),
    };

    this.info(`🚀 Starting operation: ${operation}`, startContext);
  }

  /**
   * ✅ Log de fin d'opération réussie
   * Utilisé à la fin des use cases en succès
   */
  endOperation(operation: string, context?: Record<string, any>): void {
    const endContext = {
      ...context,
      operation,
      phase: 'END',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
    };

    this.info(`✅ Operation completed: ${operation}`, endContext);
  }

  /**
   * 💥 Log de fin d'opération échouée
   * Utilisé à la fin des use cases en erreur
   */
  failOperation(
    operation: string,
    error: Error,
    context?: Record<string, any>,
  ): void {
    const failContext = {
      ...context,
      operation,
      phase: 'END',
      status: 'FAILURE',
      timestamp: new Date().toISOString(),
    };

    this.error(`💥 Operation failed: ${operation}`, error, failContext);
  }
}
