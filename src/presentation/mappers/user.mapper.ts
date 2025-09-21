/**
 * 🔄 User Mappers - Clean Architecture
 *
 * Mappers pour convertir entre les entités Domain/Infrastructure et les DTOs Presentation
 * Respect strict de la Clean Architecture avec séparation des couches
 */

import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../../infrastructure/database/sql/postgresql/entities/user-orm.entity';
import {
  ListUsersResponseDto,
  PaginationMetaDto,
  UserListItemDto,
  UserResponseDto,
  UserRole,
} from '../dtos/user.dto';

// ═══════════════════════════════════════════════════════════════
// 🏛️ DOMAIN ENTITY → PRESENTATION DTO
// ═══════════════════════════════════════════════════════════════

/**
 * Convertit une entité User (Domain) vers UserResponseDto (Presentation)
 */
export class UserToDtoMapper {
  static toUserResponse(user: User): UserResponseDto {
    // Parse du nom complet en prénom/nom
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: user.id,
      email: user.email.value,
      firstName,
      lastName,
      role: user.role as UserRole,
      phone: undefined, // Optionnel
      isActive: user.isActive ?? true,
      isVerified: user.isVerified ?? false,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() ?? user.createdAt.toISOString(),
    };
  }

  static toUserListItem(user: User): UserListItemDto {
    // Parse du nom complet en prénom/nom
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: user.id,
      email: user.email.value,
      username: undefined, // User entity n'a pas de username
      firstName,
      lastName,
      role: user.role as UserRole,
      isActive: true, // User entity n'a pas de isActive, défaut à true
      isVerified: false, // User entity n'a pas de isVerified, défaut à false
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🗄️ ORM ENTITY → PRESENTATION DTO
// ═══════════════════════════════════════════════════════════════

/**
 * Convertit une entité UserOrmEntity (Infrastructure) vers DTOs (Presentation)
 */
export class UserOrmToDtoMapper {
  static toUserResponse(userOrm: UserOrmEntity): UserResponseDto {
    return {
      id: userOrm.id,
      email: userOrm.email,
      firstName: userOrm.firstName,
      lastName: userOrm.lastName,
      role: userOrm.role as UserRole,
      phone: undefined, // UserOrmEntity n'a pas de champ phone
      isActive: userOrm.isActive,
      isVerified: userOrm.isVerified,
      createdAt: userOrm.createdAt.toISOString(),
      updatedAt: userOrm.updatedAt.toISOString(),
    };
  }

  static toUserListItem(userOrm: UserOrmEntity): UserListItemDto {
    return {
      id: userOrm.id,
      email: userOrm.email,
      username: userOrm.username,
      firstName: userOrm.firstName,
      lastName: userOrm.lastName,
      role: userOrm.role as UserRole,
      isActive: userOrm.isActive,
      isVerified: userOrm.isVerified,
      createdAt: userOrm.createdAt.toISOString(),
      updatedAt: userOrm.updatedAt.toISOString(),
    };
  }

  /**
   * Convertit un tableau d'entités UserOrmEntity vers UserListItemDto[]
   */
  static toUserListItems(userOrms: UserOrmEntity[]): UserListItemDto[] {
    return userOrms.map((userOrm) => this.toUserListItem(userOrm));
  }
}

// ═══════════════════════════════════════════════════════════════
// 📊 PAGINATION MAPPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Mapper pour les métadonnées de pagination
 */
export class PaginationMapper {
  static toPaginationMeta(
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
  ): PaginationMetaDto {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 📋 COMPLETE RESPONSE MAPPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Mapper pour la réponse complète de liste des utilisateurs
 */
export class UserListResponseMapper {
  /**
   * Crée une réponse complète à partir d'entités ORM et métadonnées
   */
  static fromOrmEntities(
    userOrms: UserOrmEntity[],
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
    message: string = 'Users retrieved successfully',
  ): ListUsersResponseDto {
    return {
      data: UserOrmToDtoMapper.toUserListItems(userOrms),
      meta: PaginationMapper.toPaginationMeta(
        currentPage,
        itemsPerPage,
        totalItems,
      ),
      message,
    };
  }

  /**
   * Crée une réponse complète à partir d'entités Domain et métadonnées
   */
  static fromDomainEntities(
    users: User[],
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
    message: string = 'Users retrieved successfully',
  ): ListUsersResponseDto {
    return {
      data: users.map((user) => UserToDtoMapper.toUserListItem(user)),
      meta: PaginationMapper.toPaginationMeta(
        currentPage,
        itemsPerPage,
        totalItems,
      ),
      message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// 🔧 UTILITY MAPPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Utilitaires de conversion pour les mappers
 */
export class UserMapperUtils {
  /**
   * Convertit un rôle string vers UserRole enum
   */
  static toUserRoleEnum(role: string): UserRole {
    if (Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    // Fallback par défaut
    return UserRole.REGULAR_CLIENT;
  }

  /**
   * Parse un nom complet en prénom/nom
   */
  static parseFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const parts = fullName.trim().split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
  }

  /**
   * Combine prénom et nom en nom complet
   */
  static buildFullName(firstName: string, lastName: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Valide et normalise un email
   */
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Formate une date pour l'affichage API
   */
  static formatDateForApi(date: Date): string {
    return date.toISOString();
  }
}

// ═══════════════════════════════════════════════════════════════
// 📝 EXEMPLES D'UTILISATION
// ═══════════════════════════════════════════════════════════════

/**
 * Exemples d'utilisation des mappers
 *
 * // Dans un Use Case (Domain → DTO)
 * const users: User[] = await this.userRepository.findAll();
 * const response = UserListResponseMapper.fromDomainEntities(
 *   users, 1, 20, users.length
 * );
 *
 * // Dans un Repository (ORM → DTO)
 * const userOrms: UserOrmEntity[] = await this.ormRepository.find();
 * const response = UserListResponseMapper.fromOrmEntities(
 *   userOrms, 1, 20, userOrms.length
 * );
 *
 * // Conversion individuelle
 * const userDto = UserOrmToDtoMapper.toUserListItem(userOrm);
 * const userResponse = UserToDtoMapper.toUserResponse(user);
 */
