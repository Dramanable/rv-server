/**
 * 🔄 MongoDB User Entity Mapper
 *
 * Mapper statique entre l'entité domaine User et le document MongoDB
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { UserDocument } from '../../entities/mongo/user.schema';

export class MongoUserMapper {
  /**
   * 🔄 Conversion Domain → MongoDB
   */
  static toMongoDocument(domainEntity: User): Partial<UserDocument> {
    return {
      _id: domainEntity.id,
      email: domainEntity.email.value,
      username: domainEntity.username,
      hashedPassword: domainEntity.hashedPassword || '',
      firstName: domainEntity.firstName || '',
      lastName: domainEntity.lastName || '',
      role: domainEntity.role,
      isActive: domainEntity.isActive ?? true,
      isVerified: domainEntity.isVerified ?? false,
      // createdAt et updatedAt gérés automatiquement par Mongoose
    };
  }

  /**
   * 🔄 Conversion MongoDB → Domain
   */
  static toDomainEntity(mongoDoc: UserDocument): User {
    return User.createWithHashedPassword(
      mongoDoc._id,
      new Email(mongoDoc.email),
      `${mongoDoc.firstName || ''} ${mongoDoc.lastName || ''}`.trim() || mongoDoc.email.split('@')[0],
      mongoDoc.role as any, // Cast pour le rôle
      mongoDoc.hashedPassword,
      mongoDoc.createdAt || new Date(),
      mongoDoc.updatedAt || new Date(),
      mongoDoc.username,
      mongoDoc.isActive,
      mongoDoc.isVerified,
    );
  }

  /**
   * 🔄 Conversion Domain → MongoDB (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: User): Partial<UserDocument> {
    return this.toMongoDocument(domainEntity);
  }

  /**
   * 🔄 Conversion multiple MongoDB → Domain
   */
  static toDomainEntities(mongoDocs: UserDocument[]): User[] {
    return mongoDocs.map((doc) => this.toDomainEntity(doc));
  }
}
