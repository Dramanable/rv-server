# 🔄 Database Migrations Guide

## 📋 Overview

Ce projet utilise **TypeORM** pour la gestion des migrations de base de données avec une architecture Clean et compatible Node.js 24.

## 🚀 Quick Start

### Scripts NPM Disponibles

```bash
# Commandes principales via script helper
npm run migrate              # Affiche l'aide
npm run migrate:run          # Exécuter les migrations en attente
npm run migrate:revert       # Annuler la dernière migration
npm run migrate:generate     # Générer une migration depuis les changements d'entités
npm run migrate:create       # Créer une migration vide
npm run migrate:status       # Afficher le statut des migrations
npm run migrate:reset        # Réinitialiser la base (DROP + migrations)

# Commandes TypeORM directes (avancées)
npm run migration:run        # TypeORM direct: run migrations
npm run migration:revert     # TypeORM direct: revert migration
npm run migration:show       # TypeORM direct: show status
npm run schema:drop          # TypeORM direct: drop schema
```

### Script Helper (Recommandé)

```bash
# Utilisation du script helper
./scripts/migration.sh run           # Exécuter migrations
./scripts/migration.sh generate AddUserTable  # Générer migration
./scripts/migration.sh create AddIndexes      # Créer migration vide
./scripts/migration.sh revert        # Annuler dernière migration
./scripts/migration.sh status        # Statut des migrations
```

## 📁 Structure des Fichiers

```
src/infrastructure/database/
├── typeorm.config.ts                 # Configuration TypeORM
├── sql/postgresql/
│   ├── entities/                     # Entités TypeORM
│   │   ├── user-orm.entity.ts
│   │   └── refresh-token-orm.entity.ts
│   ├── migrations/                   # Fichiers de migration
│   │   └── 1726742400000-InitialSchema.ts
│   └── subscribers/                  # Subscribers (optionnel)
└── scripts/
    └── migration.sh                  # Script helper
```

## 🔧 Workflow de Migration

### 1. Créer une Nouvelle Migration

#### Option A: Génération Automatique (Recommandée)
```bash
# Modifier d'abord les entités, puis générer la migration
npm run migrate:generate AddUserProfileTable
```

#### Option B: Migration Manuelle
```bash
# Créer une migration vide
npm run migrate:create AddCustomIndexes
```

### 2. Exécuter les Migrations

```bash
# Exécuter toutes les migrations en attente
npm run migrate:run
```

### 3. Annuler une Migration

```bash
# Annuler la dernière migration (avec confirmation)
npm run migrate:revert
```

### 4. Vérifier le Statut

```bash
# Voir quelles migrations ont été exécutées
npm run migrate:status
```

## 📝 Exemple de Migration

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddUserProfile1234567890000 implements MigrationInterface {
  name = 'AddUserProfile1234567890000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_profiles');
  }
}
```

## ⚙️ Configuration

### Variables d'Environnement

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=appointment_system
DB_SCHEMA=public

# Environment
NODE_ENV=development
```

### Configuration TypeORM

Le fichier `src/infrastructure/database/typeorm.config.ts` contient :

- ✅ Configuration de la base de données PostgreSQL
- ✅ Chemins vers les entities, migrations, et subscribers
- ✅ Options de SSL pour la production
- ✅ Logging pour le développement
- ✅ Support Node.js 24

## 🔒 Bonnes Pratiques

### ✅ À Faire

1. **Toujours tester les migrations** en développement avant la production
2. **Nommer les migrations explicitement** : `AddUserTable`, `AddEmailIndex`
3. **Implémenter la méthode `down()`** pour pouvoir annuler
4. **Sauvegarder la base** avant les migrations importantes
5. **Utiliser des transactions** pour les migrations complexes
6. **Tester les rollbacks** avec `migrate:revert`

### ❌ À Éviter

1. **Ne jamais modifier** une migration déjà déployée
2. **Éviter `synchronize: true`** en production
3. **Ne pas ignorer** les erreurs de migration
4. **Éviter les migrations** qui suppriment des données sans confirmation
5. **Ne pas utiliser** `schema:sync` en production

## 🚨 Situations d'Urgence

### Rollback d'Urgence

```bash
# Annuler la dernière migration (attention aux données!)
npm run migrate:revert

# Vérifier le statut après rollback
npm run migrate:status
```

### Reset Complet (Développement Uniquement)

```bash
# ⚠️ SUPPRIME TOUTES LES DONNÉES!
npm run migrate:reset
```

### Récupération après Erreur

```bash
# 1. Vérifier le statut
npm run migrate:status

# 2. Si nécessaire, marquer manuellement une migration comme exécutée
npm run typeorm query "INSERT INTO migrations_history (timestamp, name) VALUES (1234567890000, 'MigrationName1234567890000')"

# 3. Ou supprimer une entrée problématique
npm run typeorm query "DELETE FROM migrations_history WHERE name = 'ProblematicMigration1234567890000'"
```

## 📊 Monitoring

### Vérification Régulière

```bash
# Vérifier les migrations en attente
npm run migrate:status

# Logger les changements de schéma potentiels
npm run schema:log
```

## 🔗 Intégration CI/CD

```yaml
# Exemple pour GitHub Actions
- name: Run Database Migrations
  run: |
    npm run migrate:run
    npm run migrate:status
```

## 📚 Ressources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

💡 **Tip**: Utilisez `npm run migrate` pour voir toutes les options disponibles!