/**
 * 🔄 TypeORM Business Entity Mapper
 *
 * Mapper statique entre l'entité domaine Business et l'entité ORM TypeORM
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { Business, BusinessSector } from '../../../../domain/entities/business.entity';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { BusinessName } from '../../../../domain/value-objects/business-name.value-object';
import { Address } from '../../../../domain/value-objects/address.value-object';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Phone } from '../../../../domain/value-objects/phone.value-object';
import { BusinessOrmEntity } from '../../entities/typeorm/business.entity';

export class TypeOrmBusinessMapper {
  /**
   * 🔄 Conversion Domain → TypeORM
   */
  static toOrmEntity(domainEntity: Business): Partial<BusinessOrmEntity> {
    const ormEntity = new BusinessOrmEntity();
    
    ormEntity.id = domainEntity.id.getValue();
    ormEntity.name = domainEntity.name.getValue();
    ormEntity.description = domainEntity.description;
    ormEntity.sector = domainEntity.sector;
    
    // Address mapping
    ormEntity.street = domainEntity.address.street;
    ormEntity.city = domainEntity.address.city;
    ormEntity.postalCode = domainEntity.address.postalCode;
    ormEntity.country = domainEntity.address.country;
    ormEntity.latitude = domainEntity.address.latitude;
    ormEntity.longitude = domainEntity.address.longitude;
    
    // Contact info mapping
    ormEntity.email = domainEntity.contactInfo?.email?.value;
    ormEntity.phone = domainEntity.contactInfo?.phone?.getValue();
    ormEntity.website = domainEntity.contactInfo?.website;
    
    ormEntity.isActive = true; // Default active
    ormEntity.isVerified = false; // Default not verified

    return ormEntity;
  }

  /**
   * 🔄 Conversion TypeORM → Domain
   */
  static toDomainEntity(ormEntity: BusinessOrmEntity): Business {
    const address = Address.create({
      street: ormEntity.street,
      city: ormEntity.city,
      postalCode: ormEntity.postalCode,
      country: ormEntity.country,
      latitude: ormEntity.latitude || 0,
      longitude: ormEntity.longitude || 0,
    });

    const contactInfo = {
      email: ormEntity.email ? Email.create(ormEntity.email) : undefined,
      phone: ormEntity.phone ? Phone.create(ormEntity.phone) : undefined,
      website: ormEntity.website,
    };

    return Business.createFromData({
      id: ormEntity.id,
      name: ormEntity.name,
      description: ormEntity.description,
      sector: ormEntity.sector as BusinessSector,
      address,
      contactInfo,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * 🔄 Conversion Domain → TypeORM (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: Business): Partial<BusinessOrmEntity> {
    return this.toOrmEntity(domainEntity);
  }
}
