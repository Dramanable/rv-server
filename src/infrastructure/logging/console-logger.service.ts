/**
 * 🏗️ INFRASTRUCTURE - Console Logger Service
 *
 * Implémentation concrète du port Logger pour la console
 * Intégration avec le système de logging NestJS
 */

import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { Logger } from '../../application/ports/logger.port';

@Injectable()
export class ConsoleLoggerService implements Logger {
  private readonly nestLogger = new NestLogger(ConsoleLoggerService.name);
  private readonly defaultContext: Record<string, any> = {};

  constructor(defaultContext?: Record<string, any>) {
    if (defaultContext) {
      this.defaultContext = defaultContext;
    }
  }

  info(message: string, context?: Record<string, any>): void {
    const formattedMessage = this.formatMessage(message, context);
    this.nestLogger.log(formattedMessage);
  }

  debug(message: string, context?: Record<string, any>): void {
    const formattedMessage = this.formatMessage(message, context);
    this.nestLogger.debug(formattedMessage);
  }

  warn(message: string, context?: Record<string, any>): void {
    const formattedMessage = this.formatMessage(message, context);
    this.nestLogger.warn(formattedMessage);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const formattedMessage = this.formatMessage(message, context);
    if (error) {
      this.nestLogger.error(formattedMessage, error.stack);
    } else {
      this.nestLogger.error(formattedMessage);
    }
  }

  audit(action: string, userId: string, context?: Record<string, any>): void {
    const auditContext = {
      ...context,
      action,
      userId,
      timestamp: new Date().toISOString(),
      type: 'AUDIT',
    };
    const message = `AUDIT: ${action} by user ${userId}`;
    this.info(message, auditContext);
  }

  child(context: Record<string, any>): Logger {
    const childContext = { ...this.defaultContext, ...context };
    return new ConsoleLoggerService(childContext);
  }

  private formatMessage(
    message: string,
    context?: Record<string, any>,
  ): string {
    const fullContext = { ...this.defaultContext, ...context };

    if (Object.keys(fullContext).length === 0) {
      return message;
    }

    // Format: "Message | operation=CreateUser | userId=123 | correlationId=abc"
    const contextParts = Object.entries(fullContext)
      .map(([key, value]) => `${key}=${value}`)
      .join(' | ');

    return `${message} | ${contextParts}`;
  }
}
