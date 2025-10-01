import { Skill } from "@domain/entities/skill.entity";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { SkillOrmEntity } from "../database/sql/postgresql/entities/skill-orm.entity";

/**
 * ✅ OBLIGATOIRE - Mapper Skill : Domain ↔ ORM
 *
 * RESPONSABILITÉS :
 * - Conversion Domain → ORM (Persistence)
 * - Conversion ORM → Domain (Reconstruction)
 * - Conversion Batch (Collections)
 * - Préservation de l'intégrité métier
 * - ZÉRO logique métier dans le mapper
 */
export class SkillOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: Skill): SkillOrmEntity {
    const ormEntity = new SkillOrmEntity();

    ormEntity.id = domain.getId();
    ormEntity.businessId = domain.getBusinessId().getValue();
    ormEntity.name = domain.getName();
    ormEntity.category = domain.getCategory();
    ormEntity.description = domain.getDescription();
    ormEntity.isActive = domain.isActive();
    ormEntity.isCritical = domain.isCritical();
    // ⚠️ TRAÇABILITÉ OBLIGATOIRE
    ormEntity.createdBy = domain.getCreatedBy();
    ormEntity.updatedBy = domain.getUpdatedBy();
    ormEntity.createdAt = domain.getCreatedAt();
    ormEntity.updatedAt = domain.getUpdatedAt();

    return ormEntity;
  }

  /**
   * Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: SkillOrmEntity): Skill {
    const businessId = new BusinessId(orm.businessId);

    return Skill.reconstruct({
      id: orm.id,
      businessId: businessId,
      name: orm.name,
      category: orm.category,
      description: orm.description || "", // Gestion nullable
      isCritical: orm.isCritical,
      isActive: orm.isActive,
      // ⚠️ TRAÇABILITÉ OBLIGATOIRE
      createdBy: orm.createdBy,
      updatedBy: orm.updatedBy,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(ormEntities: SkillOrmEntity[]): Skill[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convertit liste Domain vers ORM
   */
  static toOrmEntities(domainEntities: Skill[]): SkillOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
