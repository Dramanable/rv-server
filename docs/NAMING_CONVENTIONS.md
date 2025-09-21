# 📋 Naming Conventions - Guide de Développement

## 🎯 **Convention de Nommage des Colonnes - Snake_Case OBLIGATOIRE**

### 🏛️ **Principe Fondamental**

**TOUTES les colonnes de base de données DOIVENT utiliser la convention snake_case**

Cette règle s'applique à :
- PostgreSQL (primary database)
- MongoDB (pour cohérence)
- Toutes futures bases de données

### ✅ **Règles de Conversion CamelCase → snake_case**

| CamelCase (TypeScript) | snake_case (Database) | Exemple @Column |
|------------------------|----------------------|-----------------|
| `firstName` | `first_name` | `@Column({ name: 'first_name' })` |
| `lastName` | `last_name` | `@Column({ name: 'last_name' })` |
| `hashedPassword` | `hashed_password` | `@Column({ name: 'hashed_password' })` |
| `isActive` | `is_active` | `@Column({ name: 'is_active' })` |
| `isVerified` | `is_verified` | `@Column({ name: 'is_verified' })` |
| `createdAt` | `created_at` | `@CreateDateColumn({ name: 'created_at' })` |
| `updatedAt` | `updated_at` | `@UpdateDateColumn({ name: 'updated_at' })` |
| `userId` | `user_id` | `@Column({ name: 'user_id' })` |
| `expiresAt` | `expires_at` | `@Column({ name: 'expires_at' })` |

### 🏗️ **Template d'Entité TypeORM Standard**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('table_name') // snake_case pour nom de table
export class EntityNameOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ✅ Propriété simple (un seul mot)
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  // ✅ Propriété composée avec snake_case explicite
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  // ✅ Boolean avec snake_case
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  // ✅ Clés étrangères avec snake_case
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  // ✅ Timestamps standardisés
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
```

### 🚨 **PROCESSUS OBLIGATOIRE pour Nouvelles Colonnes**

#### **1️⃣ Créer/Modifier l'Entité**
```typescript
// ❌ INTERDIT
@Column()
firstName!: string;

// ✅ CORRECT
@Column({ name: 'first_name' })
firstName!: string;
```

#### **2️⃣ TOUJOURS Générer une Migration**
```bash
# Générer automatiquement
docker exec nestjs-dev npm run migration:generate -- src/infrastructure/database/sql/postgresql/migrations/AddNewColumn

# Ou créer manuellement si nécessaire
npm run migration:create -- src/infrastructure/database/sql/postgresql/migrations/AddNewColumn
```

#### **3️⃣ Exécuter la Migration**
```bash
docker exec nestjs-dev npm run migration:run
```

#### **4️⃣ Vérifier le Statut**
```bash
docker exec nestjs-dev npm run migration:status
```

### 📋 **Exemples de Colonnes Courantes**

#### **Colonnes Utilisateur**
- `user_id` (clé étrangère)
- `first_name`, `last_name`
- `email_verified`, `phone_verified`
- `created_by`, `updated_by`
- `deleted_at`, `archived_at`

#### **Colonnes Booléennes**
- `is_active`, `is_deleted`, `is_verified`
- `has_access`, `can_edit`, `can_delete`
- `is_premium`, `is_trial`

#### **Colonnes Temporelles**
- `created_at`, `updated_at`, `deleted_at`
- `expires_at`, `verified_at`, `logged_in_at`
- `last_login`, `password_changed_at`

#### **Colonnes Métier**
- `business_name`, `business_type`
- `location_address`, `location_city`
- `service_duration`, `service_price`

### ⚠️ **Cas Particuliers**

#### **Mots Simples (Pas de Conversion)**
- `email` → `email` (reste tel quel)
- `phone` → `phone` (reste tel quel)
- `role` → `role` (reste tel quel)
- `status` → `status` (reste tel quel)

#### **Acronymes**
- `apiKey` → `api_key`
- `urlPath` → `url_path`
- `jsonData` → `json_data`
- `csvFile` → `csv_file`

### 🔧 **Outils de Validation**

#### **Script de Vérification (Future Amélioration)**
```bash
#!/bin/bash
# check-naming-conventions.sh
echo "🔍 Vérification des conventions de nommage..."

# Chercher les violations potentielles
grep -r "@Column()" src/infrastructure/database/sql/postgresql/entities/
if [ $? -eq 0 ]; then
    echo "❌ Trouvé des @Column() sans name explicite"
    exit 1
fi

echo "✅ Conventions de nommage respectées"
```

### 🎯 **Avantages de snake_case**

1. **🗄️ Cohérence PostgreSQL** : Convention native PostgreSQL
2. **🔍 Lisibilité SQL** : Plus facile à lire dans les requêtes
3. **🚀 Performance** : Pas de conversion case nécessaire
4. **🔧 Compatibilité** : Standard dans la plupart des SGBD
5. **👥 Équipe** : Convention universellement acceptée

### 📚 **Références**

- [PostgreSQL Naming Conventions](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)
- [TypeORM Column Options](https://typeorm.io/entities#column-options)
- [Clean Architecture Database Guidelines](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**🚨 RÈGLE CRITIQUE : À chaque modification d'entité, TOUJOURS générer et exécuter une migration !**
