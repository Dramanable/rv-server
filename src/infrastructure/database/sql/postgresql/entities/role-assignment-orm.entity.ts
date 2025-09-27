/**
 * 🗄️ INFRASTRUCTURE ORM ENTITY - Role Assignment
 *
 * Entité TypeORM pour les assignations de rôles dans PostgreSQL.
 * Respecte l'architecture Clean en gardant uniquement les annotations ORM.
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("role_assignments")
@Index(["userId", "businessId"], { unique: false })
@Index(["userId", "businessId", "locationId"], { unique: false })
@Index(["userId", "businessId", "locationId", "departmentId"], {
  unique: false,
})
@Index(["role", "businessId"], { unique: false })
@Index(["isActive", "expiresAt"], { unique: false })
export class RoleAssignmentOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // 👤 Assignation
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "role", type: "varchar", length: 50 })
  role!: string;

  // 🏢 Contexte métier - Hiérarchique
  @Column({ name: "business_id", type: "uuid" })
  businessId!: string;

  @Column({ name: "location_id", type: "uuid", nullable: true })
  locationId!: string | null;

  @Column({ name: "department_id", type: "uuid", nullable: true })
  departmentId!: string | null;

  // 🎯 Étendue (scope) calculée
  @Column({ name: "assignment_scope", type: "varchar", length: 20 })
  assignmentScope!: string; // BUSINESS, LOCATION, DEPARTMENT

  // ⏰ Gestion temporelle
  @Column({
    name: "assigned_at",
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  assignedAt!: Date;

  @Column({
    name: "expires_at",
    type: "timestamp with time zone",
    nullable: true,
  })
  expiresAt!: Date | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  // 📝 Métadonnées
  @Column({ name: "notes", type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata!: Record<string, any> | null;

  // 👥 Audit trail - Traçabilité obligatoire
  @Column({ name: "assigned_by", type: "uuid" })
  assignedBy!: string;

  @Column({ name: "created_by", type: "uuid" })
  createdBy!: string;

  @Column({ name: "updated_by", type: "uuid" })
  updatedBy!: string;

  // ⏱️ Timestamps automatiques
  @CreateDateColumn({ name: "created_at", type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp with time zone" })
  updatedAt!: Date;

  // 🔄 Optimistic locking
  @Column({ name: "version", type: "integer", default: 1 })
  version!: number;

  // 📊 Business Intelligence - Métrique pour analytics
  @Column({
    name: "assignment_source",
    type: "varchar",
    length: 50,
    default: "MANUAL",
  })
  assignmentSource!: string; // MANUAL, AUTOMATED, IMPORTED, INHERITED

  @Column({ name: "priority_level", type: "integer", default: 0 })
  priorityLevel!: number; // Pour la résolution des conflits de rôles
}
