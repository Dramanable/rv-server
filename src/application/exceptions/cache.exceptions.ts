/**
 * 🗄️ CACHE EXCEPTIONS - Exceptions pour les opérations de cache
 */

import { ApplicationException } from './application.exceptions';

export class CacheException extends ApplicationException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CACHE_ERROR', 'errors.cache.general_error', context);
  }
}

export class CacheConnectionException extends CacheException {
  constructor(
    message: string = 'Failed to connect to cache service',
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}

export class CacheOperationException extends ApplicationException {
  constructor(message: string, cause?: Error) {
    super(
      message,
      'CACHE_OPERATION_ERROR',
      'errors.cache.operation_failed',
      cause ? { originalError: cause.message } : undefined,
    );
  }
}
