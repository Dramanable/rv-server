/**
 * 🔄 MAPPERS CLEAN ARCHITECTURE - Infrastructure Layer
 *
 * Mappers statiques pour conversion entre couches :
 * - Domain ↔ Infrastructure (TypeORM, MongoDB)
 * - Domain ↔ Presentation (DTOs)
 * 
 * ✅ Respect strict de Clean Architecture
 * ✅ Performance optimisée (pas de reflection)
 * ✅ Type-safe avec TypeScript strict
 */

// Domain Entities
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserRole } from '../../shared/enums/user-role.enum';

// Infrastructure Entities
import { UserOrmEntity } from '../database/entities/typeorm/user-orm.entity';

// Presentation DTOs
import { 
  UserResponseDto, 
  LoginResponseDto, 
  RegisterResponseDto 
} from '../../presentation/dtos/auth.dto';

/**
 * 🏛️ USER MAPPERS - Domain ↔ Infrastructure ↔ Presentation
 */
export class UserMapper {

  /**
   * Domain User → TypeORM UserOrmEntity
   */
  static toTypeOrmEntity(domainUser: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = domainUser.id;
    entity.email = domainUser.email.value;
    entity.firstName = domainUser.firstName || domainUser.name.split(' ')[0] || domainUser.name;
    entity.lastName = domainUser.lastName || domainUser.name.split(' ').slice(1).join(' ') || '';
    entity.hashedPassword = domainUser.hashedPassword || '';
    entity.role = domainUser.role;
    entity.isActive = domainUser.isActive ?? true;
    entity.isVerified = domainUser.isVerified ?? false;
    entity.username = domainUser.username;
    entity.createdAt = domainUser.createdAt;
    entity.updatedAt = domainUser.updatedAt || new Date();
    return entity;
  }

  /**
   * TypeORM UserOrmEntity → Domain User
   */
  static fromTypeOrmEntity(entity: UserOrmEntity): User {
    return User.createWithHashedPassword(
      entity.id,
      Email.create(entity.email),
      `${entity.firstName} ${entity.lastName}`.trim(),
      entity.role as UserRole,
      entity.hashedPassword,
      entity.createdAt,
      entity.updatedAt,
      entity.username,
      entity.isActive,
      entity.isVerified,
      false // passwordChangeRequired par défaut
    );
  }

  /**
   * Domain User → UserResponseDto (Presentation)
   */
  static toResponseDto(domainUser: User): UserResponseDto {
    return {
      id: domainUser.id,
      email: domainUser.email.value,
      name: domainUser.name,
      role: domainUser.role,
      createdAt: domainUser.createdAt.toISOString(),
    };
  }

  /**
   * Array mapping - Domain Users → UserResponseDto[]
   */
  static toResponseDtoArray(domainUsers: User[]): UserResponseDto[] {
    return domainUsers.map(user => this.toResponseDto(user));
  }

  /**
   * Array mapping - TypeORM Entities → Domain Users
   */
  static fromTypeOrmEntityArray(entities: UserOrmEntity[]): User[] {
    return entities.map(entity => this.fromTypeOrmEntity(entity));
  }
}

/**
 * 🔐 AUTH RESPONSE MAPPERS - Use Cases Results → DTOs
 */
export class AuthResponseMapper {

  /**
   * Login Use Case Result → LoginResponseDto
   */
  static toLoginResponseDto(
    user: User, 
    message: string, 
    // tokens ne sont pas exposés dans la réponse (HttpOnly cookies)
  ): LoginResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      message,
      // tokens omis volontairement - gérés par cookies HttpOnly
    };
  }

  /**
   * Register Use Case Result → RegisterResponseDto
   */
  static toRegisterResponseDto(
    user: User, 
    message: string,
  ): RegisterResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      message,
      // tokens omis volontairement - gérés par cookies HttpOnly
    };
  }
}

/**
 * 🔄 GENERIC MAPPER INTERFACE
 * Interface générique pour standardiser les mappers
 */
export interface DomainMapper<TDomain, TInfra, TDto> {
  toInfrastructure(domain: TDomain): TInfra;
  toDomain(infra: TInfra): TDomain;
  toDto(domain: TDomain): TDto;
  toDtoArray(domains: TDomain[]): TDto[];
}

/**
 * 🎯 EXPORT CENTRALISÉ
 */
export const Mappers = {
  User: UserMapper,
  AuthResponse: AuthResponseMapper,
} as const;

/**
 * 🛡️ VALIDATION HELPERS
 * Utilitaires pour valider les mappings
 */
export class MapperValidator {
  
  /**
   * Valide qu'un objet n'est pas null/undefined avant mapping
   */
  static validateNotNull<T>(obj: T | null | undefined, entityName: string): T {
    if (obj === null || obj === undefined) {
      throw new Error(`Cannot map ${entityName}: object is null or undefined`);
    }
    return obj;
  }

  /**
   * Valide qu'un array n'est pas null/undefined avant mapping
   */
  static validateArray<T>(arr: T[] | null | undefined, entityName: string): T[] {
    if (arr === null || arr === undefined) {
      throw new Error(`Cannot map ${entityName} array: array is null or undefined`);
    }
    return arr;
  }
}