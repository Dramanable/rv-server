/**
 * @fileoverview Calendar Type Presentation Mapper
 * @module presentation/mappers/calendar-type.mapper
 */

import {
  CreateCalendarTypeRequest,
  ListCalendarTypesRequest,
  UpdateCalendarTypeRequest,
} from '@application/use-cases/calendar-types/calendar-type.types';
import { CalendarType } from '@domain/entities/calendar-type.entity';
import {
  CalendarTypeDto,
  CreateCalendarTypeDto,
  ListCalendarTypesDto,
  UpdateCalendarTypeDto,
} from '@presentation/dtos/calendar-types';

/**
 * Mapper pour la conversion entre les DTOs de présentation et les entités/requêtes
 */
export class CalendarTypeMapper {
  /**
   * Convertit une entité Domain vers DTO de présentation
   */
  static toDto(calendarType: CalendarType): CalendarTypeDto {
    return {
      id: calendarType.getId().getValue(),
      businessId: calendarType.getBusinessId().getValue(),
      name: calendarType.getName(),
      code: calendarType.getCode(),
      description: calendarType.getDescription(),
      icon: calendarType.getIcon(),
      color: calendarType.getColor(),
      isBuiltIn: calendarType.isBuiltIn(),
      isActive: calendarType.isActive(),
      sortOrder: calendarType.getSortOrder(),
      createdBy: calendarType.getCreatedBy(),
      updatedBy: calendarType.getUpdatedBy(),
      createdAt: calendarType.getCreatedAt(),
      updatedAt: calendarType.getUpdatedAt(),
    };
  }

  /**
   * Convertit une liste d'entités Domain vers DTOs de présentation
   */
  static toDtos(calendarTypes: CalendarType[]): CalendarTypeDto[] {
    return calendarTypes.map((ct) => this.toDto(ct));
  }

  /**
   * Convertit le DTO de création vers une requête de Use Case
   */
  static toCreateRequest(
    dto: CreateCalendarTypeDto,
    requestingUserId: string,
    correlationId: string,
  ): CreateCalendarTypeRequest {
    return {
      businessId: dto.businessId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      icon: dto.icon,
      color: dto.color,
      sortOrder: dto.sortOrder || 0,
      isActive: dto.isActive ?? true,
      requestingUserId,
      correlationId,
      timestamp: new Date(),
    };
  }

  /**
   * Convertit le DTO de mise à jour vers une requête de Use Case
   */
  static toUpdateRequest(
    calendarTypeId: string,
    businessId: string,
    dto: UpdateCalendarTypeDto,
    requestingUserId: string,
    correlationId: string,
  ): UpdateCalendarTypeRequest {
    return {
      calendarTypeId,
      businessId,
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      color: dto.color,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      requestingUserId,
      correlationId,
    };
  }

  /**
   * Convertit le DTO de liste vers une requête de Use Case
   */
  static toListRequest(
    dto: ListCalendarTypesDto,
    requestingUserId: string,
    correlationId: string,
  ): ListCalendarTypesRequest {
    return {
      businessId: dto.businessId,
      search: dto.search,
      isActive: dto.isActive,
      page: dto.page || 1,
      limit: dto.limit || 10,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
      requestingUserId,
      correlationId,
    };
  }
}
