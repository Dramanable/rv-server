import { Prospect } from "@domain/entities/prospect.entity";
import { ProspectId } from "@domain/value-objects/prospect-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { Money } from "@domain/value-objects/money.value-object";
import { ProspectStatus } from "@domain/value-objects/prospect-status.value-object";
import { BusinessSizeEnum } from "@domain/enums/business-size.enum";
import { Phone } from "@domain/value-objects/phone.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";
import { ProspectOrmEntity } from "../database/sql/postgresql/entities/prospect-orm.entity";

/**
 * Prospect ORM Mapper
 *
 * 🎯 Purpose: Bidirectional mapping between Domain and ORM entities
 * 🏗️ Layer: Infrastructure
 * 📋 Responsibility: ONLY conversion logic, NO business logic
 *
 * ✅ OBLIGATORY PATTERNS (per Copilot instructions):
 * - Static methods for all conversions
 * - Separate toOrmEntity and toDomainEntity methods
 * - Support for collections (arrays)
 * - Value objects reconstruction with proper factory methods
 * - Null-safe handling for optional fields
 *
 * 🚫 VIOLATIONS TO AVOID:
 * - No business logic in mappers
 * - No direct constructor calls for Value Objects
 * - No hardcoded values or defaults
 * - No transformation of business rules
 */
export class ProspectOrmMapper {
  /**
   * Convert Domain Entity to ORM Entity for persistence
   * 🎯 RESPONSIBILITY: Domain → ORM conversion for database storage
   */
  static toOrmEntity(domain: Prospect): ProspectOrmEntity {
    const orm = new ProspectOrmEntity();

    // 🆔 Primary identifiers
    orm.id = domain.getId().getValue();

    // 🏢 Business information
    orm.businessName = domain.getBusinessName();
    orm.contactName = domain.getContactName();
    orm.email = domain.getContactEmail().getValue();
    orm.phone = domain.getContactPhone().getValue();
    orm.description = undefined; // Not in current domain entity

    // 💼 Business metrics
    orm.businessSize = domain.getBusinessSize();
    orm.estimatedStaffCount = domain.getStaffCount();
    orm.estimatedValue = domain.getEstimatedValue().getAmount();
    orm.estimatedValueCurrency = domain.getEstimatedValue().getCurrency();

    // 📊 Status and workflow
    orm.status = domain.getStatus().getValue();
    orm.source = domain.getSource();
    orm.assignedSalesRep = domain.getAssignedSalesRep().getValue();
    orm.lastContactDate = undefined; // Not in current domain entity
    orm.notes = domain.getNotes();

    // 🎯 Pricing and conversion - using estimated monthly price calculation
    const estimatedMonthlyPrice = domain.getEstimatedMonthlyPrice();
    orm.pricingProposal = undefined; // Not in current domain entity
    orm.proposedMonthlyPrice = estimatedMonthlyPrice.getAmount();
    orm.proposedCurrency = estimatedMonthlyPrice.getCurrency();
    orm.expectedClosingDate = undefined; // Not in current domain entity
    orm.priorityScore = domain.isHotProspect() ? 100 : 0; // Convert boolean to score

    // 🔍 Tracking and analytics
    orm.interactionCount = 0; // Default value, not tracked in current domain
    orm.firstContactDate = domain.getCreatedAt(); // Use creation date as first contact
    orm.tags = []; // Default empty array
    orm.customFields = { currentSolution: domain.getCurrentSolution() }; // Store current solution

    // 🛡️ Audit trail (OBLIGATORY per Copilot instructions)
    // Note: Current domain entity doesn't have createdBy/updatedBy, will need to be added
    // TODO: Get userId from use case request context
    orm.createdBy = "00000000-0000-0000-0000-000000000000"; // Temporary default UUID
    orm.updatedBy = "00000000-0000-0000-0000-000000000000"; // Temporary default UUID
    orm.createdAt = domain.getCreatedAt();
    orm.updatedAt = domain.getUpdatedAt();

    // 🏷️ Soft delete support - not in current domain entity
    orm.deletedAt = undefined;
    orm.deletedBy = undefined;
    orm.deletionReason = undefined;

    return orm;
  }

  /**
   * Convert ORM Entity to Domain Entity for business logic
   * 🎯 RESPONSIBILITY: ORM → Domain conversion with Value Objects reconstruction
   */
  static toDomainEntity(orm: ProspectOrmEntity): Prospect {
    // ✅ OBLIGATORY - Reconstruct Value Objects with factory methods
    const prospectId = ProspectId.fromString(orm.id);
    const contactEmail = Email.create(orm.email);
    const contactPhone = Phone.create(orm.phone || ""); // Provide default if null
    const estimatedValue = Money.create(
      Number(orm.estimatedValue),
      orm.estimatedValueCurrency,
    );
    const status = ProspectStatus.fromString(orm.status);
    const assignedSalesRep = UserId.create(orm.assignedSalesRep || ""); // Provide default if null

    // ✅ OBLIGATORY - Use reconstruct method for existing entities
    // Map to the interface that the current domain entity expects
    return Prospect.reconstruct({
      id: prospectId,
      businessName: orm.businessName,
      contactName: orm.contactName,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      status: status,
      assignedSalesRep: assignedSalesRep,
      estimatedValue: estimatedValue,
      notes: orm.notes || "", // Provide default if null
      source: orm.source || "DIRECT", // Provide default if null
      businessSize: orm.businessSize as BusinessSizeEnum,
      staffCount: orm.estimatedStaffCount,
      // Extract currentSolution from customFields if available
      currentSolution: orm.customFields?.currentSolution,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      convertedAt: orm.status === "CLOSED_WON" ? new Date() : undefined,
    });
  }

  /**
   * Convert array of ORM entities to Domain entities
   * 🎯 RESPONSIBILITY: Batch conversion for collections
   */
  static toDomainEntities(ormEntities: ProspectOrmEntity[]): Prospect[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * Convert array of Domain entities to ORM entities
   * 🎯 RESPONSIBILITY: Batch conversion for persistence
   */
  static toOrmEntities(domainEntities: Prospect[]): ProspectOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
