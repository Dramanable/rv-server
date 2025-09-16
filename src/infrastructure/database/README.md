# 🔀 Architecture Base de Données Hybride SQL/NoSQL

Cette architecture permet de basculer entre PostgreSQL (TypeORM) et MongoDB (Mongoose) via une simple variable d'environnement.

## 🎯 Objectifs

- ✅ **Flexibilité** : Basculer entre SQL et NoSQL selon les besoins
- ✅ **Performance** : Choisir le meilleur moteur selon le cas d'usage
- ✅ **Migration** : Faciliter les migrations entre bases de données
- ✅ **Tests** : Tester avec différents moteurs de persistence

## 🏗️ Architecture

```
src/infrastructure/database/
├── entities/
│   ├── sql/                    # Entités TypeORM (PostgreSQL)
│   │   ├── business.entity.ts
│   │   ├── staff.entity.ts
│   │   ├── service.entity.ts
│   │   ├── calendar.entity.ts
│   │   └── appointment.entity.ts
│   └── nosql/                  # Schémas Mongoose (MongoDB)
│       ├── business.schema.ts
│       ├── staff.schema.ts
│       ├── service.schema.ts
│       ├── calendar.schema.ts
│       └── appointment.schema.ts
├── repositories/
│   ├── business-hybrid.repository.ts  # Repository qui bascule SQL/NoSQL
│   ├── sql/                          # Repositories SQL (futur)
│   └── nosql/                        # Repositories NoSQL (futur)
├── mappers/
│   ├── business-sql.mapper.ts         # Conversion Domain ↔ SQL Entity
│   └── business-nosql.mapper.ts       # Conversion Domain ↔ MongoDB Doc
└── database-hybrid.module.ts          # Module de configuration
```

## ⚙️ Configuration

### Variables d'Environnement

```bash
# Choisir le type de base de données
DATABASE_TYPE=sql          # ou 'nosql'

# Configuration PostgreSQL (mode SQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=rvproject

# Configuration MongoDB (mode NoSQL)
MONGODB_URI=mongodb://localhost:27017/rvproject
```

### Basculement Runtime

```typescript
// Le basculement se fait automatiquement selon DATABASE_TYPE
const businessRepository = inject(BUSINESS_REPOSITORY);

// Cette ligne fonctionnera avec SQL ou NoSQL selon la config
const business = await businessRepository.findById('123');
```

## 🔄 Mappers

### SQL Mapper (TypeORM)
```typescript
@Injectable()
export class BusinessSqlMapper {
  toEntity(business: Business): BusinessEntity {
    // Conversion Domain → TypeORM Entity
  }
  
  toDomain(entity: BusinessEntity): Business {
    // Conversion TypeORM Entity → Domain
  }
}
```

### NoSQL Mapper (Mongoose)
```typescript
@Injectable()
export class BusinessNoSqlMapper {
  toDocument(business: Business): Partial<BusinessMongo> {
    // Conversion Domain → MongoDB Document
  }
  
  toDomain(document: BusinessDocument): Business {
    // Conversion MongoDB Document → Domain
  }
}
```

## 🏪 Repository Hybride

```typescript
@Injectable()
export class BusinessHybridRepository implements IBusinessRepository {
  constructor(
    @InjectRepository(BusinessEntity, 'postgres')
    private readonly sqlRepository: Repository<BusinessEntity>,
    
    @InjectModel(BusinessMongo.name, 'mongodb')
    private readonly nosqlRepository: Model<BusinessDocument>,
    
    private readonly databaseConfig: DatabaseConfigService
  ) {}

  async save(business: Business): Promise<Business> {
    if (this.databaseConfig.isSqlMode()) {
      return await this.saveSql(business);
    } else {
      return await this.saveNoSql(business);
    }
  }
}
```

## 📊 Comparaison SQL vs NoSQL

| Fonctionnalité | SQL (PostgreSQL) | NoSQL (MongoDB) |
|---|---|---|
| **Transactions** | ✅ ACID complètes | ⚠️ Limitées |
| **Relations** | ✅ Joins natifs | ❌ Références manuelles |
| **Schéma** | ✅ Rigide, validé | 🔄 Flexible |
| **Performance** | ⚡ Joins complexes | ⚡ Documents dénormalisés |
| **Scalabilité** | 📈 Verticale | 📈 Horizontale |
| **Requêtes** | 🔍 SQL standard | 🔍 Aggregation Pipeline |

## 🎯 Cas d'Usage

### Utiliser SQL quand :
- ✅ Relations complexes entre entités
- ✅ Transactions ACID requises
- ✅ Requêtes analytiques complexes
- ✅ Contraintes de cohérence strictes

### Utiliser NoSQL quand :
- ✅ Données dénormalisées acceptables
- ✅ Scalabilité horizontale requise
- ✅ Schéma flexible nécessaire
- ✅ Performance lecture très importante

## 🚀 Démarrage Rapide

### 1. Configurer PostgreSQL (Mode SQL)
```bash
# .env
DATABASE_TYPE=sql
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=rvproject

# Démarrer PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rvproject \
  -p 5432:5432 postgres:15
```

### 2. Configurer MongoDB (Mode NoSQL)
```bash
# .env
DATABASE_TYPE=nosql
MONGODB_URI=mongodb://localhost:27017/rvproject

# Démarrer MongoDB
docker run -d --name mongodb \
  -p 27017:27017 mongo:7
```

### 3. Utiliser dans le Code
```typescript
// Injection standard - le type de DB est transparent
constructor(
  @Inject(BUSINESS_REPOSITORY)
  private readonly businessRepository: IBusinessRepository
) {}

// Utilisation identique quel que soit le backend
const business = await this.businessRepository.save(newBusiness);
```

## 🧪 Tests

```typescript
describe('Business Repository', () => {
  // Test avec SQL
  beforeEach(async () => {
    process.env.DATABASE_TYPE = 'sql';
    // Setup module avec config SQL
  });
  
  // Test avec NoSQL
  beforeEach(async () => {
    process.env.DATABASE_TYPE = 'nosql';
    // Setup module avec config NoSQL
  });
});
```

## 📈 Performance

### Optimisations SQL
- Index sur colonnes fréquemment recherchées
- Pagination avec OFFSET/LIMIT
- Relations lazy loading

### Optimisations NoSQL
- Index MongoDB appropriés
- Aggregation Pipeline pour requêtes complexes
- Pagination avec skip/limit optimisée

## 🔮 Évolutions Futures

### Court Terme
- [ ] Repositories Staff, Service, Calendar, Appointment
- [ ] Mappers pour toutes les entités
- [ ] Tests d'intégration complets

### Moyen Terme
- [ ] Support multi-tenant avec switch par tenant
- [ ] Réplication SQL → NoSQL pour analytics
- [ ] Cache distribué avec Redis

### Long Terme
- [ ] Support Elasticsearch pour recherche full-text
- [ ] Graph database (Neo4j) pour relations complexes
- [ ] Time-series database (InfluxDB) pour métriques

## 📝 Bonnes Pratiques

### Architecture
1. **Toujours passer par les interfaces de domaine**
2. **Mappers dédiés pour chaque type de persistance**
3. **Configuration centralisée via variables d'environnement**
4. **Tests avec les deux types de base**

### Performance
1. **Index appropriés sur les deux bases**
2. **Pagination systématique**
3. **Lazy loading pour les relations**
4. **Cache en lecture fréquente**

### Sécurité
1. **Validation des inputs avant persistence**
2. **Paramètres préparés pour éviter injections**
3. **Chiffrement des données sensibles**
4. **Audit des modifications**
