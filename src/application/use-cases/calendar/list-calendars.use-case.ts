/**
 * 📅 List Calendars Use Case - Clean Architecture + SOLID
 *
 * ✅ COUCHE APPLICATION PURE - Sans dépendance NestJS
 * ✅ Dependency Inversion Principle respecté
 * ✅ Interface-driven design
 */
import {
  ApplicationValidationError,
  InsufficientPermissionsError,
} from '../../../application/exceptions/application.exceptions';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import {
  Calendar,
  CalendarStatus,
} from '../../../domain/entities/calendar.entity';
import { CalendarType } from '../../../domain/entities/calendar-type.entity';
import type { CalendarRepository } from '../../../domain/repositories/calendar.repository.interface';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import {
  AppContext,
  AppContextFactory,
} from '../../../shared/context/app-context';
import { UserRole } from '../../../shared/enums/user-role.enum';

export interface ListCalendarsRequest {
  readonly requestingUserId: string;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly search?: string;
    readonly businessId?: string;
    readonly type?: CalendarType;
    readonly status?: CalendarStatus;
    readonly ownerId?: string;
  };
}

export interface CalendarSummary {
  readonly id: string;
  readonly businessId: string;
  readonly type: CalendarType;
  readonly name: string;
  readonly description: string;
  readonly ownerId?: string;
  readonly status: CalendarStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListCalendarsResponse {
  readonly data: CalendarSummary[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * ✅ PURE APPLICATION USE CASE
 * ❌ No NestJS dependencies
 * ✅ Constructor Injection via interfaces only
 */
export class ListCalendarsUseCase {
  constructor(
    private readonly calendarRepository: CalendarRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: ListCalendarsRequest): Promise<ListCalendarsResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('ListCalendars')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.calendar.list_attempt'),
      context as any,
    );

    try {
      // 2. Validation des permissions
      await this.validatePermissions(request.requestingUserId, context);

      // 3. Validation des paramètres
      this.validateRequestParameters(request);

      // 4. Récupération des calendriers
      let calendars: Calendar[] = [];

      if (request.filters.businessId) {
        const businessId = BusinessId.create(request.filters.businessId);
        calendars = await this.calendarRepository.findByBusinessId(businessId);
      } else if (request.filters.ownerId) {
        const ownerId = UserId.create(request.filters.ownerId);
        calendars = await this.calendarRepository.findByOwnerId(ownerId);
      } else {
        // Pour les admins platform, récupérer tous les calendriers
        // Pour les autres, seuls leurs calendriers
        const requestingUser = await this.userRepository.findById(
          request.requestingUserId,
        );
        if (requestingUser?.role === UserRole.PLATFORM_ADMIN) {
          // Récupération de tous les calendriers - à implémenter dans le repository
          throw new ApplicationValidationError(
            'global_listing',
            'not_implemented',
            'Global calendar listing not implemented yet',
          );
        } else {
          const ownerId = UserId.create(request.requestingUserId);
          calendars = await this.calendarRepository.findByOwnerId(ownerId);
        }
      }

      // 5. Application des filtres
      const filteredCalendars = this.applyFilters(calendars, request.filters);

      // 6. Tri
      const sortedCalendars = this.applySorting(
        filteredCalendars,
        request.sorting,
      );

      // 7. Pagination
      const { paginatedCalendars, totalItems } = this.applyPagination(
        sortedCalendars,
        request.pagination,
      );

      // 8. Mapping vers response
      const calendarSummaries: CalendarSummary[] = paginatedCalendars.map(
        this.mapToCalendarSummary,
      );

      // 9. Métadonnées de pagination
      const totalPages = Math.ceil(totalItems / request.pagination.limit);
      const currentPage = request.pagination.page;

      const response: ListCalendarsResponse = {
        data: calendarSummaries,
        meta: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage: request.pagination.limit,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      };

      this.logger.info(
        this.i18n.t('operations.calendar.list_success', {
          count: calendarSummaries.length,
        }),
        context as any,
      );

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.list_failed', {
          error: (error as Error).message,
        }),
        context as any,
      );
      throw error;
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        requestingUserId,
        'LIST_CALENDARS',
        'calendar',
      );
    }

    // Tous les utilisateurs connectés peuvent lister leurs calendriers
    // Les admins peuvent lister tous les calendriers
    const allowedRoles = [
      UserRole.PLATFORM_ADMIN,
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
      UserRole.LOCATION_MANAGER,
      UserRole.DEPARTMENT_HEAD,
      UserRole.SENIOR_PRACTITIONER,
      UserRole.PRACTITIONER,
      UserRole.RECEPTIONIST,
    ];

    if (!allowedRoles.includes(requestingUser.role)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId,
        requestingUserRole: requestingUser.role,
        requiredPermissions: 'LIST_CALENDARS',
      });
      throw new InsufficientPermissionsError(
        requestingUserId,
        'LIST_CALENDARS',
        'calendar',
      );
    }
  }

  private validateRequestParameters(request: ListCalendarsRequest): void {
    // Validation pagination
    if (request.pagination.page < 1) {
      throw new ApplicationValidationError(
        'page',
        request.pagination.page,
        'Page must be >= 1',
      );
    }

    if (request.pagination.limit < 1 || request.pagination.limit > 100) {
      throw new ApplicationValidationError(
        'limit',
        request.pagination.limit,
        'Limit must be between 1 and 100',
      );
    }

    // Validation tri
    const allowedSortFields = [
      'name',
      'type',
      'status',
      'createdAt',
      'updatedAt',
    ];
    if (!allowedSortFields.includes(request.sorting.sortBy)) {
      throw new ApplicationValidationError(
        'sortBy',
        request.sorting.sortBy,
        `Sort field must be one of: ${allowedSortFields.join(', ')}`,
      );
    }

    if (!['asc', 'desc'].includes(request.sorting.sortOrder)) {
      throw new ApplicationValidationError(
        'sortOrder',
        request.sorting.sortOrder,
        'Sort order must be "asc" or "desc"',
      );
    }
  }

  private applyFilters(
    calendars: Calendar[],
    filters: ListCalendarsRequest['filters'],
  ): Calendar[] {
    let filtered = [...calendars];

    // Filtre par recherche textuelle
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (calendar) =>
          calendar.name.toLowerCase().includes(searchTerm) ||
          calendar.description.toLowerCase().includes(searchTerm),
      );
    }

    // Filtre par type
    if (filters.type) {
      filtered = filtered.filter((calendar) => calendar.type === filters.type);
    }

    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(
        (calendar) => calendar.status === filters.status,
      );
    }

    return filtered;
  }

  private applySorting(
    calendars: Calendar[],
    sorting: ListCalendarsRequest['sorting'],
  ): Calendar[] {
    return [...calendars].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sorting.sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'createdAt':
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
        case 'updatedAt':
          valueA = a.updatedAt.getTime();
          valueB = b.updatedAt.getTime();
          break;
        default:
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
      }

      if (sorting.sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }

  private applyPagination(
    calendars: Calendar[],
    pagination: ListCalendarsRequest['pagination'],
  ): { paginatedCalendars: Calendar[]; totalItems: number } {
    const totalItems = calendars.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    return {
      paginatedCalendars: calendars.slice(startIndex, endIndex),
      totalItems,
    };
  }

  private mapToCalendarSummary(calendar: Calendar): CalendarSummary {
    return {
      id: calendar.id.getValue(),
      businessId: calendar.businessId.getValue(),
      type: calendar.type,
      name: calendar.name,
      description: calendar.description,
      ownerId: calendar.ownerId?.getValue(),
      status: calendar.status,
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
    };
  }
}
