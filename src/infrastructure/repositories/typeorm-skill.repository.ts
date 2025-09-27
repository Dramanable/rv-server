import { Repository } from "typeorm";
import { Skill } from "../../domain/entities/skill.entity";
import { ISkillRepository } from "../../domain/repositories/skill.repository";
import { BusinessId } from "../../domain/value-objects/business-id.value-object";
import { SkillOrmEntity } from "../database/sql/postgresql/entities/skill-orm.entity";
import { SkillOrmMapper } from "../mappers/skill-orm.mapper";

/**
 * ✅ OBLIGATOIRE - Repository TypeORM pour Skills
 *
 * RESPONSABILITÉS :
 * - CRUD complet avec validation métier
 * - Recherche et filtrage avancés
 * - Gestion des contraintes d'intégrité
 * - Performance avec pagination et indexation
 * - Support transactions et rollback
 */
export class TypeOrmSkillRepository implements ISkillRepository {
  private readonly repository: Repository<SkillOrmEntity>;

  constructor(repository: Repository<SkillOrmEntity>) {
    this.repository = repository;
  }

  async save(skill: Skill): Promise<Skill> {
    // 1. Conversion Domain → ORM via Mapper
    const ormEntity = SkillOrmMapper.toOrmEntity(skill);

    // 2. Persistence en base
    const savedOrm = await this.repository.save(ormEntity);

    // 3. Conversion ORM → Domain via Mapper
    return SkillOrmMapper.toDomainEntity(savedOrm);
  }

  async findById(id: string): Promise<Skill | null> {
    // 1. Requête ORM
    const ormEntity = await this.repository.findOne({
      where: { id },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain via Mapper
    return SkillOrmMapper.toDomainEntity(ormEntity);
  }

  async findByBusinessId(businessId: BusinessId): Promise<Skill[]> {
    // 1. Requête ORM avec critères business
    const ormEntities = await this.repository.find({
      where: { businessId: businessId.getValue() },
      order: { name: "ASC" },
    });

    // 2. Conversion batch via Mapper
    return SkillOrmMapper.toDomainEntities(ormEntities);
  }

  async findByName(
    businessId: BusinessId,
    name: string,
  ): Promise<Skill | null> {
    // 1. Recherche par nom unique dans le business
    const ormEntity = await this.repository.findOne({
      where: {
        businessId: businessId.getValue(),
        name: name.trim(),
      },
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain
    return SkillOrmMapper.toDomainEntity(ormEntity);
  }

  async findActiveByBusinessId(businessId: BusinessId): Promise<Skill[]> {
    // 1. Requête filtrée sur skills actives
    const ormEntities = await this.repository.find({
      where: {
        businessId: businessId.getValue(),
        isActive: true,
      },
      order: { name: "ASC" },
    });

    // 2. Conversion batch
    return SkillOrmMapper.toDomainEntities(ormEntities);
  }

  async findCriticalByBusinessId(businessId: BusinessId): Promise<Skill[]> {
    // 1. Requête filtrée sur skills critiques
    const ormEntities = await this.repository.find({
      where: {
        businessId: businessId.getValue(),
        isCritical: true,
        isActive: true, // Seulement les critiques actives
      },
      order: { name: "ASC" },
    });

    // 2. Conversion batch
    return SkillOrmMapper.toDomainEntities(ormEntities);
  }

  async findByCategory(
    businessId: BusinessId,
    category: string,
  ): Promise<Skill[]> {
    // 1. Recherche par catégorie
    const ormEntities = await this.repository.find({
      where: {
        businessId: businessId.getValue(),
        category: category.trim(),
      },
      order: { name: "ASC" },
    });

    // 2. Conversion batch
    return SkillOrmMapper.toDomainEntities(ormEntities);
  }

  async searchByName(
    businessId: BusinessId,
    searchTerm: string,
  ): Promise<Skill[]> {
    // 1. Recherche textuelle avec ILIKE (PostgreSQL)
    const ormEntities = await this.repository
      .createQueryBuilder("skill")
      .where("skill.businessId = :businessId", {
        businessId: businessId.getValue(),
      })
      .andWhere("skill.name ILIKE :searchTerm", {
        searchTerm: `%${searchTerm.trim()}%`,
      })
      .orderBy("skill.name", "ASC")
      .getMany();

    // 2. Conversion batch
    return SkillOrmMapper.toDomainEntities(ormEntities);
  }

  async countByBusinessId(businessId: BusinessId): Promise<number> {
    return await this.repository.count({
      where: { businessId: businessId.getValue() },
    });
  }

  async existsByName(businessId: BusinessId, name: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        businessId: businessId.getValue(),
        name: name.trim(),
      },
    });

    return count > 0;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async isSkillInUse(id: string): Promise<boolean> {
    // TODO: Implémenter la vérification d'usage dans StaffSkills
    // Actuellement, retourne false en attendant l'implémentation complète
    return false;
  }

  async searchByText(
    businessId: BusinessId,
    searchTerm: string,
    options?: {
      includeInactive?: boolean;
      limit?: number;
    },
  ): Promise<Skill[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("skill")
      .where("skill.businessId = :businessId", {
        businessId: businessId.getValue(),
      })
      .andWhere(
        "(skill.name ILIKE :searchTerm OR skill.description ILIKE :searchTerm)",
        {
          searchTerm: `%${searchTerm.trim()}%`,
        },
      );

    if (!options?.includeInactive) {
      queryBuilder.andWhere("skill.isActive = :isActive", { isActive: true });
    }

    queryBuilder.orderBy("skill.name", "ASC");

    if (options?.limit) {
      queryBuilder.take(options.limit);
    }

    const ormEntities = await queryBuilder.getMany();
    return SkillOrmMapper.toDomainEntities(ormEntities);
  }

  async findDistinctCategories(businessId: BusinessId): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder("skill")
      .select("DISTINCT skill.category", "category")
      .where("skill.businessId = :businessId", {
        businessId: businessId.getValue(),
      })
      .andWhere("skill.isActive = :isActive", { isActive: true })
      .orderBy("skill.category", "ASC")
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  async isNameTaken(
    businessId: BusinessId,
    name: string,
    excludeSkillId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder("skill")
      .where("skill.businessId = :businessId", {
        businessId: businessId.getValue(),
      })
      .andWhere("skill.name = :name", { name: name.trim() });

    if (excludeSkillId) {
      queryBuilder.andWhere("skill.id != :excludeSkillId", { excludeSkillId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async findMostUsedSkills(
    businessId: BusinessId,
    limit?: number,
  ): Promise<
    {
      skill: Skill;
      usageCount: number;
    }[]
  > {
    // TODO: Implémenter la logique avec StaffSkills
    // Pour l'instant, retourne les skills les plus récentes
    const ormEntities = await this.repository.find({
      where: {
        businessId: businessId.getValue(),
        isActive: true,
      },
      order: { createdAt: "DESC" },
      take: limit || 10,
    });

    return ormEntities.map((orm) => ({
      skill: SkillOrmMapper.toDomainEntity(orm),
      usageCount: 0, // Placeholder until staff skills implementation
    }));
  }

  /**
   * Méthode avancée : Pagination avec filtres multiples
   */
  async findWithFilters(request: {
    businessId: BusinessId;
    search?: string;
    category?: string;
    isCritical?: boolean;
    isActive?: boolean;
    page: number;
    limit: number;
    sortBy?: "name" | "category" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    skills: Skill[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const queryBuilder = this.repository
      .createQueryBuilder("skill")
      .where("skill.businessId = :businessId", {
        businessId: request.businessId.getValue(),
      });

    // Filtres conditionnels
    if (request.search) {
      queryBuilder.andWhere(
        "skill.name ILIKE :search OR skill.description ILIKE :search",
        {
          search: `%${request.search.trim()}%`,
        },
      );
    }

    if (request.category) {
      queryBuilder.andWhere("skill.category = :category", {
        category: request.category,
      });
    }

    if (request.isActive !== undefined) {
      queryBuilder.andWhere("skill.isActive = :isActive", {
        isActive: request.isActive,
      });
    }

    if (request.isCritical !== undefined) {
      queryBuilder.andWhere("skill.isCritical = :isCritical", {
        isCritical: request.isCritical,
      });
    }

    // Tri
    const sortBy = request.sortBy || "name";
    const sortOrder = request.sortOrder || "asc";
    queryBuilder.orderBy(
      `skill.${sortBy}`,
      sortOrder.toUpperCase() as "ASC" | "DESC",
    );

    // Pagination
    const offset = (request.page - 1) * request.limit;
    queryBuilder.skip(offset).take(request.limit);

    // Exécution avec comptage
    const [ormEntities, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / request.limit);

    return {
      skills: SkillOrmMapper.toDomainEntities(ormEntities),
      total,
      totalPages,
      currentPage: request.page,
    };
  }
}
