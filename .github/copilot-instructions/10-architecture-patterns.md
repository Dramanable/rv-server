# 🏗️ Architecture Patterns & Best Practices

## 🗺️ MAPPERS - MANDATORY CONVERSION PATTERN

### 🎯 CRITICAL RULE: ZERO MAPPING LOGIC IN ORM ENTITIES

**❌ MAJOR ARCHITECTURAL VIOLATION:**
ORM entities (TypeORM, Prisma, etc.) MUST NEVER contain conversion logic to Domain entities. This responsibility belongs exclusively to dedicated Mappers in `/infrastructure/mappers/`.

### 🚫 ABSOLUTE PROHIBITIONS

```typescript
// ❌ STRICTLY FORBIDDEN - Business logic in ORM entity
@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ❌ NEVER toDomainEntity() method in ORM entity
  toDomainEntity(): User {
    const email = Email.create(this.email);
    return User.create(email, this.name); // VIOLATION!
  }

  // ❌ NEVER import domain in ORM entities
  // import { User } from '../../../domain/entities/user.entity';
}
```

### ✅ CORRECT PATTERN: DEDICATED MAPPERS

```typescript
// ✅ EXCELLENT - Dedicated mapper in /infrastructure/mappers/
export class UserOrmMapper {
  /**
   * Convert Domain entity to ORM for persistence
   */
  static toOrmEntity(domain: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = domain.getId().getValue();
    ormEntity.email = domain.getEmail().getValue();
    ormEntity.name = domain.getName();
    ormEntity.role = domain.getRole();
    ormEntity.created_at = domain.getCreatedAt();
    ormEntity.updated_at = domain.getUpdatedAt();
    return ormEntity;
  }

  /**
   * Convert ORM entity to Domain from persistence
   */
  static toDomainEntity(orm: UserOrmEntity): User {
    const email = Email.create(orm.email);
    const userId = UserId.fromString(orm.id);

    return User.reconstruct({
      id: userId,
      email: email,
      name: orm.name,
      role: orm.role,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  /**
   * Convert ORM list to Domain
   */
  static toDomainEntities(ormEntities: UserOrmEntity[]): User[] {
    return ormEntities.map((orm) => this.toDomainEntity(orm));
  }
}
```

## 📁 MANDATORY MAPPER STRUCTURE

```
src/infrastructure/mappers/
├── orm-mappers.ts           # Centralized export of all mappers
├── user-orm.mapper.ts       # User Mapper: Domain ↔ ORM
├── business-orm.mapper.ts   # Business Mapper: Domain ↔ ORM
├── service-orm.mapper.ts    # Service Mapper: Domain ↔ ORM
└── staff-orm.mapper.ts      # Staff Mapper: Domain ↔ ORM
```

## 🔄 MAPPER RESPONSIBILITIES

### 1️⃣ Domain → ORM Conversion (Persistence)

```typescript
// For CREATE and UPDATE operations
static toOrmEntity(domain: DomainEntity): OrmEntity {
  // Value Objects conversion to primitives
  // Relations and foreign keys management
  // Preparation for database persistence
}
```

### 2️⃣ ORM → Domain Conversion (Reconstruction)

```typescript
// For READ operations and hydration
static toDomainEntity(orm: OrmEntity): DomainEntity {
  // Value Objects reconstruction from primitives
  // Domain entities validation and creation
  // Business integrity preservation
}
```

### 3️⃣ Batch Conversion (Collections)

```typescript
// For collection operations
static toDomainEntities(ormList: OrmEntity[]): DomainEntity[] {
  return ormList.map(orm => this.toDomainEntity(orm));
}

static toOrmEntities(domainList: DomainEntity[]): OrmEntity[] {
  return domainList.map(domain => this.toOrmEntity(domain));
}
```

## 🏗️ REPOSITORY USAGE WITH MAPPERS

```typescript
// ✅ EXCELLENT - Correct mapper usage in Repository
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    // 1. Domain → ORM conversion via Mapper
    const ormEntity = UserOrmMapper.toOrmEntity(user);

    // 2. Database persistence
    const savedOrm = await this.repository.save(ormEntity);

    // 3. ORM → Domain conversion via Mapper
    return UserOrmMapper.toDomainEntity(savedOrm);
  }

  async findById(id: UserId): Promise<User | null> {
    // 1. ORM query
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    if (!ormEntity) return null;

    // 2. ORM → Domain conversion via Mapper
    return UserOrmMapper.toDomainEntity(ormEntity);
  }

  async findAll(criteria: UserCriteria): Promise<User[]> {
    // 1. ORM query with criteria
    const ormEntities = await this.repository.find(/* criteria */);

    // 2. Batch conversion via Mapper
    return UserOrmMapper.toDomainEntities(ormEntities);
  }
}
```

## 🚨 COMMON ERRORS TO AVOID

### ❌ Domain Import in ORM Entity

```typescript
// VIOLATION - Never import Domain in ORM
import { User } from '../../../domain/entities/user.entity'; // FORBIDDEN!

@Entity('users')
export class UserOrmEntity {
  // This entity should ONLY know TypeORM
}
```

### ❌ Business Logic in Mapper

```typescript
// VIOLATION - Mapper must contain ONLY conversion
static toDomainEntity(orm: UserOrmEntity): User {
  const email = Email.create(orm.email);

  // ❌ FORBIDDEN - No business logic in mapper
  if (email.getValue().includes('admin')) {
    user.grantAdminRights(); // VIOLATION!
  }

  return user;
}
```

### ❌ Direct Conversion Without Mapper

```typescript
// VIOLATION - Always use mapper
async save(user: User): Promise<User> {
  // ❌ FORBIDDEN - Manual conversion
  const ormEntity = new UserOrmEntity();
  ormEntity.email = user.getEmail().getValue(); // VIOLATION!

  // ✅ CORRECT - Use mapper
  const ormEntity = UserOrmMapper.toOrmEntity(user);
}
```

## 💎 VALUE OBJECTS - CORRECT RECONSTRUCTION

```typescript
// ✅ EXCELLENT - Correct Value Objects reconstruction
export class UserOrmMapper {
  static toDomainEntity(orm: UserOrmEntity): User {
    // ✅ Use appropriate factory methods
    const userId = UserId.fromString(orm.id);
    const email = Email.create(orm.email); // For validation
    const phone = orm.phone ? Phone.create(orm.phone) : undefined;

    return User.reconstruct({
      id: userId,
      email: email,
      name: orm.name,
      phone: phone,
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  static toOrmEntity(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();

    // ✅ Extract primitive values
    orm.id = domain.getId().getValue();
    orm.email = domain.getEmail().getValue();
    orm.name = domain.getName();
    orm.phone = domain.getPhone()?.getValue();
    orm.created_at = domain.getCreatedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }
}
```

## 📋 MAPPING PATTERNS BY VALUE OBJECT TYPE

```typescript
// 🆔 ID Value Objects
const userId = UserId.fromString(orm.user_id);
const businessId = BusinessId.fromString(orm.business_id);
const serviceId = ServiceId.fromString(orm.service_id);

// 📧 Email (with validation)
const email = Email.create(orm.email);

// 📱 Phone (nullable)
const phone = orm.phone ? Phone.create(orm.phone) : undefined;

// 💰 Money (complex)
const price = Money.create(orm.price_amount, orm.price_currency);

// 🌐 URL (with validation)
const profileImage = orm.profile_image_url
  ? FileUrl.create(orm.profile_image_url)
  : undefined;

// 📅 Dates (primitives)
const createdAt = orm.created_at; // Direct Date
const updatedAt = orm.updated_at; // Direct Date
```

## ✅ STANDARD MAPPER TEMPLATE

```typescript
export class {Entity}OrmMapper {
  static toDomainEntity(orm: {Entity}OrmEntity): {Entity} {
    // 1. Value Objects reconstruction with validation
    const id = {Entity}Id.fromString(orm.id);
    const email = Email.create(orm.email);
    const phone = orm.phone ? Phone.create(orm.phone) : undefined;

    // 2. Domain entity reconstruction
    return {Entity}.reconstruct({
      id,
      email,
      phone,
      // Other properties...
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  static toOrmEntity(domain: {Entity}): {Entity}OrmEntity {
    const orm = new {Entity}OrmEntity();

    // 1. Primitive values extraction
    orm.id = domain.getId().getValue();
    orm.email = domain.getEmail().getValue();
    orm.phone = domain.getPhone()?.getValue();

    // 2. Direct dates and primitives
    orm.created_at = domain.getCreatedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }

  static toDomainEntities(ormList: {Entity}OrmEntity[]): {Entity}[] {
    return ormList.map(orm => this.toDomainEntity(orm));
  }
}
```

## 📋 MANDATORY MAPPER CHECKLIST

- [ ] ✅ **Zero mapping methods** in ORM entities
- [ ] ✅ **Dedicated mappers** in `/infrastructure/mappers/`
- [ ] ✅ **Static methods** `toOrmEntity()` and `toDomainEntity()`
- [ ] ✅ **Collection support** with `toDomainEntities()`
- [ ] ✅ **No Domain import** in ORM entities
- [ ] ✅ **No business logic** in mappers
- [ ] ✅ **Unit test validation** for mappers
- [ ] ✅ **Centralized export** in `orm-mappers.ts`

## 🧪 MANDATORY MAPPER UNIT TESTS

```typescript
// ✅ Complete tests for each mapper
describe('UserOrmMapper', () => {
  describe('toDomainEntity', () => {
    it('should convert ORM entity to Domain entity', () => {
      // Given
      const ormEntity = createValidUserOrmEntity();

      // When
      const domainEntity = UserOrmMapper.toDomainEntity(ormEntity);

      // Then
      expect(domainEntity).toBeInstanceOf(User);
      expect(domainEntity.getEmail().getValue()).toBe(ormEntity.email);
    });

    it('should handle null values correctly', () => {
      // Test edge cases and null values
    });
  });

  describe('toOrmEntity', () => {
    it('should convert Domain entity to ORM entity', () => {
      // Test reverse conversion
    });
  });

  describe('toDomainEntities', () => {
    it('should convert array of ORM entities', () => {
      // Test collections
    });
  });
});
```

This strict separation ensures **clean architecture**, **maintainability**, and **respect for Clean Architecture principles**!
