/**
 * 🔄 TypeORM Business Entity Mapper
 *
 * Mapper statique entre l'entité domaine Business et l'entité ORM TypeORM
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { Business, BusinessContactInfo, BusinessSector } from '../../../../domain/entities/business.entity';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { BusinessName } from '../../../../domain/value-objects/business-name.value-object';
import { Address } from '../../../../domain/value-objects/address.value-object';
import { Email } from '../../../../domain/value-objects/email.value-object';
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
    ormEntity.street = domainEntity.address.getStreet();
    ormEntity.city = domainEntity.address.getCity();
    ormEntity.postalCode = domainEntity.address.getPostalCode();
    ormEntity.country = domainEntity.address.getCountry();
    ormEntity.latitude = domainEntity.address.getLatitude();
    ormEntity.longitude = domainEntity.address.getLongitude();
    
    // Contact info mapping
    ormEntity.email = domainEntity.contactInfo?.primaryEmail?.getValue();
    ormEntity.phone = domainEntity.contactInfo?.primaryPhone?.getValue();
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

    const primaryEmail = ormEntity.email ? Email.create(ormEntity.email) : null;
    const primaryPhone = ormEntity.phone ? Phone.create(ormEntity.phone) : null;
    
    if (!primaryEmail || !primaryPhone) {
      throw new Error('Business must have primary email and phone');
    }

    const contactInfo: BusinessContactInfo = {
      primaryEmail,
      primaryPhone,
      website: ormEntity.website,
    };

    return Business.create({
      name: ormEntity.name,
      description: ormEntity.description || '',
      sector: ormEntity.sector as BusinessSector,
      address,
      contactInfo,
    });
  }

  /**
   * 🔄 Conversion Domain → TypeORM (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: Business): Partial<BusinessOrmEntity> {
    return this.toOrmEntity(domainEntity);
  }
}
