import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * TypeORM Entity for Prospect
 *
 * 🎯 Purpose: Database mapping for commercial prospects
 * 🏗️ Layer: Infrastructure
 * 📊 Table: prospects
 * 🔗 Schema: Dynamic (from env DB_SCHEMA)
 *
 * 🛡️ Security Features:
 * - UUID primary key for security
 * - Indexed fields for performance
 * - Audit trail with created/updated timestamps
 * - Created/updated by user tracking
 *
 * 💰 Business Features:
 * - Staff count based pricing tiers
 * - Estimated value tracking
 * - Flexible status management
 * - Source attribution tracking
 * - Sales rep assignment
 */
@Entity('prospects')
@Index('IDX_prospects_status', ['status'])
@Index('IDX_prospects_assigned_sales_rep', ['assignedSalesRep'])
@Index('IDX_prospects_business_size', ['businessSize'])
@Index('IDX_prospects_source', ['source'])
@Index('IDX_prospects_created_at', ['createdAt'])
export class ProspectOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  // 🏢 Business Information
  @Column('varchar', { length: 200, name: 'business_name' })
  @Index('IDX_prospects_business_name')
  businessName!: string;

  @Column('varchar', { length: 100, name: 'contact_name' })
  contactName!: string;

  @Column('varchar', { length: 255, name: 'email' })
  @Index('IDX_prospects_email')
  email!: string;

  @Column('varchar', { length: 20, nullable: true, name: 'phone' })
  phone?: string;

  @Column('text', { nullable: true, name: 'description' })
  description?: string;

  // 💼 Business Metrics
  @Column('varchar', { length: 20, name: 'business_size' })
  businessSize!: string; // SMALL, MEDIUM, LARGE, ENTERPRISE

  @Column('integer', { name: 'estimated_staff_count' })
  @Index('IDX_prospects_estimated_staff_count')
  estimatedStaffCount!: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'estimated_value' })
  @Index('IDX_prospects_estimated_value')
  estimatedValue!: number;

  @Column('varchar', {
    length: 3,
    default: 'EUR',
    name: 'estimated_value_currency',
  })
  estimatedValueCurrency!: string;

  // 📊 Status and Workflow
  @Column('varchar', { length: 30, name: 'status' })
  status!: string; // LEAD, QUALIFIED, PROPOSAL_SENT, NEGOTIATION, CLOSED_WON, CLOSED_LOST

  @Column('varchar', { length: 50, nullable: true, name: 'source' })
  source?: string; // WEBSITE, REFERRAL, COLD_OUTREACH, MARKETING, EVENT, etc.

  @Column('uuid', { nullable: true, name: 'assigned_sales_rep' })
  assignedSalesRep?: string;

  @Column('timestamp', { nullable: true, name: 'last_contact_date' })
  lastContactDate?: Date;

  @Column('text', { nullable: true, name: 'notes' })
  notes?: string;

  // 🎯 Pricing and Conversion
  @Column('jsonb', { nullable: true, name: 'pricing_proposal' })
  pricingProposal?: any; // Stored as JSON for flexibility

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    name: 'proposed_monthly_price',
  })
  proposedMonthlyPrice?: number;

  @Column('varchar', { length: 3, nullable: true, name: 'proposed_currency' })
  proposedCurrency?: string;

  @Column('timestamp', { nullable: true, name: 'expected_closing_date' })
  expectedClosingDate?: Date;

  @Column('integer', { default: 0, name: 'priority_score' })
  @Index('IDX_prospects_priority_score')
  priorityScore!: number; // 0-100 score for prospect prioritization

  // 🔍 Tracking and Analytics
  @Column('integer', { default: 0, name: 'interaction_count' })
  interactionCount!: number;

  @Column('timestamp', { nullable: true, name: 'first_contact_date' })
  firstContactDate?: Date;

  @Column('jsonb', { nullable: true, name: 'tags' })
  tags?: string[]; // Stored as JSON array

  @Column('jsonb', { nullable: true, name: 'custom_fields' })
  customFields?: any; // Flexible custom data storage

  // 🛡️ Audit Trail (Required by Copilot instructions)
  @Column('uuid', { name: 'created_by' })
  createdBy!: string; // UUID of user who created this prospect

  @Column('uuid', { name: 'updated_by' })
  updatedBy!: string; // UUID of user who last updated this prospect

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // 🏷️ Soft Delete Support
  @Column('timestamp', { nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  @Column('uuid', { nullable: true, name: 'deleted_by' })
  deletedBy?: string;

  @Column('text', { nullable: true, name: 'deletion_reason' })
  deletionReason?: string;
}
