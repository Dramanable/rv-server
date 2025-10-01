/**
 * 🔄 SERVICE MAPPER - Infrastructure Layer
 *
 * Mapper entre Service Domain Entity et Service ORM Entity
 * Respecte les principes Clean Architecture
 */

import { Service } from "../../domain/entities/service.entity";
import { ServiceId } from "../../domain/value-objects/service-id.value-object";
import { BusinessId } from "../../domain/value-objects/business-id.value-object";
import { ServiceTypeId } from "../../domain/value-objects/service-type-id.value-object";
import { UserId } from "../../domain/value-objects/user-id.value-object";
import { Money } from "../../domain/value-objects/money.value-object";
import { FileUrl } from "../../domain/value-objects/file-url.value-object";
import { ServiceOrmEntity } from "../database/sql/postgresql/entities/service-orm.entity";

export class ServiceMapper {
  /**
   * Convertit une entité ORM en entité Domain
   */
  static toDomain(ormEntity: ServiceOrmEntity): Service {
    if (!ormEntity) {
      throw new Error("ServiceOrmEntity is null or undefined");
    }

    // Construction des Value Objects
    const serviceId = ServiceId.create(ormEntity.id);
    const businessId = BusinessId.fromString(ormEntity.business_id);

    // Service Types - TODO: Implémenter la relation many-to-many avec service_types
    const serviceTypeIds: ServiceTypeId[] = [];

    // Staff Assignment
    const assignedStaffIds = ormEntity.assigned_staff_ids
      ? ormEntity.assigned_staff_ids.map((id) => UserId.create(id))
      : [];

    // Base Price depuis pricing JSONB
    let basePrice: Money | undefined;
    if (ormEntity.pricing?.base_price) {
      basePrice = Money.create(
        ormEntity.pricing.base_price.amount,
        ormEntity.pricing.base_price.currency,
      );
    }

    // Création de l'entité Domain via factory method
    const service = Service.create({
      businessId: businessId,
      name: ormEntity.name,
      description: ormEntity.description || "",
      serviceTypeIds: serviceTypeIds,
      basePrice: basePrice?.getAmount() || 0,
      currency: basePrice?.getCurrency() || "EUR",
      duration: ormEntity.scheduling.duration,
      allowOnlineBooking: ormEntity.scheduling.allow_online_booking,
      requiresApproval: ormEntity.scheduling.requires_approval,
      assignedStaffIds: assignedStaffIds,
    });

    return service;
  }

  /**
   * Convertit une entité Domain en entité ORM
   */
  static toOrm(domainEntity: Service): ServiceOrmEntity {
    if (!domainEntity) {
      throw new Error("Service domain entity is null or undefined");
    }

    // Extraction des données depuis l'entité Domain
    const basePrice = domainEntity.getBasePrice();

    const ormEntity = new ServiceOrmEntity();
    ormEntity.id = domainEntity.id.getValue();
    ormEntity.business_id = domainEntity.businessId.getValue();
    ormEntity.name = domainEntity.name;
    ormEntity.description = domainEntity.description;
    ormEntity.category = "OTHER"; // TODO: Mapper vers category appropriée
    ormEntity.status =
      domainEntity.status.toString() === "ACTIVE" ? "ACTIVE" : "DRAFT";

    // Pricing JSONB
    ormEntity.pricing = {
      base_price: basePrice
        ? {
            amount: basePrice.getAmount(),
            currency: basePrice.getCurrency(),
          }
        : null,
    };

    // Pricing Config JSONB
    ormEntity.pricing_config = {
      type: "FIXED",
      visibility: "PUBLIC",
      basePrice: basePrice
        ? {
            amount: basePrice.getAmount(),
            currency: basePrice.getCurrency(),
          }
        : null,
    };

    // Scheduling JSONB
    ormEntity.scheduling = {
      duration: domainEntity.scheduling.duration,
      allow_online_booking: domainEntity.scheduling.allowOnlineBooking,
      requires_approval: domainEntity.scheduling.requiresApproval,
    };

    // Staff
    ormEntity.assigned_staff_ids = domainEntity.assignedStaffIds.map(
      (id: UserId) => id.getValue(),
    );

    // Image - TODO: Gérer FileUrl correctement
    ormEntity.image_url = null;

    // Requirements
    ormEntity.requirements = null;

    // Metadata
    ormEntity.created_at = domainEntity.createdAt;
    ormEntity.updated_at = domainEntity.updatedAt;

    return ormEntity;
  }

  /**
   * Met à jour une entité ORM existante avec les données d'une entité Domain
   */
  static updateOrm(
    ormEntity: ServiceOrmEntity,
    domainEntity: Service,
  ): ServiceOrmEntity {
    if (!ormEntity || !domainEntity) {
      throw new Error("Both ORM and Domain entities are required");
    }

    const basePrice = domainEntity.getBasePrice();

    // Mise à jour des champs modifiables
    ormEntity.name = domainEntity.name;
    ormEntity.description = domainEntity.description;
    ormEntity.status =
      domainEntity.status.toString() === "ACTIVE" ? "ACTIVE" : "DRAFT";

    // Pricing JSONB
    ormEntity.pricing = {
      base_price: basePrice
        ? {
            amount: basePrice.getAmount(),
            currency: basePrice.getCurrency(),
          }
        : null,
    };

    // Pricing Config JSONB
    ormEntity.pricing_config = {
      type: "FIXED",
      visibility: "PUBLIC",
      basePrice: basePrice
        ? {
            amount: basePrice.getAmount(),
            currency: basePrice.getCurrency(),
          }
        : null,
    };

    // Scheduling JSONB
    ormEntity.scheduling = {
      duration: domainEntity.scheduling.duration,
      allow_online_booking: domainEntity.scheduling.allowOnlineBooking,
      requires_approval: domainEntity.scheduling.requiresApproval,
    };

    // Staff
    ormEntity.assigned_staff_ids = domainEntity.assignedStaffIds.map(
      (id: UserId) => id.getValue(),
    );

    ormEntity.updated_at = domainEntity.updatedAt;

    return ormEntity;
  }
}
