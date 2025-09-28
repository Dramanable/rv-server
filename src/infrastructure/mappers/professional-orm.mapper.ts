import { Professional } from '@domain/entities/professional.entity';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';
import { ProfessionalOrmEntity } from '@infrastructure/database/sql/postgresql/entities/professional-orm.entity';

/**
 * 🔄 PROFESSIONAL ORM MAPPER - Infrastructure Layer
 *
 * ✅ OBLIGATOIRE : Conversion Domain ↔ ORM sans logique métier
 * ✅ Respect strict des Value Objects et entités Domain
 */
export class ProfessionalOrmMapper {
  /**
   * 🔄 Convertit une entité Domain vers ORM pour persistence
   */
  static toOrmEntity(domain: Professional): ProfessionalOrmEntity {
    const ormEntity = new ProfessionalOrmEntity();

    ormEntity.id = domain.getId().getValue();
    ormEntity.business_id = domain.getBusinessId().getValue();
    ormEntity.first_name = domain.getFirstName();
    ormEntity.last_name = domain.getLastName();
    ormEntity.email = domain.getEmail().getValue();
    ormEntity.phone = domain.getPhone();
    ormEntity.specialization = domain.getSpeciality();
    ormEntity.bio = domain.getBio();
    ormEntity.profile_image_url = domain.getProfileImage();
    ormEntity.is_active = domain.isActive();
    ormEntity.created_by = domain.getCreatedBy();
    ormEntity.updated_by = domain.getUpdatedBy();
    ormEntity.created_at = domain.getCreatedAt();
    ormEntity.updated_at = domain.getUpdatedAt();

    return ormEntity;
  }

  /**
   * 🔄 Convertit une entité ORM vers Domain depuis persistence
   */
  static toDomainEntity(orm: ProfessionalOrmEntity): Professional {
    const professionalId = ProfessionalId.fromString(orm.id);
    const businessId = BusinessId.fromString(orm.business_id);
    const email = Email.create(orm.email);

    return Professional.reconstruct({
      id: professionalId,
      businessId: businessId,
      firstName: orm.first_name,
      lastName: orm.last_name,
      email: email,
      phone: orm.phone,
      status: 'ACTIVE', // Default status since not stored in ORM
      isVerified: false, // Default since not stored in ORM
      licenseNumber: undefined, // Not stored in ORM
      speciality: orm.specialization || '', // Required property with default
      phoneNumber: orm.phone, // Use phone as phoneNumber
      profileImage: orm.profile_image_url,
      bio: orm.bio,
      experience: undefined, // Not stored in ORM
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
      createdBy: orm.created_by,
      updatedBy: orm.updated_by,
    });
  }

  /**
   * 🔄 Convertit liste ORM vers Domain
   */
  static toDomainEntities(
    ormEntities: ProfessionalOrmEntity[],
  ): Professional[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }

  /**
   * 🔄 Convertit liste Domain vers ORM
   */
  static toOrmEntities(
    domainEntities: Professional[],
  ): ProfessionalOrmEntity[] {
    return domainEntities.map((domain) => this.toOrmEntity(domain));
  }
}
