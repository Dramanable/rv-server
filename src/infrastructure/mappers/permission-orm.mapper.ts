import { Permission } from '@domain/entities/permission.entity';
import { PermissionOrmEntity } from '@infrastructure/database/sql/postgresql/entities/permission-orm.entity';

/**
 * Permission ORM Mapper
 * Clean Architecture - Infrastructure Layer - Data Mapping
 * Converts between Domain Permission entities and ORM Permission entities
 */
export class PermissionOrmMapper {
  /**
   * Converts Domain Permission entity to ORM entity for persistence
   */
  static toOrmEntity(domain: Permission): PermissionOrmEntity {
    const orm = new PermissionOrmEntity();

    // Extraction des valeurs primitives
    orm.id = domain.getId();
    orm.name = domain.getName();
    orm.display_name = domain.getDisplayName();
    orm.description = domain.getDescription();
    orm.category = domain.getCategory();
    orm.is_system_permission = domain.isSystemPermission();
    orm.is_active = domain.isActive();
    orm.created_at = domain.getCreatedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }

  /**
   * Converts ORM entity to Domain Permission entity from persistence
   */
  static toDomainEntity(orm: PermissionOrmEntity): Permission {
    // Reconstruction de l'entité Domain
    return Permission.reconstruct(
      orm.id,
      orm.name,
      orm.display_name,
      orm.description,
      orm.category,
      orm.is_system_permission,
      orm.is_active,
      orm.created_at,
      orm.updated_at,
    );
  }

  /**
   * Converts array of ORM entities to Domain entities
   */
  static toDomainEntities(ormList: PermissionOrmEntity[]): Permission[] {
    return ormList.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Converts array of Domain entities to ORM entities
   */
  static toOrmEntities(domainList: Permission[]): PermissionOrmEntity[] {
    return domainList.map((domain) => this.toOrmEntity(domain));
  }
}
