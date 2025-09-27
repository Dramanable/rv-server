import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BusinessOrmEntity } from "./business-orm.entity";
import { CalendarOrmEntity } from "./calendar-orm.entity";
import { ServiceOrmEntity } from "./service-orm.entity";
import { UserOrmEntity } from "./user-orm.entity";

/**
 * 📅 APPOINTMENT ORM ENTITY
 * ✅ Clean Architecture compliant - Infrastructure layer
 * ✅ TypeORM entity for PostgreSQL persistence
 * ✅ NO mapping logic here - use dedicated mappers
 */

@Entity("appointments")
@Index(["business_id", "calendar_id"])
@Index(["calendar_id", "start_time", "end_time"])
@Index(["client_email"])
@Index(["status"])
@Index(["start_time"])
export class AppointmentOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  business_id!: string;

  @Column({ type: "uuid" })
  calendar_id!: string;

  @Column({ type: "uuid" })
  service_id!: string;

  // Time slot information
  @Column({ type: "timestamp with time zone" })
  start_time!: Date;

  @Column({ type: "timestamp with time zone" })
  end_time!: Date;

  // Client information
  @Column({ type: "varchar", length: 100 })
  client_first_name!: string;

  @Column({ type: "varchar", length: 100 })
  client_last_name!: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  client_email!: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  client_phone?: string;

  @Column({ type: "date", nullable: true })
  client_date_of_birth?: Date;

  @Column({ type: "text", nullable: true })
  client_notes?: string;

  @Column({ type: "boolean", default: false })
  is_new_client!: boolean;

  // Appointment details
  // ✅ Type removed - now determined by linked Service

  @Column({
    type: "enum",
    enum: [
      "REQUESTED",
      "CONFIRMED",
      "CANCELLED",
      "NO_SHOW",
      "COMPLETED",
      "IN_PROGRESS",
      "RESCHEDULED",
    ],
    default: "REQUESTED",
  })
  @Index()
  status!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  title?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  // Staff assignment
  @Column({ type: "uuid", nullable: true })
  assigned_staff_id?: string;

  // Pricing information
  @Column({ type: "decimal", precision: 10, scale: 2 })
  base_price_amount!: number;

  @Column({ type: "char", length: 3, default: "EUR" })
  base_price_currency!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_amount!: number;

  @Column({ type: "char", length: 3, default: "EUR" })
  total_currency!: string;

  @Column({
    type: "enum",
    enum: ["PENDING", "PAID", "PARTIAL", "REFUNDED"],
    default: "PENDING",
  })
  payment_status!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  payment_method?: string;

  // Discounts (JSON column for flexibility)
  @Column({ type: "jsonb", nullable: true })
  discounts?: {
    type: "PERCENTAGE" | "FIXED";
    value: number;
    reason?: string;
  }[];

  // Taxes (JSON column for flexibility)
  @Column({ type: "jsonb", nullable: true })
  taxes?: {
    name: string;
    rate: number;
    amount: number;
    currency: string;
  }[];

  // Notes (stored as JSON array)
  @Column({ type: "jsonb", nullable: true })
  notes?: {
    id: string;
    author_id: string;
    content: string;
    is_private: boolean;
    created_at: string;
    updated_at?: string;
  }[];

  // Reminders (stored as JSON array)
  @Column({ type: "jsonb", nullable: true })
  reminders?: {
    method: "EMAIL" | "SMS" | "PUSH" | "CALL";
    scheduled_for: string;
    sent: boolean;
    sent_at?: string;
    template: string;
  }[];

  // Metadata
  @Column({
    type: "enum",
    enum: ["ONLINE", "PHONE", "WALK_IN", "ADMIN"],
    default: "ONLINE",
  })
  source!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  user_agent?: string;

  @Column({ type: "inet", nullable: true })
  ip_address?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  referral_source?: string;

  @Column({ type: "varchar", array: true, nullable: true })
  tags?: string[];

  @Column({ type: "jsonb", nullable: true })
  custom_fields?: Record<string, any>;

  // Recurring pattern
  @Column({ type: "uuid", nullable: true })
  parent_appointment_id?: string;

  @Column({ type: "jsonb", nullable: true })
  recurring_pattern?: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    interval: number;
    end_date?: string;
    occurrences?: number;
  };

  // Timestamps
  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at!: Date;

  // Relations (without cascade - managed by business logic)
  @ManyToOne(() => BusinessOrmEntity)
  @JoinColumn({ name: "business_id" })
  business?: BusinessOrmEntity;

  @ManyToOne(() => CalendarOrmEntity)
  @JoinColumn({ name: "calendar_id" })
  calendar?: CalendarOrmEntity;

  @ManyToOne(() => ServiceOrmEntity)
  @JoinColumn({ name: "service_id" })
  service?: ServiceOrmEntity;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: "assigned_staff_id" })
  assigned_staff?: UserOrmEntity;

  @ManyToOne(() => AppointmentOrmEntity)
  @JoinColumn({ name: "parent_appointment_id" })
  parent_appointment?: AppointmentOrmEntity;
}
