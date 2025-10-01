/**
 * @fileoverview List Notifications Use Case - Full TDD Implementation
 * @module Application/UseCases/Notification
 * @version 1.0.0
 */

import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { INotificationRepository } from '@domain/repositories/notification.repository.interface';
import { Notification } from '@domain/entities/notification.entity';
import { NotificationChannel } from '@domain/value-objects/notification-channel.value-object';
import { NotificationPriority } from '@domain/value-objects/notification-priority.value-object';
import { NotificationStatus } from '@domain/value-objects/notification-status.value-object';
import { NotificationException } from '@application/exceptions/notification.exceptions';

/**
 * Interface pour les critères de recherche des notifications
 */
export interface ListNotificationsFilters {
  readonly recipientId?: string;
  readonly channel?: NotificationChannel;
  readonly priority?: NotificationPriority;
  readonly status?: NotificationStatus;
  readonly search?: string;
  readonly dateFrom?: Date;
  readonly dateTo?: Date;
  readonly isRead?: boolean;
  readonly businessId?: string;
  readonly appointmentId?: string;
}

/**
 * Interface pour la pagination
 */
export interface NotificationPagination {
  readonly page: number;
  readonly limit: number;
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

/**
 * Requête pour lister les notifications
 */
export interface ListNotificationsRequest {
  readonly filters?: ListNotificationsFilters;
  readonly pagination?: NotificationPagination;
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

/**
 * Métadonnées de pagination
 */
export interface PaginationMeta {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly itemsPerPage: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

/**
 * Réponse pour la liste des notifications
 */
export interface ListNotificationsResponse {
  readonly notifications: readonly Notification[];
  readonly meta: PaginationMeta;
  readonly filters?: ListNotificationsFilters;
}

/**
 * Use case pour lister les notifications avec filtres et pagination
 */
export class ListNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Exécute le cas d'usage
   */
  async execute(
    request: ListNotificationsRequest,
  ): Promise<ListNotificationsResponse> {
    // 🔍 Validation des entrées
    this.validateRequest(request);

    // 📊 Log de l'opération
    this.logger.info('Listing notifications', {
      requestingUserId: request.requestingUserId,
      filters: request.filters,
      pagination: request.pagination,
      correlationId: request.correlationId,
    });

    try {
      // 🔧 Configuration des critères et pagination par défaut
      const filters = this.buildFiltersWithDefaults(request.filters);
      const pagination = this.buildPaginationWithDefaults(request.pagination);

      // 📝 Validation des paramètres de pagination
      this.validatePagination(pagination);

      // 🔍 Recherche des notifications avec critères
      const searchResult = await this.notificationRepository.findByCriteria(
        {
          recipientId: filters.recipientId,
          channels: filters.channel ? [filters.channel] : undefined,
          priorities: filters.priority ? [filters.priority] : undefined,
          statuses: filters.status ? [filters.status] : undefined,
          businessId: filters.businessId,
          appointmentId: filters.appointmentId,
          createdAfter: filters.dateFrom,
          createdBefore: filters.dateTo,
        },
        {
          page: pagination.page,
          limit: pagination.limit,
          sortBy: pagination.sortBy,
          sortOrder: pagination.sortOrder,
        },
      );

      // 📊 Construction des métadonnées de pagination
      const meta: PaginationMeta = {
        currentPage: pagination.page,
        totalPages: searchResult.totalPages,
        totalItems: searchResult.total,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < searchResult.totalPages,
        hasPrevPage: pagination.page > 1,
      };

      // 📊 Log de succès
      this.logger.info('Notifications listed successfully', {
        totalFound: searchResult.total,
        returnedItems: searchResult.notifications.length,
        page: pagination.page,
        correlationId: request.correlationId,
      });

      return {
        notifications: searchResult.notifications,
        meta,
        filters,
      };
    } catch (error) {
      // 🚨 Log d'erreur
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        'Failed to list notifications',
        error instanceof Error ? error : undefined,
        {
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        },
      );

      if (error instanceof NotificationException) {
        throw error;
      }

      throw new NotificationException(
        this.i18n.translate('errors.notifications.list_failed'),
        'LIST_FAILED',
        'errors.notifications.list_failed',
        { originalError: errorMessage },
      );
    }
  }

  /**
   * Valide la requête
   */
  private validateRequest(request: ListNotificationsRequest): void {
    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new NotificationException(
        this.i18n.translate('errors.notifications.requesting_user_required'),
        'VALIDATION_ERROR',
        'errors.notifications.requesting_user_required',
      );
    }
  }

  /**
   * Construit les filtres avec valeurs par défaut
   */
  private buildFiltersWithDefaults(
    filters?: ListNotificationsFilters,
  ): ListNotificationsFilters {
    return {
      ...filters,
    };
  }

  /**
   * Construit la pagination avec valeurs par défaut
   */
  private buildPaginationWithDefaults(
    pagination?: NotificationPagination,
  ): NotificationPagination {
    return {
      page: pagination?.page || 1,
      limit: Math.min(pagination?.limit || 10, 100), // Max 100 items
      sortBy: pagination?.sortBy || 'createdAt',
      sortOrder: pagination?.sortOrder || 'desc',
    };
  }

  /**
   * Valide les paramètres de pagination
   */
  private validatePagination(pagination: NotificationPagination): void {
    if (pagination.page < 1) {
      throw new NotificationException(
        this.i18n.translate('errors.notifications.invalid_page'),
        'VALIDATION_ERROR',
        'errors.notifications.invalid_page',
      );
    }

    if (pagination.limit < 1 || pagination.limit > 100) {
      throw new NotificationException(
        this.i18n.translate('errors.notifications.invalid_limit'),
        'VALIDATION_ERROR',
        'errors.notifications.invalid_limit',
      );
    }

    const validSortFields = [
      'createdAt',
      'updatedAt',
      'sentAt',
      'deliveredAt',
      'readAt',
      'priority',
      'status',
      'channel',
    ];

    if (!validSortFields.includes(pagination.sortBy)) {
      throw new NotificationException(
        this.i18n.translate('errors.notifications.invalid_sort_field'),
        'VALIDATION_ERROR',
        'errors.notifications.invalid_sort_field',
        { allowedFields: validSortFields },
      );
    }

    if (!['asc', 'desc'].includes(pagination.sortOrder)) {
      throw new NotificationException(
        this.i18n.translate('errors.notifications.invalid_sort_order'),
        'VALIDATION_ERROR',
        'errors.notifications.invalid_sort_order',
      );
    }
  }
}
