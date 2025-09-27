/**
 * 🏢 BusinessSector Entity ORM - TypeORM + Clean Architecture + Node.js 24
 *
 * Entité TypeORM pour les secteurs d'activité avec contraintes strictes et optimisations Node.js 24
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("business_sectors")
@Index(["code"], { unique: true })
@Index(["isActive"])
export class BusinessSectorOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    comment:
      "Unique business sector code (uppercase, alphanumeric with underscores)",
  })
  code!: string;

  @Column({
    type: "varchar",
    length: 255,
    comment: "Human-readable business sector name",
  })
  name!: string;

  @Column({
    type: "text",
    nullable: true,
    comment: "Optional detailed description of the business sector",
  })
  description?: string;

  @Column({
    type: "boolean",
    default: true,
    name: "is_active",
    comment: "Whether this business sector is available for new businesses",
  })
  isActive!: boolean;

  @Column({
    type: "uuid",
    name: "created_by",
    comment: "ID of the user (super admin) who created this sector",
  })
  createdBy!: string;

  @Column({
    type: "uuid",
    name: "updated_by",
    nullable: true,
    comment: "ID of the user who last updated this sector",
  })
  updatedBy?: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    comment: "Timestamp when the business sector was created",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    comment: "Timestamp when the business sector was last updated",
  })
  updatedAt!: Date;

  /**
   * ✅ Méthode de conversion vers l'entité Domain
   *
   * @returns BusinessSector domain entity
   */
  toDomainEntity(): any {
    // Cette méthode sera implémentée avec l'import de l'entité Domain
    // pour éviter les dépendances circulaires
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * ✅ Méthode statique de création depuis l'entité Domain
   *
   * @param domainEntity BusinessSector domain entity
   * @returns BusinessSectorOrmEntity
   */
  static fromDomainEntity(domainEntity: any): BusinessSectorOrmEntity {
    const ormEntity = new BusinessSectorOrmEntity();

    if (domainEntity.id) {
      ormEntity.id = domainEntity.id;
    }

    ormEntity.code = domainEntity.code;
    ormEntity.name = domainEntity.name;
    ormEntity.description = domainEntity.description;
    ormEntity.isActive = domainEntity.isActive;
    ormEntity.createdBy = domainEntity.createdBy;
    ormEntity.updatedBy = domainEntity.updatedBy;

    if (domainEntity.createdAt) {
      ormEntity.createdAt = domainEntity.createdAt;
    }

    return ormEntity;
  }
}
