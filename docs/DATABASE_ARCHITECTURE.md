# 🔀 Architecture Base de Données Sélective (SQL OU NoSQL)

## 📋 Vue d'ensemble

Cette architecture permet de choisir **exclusivement** SOIT SQL (PostgreSQL/TypeORM) SOIT NoSQL (MongoDB/Mongoose) selon la configuration d'environnement. **Aucun mélange** n'est possible dans la même instance de l'application.

## 🏗️ Architecture

```
DatabaseHybridModule (Sélecteur)
├── DatabaseSqlModule (PostgreSQL + TypeORM)
│   ├── BusinessSqlRepository
│   ├── BusinessSqlMapper
│   └── SQL Entities (business.entity.ts, etc.)
└── DatabaseNoSqlModule (MongoDB + Mongoose)
    ├── BusinessNoSqlRepository
    ├── BusinessNoSqlMapper
    └── NoSQL Schemas (business.schema.ts, etc.)
```

## ⚙️ Configuration

### Variables d'Environnement

```bash
# Sélection du type de base de données (OBLIGATOIRE)
DATABASE_TYPE=sql          # 'sql' ou 'nosql'

# Configuration SQL (si DATABASE_TYPE=sql)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=rvproject

# Configuration NoSQL (si DATABASE_TYPE=nosql)
MONGODB_URI=mongodb://localhost:27017/rvproject
```

### Exemples de Configuration

#### Mode SQL (PostgreSQL)
```bash
# .env
DATABASE_TYPE=sql
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=secretpassword
DB_NAME=rvproject_prod
NODE_ENV=production
```

#### Mode NoSQL (MongoDB)
```bash
# .env
DATABASE_TYPE=nosql
MONGODB_URI=mongodb://localhost:27017/rvproject_prod
NODE_ENV=production
```

## 🚀 Utilisation

### Dans l'Application Module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseHybridModule } from './infrastructure/database/database-hybrid.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Sélection automatique SQL ou NoSQL
    await DatabaseHybridModule.forRootAsync(),
  ],
})
export class AppModule {}
```

### Dans un Use Case

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { BUSINESS_REPOSITORY } from '../domain/repositories/business.repository.interface';
import { IBusinessRepository } from '../domain/repositories/business.repository.interface';

@Injectable()
export class CreateBusinessUseCase {
  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: IBusinessRepository, // Sera SQL ou NoSQL selon config
  ) {}

  async execute(request: CreateBusinessRequest): Promise<CreateBusinessResponse> {
    // Le repository utilisé dépend de DATABASE_TYPE
    // Transparence totale pour les Use Cases
    const business = Business.create(request);
    const saved = await this.businessRepository.save(business);
    return { id: saved.id, name: saved.name };
  }
}
```

## 🔄 Basculement SQL ↔ NoSQL

### Étapes pour Basculer

1. **Arrêter l'application**
2. **Modifier DATABASE_TYPE** dans `.env`
3. **Configurer les variables** appropriées (DB_* ou MONGODB_URI)
4. **Redémarrer l'application**

### Exemple de Basculement

```bash
# Actuellement en SQL
DATABASE_TYPE=sql
DB_HOST=localhost
# ... autres variables SQL

# Basculer vers NoSQL
DATABASE_TYPE=nosql
MONGODB_URI=mongodb://localhost:27017/rvproject

# Redémarrer
npm run start:prod
```

## 📊 Différences Techniques

### SQL (TypeORM + PostgreSQL)

#### Avantages
- ✅ ACID transactions
- ✅ Relations complexes
- ✅ Jointures SQL
- ✅ Contraintes d'intégrité

#### Structure
```
src/infrastructure/database/
├── entities/sql/
│   ├── business.entity.ts      # TypeORM Entity
│   └── ...
├── repositories/sql/
│   ├── business-sql.repository.ts
│   └── ...
└── mappers/
    ├── business-sql.mapper.ts
    └── ...
```

#### Requêtes Exemple
```typescript
// Repository SQL avec TypeORM
async findByFilters(filters: BusinessFilters): Promise<Business[]> {
  const queryBuilder = this.repository.createQueryBuilder('business')
    .leftJoinAndSelect('business.staff', 'staff')
    .where('business.businessType = :type', { type: filters.businessType });
    
  return queryBuilder.getMany();
}
```

### NoSQL (Mongoose + MongoDB)

#### Avantages
- ✅ Flexibilité des schémas
- ✅ Performance lecture/écriture
- ✅ Agrégations puissantes
- ✅ Scalabilité horizontale

#### Structure
```
src/infrastructure/database/
├── entities/nosql/
│   ├── business.schema.ts      # Mongoose Schema
│   └── ...
├── repositories/nosql/
│   ├── business-nosql.repository.ts
│   └── ...
└── mappers/
    ├── business-nosql.mapper.ts
    └── ...
```

#### Requêtes Exemple
```typescript
// Repository NoSQL avec agrégation MongoDB
async findByFilters(filters: BusinessFilters): Promise<Business[]> {
  const pipeline = [
    { $match: { businessType: filters.businessType } },
    { $lookup: { from: 'staff', localField: '_id', foreignField: 'businessId', as: 'staff' } },
    { $sort: { createdAt: -1 } }
  ];
  
  return this.model.aggregate(pipeline).exec();
}
```

## 🧪 Tests

### Configuration Tests SQL
```typescript
// business-sql.repository.spec.ts
describe('BusinessSqlRepository', () => {
  let repository: BusinessSqlRepository;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [BusinessEntity],
          synchronize: true,
        }),
      ],
      providers: [BusinessSqlRepository, BusinessSqlMapper],
    }).compile();
  });
});
```

### Configuration Tests NoSQL
```typescript
// business-nosql.repository.spec.ts
describe('BusinessNoSqlRepository', () => {
  let repository: BusinessNoSqlRepository;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost/test'),
        MongooseModule.forFeature([{ name: BusinessMongo.name, schema: BusinessSchema }]),
      ],
      providers: [BusinessNoSqlRepository, BusinessNoSqlMapper],
    }).compile();
  });
});
```

## 🔧 Migration de Données

### SQL vers NoSQL
```typescript
// scripts/migrate-sql-to-nosql.ts
async function migrateSqlToNoSql() {
  // 1. Lire données SQL
  const sqlBusinesses = await sqlRepository.findAll();
  
  // 2. Convertir et sauvegarder en NoSQL
  for (const business of sqlBusinesses) {
    await nosqlRepository.save(business);
  }
}
```

### NoSQL vers SQL
```typescript
// scripts/migrate-nosql-to-sql.ts
async function migrateNoSqlToSql() {
  // 1. Lire données NoSQL
  const nosqlBusinesses = await nosqlRepository.findAll();
  
  // 2. Convertir et sauvegarder en SQL
  for (const business of nosqlBusinesses) {
    await sqlRepository.save(business);
  }
}
```

## 🚨 Points d'Attention

### ❌ Ce qui N'EST PAS possible
- Utiliser SQL et NoSQL simultanément
- Basculer sans redémarrage
- Migrations automatiques entre types

### ✅ Ce qui EST possible
- Basculement complet via configuration
- Tests séparés pour chaque type
- Repositories avec mêmes interfaces
- Transparence pour les Use Cases

## 🎯 Recommandations

### Choisir SQL quand :
- Données relationnelles complexes
- Transactions ACID critiques
- Intégrité référentielle importante
- Requêtes SQL complexes nécessaires

### Choisir NoSQL quand :
- Flexibilité des schémas requise
- Performance lecture/écriture critique
- Données semi-structurées
- Scalabilité horizontale nécessaire

## 📚 Ressources

- [TypeORM Documentation](https://typeorm.io/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [NestJS Database Integration](https://docs.nestjs.com/techniques/database)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
