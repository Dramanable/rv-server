/**
 * 🔄 TypeORM User Entity Mapper
 *
 * Mapper statique entre l'entité domaine User et l'entité ORM TypeORM
 * Clean Architecture : Infrastructure ne dépend PAS du domain
 */

import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
// Direct import without file extension for Node.js 24 + TypeScript
import { UserOrmEntity } from '../../entities/typeorm/user-orm.entity';

export class TypeOrmUserMapper {
  /**
   * 🔄 Conversion Domain → TypeORM
   */
  static toOrmEntity(domainEntity: User): Partial<UserOrmEntity> {
    const ormEntity = new UserOrmEntity();
    
    ormEntity.id = domainEntity.id;
    ormEntity.email = domainEntity.email.value;
    ormEntity.username = domainEntity.username;
    ormEntity.hashedPassword = domainEntity.hashedPassword || '';
    ormEntity.firstName = domainEntity.firstName || '';
    ormEntity.lastName = domainEntity.lastName || '';
    ormEntity.role = domainEntity.role;
    ormEntity.isActive = domainEntity.isActive ?? true;
    ormEntity.isVerified = domainEntity.isVerified ?? false;

    return ormEntity;
  }

  /**
   * 🔄 Conversion TypeORM → Domain
   */
  static toDomainEntity(ormEntity: UserOrmEntity): User {
    return User.createWithHashedPassword(
      ormEntity.id,
      new Email(ormEntity.email),
      `${ormEntity.firstName} ${ormEntity.lastName}`.trim(),
      ormEntity.role as any, // Cast temporaire pour le rôle
      ormEntity.hashedPassword,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.username,
      ormEntity.isActive,
      ormEntity.isVerified,
    );
  }

  /**
   * 🔄 Conversion Domain → TypeORM (alias pour compatibilité)
   */
  static toPersistenceEntity(domainEntity: User): Partial<UserOrmEntity> {
    return this.toOrmEntity(domainEntity);
  }
}
