import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { BusinessOrmEntity } from "./business-orm.entity";

/**
 * ✅ OBLIGATOIRE - Entité ORM Skill avec audit, performance et business constraints
 *
 * RÈGLES CRITIQUES :
 * - Skills appartiennent à un Business (pas de skills globaux)
 * - Noms de skills uniques par Business
 * - Support de soft delete avec isActive
 * - Audit trail complet (created/updated)
 * - Index optimisés pour recherche et performance
 */
@Entity("skills")
@Index(["businessId", "name"], { unique: true, where: "is_active = true" })
@Index(["businessId", "category"])
@Index(["businessId", "isActive"])
@Index(["businessId", "isCritical"])
@Index(["name"])
@Index(["category"])
export class SkillOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "business_id" })
  businessId!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 50 })
  category!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive!: boolean;

  @Column({ type: "boolean", default: false, name: "is_critical" })
  isCritical!: boolean;

  // ⚠️ TRAÇABILITÉ OPTIONNELLE
  @Column({ type: "uuid", name: "created_by", nullable: true })
  createdBy?: string;

  @Column({ type: "uuid", name: "updated_by", nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // ✅ Relations
  @ManyToOne(() => BusinessOrmEntity, (business) => business.id, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "business_id" })
  business!: BusinessOrmEntity;
}
