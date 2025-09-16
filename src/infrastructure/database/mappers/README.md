# 🔄 Database Mappers

Cette couche contient tous les mappers de conversion entre les entités domaine et les entités de persistance.

## 📁 Organisation

```
mappers/
├── sql/                     # Mappers SQL (TypeORM)
│   ├── typeorm-user.mapper.ts
│   ├── typeorm-business.mapper.ts
│   ├── typeorm-calendar.mapper.ts
│   └── index.ts
├── nosql/                   # Mappers NoSQL (MongoDB)
│   ├── mongo-user.mapper.ts
│   ├── mongo-business.mapper.ts
│   ├── mongo-calendar.mapper.ts
│   └── index.ts
└── index.ts                 # Export centralisé
```

## 🏗️ Architecture

### Mappers Statiques

Tous les mappers sont maintenant des **classes statiques** pour :
- ✅ Éviter l'injection de dépendances inutile
- ✅ Simplifier l'utilisation dans les repositories  
- ✅ Améliorer les performances (pas d'instanciation)
- ✅ Faciliter les tests unitaires

### Méthodes Standards

Chaque mapper implémente ces méthodes statiques :

```typescript
// Conversion Domain → Persistence
static toPersistenceEntity(domainEntity: DomainEntity): PersistenceEntity

// Conversion Persistence → Domain  
static toDomainEntity(persistenceEntity: PersistenceEntity): DomainEntity

// Méthodes spécifiques (optionnelles)
static toOrmEntity(domainEntity: DomainEntity): OrmEntity      // SQL
static toMongoDocument(domainEntity: DomainEntity): MongoDoc   // NoSQL
```

## 🚀 Utilisation

### Dans les Repositories SQL

```typescript
import { TypeOrmUserMapper } from '../../mappers/sql/typeorm-user.mapper';

// Conversion Domain → ORM
const ormEntity = TypeOrmUserMapper.toPersistenceEntity(user);

// Conversion ORM → Domain
const domainEntity = TypeOrmUserMapper.toDomainEntity(ormResult);
```

### Dans les Repositories NoSQL

```typescript
import { MongoUserMapper } from '../../mappers/nosql/mongo-user.mapper';

// Conversion Domain → MongoDB
const mongoDoc = MongoUserMapper.toPersistenceEntity(user);

// Conversion MongoDB → Domain
const domainEntity = MongoUserMapper.toDomainEntity(mongoResult);
```

## 🎯 Principes

1. **Clean Architecture** : Les mappers appartiennent à la couche Infrastructure
2. **Séparation des responsabilités** : SQL et NoSQL séparés
3. **Stateless** : Aucun état interne, méthodes purement fonctionnelles
4. **Type Safety** : TypeScript strict pour éviter les erreurs de conversion
5. **Performance** : Pas d'instanciation, appels directs aux méthodes statiques

## 🔧 Maintenance

- Ajouter de nouveaux mappers dans le bon dossier (sql/ ou nosql/)
- Maintenir la cohérence des noms de méthodes
- Tester les conversions bidirectionnelles
- Documenter les cas particuliers de mapping
