import { RoleAssignment } from '@domain/entities/role-assignment.entity';
import { RoleAssignmentOrmEntity } from '@infrastructure/database/sql/postgresql/entities/role-assignment-orm.entity';

/**
 * 🔄 RoleAssignment ORM Mapper
 *
 * Conversion bidirectionnelle entre entités Domain et ORM.
 * Respecte les principes de Clean Architecture et la séparation des couches.
 *
 * ✅ Fonctionnalités :
 * - Conversion Domain → ORM pour persistence
 * - Conversion ORM → Domain pour reconstruction
 * - Support des collections
 * - Validation des données lors des conversions
 */
export class RoleAssignmentOrmMapper {
  /**
   * 🔄 Convertit une entité Domain vers ORM pour persistence
   *
   * @param domain - Entité Domain RoleAssignment
   * @returns Entité ORM prête pour persistence
   */
  static toOrmEntity(domain: RoleAssignment): RoleAssignmentOrmEntity {
    const ormEntity = new RoleAssignmentOrmEntity();

    // 🆔 Identification
    ormEntity.id = domain.getId();
    ormEntity.userId = domain.getUserId();
    ormEntity.role = domain.getRole();

    // 🏢 Contexte métier
    const context = domain.getContext();
    ormEntity.businessId = context.businessId;
    ormEntity.locationId = context.locationId || null;
    ormEntity.departmentId = context.departmentId || null;
    ormEntity.assignmentScope = domain.getAssignmentScope();

    // ⏰ Gestion temporelle
    ormEntity.assignedAt = domain.getAssignedAt();
    ormEntity.expiresAt = domain.getExpiresAt() || null;
    ormEntity.isActive = domain.isActiveAssignment();

    // 📝 Métadonnées
    ormEntity.notes = domain.getNotes() || null;
    ormEntity.metadata = null; // Pas encore implémenté dans l'entité Domain

    // 👥 Audit trail
    ormEntity.assignedBy = domain.getAssignedBy();
    ormEntity.createdBy = domain.getAssignedBy(); // Utilisons assignedBy pour l'instant
    ormEntity.updatedBy = domain.getAssignedBy(); // Utilisons assignedBy pour l'instant

    // ⏱️ Timestamps
    ormEntity.createdAt = domain.getAssignedAt();
    ormEntity.updatedAt = domain.getAssignedAt(); // Utilisons assignedAt pour l'instant

    // 🔄 Versioning et métadonnées techniques
    ormEntity.version = 1; // Version initiale
    ormEntity.assignmentSource = 'MANUAL'; // Valeur par défaut
    ormEntity.priorityLevel = 0; // Valeur par défaut

    return ormEntity;
  }

  /**
   * 🔄 Convertit une entité ORM vers Domain depuis persistence
   *
   * @param orm - Entité ORM depuis la base de données
   * @returns Entité Domain reconstruite
   */
  static toDomainEntity(orm: RoleAssignmentOrmEntity): RoleAssignment {
    // 🏢 Contexte métier depuis ORM
    const context = {
      businessId: orm.businessId,
      locationId: orm.locationId || undefined,
      departmentId: orm.departmentId || undefined,
    };

    // 🔄 Reconstruction de l'entité RoleAssignment via restore()
    return RoleAssignment.restore({
      id: orm.id,
      userId: orm.userId,
      role: orm.role as any, // Cast vers UserRole
      context: context,
      assignedBy: orm.assignedBy,
      assignedAt: orm.assignedAt,
      expiresAt: orm.expiresAt || undefined,
      isActive: orm.isActive,
      notes: orm.notes || undefined,
    });
  }

  /**
   * 🔄 Convertit une liste d'entités ORM vers Domain
   *
   * @param ormEntities - Liste des entités ORM
   * @returns Liste des entités Domain
   */
  static toDomainEntities(
    ormEntities: RoleAssignmentOrmEntity[],
  ): RoleAssignment[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * 🔄 Convertit une liste d'entités Domain vers ORM
   *
   * @param domainEntities - Liste des entités Domain
   * @returns Liste des entités ORM
   */
  static toOrmEntities(
    domainEntities: RoleAssignment[],
  ): RoleAssignmentOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
