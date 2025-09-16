/**
 * 🔄 MongoDB Business Entity Mapper
 *
 * Mapper statique entre l'entité domaine Business et le document MongoDB
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { Business, BusinessSector } from '../../../../domain/entities/business.entity';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { BusinessName } from '../../../../domain/value-objects/business-name.value-object';
import { Address } from '../../../../domain/value-objects/address.value-object';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Phone } from '../../../../domain/value-objects/phone.value-object';
import { BusinessDocument } from '../../entities/mongo/business.schema';

export class MongoBusinessMapper {
  /**
   * 🔄 Conversion Domain → MongoDB
   */
  static toMongoDocument(domainEntity: Business): Partial<BusinessDocument> {
    const doc: Partial<BusinessDocument> = {
      _id: domainEntity.id.getValue(),
      name: domainEntity.name.getValue(),
      description: domainEntity.description,
      sector: domainEntity.sector,
      
      // Address mapping
      address: {
        street: domainEntity.address.street,
        city: domainEntity.address.city,
        postalCode: domainEntity.address.postalCode,
        country: domainEntity.address.country,
        latitude: domainEntity.address.latitude,
        longitude: domainEntity.address.longitude,
      },
      
      // Contact info mapping
      contactInfo: {
        email: domainEntity.contactInfo?.email?.value,
        phone: domainEntity.contactInfo?.phone?.getValue(),
        website: domainEntity.contactInfo?.website,
      },
      
      isActive: true, // Default active
      isVerified: false, // Default not verified
    };

    // Index géospatial si coordonnées disponibles
    if (domainEntity.address.latitude && domainEntity.address.longitude) {
      doc.location = {
        type: 'Point',
        coordinates: [domainEntity.address.longitude, domainEntity.address.latitude],
      };
    }

    return doc;
  }

  /**
   * 🔄 Conversion MongoDB → Domain
   */
  static toDomainEntity(mongoDoc: BusinessDocument): Business {
    const address = Address.create({
      street: mongoDoc.address.street,
      city: mongoDoc.address.city,
      postalCode: mongoDoc.address.postalCode,
      country: mongoDoc.address.country,
      latitude: mongoDoc.address.latitude || 0,
      longitude: mongoDoc.address.longitude || 0,
    });

    const contactInfo = {
      email: mongoDoc.contactInfo?.email ? Email.create(mongoDoc.contactInfo.email) : undefined,
      phone: mongoDoc.contactInfo?.phone ? Phone.create(mongoDoc.contactInfo.phone) : undefined,
      website: mongoDoc.contactInfo?.website,
    };

    return Business.createFromData({
      id: mongoDoc._id.toString(),
      name: mongoDoc.name,
      description: mongoDoc.description,
      sector: mongoDoc.sector as BusinessSector,
      address,
      contactInfo,
      createdAt: mongoDoc.createdAt || new Date(),
      updatedAt: mongoDoc.updatedAt || new Date(),
    });
  }

  /**
   * 🔄 Conversion Domain → MongoDB (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: Business): Partial<BusinessDocument> {
    return this.toMongoDocument(domainEntity);
  }

  /**
   * 🔄 Conversion multiple MongoDB → Domain
   */
  static toDomainEntities(mongoDocs: BusinessDocument[]): Business[] {
    return mongoDocs.map((doc) => this.toDomainEntity(doc));
  }
}
