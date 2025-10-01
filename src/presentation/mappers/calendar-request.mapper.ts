/**
 * 🔄 Calendar Request Mapper - Conversion DTO vers Use Case
 *
 * ✅ Évite les conflits d'enums entre couches
 * ✅ Conversion safe des types presentation → application
 */

import { ListCalendarsRequest } from '../../application/use-cases/calendar/list-calendars.use-case';
import { CalendarStatus as DomainCalendarStatus } from '../../domain/entities/calendar.entity';
import {
  CalendarStatus as DtoCalendarStatus,
  ListCalendarsDto,
} from '../dtos/calendar.dto';

export class CalendarRequestMapper {
  /**
   * Convertit ListCalendarsDto vers ListCalendarsRequest
   * avec harmonisation des enums
   */
  static toListCalendarsRequest(
    dto: ListCalendarsDto,
    requestingUserId: string,
  ): ListCalendarsRequest {
    return {
      requestingUserId,
      pagination: {
        page: dto.page ?? 1,
        limit: dto.limit ?? 10,
      },
      sorting: {
        sortBy: dto.sortBy ?? 'createdAt',
        sortOrder: dto.sortOrder ?? 'desc',
      },
      filters: {
        search: dto.search,
        businessId: dto.businessId,
        type: dto.type as any,
        status: this.mapCalendarStatusToDomain(dto.status),
      },
    };
  }

  /**
   * Convertit CalendarStatus DTO vers Domain
   */
  private static mapCalendarStatusToDomain(
    status?: DtoCalendarStatus,
  ): DomainCalendarStatus | undefined {
    if (!status) return undefined;

    // Conversion par valeur string pour éviter les conflits TypeScript
    const statusValue = status as string;

    switch (statusValue) {
      case 'ACTIVE':
        return DomainCalendarStatus.ACTIVE;
      case 'INACTIVE':
        return DomainCalendarStatus.INACTIVE;
      case 'MAINTENANCE':
        return DomainCalendarStatus.MAINTENANCE;
      case 'SUSPENDED':
        return DomainCalendarStatus.INACTIVE; // Map to INACTIVE
      case 'ARCHIVED':
        return DomainCalendarStatus.INACTIVE; // Map to INACTIVE
      default:
        return undefined;
    }
  }
}
