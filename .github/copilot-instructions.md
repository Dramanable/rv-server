`````instructions
````instructions
# 🤖 GitHub Copilot Instructions pour Clean Architecture + NestJS

## 🎯 **Context du Projet**

Vous travaillez sur une **application enterprise NestJS** implémentant la **Clean Architecture de Robert C. Martin (Uncle Bob)** avec une approche **TDD rigoureuse**, les **principes SOLID**, et les **meilleures pratiques TypeScript** strictes. L'application est **production-ready** avec sécurité, i18n, et patterns enterprise.

## 🚨 **RÈGLE CRITIQUE : APPLICATION PROFESSIONNELLE D'ENTREPRISE**

**⚠️ RÈGLE NON-NÉGOCIABLE** : Cette application est une **solution d'entreprise professionnelle**, pas un blog ou prototype. CHAQUE ligne de code DOIT respecter les standards d'entreprise :

### 📊 **LOGGING OBLIGATOIRE PARTOUT**

**TOUJOURS inclure le logging dans CHAQUE couche :**

```typescript
// ✅ OBLIGATOIRE - Use Case avec logging complet
export class CreateSkillUseCase {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly logger: ILogger, // ⚠️ OBLIGATOIRE
    private readonly i18n: I18nService, // ⚠️ OBLIGATOIRE
  ) {}

  async execute(request: CreateSkillRequest): Promise<CreateSkillResponse> {
    this.logger.info('Creating new skill', {
      businessId: request.businessId,
      skillName: request.name,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId, // ⚠️ OBLIGATOIRE
    });

    try {
      const skill = Skill.create(/* ... */);
      const savedSkill = await this.skillRepository.save(skill);

      this.logger.info('Skill created successfully', {
        skillId: savedSkill.getId(),
        businessId: request.businessId,
        correlationId: request.correlationId,
      });

      return CreateSkillResponse.fromSkill(savedSkill);
    } catch (error) {
      this.logger.error('Failed to create skill', {
        error: error.message,
        businessId: request.businessId,
        correlationId: request.correlationId,
      });
      throw error;
    }
  }
}
```

### 🌐 **I18N OBLIGATOIRE POUR TOUS LES MESSAGES**

**JAMAIS de texte hardcodé :**

```typescript
// ❌ INTERDIT - Messages hardcodés
throw new Error('Skill name is required');

// ✅ OBLIGATOIRE - Messages i18n
throw new SkillValidationError(
  this.i18n.translate('skill.validation.nameRequired'),
  'SKILL_NAME_REQUIRED'
);
```

### 🔍 **CONTEXTE ET TRAÇABILITÉ OBLIGATOIRES**

**Chaque requête DOIT avoir :**
- **correlationId** : UUID unique pour tracer la requête
- **requestingUserId** : Qui fait l'action
- **businessContext** : Dans quel contexte business
- **operationMetadata** : Métadonnées de l'opération

```typescript
// ✅ OBLIGATOIRE - Interface de requête avec contexte
export interface CreateSkillRequest {
  // Business data
  readonly businessId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly isCritical: boolean;

  // ⚠️ CONTEXTE OBLIGATOIRE
  readonly requestingUserId: string; // Qui fait l'action
  readonly correlationId: string;    // Traçabilité unique
  readonly clientIp?: string;        // IP client (sécurité)
  readonly userAgent?: string;       // User agent
  readonly timestamp: Date;          // Horodatage précis
}
```

## 🐳 **ENVIRONNEMENT DOCKER EXCLUSIF - RÈGLE ABSOLUE**

### 🛠️ **RÈGLE CRITIQUE NON-NÉGOCIABLE : TOUT TOURNE SUR DOCKER**

**⚠️ INTERDICTION ABSOLUE D'EXÉCUTER DES COMMANDES SUR L'HOST**

L'application **TOURNE EXCLUSIVEMENT SUR DOCKER** avec Docker Compose. **AUCUNE** commande ne doit être exécutée directement sur la machine host.

**🚨 NOUVELLE RÈGLE CRITIQUE** : Toute commande npm, node, tsc, lint, test, ou migration DOIT s'exécuter dans le container Docker.

#### **✅ COMMANDES OBLIGATOIRES - TOUJOURS DOCKER**

```bash
# ✅ OBLIGATOIRE - Tous les tests
docker compose exec app npm test
docker compose exec app npm run test:unit
docker compose exec app npm run test:cov

# ✅ OBLIGATOIRE - Lint et formatage
docker compose exec app npm run lint
docker compose exec app npm run lint -- --fix
docker compose exec app npm run format

# ✅ OBLIGATOIRE - Build et compilation
docker compose exec app npm run build
docker compose exec app npx tsc --noEmit

# ✅ OBLIGATOIRE - Migrations (CRITIQUE !)
docker compose exec app npm run migration:run
docker compose exec app npm run migration:revert
docker compose exec app npm run migration:generate -- -n NameOfMigration

# ✅ OBLIGATOIRE - Installation dépendances
docker compose exec app npm install package-name
docker compose exec app npm ci

# ✅ OBLIGATOIRE - Développement
docker compose exec app npm run start:dev
```

#### **🚨 WORKFLOW INSTALLATION DÉPENDANCES OBLIGATOIRE**

**⚠️ RÈGLE CRITIQUE** : Pour éviter les problèmes de cache Docker et compatibilité :

```bash
# 1️⃣ Installer dans le container
docker compose exec app npm install nouvelle-dependance

# 2️⃣ OBLIGATOIRE : Supprimer le container
docker compose down app

# 3️⃣ OBLIGATOIRE : Reconstruire sans cache
docker compose build --no-cache app

# 4️⃣ Redémarrer avec nouvelle image
docker compose up -d app

# 5️⃣ Vérifier démarrage
docker compose logs app --tail=20
```

#### **❌ INTERDICTIONS ABSOLUES - COMMANDES HOST**

- ❌ **JAMAIS** `npm run start:dev` directement
- ❌ **JAMAIS** `npm test` sur l'host
- ❌ **JAMAIS** `npm run lint` sur l'host
- ❌ **JAMAIS** `npm run build` sur l'host
- ❌ **JAMAIS** `npm run migration:run` sur l'host
- ❌ **JAMAIS** `npx tsc` sur l'host
- ❌ **JAMAIS** installer PostgreSQL/Redis/MongoDB localement

## 🗄️ **RÈGLE CRITIQUE : MIGRATIONS TYPEORM ET DONNÉES EXISTANTES**

### 🎯 **RÈGLE FONDAMENTALE NON-NÉGOCIABLE : PRÉSERVER LES DONNÉES EXISTANTES**

**⚠️ RÈGLE CRITIQUE** : Toute migration TypeORM DOIT impérativement tenir compte des données déjà présentes en base de données. Cette règle est **NON-NÉGOCIABLE** pour éviter la corruption de données et les pannes en production.

#### **📋 PRINCIPE FONDAMENTAL : SAFETY-FIRST MIGRATIONS**

**TOUJOURS se demander avant chaque migration :**
1. **Y a-t-il déjà des données** dans cette table ?
2. **Comment préserver** l'intégrité des données existantes ?
3. **Les contraintes ajoutées** sont-elles compatibles avec les données actuelles ?
4. **Les colonnes supprimées** contiennent-elles des données critiques ?

#### **✅ PATTERNS OBLIGATOIRES SELON LE TYPE DE MIGRATION**

##### **🆕 AJOUT DE COLONNE - Gestion des Valeurs par Défaut**

```typescript
// ✅ OBLIGATOIRE - Colonne nullable ou avec valeur par défaut
export class AddPricingConfigToServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Vérifier l'existence avant ajout
    const columnExists = await queryRunner.hasColumn(`${schema}.services`, 'pricing_config');

    if (!columnExists) {
      // ✅ CORRECT - Colonne avec DEFAULT pour données existantes
      await queryRunner.query(`
        ALTER TABLE "${schema}"."services"
        ADD COLUMN "pricing_config" jsonb
        DEFAULT '{"type":"FIXED","basePrice":{"amount":0,"currency":"EUR"}}'::jsonb
      `);

      // ✅ CORRECT - Mettre à jour les données existantes si nécessaire
      await queryRunner.query(`
        UPDATE "${schema}"."services"
        SET "pricing_config" = '{"type":"FIXED","basePrice":{"amount":50,"currency":"EUR"}}'::jsonb
        WHERE "pricing_config" IS NULL AND "is_active" = true
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Vérifier avant suppression
    const columnExists = await queryRunner.hasColumn(`${schema}.services`, 'pricing_config');

    if (columnExists) {
      // ⚠️ ATTENTION - Sauvegarder les données critiques avant suppression
      await queryRunner.query(`
        -- Optionnel : Sauvegarder les données dans une table temporaire
        CREATE TABLE IF NOT EXISTS "${schema}"."services_pricing_backup" AS
        SELECT id, pricing_config FROM "${schema}"."services"
        WHERE pricing_config IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "pricing_config"
      `);
    }
  }
}
```

##### **🔧 MODIFICATION DE COLONNE - Gestion des Types et Contraintes**

```typescript
// ✅ OBLIGATOIRE - Transformation sécurisée des données
export class UpdateStatusEnumInServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Vérifier les données existantes
    const existingData = await queryRunner.query(`
      SELECT DISTINCT status FROM "${schema}"."services"
    `);

    console.log('Statuts existants avant migration:', existingData);

    // ✅ ÉTAPE 2 - Ajouter une colonne temporaire avec nouveau type
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "status_new" VARCHAR(20)
    `);

    // ✅ ÉTAPE 3 - Migrer les données avec mapping approprié
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "status_new" = CASE
        WHEN status = 'active' THEN 'ACTIVE'
        WHEN status = 'inactive' THEN 'INACTIVE'
        WHEN status = 'draft' THEN 'DRAFT'
        ELSE 'DRAFT' -- Valeur par défaut pour données inconnues
      END
    `);

    // ✅ ÉTAPE 4 - Supprimer ancienne colonne et renommer
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" DROP COLUMN "status"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      RENAME COLUMN "status_new" TO "status"
    `);

    // ✅ ÉTAPE 5 - Ajouter contraintes après transformation
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ALTER COLUMN "status" SET NOT NULL
    `);
  }
}
```

##### **🗑️ SUPPRESSION DE COLONNE - Sauvegarde Obligatoire**

```typescript
// ✅ OBLIGATOIRE - Sauvegarde avant suppression
export class RemoveDeprecatedColumnsFromServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Vérifier s'il y a des données dans la colonne
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."services"
      WHERE "deprecated_field" IS NOT NULL
    `);

    if (dataCount[0]?.count > 0) {
      // ✅ ÉTAPE 2 - Créer table de sauvegarde
      await queryRunner.query(`
        CREATE TABLE "${schema}"."services_deprecated_backup" AS
        SELECT id, deprecated_field, created_at
        FROM "${schema}"."services"
        WHERE deprecated_field IS NOT NULL
      `);

      console.log(`Sauvegarde de ${dataCount[0].count} enregistrements dans services_deprecated_backup`);
    }

    // ✅ ÉTAPE 3 - Supprimer la colonne
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "deprecated_field"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Recréer la colonne
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "deprecated_field" VARCHAR(255)
    `);

    // ✅ ÉTAPE 2 - Restaurer les données depuis la sauvegarde
    const backupExists = await queryRunner.hasTable(`${schema}.services_deprecated_backup`);

    if (backupExists) {
      await queryRunner.query(`
        UPDATE "${schema}"."services"
        SET "deprecated_field" = backup."deprecated_field"
        FROM "${schema}"."services_deprecated_backup" backup
        WHERE "${schema}"."services".id = backup.id
      `);
    }
  }
}
```

#### **🚨 WORKFLOW OBLIGATOIRE AVANT CHAQUE MIGRATION**

##### **1️⃣ AUDIT DES DONNÉES EXISTANTES (OBLIGATOIRE)**

```bash
# ✅ OBLIGATOIRE - Se connecter à la base et analyser les données
docker compose exec postgres-dev psql -U postgres -d appointment_system

-- Vérifier la structure actuelle
\dt+ schema_name.*

-- Analyser les données dans la table concernée
SELECT COUNT(*), column_name FROM table_name GROUP BY column_name;
SELECT DISTINCT column_name FROM table_name;
SELECT * FROM table_name LIMIT 10;
```

##### **2️⃣ PLAN DE MIGRATION SÉCURISÉ**

```typescript
// ✅ OBLIGATOIRE - Documenter le plan dans la migration
export class ExampleMigration implements MigrationInterface {
  name = 'ExampleMigration';

  /**
   * PLAN DE MIGRATION SÉCURISÉ
   *
   * 🎯 OBJECTIF : [Décrire l'objectif de la migration]
   *
   * 📊 DONNÉES EXISTANTES :
   * - Table "services" contient 150 enregistrements
   * - Colonne "status" : 120 'active', 25 'inactive', 5 'draft'
   * - Aucune valeur NULL dans "status"
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Vérification existence colonne avant modification
   * - Sauvegarde données critiques dans table temporaire
   * - Transformation progressive avec mapping explicite
   * - Rollback complet possible via méthode down()
   *
   * ⚠️ RISQUES IDENTIFIÉS :
   * - Perte de données si mapping incorrect
   * - Contraintes NOT NULL sur données existantes
   * - Temps d'exécution sur tables volumineuses
   *
   * ✅ TESTS EFFECTUÉS :
   * - Migration testée sur copie de base de développement
   * - Rollback vérifié et fonctionnel
   * - Performances acceptables (<5 secondes)
   */
}
```

##### **3️⃣ TESTS OBLIGATOIRES EN DÉVELOPPEMENT**

```bash
# ✅ WORKFLOW OBLIGATOIRE - Tester la migration
# 1. Sauvegarder la base actuelle
docker compose exec postgres-dev pg_dump -U postgres appointment_system > backup_pre_migration.sql

# 2. Appliquer la migration
docker compose exec app npm run migration:run

# 3. Vérifier les données après migration
docker compose exec postgres-dev psql -U postgres -d appointment_system -c "SELECT COUNT(*) FROM services;"

# 4. Tester le rollback
docker compose exec app npm run migration:revert

# 5. Vérifier que les données sont restaurées
docker compose exec postgres-dev psql -U postgres -d appointment_system -c "SELECT COUNT(*) FROM services;"

# 6. Re-appliquer si le test de rollback réussit
docker compose exec app npm run migration:run
```

#### **❌ INTERDICTIONS ABSOLUES - MIGRATIONS DESTRUCTRICES**

- ❌ **JAMAIS** `DROP COLUMN` sans sauvegarde des données
- ❌ **JAMAIS** `ALTER COLUMN ... NOT NULL` sans vérifier les données existantes
- ❌ **JAMAIS** `DROP TABLE` sans export complet des données
- ❌ **JAMAIS** de migration sans plan de rollback testé
- ❌ **JAMAIS** de transformation de type destructrice
- ❌ **JAMAIS** de migration sans vérification préalable des données
- ❌ **JAMAIS** ignorer les warnings sur les contraintes

#### **🎯 CHECKLIST OBLIGATOIRE POUR CHAQUE MIGRATION**

- [ ] ✅ **Analyse des données existantes** effectuée
- [ ] ✅ **Plan de migration** documenté dans le fichier
- [ ] ✅ **Vérifications d'existence** avant modifications
- [ ] ✅ **Valeurs par défaut** appropriées pour nouvelles colonnes
- [ ] ✅ **Sauvegarde automatique** des données critiques
- [ ] ✅ **Transformation progressive** pour modifications de type
- [ ] ✅ **Méthode down()** complète et testée
- [ ] ✅ **Tests de migration/rollback** en développement
- [ ] ✅ **Performance acceptable** sur données volumineuses
- [ ] ✅ **Documentation des risques** identifiés et mitigés

#### **📊 EXEMPLES CONCRETS PAR CAS D'USAGE**

##### **Cas 1 : Ajout de colonne obligatoire sur table peuplée**
```sql
-- ❌ INTERDIT - Causera des erreurs sur données existantes
ALTER TABLE services ADD COLUMN required_field VARCHAR(50) NOT NULL;

-- ✅ CORRECT - Progression en 3 étapes
-- Étape 1 : Ajouter colonne nullable avec défaut
ALTER TABLE services ADD COLUMN required_field VARCHAR(50) DEFAULT 'DEFAULT_VALUE';

-- Étape 2 : Mettre à jour les données existantes
UPDATE services SET required_field = 'APPROPRIATE_VALUE' WHERE required_field IS NULL;

-- Étape 3 : Ajouter contrainte NOT NULL
ALTER TABLE services ALTER COLUMN required_field SET NOT NULL;
```

##### **Cas 2 : Changement de type avec données existantes**
```sql
-- ❌ INTERDIT - Perte de données garantie
ALTER TABLE services ALTER COLUMN price TYPE INTEGER;

-- ✅ CORRECT - Colonne temporaire et migration
ALTER TABLE services ADD COLUMN price_new INTEGER;
UPDATE services SET price_new = CAST(price AS INTEGER) WHERE price ~ '^[0-9]+$';
UPDATE services SET price_new = 0 WHERE price_new IS NULL; -- Défaut sécurisé
ALTER TABLE services DROP COLUMN price;
ALTER TABLE services RENAME COLUMN price_new TO price;
```

#### **🚨 SANCTIONS POUR NON-RESPECT**

Le non-respect de cette règle entraîne :
- **Blocage immédiat** de la migration en production
- **Corruption potentielle** des données critiques
- **Rollback d'urgence** et investigation complète
- **Review obligatoire** de toutes les migrations futures
- **Formation supplémentaire** sur les bonnes pratiques

**Cette règle est CRITIQUE pour la sécurité et l'intégrité des données !**

### 👤 **TRAÇABILITÉ UTILISATEUR OBLIGATOIRE**

**⚠️ RÈGLE CRITIQUE : Il faut TOUJOURS savoir qui a créé quoi et qui a mis à jour quoi**

**CHAQUE entité DOIT avoir :**
- **createdBy** : UUID de l'utilisateur qui a créé l'entité
- **updatedBy** : UUID de l'utilisateur qui a fait la dernière modification
- **createdAt** : Timestamp de création
- **updatedAt** : Timestamp de dernière modification

```typescript
// ✅ OBLIGATOIRE - Pattern d'entité avec traçabilité complète
export class Skill {
  private constructor(
    private readonly _id: string,
    private readonly _businessId: BusinessId,
    private _name: string,
    private _category: string,
    private _description: string,
    private _isActive: boolean,
    private _isCritical: boolean,
    private readonly _createdBy: string,    // ⚠️ OBLIGATOIRE
    private _updatedBy: string,             // ⚠️ OBLIGATOIRE
    private readonly _createdAt: Date,      // ⚠️ OBLIGATOIRE
    private _updatedAt: Date,               // ⚠️ OBLIGATOIRE
  ) {}

  static create(params: {
    businessId: BusinessId;
    name: string;
    category: string;
    description: string;
    isCritical: boolean;
    createdBy: string; // ⚠️ OBLIGATOIRE - UUID de l'utilisateur
  }): Skill {
    const now = new Date();
    return new Skill(
      generateId(),
      params.businessId,
      params.name,
      params.category,
      params.description,
      true, // Actif par défaut
      params.isCritical,
      params.createdBy,    // ⚠️ OBLIGATOIRE
      params.createdBy,    // updatedBy = createdBy initialement
      now,                 // createdAt
      now,                 // updatedAt
    );
  }

  update(params: {
    name?: string;
    category?: string;
    description?: string;
    isCritical?: boolean;
    isActive?: boolean;
    updatedBy: string; // ⚠️ OBLIGATOIRE - UUID de l'utilisateur
  }): void {
    if (params.name) this._name = params.name;
    if (params.category) this._category = params.category;
    if (params.description !== undefined) this._description = params.description;
    if (params.isCritical !== undefined) this._isCritical = params.isCritical;
    if (params.isActive !== undefined) this._isActive = params.isActive;

    this._updatedBy = params.updatedBy; // ⚠️ OBLIGATOIRE
    this._updatedAt = new Date();       // ⚠️ OBLIGATOIRE
  }

  // Getters pour traçabilité
  getCreatedBy(): string { return this._createdBy; }
  getUpdatedBy(): string { return this._updatedBy; }
  getCreatedAt(): Date { return this._createdAt; }
  getUpdatedAt(): Date { return this._updatedAt; }
}
```

**MIGRATIONS ORM - Pattern obligatoire :**
```typescript
// ✅ OBLIGATOIRE - Colonnes de traçabilité dans TOUTES les tables
export class CreateSkillsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'skills',
        columns: [
          // Colonnes métier...

          // ⚠️ TRAÇABILITÉ OBLIGATOIRE
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who created this skill',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: false,
            comment: 'UUID of user who last updated this skill',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Creation timestamp',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            comment: 'Last update timestamp',
          },
        ],
      }),
      true,
    );
  }
}
```

### 🔐 **AUDIT TRAIL OBLIGATOIRE**

**Toutes les opérations CRUD doivent être auditées :**

```typescript
// ✅ OBLIGATOIRE - Audit dans les Use Cases
await this.auditService.logOperation({
  operation: 'CREATE_SKILL',
  entityType: 'SKILL',
  entityId: savedSkill.getId(),
  businessId: request.businessId,
  userId: request.requestingUserId,
  correlationId: request.correlationId,
  changes: {
    created: savedSkill.toJSON(),
  },
  timestamp: new Date(),
});
```

### 📋 **CHECKLIST OBLIGATOIRE POUR CHAQUE FICHIER**

- [ ] ✅ **Logging** : ILogger injecté et utilisé
- [ ] ✅ **I18n** : I18nService injecté, messages traduits
- [ ] ✅ **Contexte** : correlationId, requestingUserId présents
- [ ] ✅ **Error Handling** : Erreurs loggées avec contexte
- [ ] ✅ **Audit** : Opérations critiques auditées
- [ ] ✅ **Métadonnées** : Timestamp, IP, UserAgent capturés
- [ ] ✅ **Types stricts** : Aucun `any`, interfaces complètes
- [ ] ✅ **Validation** : Données validées avec messages i18n

### 🚫 **INTERDICTIONS ABSOLUES**

- ❌ **JAMAIS** de `console.log()` en production
- ❌ **JAMAIS** de messages d'erreur hardcodés
- ❌ **JAMAIS** d'opération sans logging
- ❌ **JAMAIS** de Use Case sans correlationId
- ❌ **JAMAIS** d'exception sans contexte de traçabilité
- ❌ **JAMAIS** de CRUD sans audit trail

## 🐳 **ENVIRONNEMENT DOCKER EXCLUSIF - RÈGLE ABSOLUE**

### � **RÈGLE CRITIQUE NON-NÉGOCIABLE : TOUT TOURNE SUR DOCKER**

**⚠️ INTERDICTION ABSOLUE D'EXÉCUTER DES COMMANDES SUR L'HOST**

L'application **TOURNE EXCLUSIVEMENT SUR DOCKER** avec Docker Compose. **AUCUNE** commande ne doit être exécutée directement sur la machine host.

**🎯 POURQUOI DOCKER EXCLUSIF :**
- **🎯 Consistance d'environnement** : Même stack partout (dev, staging, prod)
- **🗄️ Base de données intégrée** : PostgreSQL + Redis dans containers
- **🔧 Hot reload activé** : Développement fluide avec volumes montés
- **⚙️ Configuration simplifiée** : Variables d'environnement centralisées
- **🚀 Déploiement reproductible** : Infrastructure as Code
- **🔒 Isolation complète** : Pas de pollution de l'environnement host
- **📦 Dépendances maîtrisées** : Versions exactes dans containers

### **🔧 Commandes Docker OBLIGATOIRES - REMPLACEMENTS HOST**

```bash
# 🐳 Démarrer TOUS les services (App + DB + Redis)
make start
# OU
docker compose up -d

# 📊 Démarrer SEULEMENT les bases de données
make start-db

# 🛑 Arrêter tous les services
make stop

# 🔄 Redémarrer les services
make restart

# 📝 Voir les logs
make logs

# 🧹 Nettoyer volumes et images
make clean

# ⚠️ NOUVEAU - Commandes dans container OBLIGATOIRES
docker compose exec app npm run lint
docker compose exec app npm run test
docker compose exec app npm run build
docker compose exec app npx tsc --noEmit
docker compose exec app npm run migration:run
docker compose exec app npm run migration:revert
```

### **🚨 RÈGLE CRITIQUE : INSTALLATION DÉPENDANCES DANS LE CONTAINER**

**⚠️ WORKFLOW OBLIGATOIRE** : Pour éviter les problèmes de compatibilité et cache Docker, TOUJOURS installer les dépendances depuis le container et supprimer le container avant reconstruction :

```bash
# ✅ WORKFLOW CORRECT - Installation depuis le container
# 1️⃣ Entrer dans le container pour installer la dépendance
docker compose exec app npm install nouvelle-dependance

# 2️⃣ OBLIGATOIRE : Supprimer le container avant reconstruction
docker compose down app

# 3️⃣ OBLIGATOIRE : Reconstruire l'image Docker sans cache
docker compose build --no-cache app

# 4️⃣ Redémarrer le container avec la nouvelle image
docker compose up -d app

# 5️⃣ Vérifier que l'application démarre correctement
docker compose logs app --tail=20
```

**❌ ERREURS COURANTES À ÉVITER** :
- Installer sur l'host puis reconstruire → Problèmes de cache Docker
- Oublier de supprimer le container → Ancienne image utilisée
- Reconstruire avec cache → Dépendances pas mises à jour dans le container

**✅ WORKFLOW DÉTAILLÉ OBLIGATOIRE** :
1. `docker compose exec app npm install package` (DANS le container)
2. `docker compose down app` (OBLIGATOIRE - supprimer container)
3. `docker compose build --no-cache app` (OBLIGATOIRE - reconstruction sans cache)
4. `docker compose up -d app` (redémarrage propre)
5. `docker compose logs app --tail=20` (vérification démarrage)

### **� RÈGLE CRITIQUE : MIGRATIONS EXCLUSIVEMENT DANS DOCKER**

**⚠️ WORKFLOW OBLIGATOIRE** : Toutes les migrations doivent être exécutées dans le container Docker pour éviter les problèmes de compatibilité et d'environnement :

```bash
# ✅ OBLIGATOIRE - Exécuter migrations dans container
docker compose exec app npm run migration:run

# ✅ OBLIGATOIRE - Rollback migrations dans container
docker compose exec app npm run migration:revert

# ✅ OBLIGATOIRE - Génération de migration dans container
docker compose exec app npm run migration:generate -- -n NameOfMigration

# ✅ OBLIGATOIRE - Création manuelle de migration dans container
docker compose exec app npm run migration:create -- -n NameOfMigration

# ✅ OBLIGATOIRE - Vérifier status migrations dans container
docker compose exec app npm run migration:show
```

### **🔧 COMMANDES COURANTES DOCKER - RÉFÉRENCE RAPIDE**

```bash
# 🧪 TESTS
docker compose exec app npm test                    # Tous les tests
docker compose exec app npm run test:unit          # Tests unitaires
docker compose exec app npm run test:integration   # Tests d'intégration
docker compose exec app npm run test:e2e          # Tests end-to-end
docker compose exec app npm run test:cov          # Coverage

# 🔍 QUALITÉ CODE
docker compose exec app npm run lint              # ESLint
docker compose exec app npm run lint -- --fix    # Auto-fix
docker compose exec app npm run format            # Prettier
docker compose exec app npx tsc --noEmit         # Vérification TypeScript

# 🏗️ BUILD
docker compose exec app npm run build             # Build production
docker compose exec app npm run start:dev         # Dev mode (dans container)

# 📦 DÉPENDANCES
docker compose exec app npm install package-name  # Installer dépendance
docker compose exec app npm uninstall package-name # Désinstaller
docker compose exec app npm ci                    # Clean install
docker compose exec app npm audit                 # Audit sécurité
docker compose exec app npm outdated              # Dépendances obsolètes

# 🗄️ BASE DE DONNÉES
docker compose exec app npm run migration:run     # Exécuter migrations
docker compose exec app npm run migration:revert  # Rollback migration
docker compose exec app npm run seed:run          # Exécuter seeds
docker compose exec postgres-dev psql -U postgres -d appointment_system  # Accès direct DB
```

### **📦 Services Docker Configurés**

- **🎨 NestJS App** : Port 3000, hot reload, debugging
- **🐘 PostgreSQL 15** : Port 5432, volume persistant, health checks
- **🍃 MongoDB 7** : Port 27017, réplication configurée
- **🔴 Redis** : Port 6379, cache utilisateur et sessions
- **🔧 pgAdmin 4** : Port 5050, interface web DB management

### **🚨 INTERDICTIONS ABSOLUES - COMMANDES HOST**

**❌ JAMAIS EXÉCUTER SUR L'HOST :**
- ❌ **JAMAIS** `npm run start:dev` directement sur la machine host
- ❌ **JAMAIS** `npm install` ou `npm ci` sur l'host
- ❌ **JAMAIS** `npm run test` sur l'host
- ❌ **JAMAIS** `npm run lint` sur l'host
- ❌ **JAMAIS** `npm run build` sur l'host
- ❌ **JAMAIS** `npx tsc` sur l'host
- ❌ **JAMAIS** `npm run migration:run` sur l'host
- ❌ **JAMAIS** installer PostgreSQL/Redis/MongoDB localement
- ❌ **JAMAIS** modifier les ports sans mettre à jour docker-compose.yml
- ❌ **JAMAIS** utiliser node/npm directement sur l'host

**✅ TOUJOURS OBLIGATOIRE - COMMANDES DOCKER :**
- ✅ **TOUJOURS** `docker compose exec app npm run [command]`
- ✅ **TOUJOURS** `docker compose exec app npm install [package]`
- ✅ **TOUJOURS** `docker compose exec app npm run test`
- ✅ **TOUJOURS** `docker compose exec app npm run lint`
- ✅ **TOUJOURS** `docker compose exec app npm run build`
- ✅ **TOUJOURS** `docker compose exec app npm run migration:run`
- ✅ **TOUJOURS** utiliser Docker pour développement, tests, débogage, migrations

## �️ **ARCHITECTURE DE BASE DE DONNÉES - CLEAN ARCHITECTURE OBLIGATOIRE**

### 🎯 **RÈGLE CRITIQUE : ORGANISATION PAR TYPE DE BASE DE DONNÉES**

**⚠️ RÈGLE NON-NÉGOCIABLE** : Pour respecter la Clean Architecture et permettre de changer facilement de base de données (SQL/NoSQL), nous devons organiser les fichiers par type de driver spécifique.

#### **📁 STRUCTURE OBLIGATOIRE DES COUCHES DONNÉES**

```
src/infrastructure/database/
├── database.module.ts                 # Module principal avec switch DB
├── typeorm.config.ts                  # Configuration générale TypeORM
├── typeorm-repositories.module.ts     # Module repositories TypeORM
├── sql/                              # ✅ Bases de données SQL
│   └── postgresql/                   # ✅ Driver PostgreSQL spécifique
│       ├── entities/                 # ✅ Entités ORM PostgreSQL
│       │   ├── user-orm.entity.ts
│       │   ├── skill-orm.entity.ts
│       │   ├── service-category-orm.entity.ts
│       │   ├── service-type-orm.entity.ts
│       │   └── index.ts             # Export centralisé
│       ├── repositories/             # ✅ Repositories PostgreSQL
│       │   ├── typeorm-user.repository.ts
│       │   ├── typeorm-skill.repository.ts
│       │   ├── typeorm-service-category.repository.ts
│       │   ├── typeorm-service-type.repository.ts
│       │   └── index.ts             # Export centralisé
│       ├── migrations/               # ✅ Migrations PostgreSQL
│       │   ├── 1703701200000-CreateSkillsTable.ts
│       │   ├── 1703702000000-CreateServiceCategoriesTable.ts
│       │   ├── 1703703000000-CreateServiceTypesTable.ts
│       │   └── index.ts
│       └── utils/                    # ✅ Utilitaires PostgreSQL
├── nosql/                           # ✅ Bases de données NoSQL
│   ├── mongodb/                     # ✅ Driver MongoDB spécifique
│   │   ├── schemas/                 # Schémas MongoDB
│   │   ├── repositories/            # Repositories MongoDB
│   │   └── migrations/              # Migrations MongoDB
│   └── redis/                       # ✅ Driver Redis spécifique
│       ├── schemas/
│       └── repositories/
└── orm/                             # ✅ Mappers ORM génériques
    └── mappers/                     # ✅ Conversion Domain ↔ Persistence
        ├── user-orm.mapper.ts
        ├── skill-orm.mapper.ts
        ├── service-category-orm.mapper.ts
        ├── service-type-orm.mapper.ts
        └── index.ts
```

#### **🚨 RÈGLES DE DÉPLACEMENT OBLIGATOIRES**

**⚠️ TOUS les fichiers doivent être organisés selon cette hiérarchie :**

```bash
# ❌ INTERDIT - Fichiers dans mauvais répertoire
src/infrastructure/database/entities/           # Trop générique
src/infrastructure/database/repositories/       # Trop générique

# ✅ CORRECT - Fichiers dans structure spécifique
src/infrastructure/database/sql/postgresql/entities/
src/infrastructure/database/sql/postgresql/repositories/
```

#### **📋 AVANTAGES DE CETTE ARCHITECTURE**

1. **🔄 Swappable Database** : Changer facilement entre PostgreSQL, MySQL, MongoDB
2. **🎯 Isolation par Driver** : Chaque driver a sa propre implémentation
3. **📦 Modulaire** : Ajouter/supprimer des drivers sans impact
4. **🧪 Tests Isolés** : Tests spécifiques par type de base
5. **⚡ Performance** : Optimisations spécifiques par driver
6. **🔧 Maintenance** : Code organisé par responsabilité technique

#### **🛠️ WORKFLOW DE MIGRATION OBLIGATOIRE**

**Étape 1 : Identifier les fichiers mal placés**
```bash
# Trouver tous les fichiers ORM/repositories mal placés
find src/infrastructure/database -name "*-orm.entity.ts" -not -path "*/sql/postgresql/entities/*"
find src/infrastructure/database -name "typeorm-*.repository.ts" -not -path "*/sql/postgresql/repositories/*"
```

**Étape 2 : Déplacer vers la structure correcte**
```bash
# Déplacer entités ORM vers PostgreSQL
mv src/infrastructure/database/entities/*.ts src/infrastructure/database/sql/postgresql/entities/

# Déplacer repositories TypeORM vers PostgreSQL
mv src/infrastructure/database/repositories/typeorm-*.ts src/infrastructure/database/sql/postgresql/repositories/
```

**Étape 3 : Mettre à jour les imports**
```bash
# Corriger automatiquement les imports après déplacement
npx ts-node scripts/fix-imports-after-db-migration.ts
```

#### **✅ CHECKLIST ARCHITECTURE DATABASE OBLIGATOIRE**

- [ ] ✅ **Entités ORM** dans `sql/postgresql/entities/`
- [ ] ✅ **Repositories TypeORM** dans `sql/postgresql/repositories/`
- [ ] ✅ **Migrations** dans `sql/postgresql/migrations/`
- [ ] ✅ **Mappers** dans `infrastructure/mappers/` (génériques)
- [ ] ✅ **Index exports** dans chaque sous-dossier
- [ ] ✅ **Imports corrigés** après migration
- [ ] ✅ **Tests** organisés selon même structure
- [ ] ✅ **Documentation** mise à jour

#### **🚫 INTERDICTIONS ABSOLUES - ARCHITECTURE DB**

- ❌ **JAMAIS** de fichier ORM dans `database/entities/` (trop générique)
- ❌ **JAMAIS** de repository dans `database/repositories/` (trop générique)
- ❌ **JAMAIS** mélanger drivers différents dans même dossier
- ❌ **JAMAIS** d'import direct entre drivers (PostgreSQL ↔ MongoDB)
- ❌ **JAMAIS** de logique métier dans couche infrastructure
- ❌ **JAMAIS** de couplage fort avec un driver spécifique

### 🔗 **INTÉGRATION AVEC DOCKER ET MIGRATIONS**

```bash
# ✅ OBLIGATOIRE - Migrations PostgreSQL dans Docker
docker compose exec app npm run migration:run

# ✅ OBLIGATOIRE - Tests avec base PostgreSQL
docker compose exec app npm run test:integration

# ✅ OBLIGATOIRE - Seed data PostgreSQL
docker compose exec app npm run seed:postgresql
```

**Cette organisation garantit une architecture flexible, maintenable et évolutive !**

## �🚀 **NODE.JS 24 - NOUVELLES FONCTIONNALITÉS À EXPLOITER**

### 📋 **Environnement Technique Requis**

- **Node.js Version** : `24.0.0` minimum (LTS recommandé)
- **Documentation officielle** : https://nodejs.org/en/blog/release/v24.0.0
- **TypeScript** : `5.5+` pour compatibilité maximale avec Node 24

### ⚡ **Nouvelles Fonctionnalités Node.js 24 à Utiliser**

#### **1. 🔧 Enhanced WebStreams Support**

```typescript
// ✅ NOUVEAU - WebStreams natives optimisées
export class DataProcessor {
  async processLargeDataset(data: ReadableStream<Uint8Array>): Promise<void> {
    const transformer = new TransformStream({
      transform(chunk, controller) {
        // Processing logique métier
        const processed = this.transformChunk(chunk);
        controller.enqueue(processed);
      }
    });

    await data
      .pipeThrough(transformer)
      .pipeTo(new WritableStream({
        write(chunk) {
          // Optimisé par Node 24
          this.saveToDatabase(chunk);
        }
      }));
  }
}
```

#### **2. 🚀 Improved V8 Performance (v12.4)**

```typescript
// ✅ NOUVEAU - Optimisations automatiques V8 pour:
export class PerformanceOptimizedService {
  // Object spread operations - 15% plus rapide
  private mergeConfigurations(base: Config, override: Partial<Config>): Config {
    return { ...base, ...override }; // Optimisé par V8 12.4
  }

  // Array operations - 20% plus rapide
  private processLargeArrays<T>(items: T[]): T[] {
    return items
      .filter(this.isValid)
      .map(this.transform)
      .sort(this.compare); // Tri vectorisé optimisé
  }

  // String template literals - Améliorés
  private generateReport(data: ReportData): string {
    return `
      📊 Report Generated: ${new Date().toISOString()}
      📈 Total Items: ${data.items.length}
      🎯 Success Rate: ${(data.successRate * 100).toFixed(2)}%
    `; // Optimisation template string V8 12.4
  }
}
```

#### **3. 🛡️ Enhanced Security Features**

```typescript
// ✅ NOUVEAU - Politique de sécurité renforcée
export class SecureConfigService {
  constructor() {
    // Node 24 - Enhanced permission model
    if (process.permission?.has('fs.read', './config/')) {
      this.loadSecureConfig();
    }
  }

  // NOUVEAU - crypto.webcrypto optimisé
  async generateSecureHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // WebCrypto API natif optimisé Node 24
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
```

#### **4. 📦 Built-in Test Runner Amélioré**

```typescript
// ✅ NOUVEAU - Node.js native test runner enhanced
// package.json scripts
{
  "scripts": {
    "test:node": "node --test **/*.test.js",
    "test:node-watch": "node --test --watch **/*.test.js",
    "test:coverage": "node --test --experimental-test-coverage **/*.test.js"
  }
}

// Tests avec Node native runner
import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert';

describe('UserService Tests', () => {
  it('should create user successfully', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      name: 'Test User'
    });

    // Node 24 - Améliorations assert
    assert.strictEqual(user.email, 'test@example.com');
    assert.ok(user.id);
  });
});
```

#### **5. 🌍 ESM & Import Attributes**

```typescript
// ✅ NOUVEAU - Import attributes pour JSON
import config from './config.json' with { type: 'json' };
import packageInfo from '../package.json' with { type: 'json' };

// ✅ NOUVEAU - Dynamic imports améliorés
export class DynamicModuleLoader {
  async loadPlugin(pluginName: string): Promise<any> {
    // Node 24 - Résolution ESM optimisée
    const module = await import(`./plugins/${pluginName}.js`);
    return module.default;
  }

  // Top-level await dans ESM
  private config = await this.loadConfiguration();
}
```

#### **6. 🔍 Enhanced Debugging & Diagnostics**

```typescript
// ✅ NOUVEAU - Diagnostics intégrés améliorés
export class DiagnosticsService {
  getSystemDiagnostics(): SystemDiagnostics {
    return {
      // Node 24 - Métriques étendues
      memory: process.memoryUsage.rss(),
      heap: process.memoryUsage(),

      // NOUVEAU - Resource usage details
      resourceUsage: process.resourceUsage(),

      // NOUVEAU - Enhanced performance marks
      performanceMarks: performance.getEntriesByType('mark'),

      // Node 24 - Network diagnostics
      networkInterfaces: require('os').networkInterfaces()
    };
  }

  // NOUVEAU - Performance observer API amélioré
  observePerformance(): void {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.logger.debug(`Performance: ${entry.name} took ${entry.duration}ms`);
      });
    });

    obs.observe({ entryTypes: ['function', 'http', 'dns'] });
  }
}
```

### 📋 **Checklist Node.js 24 Migration**

- [ ] **Version Check** : `node --version` >= 24.0.0
- [ ] **ESM Migration** : Convertir vers `"type": "module"` si nécessaire
- [ ] **Import Attributes** : Utiliser `with { type: 'json' }` pour JSON
- [ ] **WebStreams** : Migrer vers WebStreams API natif
- [ ] **Test Runner** : Évaluer l'utilisation du test runner natif
- [ ] **Performance** : Profiter des optimisations V8 12.4
- [ ] **Security** : Implémenter les nouvelles fonctionnalités crypto
- [ ] **Diagnostics** : Intégrer les nouveaux outils de monitoring

### 🚨 **Patterns Spécifiques Node.js 24**

#### **Gestion Mémoire Optimisée**
```typescript
// ✅ Node 24 - Weak references optimisées
export class CacheService {
  private cache = new WeakMap(); // Optimisé pour GC
  private registry = new FinalizationRegistry((key) => {
    this.logger.debug(`Cache entry ${key} garbage collected`);
  });
}
```

#### **Worker Threads Améliorés**
```typescript
// ✅ Node 24 - Worker threads performance
import { Worker, isMainThread, parentPort } from 'worker_threads';

export class ComputeService {
  async heavyComputation(data: any[]): Promise<any[]> {
    if (data.length > 1000) {
      // Node 24 - Optimized worker spawning
      return this.processInWorker(data);
    }
    return this.processInMain(data);
  }
}
```

### 🎯 **Recommandations Architecture avec Node.js 24**

1. **ESM First** : Privilégier les modules ES natifs
2. **WebStreams** : Utiliser pour le traitement de gros volumes
3. **Native Test Runner** : Pour les tests unitaires simples
4. **Enhanced Crypto** : Pour la sécurité renforcée
5. **Performance Monitoring** : Exploiter les nouveaux outils de diagnostic
6. **Worker Threads** : Pour les calculs intensifs

## 📊 **ÉTAT ACTUEL DU PROJET - BUSINESS FEATURES**

### ✅ **FONCTIONNALITÉS COMPLÈTEMENT IMPLÉMENTÉES**

#### **Staff Management (Personnel) - ✅ 100% TERMINÉ AVEC SUCCÈS**
- ✅ **Domain** : Staff Entity + Value Objects + Repository Interface
- ✅ **Application** : CreateStaff, GetStaff, ListStaff, UpdateStaff, DeleteStaff Use Cases
- ✅ **Infrastructure** : StaffOrmEntity + TypeOrmStaffRepository + StaffMapper + Migration
- ✅ **Presentation** : StaffController + StaffDTO + Documentation Swagger **COMPLET**
- ✅ **Documentation** : ✅ docs/SWAGGER_STAFF_SERVICE_API.md créé avec exemples complets

#### **Service Management - ✅ 100% TERMINÉ AVEC SUCCÈS**
- ✅ **Domain** : Service Entity + Value Objects + Repository Interface
- ✅ **Application** : CreateService, GetService, ListService, UpdateService, DeleteService Use Cases
- ✅ **Infrastructure** : ServiceOrmEntity + TypeOrmServiceRepository + ServiceMapper + Migration
- ✅ **Presentation** : ServiceController + ServiceDTO + Documentation Swagger **COMPLET**
- ✅ **Documentation** : ✅ docs/SWAGGER_STAFF_SERVICE_API.md créé avec exemples complets

#### **Appointment System - 100% COMPLET AVEC RÈGLES MÉTIER**
- ✅ **Domain** : Appointment Entity + Value Objects + Repository Interface
- ✅ **Application** : BookAppointment + GetAvailableSlots Use Cases avec règles métier
- ✅ **Infrastructure** : AppointmentOrmEntity + TypeOrmAppointmentRepository + Mappers + Migration
- ✅ **Business Rules** : **SEULS les services avec `allowOnlineBooking: true` peuvent être réservés**
- ✅ **Exception Handling** : ServiceNotBookableOnlineError pour services non-publics
- ⚠️ **Presentation** : AppointmentController (PARTIEL - À COMPLÉTER)
- ❌ **Documentation** : Documentation Swagger Appointment à créer après présentation

### ✅ **FONCTIONNALITÉS DÉJÀ TERMINÉES (AVEC PRESENTATION)**
- **User Management** - Controllers + DTOs complets
- **Business Management** - Controllers + DTOs complets
- **Business Sector Management** - Controllers + DTOs complets
- **Calendar Management** - Controllers + DTOs complets
- **Health Checks** - Controller complet

### 🎯 **PROCHAINE ÉTAPE : PRESENTATION UNIQUEMENT**

**⚠️ IMPORTANT** : Pour Staff et Service, nous avons Domain + Application + Infrastructure COMPLETS.
Il ne manque QUE la couche Presentation (Controllers + DTOs).

**WORKFLOW SIMPLIFIÉ POUR CES CAS** :
1. Créer les DTOs typés (validation + Swagger)
2. Créer le Controller complet (CRUD + list)
3. Tests E2E
4. Documentation mise à jour

## 🏗️ **MÉTHODOLOGIE DE DÉVELOPPEMENT EN COUCHES ORDONNÉES - RÈGLE CRITIQUE NON-NÉGOCIABLE**

### 🎯 **ORDRE OBLIGATOIRE DE DÉVELOPPEMENT - TDD STRICT**

**⚠️ RÈGLE FONDAMENTALE NON-NÉGOCIABLE** : Dans TOUTE création, modification ou suppression de fonctionnalité, il faut OBLIGATOIREMENT partir de la couche Domain, puis Application, puis Infrastructure (y compris modifications et exécution éventuelles des migrations), et ENFIN Presentation.

**🚨 VIOLATION ARCHITECTURALE MAJEURE** : Commencer par les Controllers/DTOs (Presentation) sans avoir terminé l'Infrastructure constitue une violation grave de la Clean Architecture et est **STRICTEMENT INTERDIT**.

**🎯 WORKFLOW OBLIGATOIRE - AUCUNE EXCEPTION AUTORISÉE** :

1. **DOMAIN** (Entités, Value Objects, Services métier, Exceptions)
2. **APPLICATION** (Use Cases, Ports/Interfaces, Services applicatifs)
3. **INFRASTRUCTURE** (Repositories, ORM, Migrations TypeORM, Services techniques)
4. **PRESENTATION** (Controllers, DTOs, Mappers, Validation)

**Cette règle s'applique pour :**
- ✅ **Création** de nouvelles fonctionnalités
- ✅ **Modification** de fonctionnalités existantes
- ✅ **Suppression** de fonctionnalités
- ✅ **Refactoring** architectural
- ✅ **Ajout de propriétés** aux entités
- ✅ **Changement de logique métier**

### 🔄 **PROCESSUS TDD PAR COUCHE - OBLIGATOIRE POUR TOUTE MODIFICATION** :

**🚨 RÈGLE CRITIQUE** : Que ce soit pour créer, modifier ou supprimer une fonctionnalité, TOUJOURS respecter cet ordre :

1. **🔴 RED** : Écrire le test qui échoue pour la fonctionnalité dans la couche appropriée
2. **🟢 GREEN** : Écrire le code minimal qui fait passer le test
3. **🔵 REFACTOR** : Améliorer le code en gardant les tests verts
4. **✅ VALIDATE** : Vérifier que la couche compile et tous ses tests passent
5. **➡️ NEXT LAYER** : Passer à la couche suivante UNIQUEMENT si la précédente est terminée

**⚠️ CAS D'USAGE CONCRETS OBLIGATOIRES** :

### 📝 **CRÉATION D'UNE NOUVELLE FONCTIONNALITÉ**
```bash
1️⃣ DOMAIN       : Entité + Value Objects + Exceptions + Repository Interface + Tests
2️⃣ APPLICATION  : Use Cases + Validation + Ports + Tests
3️⃣ INFRASTRUCTURE: ORM Entity + Repository + Migration TypeORM + Tests
4️⃣ PRESENTATION : Controllers + DTOs + Validation + Swagger + Tests
```

### 🔧 **MODIFICATION D'UNE FONCTIONNALITÉ EXISTANTE**
```bash
1️⃣ DOMAIN       : Modification entité + validation métier + tests mis à jour
2️⃣ APPLICATION  : Modification use cases + nouvelles validations + tests
3️⃣ INFRASTRUCTURE: Migration TypeORM + modification ORM + repositories + tests
4️⃣ PRESENTATION : Modification DTOs + controllers + validation + tests
```

### 🗑️ **SUPPRESSION D'UNE FONCTIONNALITÉ**
```bash
1️⃣ DOMAIN       : Marquage deprecated + validation suppression + tests
2️⃣ APPLICATION  : Use cases suppression + gestion dépendances + tests
3️⃣ INFRASTRUCTURE: Migration cleanup + suppression ORM + tests
4️⃣ PRESENTATION : Suppression endpoints + DTOs + documentation
```

### ⚠️ **RÈGLES CRITIQUES NON-NÉGOCIABLES**
- ❌ **JAMAIS** développer plusieurs fonctionnalités simultanément
- ❌ **JAMAIS** passer à la couche suivante si la précédente a des tests qui échouent
- ❌ **JAMAIS** écrire du code sans test préalable (TDD strict)
- ❌ **JAMAIS** ignorer les erreurs de compilation d'une couche
- ❌ **JAMAIS** commencer par la Presentation sans Infrastructure complète
- ❌ **JAMAIS** modifier une entité sans migration TypeORM appropriée
- ❌ **JAMAIS** créer/modifier/supprimer sans suivre l'ordre Domain → Application → Infrastructure → Presentation
- ✅ **TOUJOURS** une seule fonctionnalité à la fois (ex: CreateUser → UpdateUser → DeleteUser)
- ✅ **TOUJOURS** finir complètement une couche avant de passer à la suivante
- ✅ **TOUJOURS** écrire les tests AVANT le code (TDD strict)
- ✅ **TOUJOURS** valider la compilation après chaque modification
- ✅ **TOUJOURS** exécuter et tester les migrations avant la couche Presentation

### 📋 **WORKFLOW DÉTAILLÉ PAR COUCHE**

#### **🏗️ Exemple Concret : Fonctionnalité "Create Business"**

**Étape 1️⃣ : DOMAIN** (Obligatoire en premier)
```bash
# 1. Créer les tests d'entité Business
touch src/domain/entities/business.entity.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer l'entité Business (GREEN)
# 4. Refactorer si nécessaire (REFACTOR)
# 5. Valider : npm test -- business.entity.spec.ts
```

**Étape 2️⃣ : APPLICATION** (Seulement après Domain terminé)
```bash
# 1. Créer les tests de use case
touch src/application/use-cases/business/create-business.use-case.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer le use case CreateBusinessUseCase (GREEN)
# 4. Créer l'interface BusinessRepository dans domain/repositories/
# 5. Refactorer si nécessaire (REFACTOR)
# 6. Valider : npm test -- create-business.use-case.spec.ts
```

**Étape 3️⃣ : INFRASTRUCTURE** (Seulement après Application terminé - ⚠️ OBLIGATOIRE AVANT PRESENTATION)
```bash
# 1. Créer les tests de repository
touch src/infrastructure/database/repositories/typeorm-business.repository.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. ⚠️ CRITIQUE : Créer Migration TypeORM OBLIGATOIRE EN PREMIER
touch src/infrastructure/database/sql/postgresql/migrations/{timestamp}-Create{Entity}Table.ts
# 4. 🚨 ÉTAPE OBLIGATOIRE : TESTER LA MIGRATION AVANT TOUT CODE
docker-compose exec nestjs-dev npm run migration:run
docker-compose exec nestjs-dev npm run migration:revert  # Vérifier le rollback
docker-compose exec nestjs-dev npm run migration:run     # Re-appliquer
# 5. ⚠️ CRITIQUE : VALIDER QUE LA MIGRATION FONCTIONNE SANS ERREUR
# Si erreurs → STOP et corriger la migration avant de continuer
# 6. Créer l'entité ORM BusinessOrmEntity (GREEN)
# 7. Créer/Mettre à jour les Mappers statiques dans /infrastructure/mappers/ (GREEN)
# 8. Créer TypeOrmBusinessRepository qui implémente BusinessRepository (GREEN)
# 9. Configurer l'injection de dépendances dans TypeOrmRepositoriesModule (GREEN)
# 10. Refactorer si nécessaire (REFACTOR)
# 11. Valider : npm test -- typeorm-business.repository.spec.ts
```

### 🚨 **RÈGLE CRITIQUE : MIGRATION VALIDÉE AVANT PRÉSENTATION**

**⚠️ RÈGLE NON-NÉGOCIABLE** : **JAMAIS** passer à la couche Presentation sans avoir validé que les migrations fonctionnent parfaitement.

**WORKFLOW OBLIGATOIRE MIGRATIONS :**

```bash
# 1️⃣ CRÉER la migration
touch src/infrastructure/database/sql/postgresql/migrations/{timestamp}-Create{Entity}Table.ts

# 2️⃣ TESTER dans Docker (OBLIGATOIRE)
docker-compose exec nestjs-dev npm run migration:run

# 3️⃣ VÉRIFIER le rollback
docker-compose exec nestjs-dev npm run migration:revert

# 4️⃣ RE-APPLIQUER pour validation finale
docker-compose exec nestjs-dev npm run migration:run

# 5️⃣ VÉRIFIER les tables créées
docker-compose exec postgres-dev psql -U postgres -d appointment_system -c "\dt"

# 6️⃣ SEULEMENT SI SUCCÈS → Continuer vers ORM Entity et Repository
```

**🚨 SI ERREURS DE MIGRATION :**
- **STOP** immédiatement le développement
- **CORRIGER** la migration avant toute autre action
- **RE-TESTER** jusqu'à succès complet
- **JAMAIS** ignorer les erreurs de migration

**Étape 4️⃣ : PRESENTATION** (Seulement après Infrastructure terminé)
```bash
# 1. Créer les tests de controller
touch src/presentation/controllers/business.controller.spec.ts
# 2. Écrire les tests qui échouent (RED)
# 3. Créer les DTOs de validation (GREEN)
# 4. Créer BusinessController (GREEN)
# 5. Configurer la validation et la documentation Swagger (GREEN)
# 6. Refactorer si nécessaire (REFACTOR)
# 7. Valider : npm test -- business.controller.spec.ts
# 8. Test d'intégration E2E : npm run test:e2e -- business
```

### 🚨 **VIOLATIONS COURANTES À ÉVITER**
- **Commencer par le controller** → ❌ Violation de Clean Architecture
- **Créer l'entité ORM avant l'entité Domain** → ❌ Violation de dépendance
- **Écrire du code sans test** → ❌ Violation de TDD
- **Passer à Infrastructure avec des tests Application qui échouent** → ❌ Violation de workflow
- **⚠️ CRITIQUE : Créer Controller/DTOs sans Migration TypeORM testée** → ❌ Violation Infrastructure manquante
- **🚨 NOUVEAU : Passer à Presentation sans tester migration:run/revert** → ❌ Violation sécurité DB

#### **1️⃣ DOMAIN (Couche Métier) - EN PREMIER**
```
src/domain/
├── entities/          # Entités métier pures
├── value-objects/     # Objets valeur immutables
├── services/          # Services métier (règles complexes)
├── repositories/      # Interfaces repositories (ports)
└── exceptions/        # Exceptions métier spécifiques
```
**✅ Caractéristiques** :
- **ZÉRO dépendance externe** (pas de NestJS, pas d'ORM, pas de framework)
- **Pure TypeScript** avec types stricts
- **Logique métier uniquement**
- **Testable en isolation**

#### **2️⃣ APPLICATION (Cas d'Usage) - EN SECOND**
```
src/application/
├── services/          # Services applicatifs (PRÉFÉRER aux use-cases)
├── ports/             # Interfaces pour l'infrastructure
├── use-cases/         # Cases d'utilisation (seulement si nécessaire)
└── exceptions/        # Exceptions applicatives
```
**✅ Caractéristiques** :
- **PRÉFÉRER les Services** aux Use Cases complexes
- **Dépend UNIQUEMENT** de la couche Domain
- **ZÉRO dépendance** vers Infrastructure ou Presentation
- **Orchestration simple** des entités et services métier
- **Définit les ports** (interfaces) pour l'infrastructure
- **Logique d'application claire** et testable

#### **3️⃣ INFRASTRUCTURE (Technique) - EN TROISIÈME**
```
src/infrastructure/
├── database/          # Repositories concrets, ORM, migrations
├── services/          # Services techniques (JWT, Email, etc.)
├── config/            # Configuration
└── security/          # Sécurité technique
```
**✅ Caractéristiques** :
- **Implémente les ports** définis dans Application
- **Peut utiliser NestJS** et autres frameworks
- **Aucune logique métier**
- **Adaptateurs** vers le monde externe

#### **4️⃣ PRESENTATION (Interface) - EN DERNIER**
```
src/presentation/
├── controllers/       # Contrôleurs HTTP
├── dtos/              # Objets de transfert
├── decorators/        # Décorateurs NestJS
└── mappers/           # Conversion DTO ↔ Domain
```
**✅ Caractéristiques** :
- **Orchestration** des Services Application (PAS d'Use Cases complexes)
- **Validation** des entrées avec class-validator
- **Sérialisation** des sorties
- **Documentation Swagger** complète et détaillée
- **Support i18n** pour messages d'erreur
- **Interface utilisateur** (REST, GraphQL, etc.)

### 📧 **RÈGLE PORTS & ADAPTERS pour Services Externes**
**Tous les services externes (Email, SMS, etc.) DOIVENT être des ports/adapters :**
- **Port** (Interface) dans `/application/ports/`
- **Adapter** (Implémentation) dans `/infrastructure/services/`
- **Exemples** : EmailPort → GmailAdapter, SmsPort → TwilioAdapter

### 🗄️ **RÈGLE OBLIGATOIRE : MIGRATIONS TYPEORM POUR NOUVELLES ENTITÉS**
**Pour chaque nouvelle entité créée dans la couche infrastructure, créer SYSTÉMATIQUEMENT :**
- **Migration TypeORM** dans `/src/infrastructure/database/sql/postgresql/migrations/`
- **Nom du fichier** : `{timestamp}-{ActionEntityTable}.ts` (ex: `1695829200000-CreateAppointmentsTable.ts`)
- **Contenu** : Utiliser l'API TypeORM 0.3+ avec `QueryRunner`
- **Validation** : Tester la migration avant de commiter

#### **🛠️ Template Obligatoire pour Migration TypeORM**

```typescript
import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class Create{Entity}Table{Timestamp} implements MigrationInterface {
  name = 'Create{Entity}Table{Timestamp}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: '{entity_name}s',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          // Autres colonnes...
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Index et Foreign Keys si nécessaire
    await queryRunner.createIndex('{entity_name}s', new Index('{entity_name}_idx', ['column']));

    // Foreign Keys
    await queryRunner.createForeignKey('{entity_name}s', new ForeignKey({
      columnNames: ['foreign_column_id'],
      referencedTableName: 'referenced_table',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('{entity_name}s');
  }
}
```

#### **📋 Checklist Migration Obligatoire**
- [ ] ✅ **Nom du fichier** respecte le format `{timestamp}-{Action}{Entity}Table.ts`
- [ ] ✅ **UUID par défaut** avec `uuid_generate_v4()`
- [ ] ✅ **created_at/updated_at** avec defaults appropriés
- [ ] ✅ **Index** sur les colonnes fréquemment utilisées
- [ ] ✅ **Foreign Keys** avec contraintes appropriées (`CASCADE`, `RESTRICT`)
- [ ] ✅ **Méthode down()** pour rollback complet
- [ ] ✅ **Test migration** avec `npm run migration:run` et `npm run migration:revert`

### 🚀 **AVANTAGES DE CETTE APPROCHE**

#### **✅ Réduction des Erreurs**
- **Pas de dépendances circulaires** : chaque couche ne dépend que des précédentes
- **Compilation incrémentale** : chaque couche compile avant de passer à la suivante
- **Détection précoce** des violations architecturales

#### **✅ Développement Efficace**
- **Focus progressif** : une préoccupation à la fois
- **Tests ciblés** : chaque couche testable indépendamment
- **Refactoring sûr** : modifications isolées par couche

#### **✅ Qualité Architecturale**
- **Respect automatique** des principes Clean Architecture
- **Séparation claire** des responsabilités
- **Évolutivité** et maintenabilité garanties

### ✅ **CHECKPOINTS DE VALIDATION OBLIGATOIRES**

**À chaque fin de couche, vérifier OBLIGATOIREMENT :**

#### **🔍 Checkpoint Domain**
```bash
# Tests unitaires Domain
npm test -- --testPathPattern=domain/ --coverage
# Compilation TypeScript
npm run build
# Linting sans erreur
npm run lint
# RÉSULTAT ATTENDU : 100% tests passants, 0 erreur compilation, 0 erreur lint
```

#### **🔍 Checkpoint Application**
```bash
# Tests unitaires Application + Domain
npm test -- --testPathPattern="(domain|application)/" --coverage
# Vérification des interfaces (ports)
# RÉSULTAT ATTENDU : Coverage > 80%, toutes les interfaces définies, 0 erreur
```

#### **� Checkpoint Infrastructure**
```bash
# Tests unitaires Infrastructure + couches précédentes
npm test -- --testPathPattern="(domain|application|infrastructure)/" --coverage
# Tests d'intégration base de données
npm run test:integration
# RÉSULTAT ATTENDU : Connexion DB OK, repositories fonctionnels, DI configuré
```

#### **🔍 Checkpoint Presentation**
```bash
# Tests complets + E2E
npm test
npm run test:e2e
# Test de démarrage application
npm run start:dev
# RÉSULTAT ATTENDU : Application démarre, endpoints répondent, documentation Swagger
```

### �📋 **WORKFLOW PRATIQUE - EXEMPLE CONCRET**

```typescript
// 1️⃣ DOMAIN - Créer d'abord l'entité (avec test RED-GREEN-REFACTOR)
export class User {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _name: string,
  ) {}

  static create(email: Email, name: string): User {
    // Validation métier
    return new User(generateId(), email, name);
  }
}

// 2️⃣ APPLICATION - Puis le use case
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface définie ici
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Orchestration métier
  }
}

// 3️⃣ INFRASTRUCTURE - Ensuite l'implémentation
export class TypeOrmUserRepository implements IUserRepository {
  // Implémentation technique
}

// 4️⃣ PRESENTATION - Enfin le contrôleur
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // Interface utilisateur
  }
}
```

### ⚠️ **INTERDICTIONS ABSOLUES - WORKFLOW TDD**

#### **❌ Ne JAMAIS faire** :
- **Commencer par les contrôleurs** (Presentation) → ❌ Violation Clean Architecture
- **Développer plusieurs couches simultanément** → ❌ Violation TDD
- **Écrire du code sans test** → ❌ Violation TDD strict
- **Passer à la couche suivante avec des tests qui échouent** → ❌ Violation workflow
- **Écrire de la logique métier dans Infrastructure** → ❌ Violation séparation
- **Utiliser NestJS dans Domain/Application** → ❌ Violation indépendance framework
- **Créer des dépendances vers les couches supérieures** → ❌ Violation Dependency Rule
- **Ignorer les erreurs de compilation/lint** → ❌ Violation qualité code

#### **✅ TOUJOURS faire - WORKFLOW OBLIGATOIRE** :
- **Respecter l'ordre strict** : Domain → Application → Infrastructure → Presentation
- **TDD à chaque étape** : RED → GREEN → REFACTOR → VALIDATE
- **Tester chaque couche complètement** avant de passer à la suivante
- **Valider compilation + lint** à chaque modification
- **Documenter les interfaces (ports)** dans Application
- **Une fonctionnalité à la fois** jusqu'à completion E2E
- **Checkpoints de validation** obligatoires entre couches

#### **🚨 DÉTECTION PRÉCOCE DES VIOLATIONS**

```bash
# Vérifier les imports interdits dans Domain/Application
grep -r "@nestjs\|typeorm\|express" src/domain/ src/application/
# RÉSULTAT ATTENDU : Aucun résultat (0 ligne)

# Vérifier les dépendances circulaires
npx madge --circular src/
# RÉSULTAT ATTENDU : No circular dependencies found

# Vérifier la structure des tests par couche
find src/ -name "*.spec.ts" | head -20
# RÉSULTAT ATTENDU : Tests présents dans chaque couche
```

#### **🔄 CORRECTION DES VIOLATIONS**

Si une violation est détectée :
1. **STOP** le développement immédiatement
2. **ROLLBACK** aux derniers tests passants
3. **ANALYSER** la cause de la violation
4. **REPRENDRE** depuis la dernière couche validée
5. **APPLIQUER** le workflow TDD strict

### 🧪 **TEST-DRIVEN DEVELOPMENT (TDD) - PRATIQUES OBLIGATOIRES**

#### **🎯 Cycle TDD Red-Green-Refactor**

**Pour CHAQUE fonctionnalité, suivre ce cycle dans CHAQUE couche :**

1. **🔴 RED Phase** :
   ```bash
   # Écrire le test qui échoue AVANT le code
   npm test -- some.spec.ts
   # RÉSULTAT ATTENDU : Test fails (RED)
   ```

2. **🟢 GREEN Phase** :
   ```bash
   # Écrire le code minimal qui fait passer le test
   npm test -- some.spec.ts
   # RÉSULTAT ATTENDU : Test passes (GREEN)
   ```

3. **🔵 REFACTOR Phase** :
   ```bash
   # Améliorer le code en gardant les tests verts
   npm test -- some.spec.ts
   npm run lint
   # RÉSULTAT ATTENDU : Tests pass + code quality
   ```

#### **📋 Structure de Tests par Couche**

**Domain Layer Tests** :
```typescript
// ✅ Tests d'entités avec règles métier
describe('User Entity', () => {
  it('should create user with valid data', () => {
    // Test de création valide
  });

  it('should throw error with invalid email', () => {
    // Test de validation métier
  });
});

// ✅ Tests de Value Objects
describe('Email Value Object', () => {
  it('should validate email format', () => {
    // Test de validation format
  });
});
```

**Application Layer Tests** :
```typescript
// ✅ Tests de Use Cases avec mocks
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = createMockUserRepository();
    useCase = new CreateUserUseCase(mockUserRepo);
  });

  it('should create user successfully', async () => {
    // Test du cas nominal
  });
});
```

**Infrastructure Layer Tests** :
```typescript
// ✅ Tests d'intégration avec base de données
describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createTestConnection();
    repository = new TypeOrmUserRepository(connection);
  });

  it('should save user to database', async () => {
    // Test de persistence réelle
  });
});
```

**Presentation Layer Tests** :
```typescript
// ✅ Tests E2E complets
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(validUserDto)
      .expect(201);
  });
});
```

#### **🎯 Couverture de Tests Minimale**

- **Domain** : 95%+ coverage obligatoire
- **Application** : 90%+ coverage obligatoire
- **Infrastructure** : 80%+ coverage acceptable
- **Presentation** : 85%+ coverage avec E2E

#### **⚠️ RÈGLES TDD NON-NÉGOCIABLES**

- ❌ **ZÉRO code sans test préalable**
- ❌ **ZÉRO test ignoré (.skip ou .todo)**
- ❌ **ZÉRO commit avec tests qui échouent**
- ✅ **Tests AVANT le code (RED-GREEN-REFACTOR)**
- ✅ **Un test = une responsabilité**
- ✅ **Tests lisibles et maintenables**
- ✅ **Mocks pour les dépendances externes**

## 🏛️ **Clean Architecture - Principes Fondamentaux d'Uncle Bob**

### 📚 **Référence Officielle**

**Source** : [The Clean Architecture par Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### 🎯 **Objectifs de la Clean Architecture**

La Clean Architecture produit des systèmes qui sont :

1. **🔧 Independent of Frameworks** - L'architecture ne dépend pas de l'existence de frameworks. Vous utilisez les frameworks comme des outils, plutôt que de contraindre votre système dans leurs limitations.

2. **🧪 Testable** - Les règles métier peuvent être testées sans UI, Database, Web Server, ou tout autre élément externe.

3. **🎨 Independent of UI** - L'UI peut changer facilement, sans changer le reste du système. Une Web UI peut être remplacée par une console UI sans changer les règles métier.

4. **🗄️ Independent of Database** - Vous pouvez échanger Oracle ou SQL Server pour Mongo, BigTable, CouchDB, ou autre chose. Vos règles métier ne sont pas liées à la base de données.

5. **🌐 Independent of any external agency** - Vos règles métier ne savent simplement rien du monde extérieur.

### 🔄 **The Dependency Rule - RÈGLE FONDAMENTALE**

> **"Source code dependencies can only point inwards"**

![Clean Architecture Circles](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

**Les cercles concentriques représentent différentes zones du logiciel :**

- Plus vous allez vers l'intérieur, plus le niveau du logiciel est élevé
- Les cercles extérieurs sont des mécanismes
- Les cercles intérieurs sont des politiques

**❌ INTERDIT** : Rien dans un cercle intérieur ne peut connaître quoi que ce soit d'un cercle extérieur
**❌ INTERDIT** : Le nom de quelque chose déclaré dans un cercle extérieur ne doit pas être mentionné par le code dans un cercle intérieur

## 🚨 **RÈGLE CRITIQUE - AUCUNE DÉPENDANCE NESTJS DANS DOMAIN/APPLICATION**

### ❌ **VIOLATIONS ABSOLUMENT INTERDITES**

Les couches **Domain** et **Application** NE DOIVENT JAMAIS contenir :
- `import { Injectable, Inject } from '@nestjs/common'`
- `@Injectable()` decorator
- `@Inject()` decorator
- Aucun import de `@nestjs/*` packages
- Aucune référence aux tokens d'injection NestJS

### ✅ **APPROCHE CORRECTE**

```typescript
// ❌ INTERDIT - Violation de Clean Architecture
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('USER_REPOSITORY') private userRepo: IUserRepository
  ) {}
}

// ✅ CORRECT - Clean Architecture respectée
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}
}
```

### 🏗️ **Séparation des Responsabilités**

- **Domain/Application** : Logic métier pure, sans framework
- **Infrastructure** : Implémentations techniques avec NestJS
- **Presentation** : Controllers NestJS qui orchestrent les Use Cases

### 🔗 **Injection de Dépendances**

L'injection NestJS se fait UNIQUEMENT dans la couche **Presentation/Infrastructure** :
```typescript
// Dans presentation/controllers/*.controller.ts
@Controller()
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase
  ) {}
}
```

**Cette règle est NON-NÉGOCIABLE pour maintenir les principes de Clean Architecture !**

## 🗺️ **MAPPERS - PATTERN OBLIGATOIRE POUR CONVERSION DE DONNÉES**

### 🎯 **RÈGLE CRITIQUE : ZÉRO LOGIQUE DE MAPPING DANS LES ENTITÉS ORM**

**❌ VIOLATION ARCHITECTURALE MAJEURE :**
Les entités ORM (TypeORM, Prisma, etc.) NE DOIVENT JAMAIS contenir de logique de conversion vers les entités Domain. Cette responsabilité appartient exclusivement aux Mappers dédiés dans `/infrastructure/mappers/`.

### 🚫 **INTERDICTIONS ABSOLUES**

```typescript
// ❌ STRICTEMENT INTERDIT - Logique métier dans l'entité ORM
@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ❌ JAMAIS de méthode toDomainEntity() dans l'entité ORM
  toDomainEntity(): User {
    const email = Email.create(this.email);
    return User.create(email, this.name); // VIOLATION !
  }

  // ❌ JAMAIS d'imports domaine dans les entités ORM
  // import { User } from '../../../domain/entities/user.entity';
}
```

### ✅ **PATTERN CORRECT : MAPPERS DÉDIÉS**

```typescript
// ✅ EXCELLENT - Mapper dédié dans /infrastructure/mappers/
export class UserOrmMapper {
  /**
   * Convertit une entité Domain vers ORM pour persistence
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
   * Convertit une entité ORM vers Domain depuis persistence
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
   * Convertit liste ORM vers Domain
   */
  static toDomainEntities(ormEntities: UserOrmEntity[]): User[] {
    return ormEntities.map(orm => this.toDomainEntity(orm));
  }
}
```

### 📁 **STRUCTURE OBLIGATOIRE DES MAPPERS**

```
src/infrastructure/mappers/
├── orm-mappers.ts           # Export centralisé de tous les mappers
├── user-orm.mapper.ts       # Mapper User : Domain ↔ ORM
├── business-orm.mapper.ts   # Mapper Business : Domain ↔ ORM
├── service-orm.mapper.ts    # Mapper Service : Domain ↔ ORM
└── staff-orm.mapper.ts      # Mapper Staff : Domain ↔ ORM
```

### 🔄 **RESPONSABILITÉS DES MAPPERS**

#### **1️⃣ Conversion Domain → ORM (Persistence)**
```typescript
// Pour les opérations CREATE et UPDATE
static toOrmEntity(domain: DomainEntity): OrmEntity {
  // Conversion des Value Objects vers types primitifs
  // Gestion des relations et foreign keys
  // Préparation pour persistence en base
}
```

#### **2️⃣ Conversion ORM → Domain (Reconstruction)**
```typescript
// Pour les opérations READ et hydratation
static toDomainEntity(orm: OrmEntity): DomainEntity {
  // Reconstruction des Value Objects depuis primitifs
  // Validation et création des entités Domain
  // Préservation de l'intégrité métier
}
```

#### **3️⃣ Conversion Batch (Collections)**
```typescript
// Pour les opérations sur collections
static toDomainEntities(ormList: OrmEntity[]): DomainEntity[] {
  return ormList.map(orm => this.toDomainEntity(orm));
}

static toOrmEntities(domainList: DomainEntity[]): OrmEntity[] {
  return domainList.map(domain => this.toOrmEntity(domain));
}
```

### 🏗️ **UTILISATION DANS LES REPOSITORIES**

```typescript
// ✅ EXCELLENT - Usage correct des mappers dans Repository
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    // 1. Conversion Domain → ORM via Mapper
    const ormEntity = UserOrmMapper.toOrmEntity(user);

    // 2. Persistence en base
    const savedOrm = await this.repository.save(ormEntity);

    // 3. Conversion ORM → Domain via Mapper
    return UserOrmMapper.toDomainEntity(savedOrm);
  }

  async findById(id: UserId): Promise<User | null> {
    // 1. Requête ORM
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() }
    });

    if (!ormEntity) return null;

    // 2. Conversion ORM → Domain via Mapper
    return UserOrmMapper.toDomainEntity(ormEntity);
  }

  async findAll(criteria: UserCriteria): Promise<User[]> {
    // 1. Requête ORM avec critères
    const ormEntities = await this.repository.find(/* critères */);

    // 2. Conversion batch via Mapper
    return UserOrmMapper.toDomainEntities(ormEntities);
  }
}
```

### 🚨 **ERREURS COURANTES À ÉVITER**

#### **❌ Import Domain dans Entité ORM**
```typescript
// VIOLATION - Ne jamais importer Domain dans ORM
import { User } from '../../../domain/entities/user.entity'; // INTERDIT !

@Entity('users')
export class UserOrmEntity {
  // Cette entité ne doit connaître QUE TypeORM
}
```

#### **❌ Logique Métier dans Mapper**
```typescript
// VIOLATION - Mapper ne doit contenir QUE de la conversion
static toDomainEntity(orm: UserOrmEntity): User {
  const email = Email.create(orm.email);

  // ❌ INTERDIT - Pas de logique métier dans mapper
  if (email.getValue().includes('admin')) {
    user.grantAdminRights(); // VIOLATION !
  }

  return user;
}
```

#### **❌ Conversion Directe sans Mapper**
```typescript
// VIOLATION - Toujours passer par le mapper
async save(user: User): Promise<User> {
  // ❌ INTERDIT - Conversion manuelle
  const ormEntity = new UserOrmEntity();
  ormEntity.email = user.getEmail().getValue(); // VIOLATION !

  // ✅ CORRECT - Utiliser le mapper
  const ormEntity = UserOrmMapper.toOrmEntity(user);
}
```

### 📋 **CHECKLIST MAPPERS OBLIGATOIRE**

- [ ] ✅ **Zéro méthode de mapping dans entités ORM**
- [ ] ✅ **Mappers dédiés dans `/infrastructure/mappers/`**
- [ ] ✅ **Méthodes statiques `toOrmEntity()` et `toDomainEntity()`**
- [ ] ✅ **Support des collections avec `toDomainEntities()`**
- [ ] ✅ **Aucun import Domain dans entités ORM**
- [ ] ✅ **Aucune logique métier dans mappers**
- [ ] ✅ **Validation par les tests unitaires des mappers**
- [ ] ✅ **Export centralisé dans `orm-mappers.ts`**

### 🎯 **TESTS UNITAIRES MAPPERS OBLIGATOIRES**

```typescript
// ✅ Tests complets pour chaque mapper
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
      // Test des cas limites et valeurs nulles
    });
  });

  describe('toOrmEntity', () => {
    it('should convert Domain entity to ORM entity', () => {
      // Test de la conversion inverse
    });
  });

  describe('toDomainEntities', () => {
    it('should convert array of ORM entities', () => {
      // Test des collections
    });
  });
});
```

**Cette séparation stricte garantit une architecture propre, maintenable et respectueuse des principes de Clean Architecture !**

## 📚 **DOCUMENTATION SWAGGER - BONNES PRATIQUES OBLIGATOIRES**

### 🎯 **RÈGLE CRITIQUE : DOCUMENTATION SWAGGER COMPLÈTE APRÈS PRÉSENTATION**

**Après avoir créé les Controllers et DTOs, TOUJOURS créer une documentation Swagger complète pour garantir une API utilisable et professionnelle.**

#### **📋 Template de Documentation Swagger Obligatoire**

```markdown
# 🎯 {FeatureName} APIs - Swagger Documentation

## 📋 Overview
Description claire de la fonctionnalité et de ses APIs

## 🏗️ Architecture Implementation Status
### ✅ **{FeatureName} - 100% Complete**
- **Domain** : ✅ {Entity} Entity + Value Objects + Repository Interface
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List)
- **Infrastructure** : ✅ {Entity}OrmEntity + TypeOrm{Entity}Repository + Mappers + Migration
- **Presentation** : ✅ {Entity}Controller + All DTOs with Swagger documentation

## 🎯 {FeatureName} APIs

### **POST /api/v1/{resources}/list**
**Description** : Recherche avancée paginée
**Security** : Requires JWT authentication
**Request Body** : [Example with all fields]
**Response** : [Complete response with pagination metadata]

### **GET /api/v1/{resources}/:id**
**Description** : Récupérer par ID
**Response** : [Complete entity response]

### **POST /api/v1/{resources}**
**Description** : Créer nouveau
**Request Body** : [All required and optional fields with validation rules]

### **PUT /api/v1/{resources}/:id**
**Description** : Mettre à jour
**Request Body** : [Partial update examples]

### **DELETE /api/v1/{resources}/:id**
**Description** : Supprimer
**Response** : [Deletion confirmation]

## 🚨 Error Responses
Format d'erreur standardisé avec tous les codes HTTP possibles

## 🔐 Authentication & Authorization
JWT + permissions requises

## 📊 Validation Rules
Toutes les règles de validation expliquées

## 🎯 Business Rules
Règles métier spécifiques à la fonctionnalité

## 📈 Performance & Scalability
Pagination, cache, performance

## 🔧 Swagger Integration
URLs et fonctionnalités Swagger disponibles
```

#### **🔧 Configuration Swagger Correcte dans les DTOs**

```typescript
// ✅ OBLIGATOIRE - Schema objects avec additionalProperties
@ApiPropertyOptional({
  description: 'Configuration object',
  type: 'object',
  additionalProperties: true, // ⚠️ REQUIS pour éviter erreurs TypeScript
})
readonly configObject?: any;

// ✅ OBLIGATOIRE - Response DTOs avec définite assignment
export class ResponseDto {
  @ApiProperty()
  readonly success!: boolean; // ⚠️ ! REQUIS pour éviter erreurs TypeScript

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  readonly data!: any[]; // ⚠️ ! REQUIS
}

// ✅ OBLIGATOIRE - Enum documentation complète
@ApiPropertyOptional({
  description: 'Status filter',
  enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'],
  example: 'ACTIVE'
})
@IsOptional()
@IsString()
readonly status?: string;
```

#### **🎯 Controllers avec Documentation Swagger Optimale**

```typescript
// ✅ OBLIGATOIRE - Tags et descriptions complètes
@ApiTags('👥 {FeatureName} Management')
@Controller('api/v1/{resources}')
@ApiBearerAuth()
export class {Feature}Controller {

  // ✅ OBLIGATOIRE - Documentation complète avec exemples
  @Post('list')
  @ApiOperation({
    summary: '🔍 Search {resources} with advanced filters',
    description: `
    Recherche avancée paginée des {resources}.

    ✅ Fonctionnalités :
    - Pagination (page, limit)
    - Tri multi-critères (sortBy, sortOrder)
    - Recherche textuelle (search)
    - Filtres spécialisés ({specific filters})

    🔐 Permissions requises :
    - MANAGE_{RESOURCES} ou READ_{RESOURCES}
    - Scoping automatique selon rôle utilisateur
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ {Resources} found successfully',
    type: List{Resource}ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid search parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async list(@Body() dto: List{Resource}sDto, @GetUser() user: User) {
    // Implementation
  }
}
```

#### **🚨 Erreurs Swagger Courantes à Éviter**

1. **❌ Schema objects sans additionalProperties**
```typescript
// INTERDIT - Cause des erreurs TypeScript
@ApiPropertyOptional({
  type: 'object', // Manque additionalProperties: true
})
```

2. **❌ Response DTOs sans definite assignment**
```typescript
// INTERDIT - Cause des erreurs TypeScript strictes
export class ResponseDto {
  readonly success: boolean; // Manque !
}
```

3. **❌ Documentation API incomplète**
```typescript
// INTERDIT - Documentation minimale
@ApiOperation({ summary: 'Get data' }) // Trop vague
```

4. **❌ Enums non documentés**
```typescript
// INTERDIT - Valeurs enum non exposées
@IsEnum(StaffRole) // Manque documentation Swagger
```

#### **📁 Structure Documentation Obligatoire**

```
docs/
├── SWAGGER_{FEATURE}_API.md     # Documentation complète par fonctionnalité
├── SWAGGER_ENHANCEMENT_REPORT.md # Rapport d'amélioration Swagger
└── API_STANDARDS.md             # Standards généraux API
```

#### **✅ Checklist Swagger Obligatoire**

- [ ] **Documentation markdown** complète créée dans `/docs/`
- [ ] **Tous les endpoints** documentés avec exemples
- [ ] **Request/Response** schemas complets avec validation
- [ ] **Error responses** avec codes HTTP appropriés
- [ ] **Authentication** et permissions documentées
- [ ] **Business rules** expliquées clairement
- [ ] **Swagger UI** accessible sur `/api/docs`
- [ ] **DTOs** avec `additionalProperties: true` pour objects
- [ ] **Response DTOs** avec definite assignment (`!`)
- [ ] **Enums** documentés avec toutes les valeurs possibles
- [ ] **Controllers** avec `@ApiOperation` détaillées

### 🎯 **Workflow Complet : Présentation + Swagger**

1. **Créer Controllers + DTOs** (couche Presentation)
2. **Tester et corriger** erreurs TypeScript/lint
3. **Créer documentation Swagger** markdown complète
4. **Vérifier Swagger UI** fonctionnel
5. **Tester APIs** via Swagger interface
6. **Valider examples** et schémas complets
7. **Mettre à jour** architecture status

**Cette approche garantit des APIs professionnelles, documentées et facilement utilisables !**

### 💎 **VALUE OBJECTS - BONNES PRATIQUES DANS LES MAPPERS**

#### **🎯 RÈGLE IMPORTANTE : RECONSTRUCTION CORRECTE DES VALUE OBJECTS**

Les Value Objects doivent être correctement reconstruits dans les mappers en utilisant les bonnes méthodes factory :

```typescript
// ✅ EXCELLENT - Reconstruction correcte des Value Objects
export class UserOrmMapper {
  static toDomainEntity(orm: UserOrmEntity): User {
    // ✅ Utilisation des méthodes factory appropriées
    const userId = UserId.fromString(orm.id);
    const email = Email.create(orm.email); // Pour validation
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

    // ✅ Extraction des valeurs primitives
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

#### **🚨 ERREURS COURANTES AVEC VALUE OBJECTS**

```typescript
// ❌ INTERDIT - Construction directe sans validation
const email = new Email(orm.email); // VIOLATION !

// ✅ CORRECT - Utilisation de la méthode factory
const email = Email.create(orm.email); // Validation automatique

// ❌ INTERDIT - Reconstruction incorrecte d'ID
const userId = new UserId(orm.id); // VIOLATION !

// ✅ CORRECT - Méthode factory appropriée
const userId = UserId.fromString(orm.id); // Type-safe

// ❌ INTERDIT - Gestion incorrecte des nullable
const phone = Phone.create(orm.phone); // Peut planter si null !

// ✅ CORRECT - Gestion sécurisée des nullable
const phone = orm.phone ? Phone.create(orm.phone) : undefined;
```

#### **📋 MAPPING PATTERNS PAR TYPE DE VALUE OBJECT**

```typescript
// 🆔 ID Value Objects
const userId = UserId.fromString(orm.user_id);
const businessId = BusinessId.fromString(orm.business_id);
const serviceId = ServiceId.fromString(orm.service_id);

// 📧 Email (avec validation)
const email = Email.create(orm.email);

// 📱 Phone (nullable)
const phone = orm.phone ? Phone.create(orm.phone) : undefined;

// 💰 Money (complexe)
const price = Money.create(orm.price_amount, orm.price_currency);

// 🌐 URL (avec validation)
const profileImage = orm.profile_image_url
  ? FileUrl.create(orm.profile_image_url)
  : undefined;

// 📅 Dates (primitives)
const createdAt = orm.created_at; // Date directe
const updatedAt = orm.updated_at; // Date directe
```

#### **✅ TEMPLATE MAPPER STANDARD**

```typescript
export class {Entity}OrmMapper {
  static toDomainEntity(orm: {Entity}OrmEntity): {Entity} {
    // 1. Reconstruction des Value Objects avec validation
    const id = {Entity}Id.fromString(orm.id);
    const email = Email.create(orm.email);
    const phone = orm.phone ? Phone.create(orm.phone) : undefined;

    // 2. Reconstruction de l'entité Domain
    return {Entity}.reconstruct({
      id,
      email,
      phone,
      // Autres propriétés...
      createdAt: orm.created_at,
      updatedAt: orm.updated_at,
    });
  }

  static toOrmEntity(domain: {Entity}): {Entity}OrmEntity {
    const orm = new {Entity}OrmEntity();

    // 1. Extraction des valeurs primitives
    orm.id = domain.getId().getValue();
    orm.email = domain.getEmail().getValue();
    orm.phone = domain.getPhone()?.getValue();

    // 2. Dates et primitives directes
    orm.created_at = domain.getCreatedAt();
    orm.updated_at = domain.getUpdatedAt();

    return orm;
  }

  static toDomainEntities(ormList: {Entity}OrmEntity[]): {Entity}[] {
    return ormList.map(orm => this.toDomainEntity(orm));
  }
}
```

### 🏗️ **Les 4 Couches Principales**

#### 1. 🏛️ **Entities (Entités)**

- **Rôle** : Encapsulent les règles métier de l'enterprise
- **Contenu** : Objets avec méthodes OU structures de données + fonctions
- **Stabilité** : Les moins susceptibles de changer lors de changements externes
- **Exemple** : Pas affectées par les changements de navigation, sécurité, ou UI

#### 2. 💼 **Use Cases (Cas d'Usage)**

- **Rôle** : Contiennent les règles métier spécifiques à l'application
- **Contenu** : Orchestrent le flux de données vers/depuis les entités
- **Isolation** : Isolées des préoccupations externes (DB, UI, frameworks)
- **Impact** : Affectées uniquement par les changements d'opérations applicatives

#### 3. 🔌 **Interface Adapters (Adaptateurs d'Interface)**

- **Rôle** : Ensemble d'adaptateurs qui convertissent les données
- **Contenu** : MVC, Presenters, Views, Controllers, Repository implementations
- **Conversion** : Du format le plus pratique pour use cases/entities vers le format externe
- **Exemple** : Tout le SQL doit être restreint à cette couche

#### 4. 🔧 **Frameworks and Drivers (Frameworks et Pilotes)**

- **Rôle** : Couche la plus externe composée de frameworks et outils
- **Contenu** : Database, Web Framework, outils externes
- **Code** : Principalement du code de "glue" qui communique vers l'intérieur
- **Détails** : Où tous les détails vont (Web, Database sont des détails)

### 🚪 **Crossing Boundaries (Franchissement des Frontières)**

#### 🔄 **Dependency Inversion Principle**

- **Problème** : Use case doit appeler presenter, mais ne peut pas (violation de Dependency Rule)
- **Solution** : Use case appelle une interface dans le cercle intérieur
- **Implémentation** : Presenter dans cercle extérieur implémente l'interface
- **Technique** : Polymorphisme dynamique pour créer des dépendances qui s'opposent au flux de contrôle

#### 📦 **Data Crossing Boundaries**

- **Format** : Structures de données simples et isolées
- **Types autorisés** : Structs basiques, Data Transfer Objects, arguments de fonctions
- **❌ INTERDIT** : Passer des Entities ou Database rows à travers les frontières
- **❌ INTERDIT** : Structures de données avec dépendances violant la Dependency Rule
- **✅ RÈGLE** : Données toujours dans le format le plus pratique pour le cercle intérieur

## 📝 **Commits Sémantiques OBLIGATOIRES**

### 🎯 **Conventional Commits avec Commitlint**

Ce projet utilise **[Commitlint](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)** pour garantir des commits sémantiques et conventionnels standardisés.

#### **✅ Format OBLIGATOIRE**

```
🎯 type(scope): description

body (optionnel)

footer (optionnel)
```

#### **🏷️ Types de Commits AUTORISÉS**

- 🎉 **feat**: Nouvelle fonctionnalité
- 🐛 **fix**: Correction de bug
- 📚 **docs**: Documentation
- 💄 **style**: Formatage, point-virgules, etc. (pas de changement de code)
- ♻️ **refactor**: Refactoring (ni feature ni fix)
- ⚡ **perf**: Amélioration des performances
- ✅ **test**: Ajout/modification de tests
- 🔧 **chore**: Tâches de maintenance, outils, etc.
- 🚀 **ci**: Configuration CI/CD
- ⏪ **revert**: Annulation d'un commit précédent
- 🔐 **security**: Corrections de sécurité
- 🌐 **i18n**: Internationalisation
- ♿ **a11y**: Accessibilité
- 🚨 **hotfix**: Correction urgente en production

#### **📋 Exemples de Commits Valides**

```bash
🎉 feat(auth): add JWT refresh token rotation
🐛 fix(user): resolve email validation edge case
📚 docs(api): update authentication endpoints documentation
♻️ refactor(repo): extract common repository patterns
✅ test(login): add comprehensive login use case tests
🔧 chore(deps): update NestJS to latest version
🔐 security(jwt): implement secure token storage
```

#### **❌ Commits INTERDITS**

```bash
# Trop vague
fix: bug fix
update code
improvements

# Type non autorisé
hack: quick fix
temp: temporary solution
```

#### **🎯 Règles Commitlint Configurées**

```javascript
// .commitlintrc.js
{
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      '🎉 feat', '🐛 fix', '📚 docs', '💄 style',
      '♻️ refactor', '⚡ perf', '✅ test', '🔧 chore',
      '🚀 ci', '⏪ revert', '🔐 security', '🌐 i18n',
      '♿ a11y', '🚨 hotfix'
    ]],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 100]
  }
}
```

**🚀 NOUVEAUTÉ : Environnement Docker Complet**

### � **Docker Environment Production-Ready**

- ✅ **Docker Compose** multi-services avec hot reload
- ✅ **PostgreSQL 15** avec volume persistant et health checks
- ✅ **MongoDB 7** pour stockage NoSQL avec réplication
- ✅ **pgAdmin 4** interface web pour gestion PostgreSQL (localhost:5050)
- ✅ **NestJS** containerisé avec debug ports et volumes
- ✅ **Makefile** complet avec commandes Docker simplifiées

#### **🔧 Commandes Docker Disponibles**

```bash
make start          # Démarrer tous les services Docker
make stop           # Arrêter tous les services
make build          # Construire les images Docker
make logs           # Voir les logs de tous les services
make test           # Lancer les tests dans le container
make clean          # Nettoyer volumes et images
make restart        # Redémarrer les services
make status         # Statut des services
```

### 📊 **Métriques de Qualité Améliorées**

### 🎯 **Objectifs Maintenus et Améliorés**

- ✅ **202 tests** passants (30 suites de tests complètes) - **UPGRADE de 24 tests**
- ✅ **Clean Architecture** respectée dans tous les composants
- ✅ **SOLID principles** appliqués rigoureusement
- ✅ **Security first** approach avec cookies HttpOnly
- ✅ **Enterprise patterns** utilisés (logging, audit, i18n)
- ✅ **Docker environment** pour développement isolé
- ✅ **ESLint errors ELIMINATED** - De 18 erreurs bloquantes à 0 🎯✨
- ✅ **Node.js 24 Ready** - Architecture compatible nouvelles fonctionnalités
- ✅ **Code quality** avec ESLint + Prettier configurés strictement

### 📈 **Indicateurs de Succès - MISE À JOUR FINALE**

- Tests continuent de passer après modifications (198/198 ✅)
- **🎯 ZÉRO ERREUR ESLINT BLOQUANTE** - 100% des erreurs critiques éliminées
- **Promise.all corrections** - Méthodes synchrones converties en Promises
- **Regex patterns optimized** - Échappements inutiles supprimés (no-useless-escape)
- **Enum comparisons fixed** - Type safety renforcé (no-unsafe-enum-comparison)
- **Case declarations wrapped** - Blocs correctement structurés (no-case-declarations)
- **Template expressions secured** - Types never correctement gérés
- Aucune dépendance circulaire introduite
- Logging et audit trail présents sur toutes les opérations
- Configuration externalisée (JWT secrets, expiration)
- Messages i18n utilisés dans tous les Use Cases
- Permissions vérifiées et exceptions spécifiques
- Environnement Docker complètement fonctionnel
- **Pipeline de qualité ESLint** opérationnel sans erreurs bloquantes

## 🏗️ **Architecture Établie**

### 📁 **Structure des Couches**

```
src/
├── domain/           # 🏢 Règles métier pures (entities, value objects)
├── application/      # 💼 Use cases + ports + exceptions applicatives
├── infrastructure/   # 🔧 Implémentations techniques (repos, services)
├── presentation/     # 🎨 Controllers HTTP + DTOs
└── shared/           # 🔗 Cross-cutting concerns
```

### 🎯 **Principes à Respecter**

- ✅ **Dependency Inversion** : Couches supérieures ne dépendent jamais des inférieures
- ✅ **Single Responsibility** : Chaque classe a une seule responsabilité
- ✅ **TDD First** : Tests avant implémentation (**24 tests auth + autres**)
- ✅ **Clean Code** : Nommage expressif, fonctions courtes, commentaires utiles
- ✅ **Enterprise Security** : Authentification, autorizations, audit trail
- ✅ **SOLID Principles** : Application rigoureuse des 5 principes de Robert C. Martin
- ✅ **TypeScript Strict** : Type safety à 100%, zéro tolérance pour `any`

## 🎯 **Principes SOLID de Robert C. Martin**

### 🔹 **S** - Single Responsibility Principle (SRP)

**Une classe, une seule raison de changer**

```typescript
// ✅ GOOD - Une seule responsabilité
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Gère uniquement la création d'utilisateur
  }
}

// ❌ BAD - Multiples responsabilités
export class UserService {
  createUser() {} // Création utilisateur
  sendEmail() {} // Envoi email
  validateData() {} // Validation données
}
```

### 🔹 **O** - Open/Closed Principle (OCP)

**Ouvert à l'extension, fermé à la modification**

```typescript
// ✅ GOOD - Extension via interfaces
export interface INotificationService {
  send(message: string, recipient: string): Promise<void>;
}

export class EmailNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Implémentation email
  }
}

export class SmsNotificationService implements INotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Implémentation SMS - extension sans modification
  }
}
```

### 🔹 **L** - Liskov Substitution Principle (LSP)

**Les sous-types doivent être substituables à leurs types de base**

```typescript
// ✅ GOOD - Substitution correcte
export abstract class Repository<T> {
  abstract save(entity: T): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
}

export class UserRepository extends Repository<User> {
  async save(user: User): Promise<User> {
    // Respecte le contrat - retourne toujours un User
    return this.persistenceAdapter.save(user);
  }

  async findById(id: string): Promise<User | null> {
    // Respecte le contrat - retourne User ou null
    return this.persistenceAdapter.findById(id);
  }
}
```

### 🔹 **I** - Interface Segregation Principle (ISP)

**Les clients ne doivent pas dépendre d'interfaces qu'ils n'utilisent pas**

```typescript
// ✅ GOOD - Interfaces ségrégées
export interface IUserReader {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface IUserWriter {
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IUserCounter {
  count(): Promise<number>;
  countByRole(role: UserRole): Promise<number>;
}

// ❌ BAD - Fat interface
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  exportToJson(): Promise<string>; // Non utilisé par tous
  generateReport(): Promise<Buffer>; // Non utilisé par tous
}
```

### 🔹 **D** - Dependency Inversion Principle (DIP)

**Dépendre des abstractions, pas des implémentations**

```typescript
// ✅ GOOD - Dépend des abstractions
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository, // Interface
    private readonly logger: ILogger, // Interface
    private readonly eventBus: IEventBus, // Interface
  ) {}
}

// ❌ BAD - Dépend des implémentations
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: TypeOrmUserRepository, // Classe concrète
    private readonly logger: ConsoleLogger, // Classe concrète
    private readonly eventBus: InMemoryEventBus, // Classe concrète
  ) {}
}
```

## 🔧 **Meilleures Pratiques TypeScript**

### 🎯 **Configuration Stricte Obligatoire**

```typescript
// tsconfig.json - Mode strict OBLIGATOIRE
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 🎯 **Typage Explicite - ZERO `any` - PRÉFÉRER `unknown`**

```typescript
// ✅ GOOD - Types explicites pour APIs publiques et unknown pour types incertains
export interface CreateUserRequest {
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly requestingUserId: string;
}

export interface CreateUserResponse {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt: Date;
}

// ✅ GOOD - Contraintes génériques
export interface Repository<T extends Entity> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
}

// ✅ GOOD - Union types pour valeurs contrôlées
export type DatabaseType = 'mongodb' | 'postgresql' | 'mysql';
export type Environment = 'development' | 'staging' | 'production';

// ❌ STRICTEMENT INTERDIT - Usage de any
export function processData(data: any): any {
  // JAMAIS ! Utilise unknown à la place
  return data;
}

// ✅ EXCELLENT - Utiliser unknown au lieu de any
export function processData(data: unknown): unknown {
  // Type guard OBLIGATOIRE avec unknown
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  throw new Error('Invalid data type');
}

// ✅ MEILLEUR - Types spécifiques avec générique
export function processData<T>(data: T): T {
  return data;
}

// ✅ PATTERN RECOMMANDÉ - Type guards avec unknown
function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    typeof (data as { id: unknown }).id === 'string' &&
    typeof (data as { email: unknown }).email === 'string'
  );
}

// ✅ PATTERN RECOMMANDÉ - Parsing sécurisé avec unknown
export function parseUserFromRequest(req: unknown): User {
  if (!isValidUser(req)) {
    throw new ValidationError('Invalid user data structure');
  }
  return req; // TypeScript sait maintenant que c'est un User
}

// ✅ PATTERN RECOMMANDÉ - API Responses typées
export interface SafeApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data: T;
  readonly errors?: readonly string[];
  readonly meta?: {
    readonly timestamp: string;
    readonly requestId: string;
  };
}

// ❌ ANTI-PATTERNS À ÉVITER
// Ne jamais utiliser : as any, any[], Array<any>, Record<string, any>
// Ne jamais typer les paramètres de requête comme any
// Ne jamais retourner any depuis une fonction publique
```

### 🚨 **RÈGLES STRICTES DE TYPAGE**

#### **🔴 INTERDICTIONS ABSOLUES**

- **`any`** : Usage strictement interdit sauf cas exceptionnels documentés
- **`as any`** : Casting dangereux interdit
- **`any[]`** : Tableaux non typés interdits
- **`Record<string, any>`** : Objets non typés interdits
- **`function(param: any)`** : Paramètres non typés interdits

#### **🟢 ALTERNATIVES RECOMMANDÉES**

- **`unknown`** : Pour types incertains nécessitant type guards
- **`object`** : Pour objets génériques
- **`Record<string, unknown>`** : Pour objets avec clés dynamiques
- **Generics `<T>`** : Pour types paramétrés
- **Union types** : Pour valeurs connues limitées
- **Type guards** : Pour validation runtime des types

### 🎯 **Gestion Null-Safe & Erreurs**

```typescript
// ✅ GOOD - Gestion explicite des null
export class UserService {
  async findUserById(id: string): Promise<User | null> {
    const userData = await this.repository.findById(id);
    return userData ? User.fromData(userData) : null;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserNotFoundError(`User with id ${id} not found`);
    }
    return user;
  }
}

// ✅ GOOD - Result pattern pour gestion d'erreurs
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export async function safeOperation<T>(
  operation: () => Promise<T>,
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## 🔍 **ESLint & Formatage - Règles CRITIQUES**

### 🎯 **Règles NON DÉSACTIVABLES**

```typescript
// eslint.config.mjs
export default [
  {
    rules: {
      // Type Safety - CRITIQUE
      '@typescript-eslint/no-any': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Qualité Code - CRITIQUE
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-inferrable-types': 'off', // Préférer explicite

      // Bonnes Pratiques - CRITIQUE
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
];
```

### 🎯 **Configuration Prettier Standardisée**

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 🚨 **ERREURS ESLINT CRITIQUES IDENTIFIÉES - MISE À JOUR POST-MIGRATION**

### 🎯 **PROBLÈMES URGENTS À CORRIGER DANS L'ORDRE DE PRIORITÉ**

#### **1️⃣ PRIORITÉ MAXIMALE : @typescript-eslint/no-unsafe-*** (1437 warnings)**

**❌ PROBLÈME CRITIQUE** : Usage intensif de `any` à travers le codebase causant des violations de type safety.

**🏗️ LOCALISATION PRINCIPALE :**

```typescript
// ❌ VIOLATIONS MAJEURES DÉTECTÉES dans :
// - src/presentation/controllers/*.controller.ts
// - src/presentation/dtos/*.dto.ts
// - src/presentation/filters/*.filter.ts
// - src/presentation/security/*.ts
// - src/shared/utils/*.ts

// Exemple de violation courante dans controllers :
// ❌ INTERDIT - Accès non typé aux propriétés de requête
const requestingUser = req.user; // any type !
const userId = requestingUser.id; // Unsafe member access

// ✅ CORRECT - Typage strict obligatoire
const requestingUser = req.user as AuthenticatedUser;
const userId: string = requestingUser.id;

// OU MIEUX - Interface typée
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
```

#### **2️⃣ PRIORITÉ ÉLEVÉE : @typescript-eslint/require-await (8 violations)**

**❌ PROBLÈME** : Méthodes marquées `async` sans utilisation d'`await`.

```typescript
// ❌ VIOLATIONS DÉTECTÉES dans :
// - business.controller.ts:468 - async delete() sans await
// - calendar.controller.ts:330 - async update() sans await
// - calendar.controller.ts:379 - async delete() sans await

// ❌ INTERDIT - async sans await
async delete(id: string): Promise<void> {
  // Pas d'await dans cette méthode
  this.businessService.delete(id);
}

// ✅ CORRECT - Ajouter await OU enlever async
async delete(id: string): Promise<void> {
  await this.businessService.delete(id);
}

// OU
delete(id: string): Promise<void> {
  return this.businessService.delete(id);
}
```

#### **3️⃣ PRIORITÉ ÉLEVÉE : @typescript-eslint/no-unused-vars (4 violations)**

**❌ PROBLÈME** : Variables déclarées mais jamais utilisées.

```typescript
// ❌ VIOLATIONS DÉTECTÉES dans :
// - business-hours.controller.ts:323 - 'user' défini mais inutilisé
// - calendar.controller.ts:331 - 'id' défini mais inutilisé
// - calendar.controller.ts:332 - 'dto' défini mais inutilisé
// - calendar.controller.ts:379 - 'id' défini mais inutilisé

// ❌ INTERDIT - Variables inutilisées
async method(@GetUser() user: User, @Param('id') id: string) {
  // user et id jamais utilisés dans la méthode
  return { success: true };
}

// ✅ CORRECT - Préfixer avec underscore si requis par interface
async method(@GetUser() _user: User, @Param('id') _id: string) {
  // Indique explicitement que les paramètres ne sont pas utilisés
  return { success: true };
}

// OU supprimer les paramètres inutilisés
async method() {
  return { success: true };
}
```

#### **4️⃣ PRIORITÉ ÉLEVÉE : @typescript-eslint/unbound-method (2 violations)**

**❌ PROBLÈME** : Références de méthodes sans liaison `this`.

```typescript
// ❌ VIOLATIONS DÉTECTÉES dans :
// - business-sector.mapper.ts:168 - référence méthode non liée
// - business-sector.mapper.ts:216 - référence méthode non liée

// ❌ INTERDIT - Référence méthode sans this
const transformedData = data.map(this.transform); // Problème de scoping

// ✅ CORRECT - Arrow function
const transformedData = data.map(item => this.transform(item));

// OU liaison explicite
const transformedData = data.map(this.transform.bind(this));
```

### 🔧 **SOLUTIONS TECHNIQUES PRIORITAIRES**

#### **🎯 Solution 1 : Interfaces TypeScript Strictes**

```typescript
// ✅ OBLIGATOIRE - Créer des interfaces typées pour les requêtes
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ UTILISATION dans les controllers
@Controller('users')
export class UserController {
  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest): Promise<UserDto> {
    const user = req.user; // Maintenant typé !
    const userId: string = user.id; // Type-safe
    return this.userService.getProfile(userId);
  }
}
```

#### **🎯 Solution 2 : Décorateurs Typés**

```typescript
// ✅ OBLIGATOIRE - Décorateur @GetUser typé
export const GetUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!data) return user;
    return user[data] as any; // Type guard nécessaire ici
  },
);

// ✅ UTILISATION typée
@Get('profile')
async getProfile(@GetUser() user: AuthenticatedUser): Promise<UserDto> {
  const userId: string = user.id; // Type-safe !
  return this.userService.getProfile(userId);
}
```

#### **🎯 Solution 3 : Transformers DTO Typés**

```typescript
// ✅ OBLIGATOIRE - Transformers avec typage strict
export class CreateBusinessSectorDto {
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      throw new ValidationError('Name must be a string');
    }
    return value.trim();
  })
  @IsString()
  @Length(2, 100)
  readonly name!: string;

  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      throw new ValidationError('Code must be a string');
    }
    return value.trim().toUpperCase();
  })
  @IsString()
  @Length(2, 10)
  readonly code!: string;
}
```

### ❌ **Erreurs Promise.all avec méthodes synchrones**

```typescript
// ❌ INTERDIT - Promise.all avec des valeurs non-Promise
const [dbCheck, memoryInfo, systemInfo] = await Promise.all([
  this.checkDatabaseStatus(),  // OK - méthode async
  this.getMemoryInfo(),       // ❌ ERREUR - méthode synchrone
  this.getSystemInfo(),       // ❌ ERREUR - méthode synchrone
]);

// ✅ CORRECT - Toutes les méthodes retournent des Promises
private getMemoryInfo(): Promise<MemoryInfo> {
  const memUsage = process.memoryUsage();
  return Promise.resolve({
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
  });
}

private getSystemInfo(): Promise<SystemInfo> {
  return Promise.resolve({
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpuUsage: process.cpuUsage(),
    pid: process.pid,
  });
}
```

### ❌ **Échappements inutiles dans les expressions régulières**

```typescript
// ❌ INTERDIT - Échappements inutiles
const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;  // \-, \(, \) sont inutiles

// ✅ CORRECT - Échappements minimaux requis
const phoneRegex = /^\+?[\d\s-()]{10,}$/;     // Plus propre et correct
```

### ❌ **Méthodes async sans await**

```typescript
// ❌ INTERDIT - async sans await
async generateTokens(userId: string): Promise<TokenPair> {
  // Pas d'await dans cette méthode
  return {
    accessToken: this.createAccessToken(userId),
    refreshToken: this.createRefreshToken(userId)
  };
}

// ✅ CORRECT - Enlever async ou utiliser Promise.resolve
generateTokens(userId: string): Promise<TokenPair> {
  return Promise.resolve({
    accessToken: this.createAccessToken(userId),
    refreshToken: this.createRefreshToken(userId)
  });
}

// OU si vraiment besoin d'async
async generateTokens(userId: string): Promise<TokenPair> {
  const accessToken = await this.createAccessToken(userId);
  const refreshToken = await this.createRefreshToken(userId);
  return { accessToken, refreshToken };
}
```

### ❌ **Variables inutilisées (no-unused-vars)**

```typescript
// ❌ INTERDIT - Variables/imports non utilisés
import { Email, User, Permission } from '../domain/entities';  // Permission non utilisé

export class CreateUserUseCase {
  execute(request: CreateUserRequest, context: AppContext): Promise<User> {
    // context n'est jamais utilisé dans cette méthode
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}

// ✅ CORRECT - Supprimer les imports/variables inutilisés
import { Email, User } from '../domain/entities';

export class CreateUserUseCase {
  execute(request: CreateUserRequest): Promise<User> {
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}

// ✅ CORRECT - Préfixer avec underscore si requis par interface
export class CreateUserUseCase {
  execute(request: CreateUserRequest, _context: AppContext): Promise<User> {
    // _context indique explicitement que le paramètre n'est pas utilisé
    const email = Email.create(request.email);
    return this.userRepository.save(User.create(email, request.name));
  }
}
```

### 🎯 **Règles de Correction ESLint - MISE À JOUR POST-MIGRATION**

#### **🚨 PLAN D'ACTION CRITIQUE : Éliminer les 1437 warnings en 3 phases**

#### **PHASE 1 - CRITIQUE (1-2 jours) : Type Safety**

**1. @typescript-eslint/no-unsafe-assignment (PRIORITÉ MAX)**
- **Problème** : `any` types causant des assignments non sécurisés
- **Solution** : Créer des interfaces strictes pour Request, User, DTO
- **Impact** : ~400+ warnings éliminés

**2. @typescript-eslint/no-unsafe-member-access (PRIORITÉ MAX)**
- **Problème** : Accès aux propriétés d'objets `any`
- **Solution** : Type guards et interfaces typées
- **Impact** : ~300+ warnings éliminés

**3. @typescript-eslint/no-unsafe-argument (PRIORITÉ MAX)**
- **Problème** : Passage d'arguments `any` à des fonctions typées
- **Solution** : Validation et casting explicite avec type guards
- **Impact** : ~200+ warnings éliminés

#### **PHASE 2 - ÉLEVÉE (1 jour) : Code Quality**

**4. @typescript-eslint/require-await**
- **Problème** : Méthodes marquées `async` sans utilisation d'`await`
- **Solution** : Enlever `async` et utiliser `Promise.resolve()` OU ajouter de vrais appels `await`
- **Impact** : 8 warnings éliminés

**5. @typescript-eslint/no-unused-vars**
- **Problème** : Variables, imports ou paramètres déclarés mais jamais utilisés
- **Solution** : Supprimer ou préfixer avec `_` (ex: `_context`, `_error`)
- **Impact** : 4 warnings éliminés

**6. @typescript-eslint/unbound-method**
- **Problème** : Référencer des méthodes sans lier `this`
- **Solution** : Utiliser des arrow functions ou lier explicitement `this`
- **Impact** : 2 warnings éliminés

#### **PHASE 3 - NORMALE (1 jour) : Cleanup Final**

**7. @typescript-eslint/no-unsafe-return**
- **Problème** : Retour de valeurs `any` depuis des fonctions
- **Solution** : Typage explicite des valeurs de retour
- **Impact** : ~100+ warnings éliminés

**8. @typescript-eslint/no-unsafe-call**
- **Problème** : Appel de fonctions `any`
- **Solution** : Validation des types avant appel
- **Impact** : ~50+ warnings éliminés

#### **🔧 TEMPLATES DE CORRECTION OBLIGATOIRES**

```typescript
// ✅ TEMPLATE - Interface Request typée
export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

// ✅ TEMPLATE - Type guard pour validation
function isValidUser(data: unknown): data is AuthenticatedUser {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    typeof (data as { id: unknown }).id === 'string' &&
    typeof (data as { email: unknown }).email === 'string'
  );
}

// ✅ TEMPLATE - Controller typé correct
@Controller('users')
export class UserController {
  @Get('profile')
  async getProfile(@GetUser() user: AuthenticatedUser): Promise<UserDto> {
    // user est maintenant complètement typé
    const userId: string = user.id; // Type-safe
    return this.userService.getProfile(userId);
  }
}

// ✅ TEMPLATE - Transformer DTO typé
@Transform(({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    throw new ValidationError('Value must be a string');
  }
  return value.trim();
})
readonly name!: string;

// ✅ TEMPLATE - Méthode async correcte
async delete(id: string): Promise<void> {
  await this.businessService.delete(id); // Avec await
}

// OU
delete(id: string): Promise<void> {
  return this.businessService.delete(id); // Sans async
}

// ✅ TEMPLATE - Variables inutilisées
async method(@GetUser() _user: User, @Param('id') _id: string) {
  // Préfixe _ indique explicitement non utilisé
  return { success: true };
}
```

#### **📊 MÉTRIQUES DE SUCCÈS ATTENDUES**

- **Avant correction** : 1437 warnings
- **Après Phase 1** : ~500 warnings (-900 warnings)
- **Après Phase 2** : ~50 warnings (-450 warnings)
- **Après Phase 3** : 0 warnings (-50 warnings)
- **OBJECTIF** : 🎯 **ZÉRO WARNING ESLINT**

#### **🚨 RÈGLES D'URGENCE**

1. **JAMAIS commiter** avec plus de 100 warnings ESLint
2. **PRIORITÉ ABSOLUE** aux violations `no-unsafe-*`
3. **Validation obligatoire** : `npm run lint` avant chaque commit
4. **Type safety** : Préférer `unknown` à `any` TOUJOURS
5. **Interfaces strictes** : Créer des types pour chaque structure de données

### 📋 **Checklist de Vérification ESLint**

Avant de commiter, TOUJOURS vérifier :

- [ ] **Promise.all** : Toutes les valeurs sont des Promises
- [ ] **Regex** : Échappements minimaux requis uniquement
- [ ] **Async/await** : Méthodes async utilisent vraiment await
- [ ] **Variables** : Tous les imports/variables sont utilisés
- [ ] **Tests** : Mocks correctement typés avec `jest.Mocked<T>`

### 🔧 **Commandes de Correction**

```bash
# Vérifier les erreurs ESLint
npm run lint

# Corriger automatiquement ce qui peut l'être
npm run lint -- --fix

# Compiler pour vérifier les erreurs TypeScript
npm run build

# Lancer tous les tests
npm test
```

## 🚨 **CRITIQUE : COUCHES DOMAIN & APPLICATION LIBRES DE FRAMEWORKS**

### 🎯 **RÈGLE ABSOLUE : ZÉRO Dépendance Framework dans la Logique Métier**

**Les couches Domain et Application DOIVENT rester complètement libres de toute dépendance de framework. C'est un principe fondamental de la Clean Architecture qui garantit :**

- **Indépendance des Frameworks** : Les règles métier ne sont pas couplées à un framework spécifique
- **Testabilité** : La logique métier pure peut être testée en isolation
- **Portabilité** : La logique centrale peut être déplacée entre différents frameworks
- **Maintenabilité** : Les changements de frameworks n'affectent pas les règles métier

## 🔍 **STANDARDISATION API - RECHERCHE & FILTRAGE PAGINÉS OBLIGATOIRES**

### 🎯 **RÈGLE CRITIQUE : TOUTES LES RESSOURCES DOIVENT AVOIR UNE API DE RECHERCHE COHÉRENTE**

**Chaque ressource (User, BusinessSector, Business, etc.) DOIT respecter le même pattern de recherche et filtrage paginés pour garantir une expérience développeur cohérente.**

#### **📋 Pattern Obligatoire : POST /api/v1/{resource}/list**

```typescript
// ✅ CORRECT - Pattern standardisé pour TOUTES les ressources
@Post('list')
@ApiOperation({
  summary: 'List {ResourceName}s with advanced search and pagination',
  description: 'Provides comprehensive search, filtering, and pagination for {ResourceName}s'
})
@ApiResponse({ type: List{ResourceName}ResponseDto })
@UseGuards(JwtAuthGuard)
async list(
  @Body() dto: List{ResourceName}sDto,
  @GetUser() user: User,
): Promise<List{ResourceName}ResponseDto> {
  // Implémentation avec use case
}
```

#### **🔧 Structure DTO Standardisée**

```typescript
// ✅ OBLIGATOIRE - Chaque ressource doit avoir cette structure de base
export class List{ResourceName}sDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({ enum: ['{field1}', '{field2}', 'createdAt'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['{field1}', '{field2}', 'createdAt'])
  readonly sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  readonly sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ description: 'Search term for text fields' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  readonly search?: string;

  // ✅ Filtres spécifiques à la ressource
  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  // Autres filtres spécifiques...
}
```

#### **📊 Response DTO Standardisée**

```typescript
// ✅ OBLIGATOIRE - Métadonnées de pagination cohérentes
export class List{ResourceName}ResponseDto {
  @ApiProperty({ type: [{ResourceName}Dto] })
  readonly data: {ResourceName}Dto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 47,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPrevPage: false
    }
  })
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}
```

#### **🎯 Use Case Pattern Standardisé**

```typescript
// ✅ OBLIGATOIRE - Chaque ressource doit avoir un use case de liste
export interface List{ResourceName}sRequest {
  readonly requestingUserId: string;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly search?: string;
    readonly isActive?: boolean;
    // Filtres spécifiques...
  };
}

export interface List{ResourceName}sResponse {
  readonly data: {ResourceName}[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class List{ResourceName}sUseCase {
  async execute(request: List{ResourceName}sRequest): Promise<List{ResourceName}sResponse> {
    // 1. Validation des permissions
    // 2. Application des filtres
    // 3. Pagination
    // 4. Tri
    // 5. Mapping vers response
  }
}
```

#### **📋 Checklist Obligatoire pour Chaque Ressource**

- [ ] **Endpoint POST /api/v1/{resource}/list** implémenté
- [ ] **DTO de requête** avec pagination, tri, recherche, filtres
- [ ] **DTO de réponse** avec metadata pagination cohérente
- [ ] **Use Case dédié** pour la logique de recherche
- [ ] **Repository method findAll()** avec support filtres avancés
- [ ] **Mapper** pour conversion DTO ↔ Domain ↔ Response
- [ ] **Tests unitaires** complets pour use case et controller
- [ ] **Documentation Swagger** détaillée avec exemples
- [ ] **Validation des permissions** basée sur les rôles utilisateur
- [ ] **Gestion d'erreurs** avec messages i18n appropriés

#### **🚫 INTERDICTIONS**

- ❌ **JAMAIS** d'endpoint GET simple sans filtrage avancé
- ❌ **JAMAIS** de pagination sans métadonnées complètes
- ❌ **JAMAIS** de recherche sans validation de permissions
- ❌ **JAMAIS** de tri sans validation des champs autorisés
- ❌ **JAMAIS** de limite de pagination > 100 éléments

#### **✅ Ressources Déjà Conformes**

- **Users** : ✅ POST /api/v1/users/list avec recherche, filtrage, pagination
- **BusinessSectors** : 🔄 À mettre à jour selon ce standard

#### **📝 TODO : Mise à Jour des Ressources Existantes**

1. **BusinessSectors** : Remplacer l'endpoint simple par le pattern standardisé
2. **Businesses** : Implémenter le pattern dès la création
3. **Services** : Implémenter le pattern dès la création
4. **Appointments** : Implémenter le pattern dès la création

**Cette standardisation garantit une API cohérente, performante et facilement utilisable par les développeurs frontend !**

### 🛣️ **CONVENTIONS D'ENDPOINTS REST STANDARDISÉES**

#### **📋 Pattern Obligatoire pour TOUTES les Ressources**

```typescript
// ✅ STRUCTURE ENDPOINT STANDARDISÉE
@Controller('api/v1/{resources}') // Toujours au pluriel
export class {Resource}Controller {

  // 🔍 RECHERCHE & LISTE (POST pour filtres complexes)
  @Post('list') // ✅ OBLIGATOIRE pour toutes les ressources
  async list(@Body() dto: List{Resource}sDto): Promise<List{Resource}ResponseDto>

  // 📄 RÉCUPÉRATION PAR ID
  @Get(':id') // ✅ Standard REST
  async findById(@Param('id') id: string): Promise<{Resource}Dto>

  // ➕ CRÉATION
  @Post() // ✅ Standard REST
  async create(@Body() dto: Create{Resource}Dto): Promise<Create{Resource}ResponseDto>

  // ✏️ MISE À JOUR
  @Put(':id') // ✅ Standard REST
  async update(@Param('id') id: string, @Body() dto: Update{Resource}Dto): Promise<Update{Resource}ResponseDto>

  // 🗑️ SUPPRESSION
  @Delete(':id') // ✅ Standard REST
  async delete(@Param('id') id: string): Promise<Delete{Resource}ResponseDto>

  // 📊 STATISTIQUES/MÉTRIQUES (optionnel)
  @Get('stats')
  async getStats(): Promise<{Resource}StatsDto>
}
```

#### **🎯 Exemples Concrets d'URLs**

```bash
# ✅ CORRECT - Endpoints standardisés
POST   /api/v1/users/list          # Recherche utilisateurs paginée
GET    /api/v1/users/123           # Récupérer utilisateur par ID
POST   /api/v1/users               # Créer utilisateur
PUT    /api/v1/users/123           # Mettre à jour utilisateur
DELETE /api/v1/users/123           # Supprimer utilisateur
GET    /api/v1/users/stats         # Statistiques utilisateurs

POST   /api/v1/business-sectors/list    # Recherche secteurs paginée
GET    /api/v1/business-sectors/456     # Récupérer secteur par ID
POST   /api/v1/business-sectors         # Créer secteur
PUT    /api/v1/business-sectors/456     # Mettre à jour secteur
DELETE /api/v1/business-sectors/456     # Supprimer secteur

POST   /api/v1/businesses/list          # Recherche entreprises paginée
POST   /api/v1/appointments/list        # Recherche rendez-vous paginée
POST   /api/v1/services/list            # Recherche services paginée
```

#### **❌ ANTI-PATTERNS À ÉVITER**

```bash
# ❌ INTERDIT - Endpoints non standardisés
GET    /api/v1/users/all           # Pas de filtrage avancé
GET    /api/v1/users/search        # Limité, utiliser POST /list
POST   /api/v1/users/filter        # Utiliser POST /list
GET    /api/v1/users/paginated     # Utiliser POST /list
POST   /api/v1/users/find          # Utiliser POST /list

# ❌ INTERDIT - URLs mal formées
GET    /api/v1/user/123            # Singulier interdit
GET    /api/v1/Users/123           # Casse incorrecte
GET    /api/v1/businessSector/123  # camelCase interdit, utiliser kebab-case
```

#### **📝 Règles de Nommage**

1. **Ressources** : Toujours au **pluriel** et en **kebab-case**
   - ✅ `/users`, `/business-sectors`, `/appointments`
   - ❌ `/user`, `/businessSectors`, `/Users`

2. **Actions** : Verbes HTTP standard + suffixes conventionnels
   - ✅ `POST /list` pour recherche avancée
   - ✅ `GET /stats` pour statistiques
   - ❌ `GET /getAll`, `POST /search`

3. **Paramètres** : ID en paramètre de route, filtres complexes en body
   - ✅ `GET /users/123`, `POST /users/list`
   - ❌ `GET /users?id=123`

**Cette standardisation assure une API REST cohérente et prévisible pour tous les développeurs !**

### 🚨 **GESTION D'ERREURS API STANDARDISÉE**

#### **📋 Format de Réponse d'Erreur Obligatoire**

```typescript
// ✅ OBLIGATOIRE - Format d'erreur standardisé pour toutes les ressources
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;           // Code d'erreur technique
    readonly message: string;        // Message utilisateur (i18n)
    readonly details?: string;       // Détails techniques (dev only)
    readonly field?: string;         // Champ en erreur (validation)
    readonly timestamp: string;      // ISO timestamp
    readonly path: string;           // Endpoint appelé
    readonly correlationId: string;  // ID pour tracing
  };
}

// ✅ OBLIGATOIRE - Format de réponse succès standardisé
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
```

#### **🎯 Codes d'Erreur Standardisés par Ressource**

```typescript
// ✅ OBLIGATOIRE - Chaque ressource doit définir ses codes d'erreur
export enum {Resource}ErrorCodes {
  // Erreurs génériques (4xx)
  NOT_FOUND = '{RESOURCE}_NOT_FOUND',
  INVALID_DATA = '{RESOURCE}_INVALID_DATA',
  DUPLICATE_ENTRY = '{RESOURCE}_DUPLICATE_ENTRY',
  PERMISSION_DENIED = '{RESOURCE}_PERMISSION_DENIED',

  // Erreurs métier spécifiques
  CANNOT_DELETE_REFERENCED = '{RESOURCE}_CANNOT_DELETE_REFERENCED',
  STATUS_TRANSITION_INVALID = '{RESOURCE}_STATUS_TRANSITION_INVALID',

  // Erreurs système (5xx)
  REPOSITORY_ERROR = '{RESOURCE}_REPOSITORY_ERROR',
  EXTERNAL_SERVICE_ERROR = '{RESOURCE}_EXTERNAL_SERVICE_ERROR',
}

// Exemple concret pour BusinessSector
export enum BusinessSectorErrorCodes {
  NOT_FOUND = 'BUSINESS_SECTOR_NOT_FOUND',
  INVALID_DATA = 'BUSINESS_SECTOR_INVALID_DATA',
  DUPLICATE_CODE = 'BUSINESS_SECTOR_DUPLICATE_CODE',
  PERMISSION_DENIED = 'BUSINESS_SECTOR_PERMISSION_DENIED',
  CANNOT_DELETE_REFERENCED = 'BUSINESS_SECTOR_CANNOT_DELETE_REFERENCED',
  REPOSITORY_ERROR = 'BUSINESS_SECTOR_REPOSITORY_ERROR',
}
```

#### **📊 Codes de Statut HTTP Standardisés**

```typescript
// ✅ OBLIGATOIRE - Mapping cohérent des erreurs métier vers HTTP
export const ERROR_HTTP_STATUS_MAP = {
  // 400 - Bad Request
  INVALID_DATA: 400,
  VALIDATION_ERROR: 400,
  BUSINESS_RULE_VIOLATION: 400,

  // 401 - Unauthorized
  AUTHENTICATION_REQUIRED: 401,
  INVALID_CREDENTIALS: 401,
  TOKEN_EXPIRED: 401,

  // 403 - Forbidden
  PERMISSION_DENIED: 403,
  INSUFFICIENT_PERMISSIONS: 403,

  // 404 - Not Found
  NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,

  // 409 - Conflict
  DUPLICATE_ENTRY: 409,
  RESOURCE_ALREADY_EXISTS: 409,
  CONCURRENT_MODIFICATION: 409,

  // 422 - Unprocessable Entity
  CANNOT_DELETE_REFERENCED: 422,
  STATUS_TRANSITION_INVALID: 422,

  // 500 - Internal Server Error
  REPOSITORY_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 500,
  UNKNOWN_ERROR: 500,
} as const;
```

#### **🔧 Exception Filter Global**

```typescript
// ✅ OBLIGATOIRE - Gestionnaire d'erreurs global pour cohérence
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: this.getI18nMessage(exception),
        details: this.getErrorDetails(exception),
        field: this.getFieldName(exception),
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
      },
    };

    const statusCode = this.getHttpStatus(exception);
    response.status(statusCode).json(errorResponse);
  }
}
```

#### **📝 Messages d'Erreur Internationalisés**

```typescript
// ✅ OBLIGATOIRE - Messages i18n pour toutes les erreurs
// src/shared/i18n/en/errors.json
{
  "BUSINESS_SECTOR_NOT_FOUND": "Business sector not found",
  "BUSINESS_SECTOR_DUPLICATE_CODE": "A business sector with this code already exists",
  "BUSINESS_SECTOR_PERMISSION_DENIED": "You don't have permission to manage business sectors",
  "BUSINESS_SECTOR_CANNOT_DELETE_REFERENCED": "Cannot delete business sector: it is referenced by existing businesses"
}

// src/shared/i18n/fr/errors.json
{
  "BUSINESS_SECTOR_NOT_FOUND": "Secteur d'activité introuvable",
  "BUSINESS_SECTOR_DUPLICATE_CODE": "Un secteur d'activité avec ce code existe déjà",
  "BUSINESS_SECTOR_PERMISSION_DENIED": "Vous n'avez pas l'autorisation de gérer les secteurs d'activité",
  "BUSINESS_SECTOR_CANNOT_DELETE_REFERENCED": "Impossible de supprimer le secteur : il est référencé par des entreprises existantes"
}
```

#### **🚫 INTERDICTIONS - Gestion d'Erreurs**

- ❌ **JAMAIS** renvoyer des stack traces en production
- ❌ **JAMAIS** exposer des détails internes de la base de données
- ❌ **JAMAIS** utiliser des messages d'erreur génériques ("Internal Error")
- ❌ **JAMAIS** oublier la corrélation ID pour le debugging
- ❌ **JAMAIS** renvoyer des codes HTTP incohérents

**Cette standardisation garantit une gestion d'erreurs cohérente et debuggable sur toute l'API !**

## 📚 **DOCUMENTATION SWAGGER - WORKFLOW COMPLET OBLIGATOIRE**

### 🎯 **RÈGLE CRITIQUE : API DOCUMENTATION COMPLÈTE ET FRONTEND-FRIENDLY**

**Après avoir créé les Controllers et DTOs, TOUJOURS créer une documentation Swagger complète pour garantir une API utilisable, cohérente et facilement intégrable par les équipes frontend.**

#### **📋 WORKFLOW DOCUMENTATION OBLIGATOIRE APRÈS PRÉSENTATION**

#### **1️⃣ RÈGLE ROUTE PREFIXING - ÉVITER DOUBLE /v1/v1/**

```typescript
// ✅ CORRECT - main.ts avec globalPrefix
app.setGlobalPrefix('api/v1');

// ✅ CORRECT - Controllers SANS préfixe redondant
@Controller('services')  // → /api/v1/services
@Controller('staff')     // → /api/v1/staff
@Controller('appointments') // → /api/v1/appointments

// ❌ INTERDIT - Double préfixage
@Controller('api/v1/services') // → /api/v1/api/v1/services (ERREUR!)
```

#### **2️⃣ TAGS SWAGGER OBLIGATOIRES PAR RESSOURCE**

```typescript
// ✅ OBLIGATOIRE - Tags avec icônes pour clarté
@ApiTags('💼 Services')           // Services métier
@ApiTags('👨‍💼 Staff Management')    // Gestion personnel
@ApiTags('📅 Appointments')       // Rendez-vous
@ApiTags('🏢 Business Management') // Gestion entreprises
@ApiTags('👥 User Management')    // Gestion utilisateurs
@ApiTags('❤️ Health Checks')      // Santé système
```

#### **3️⃣ DOCUMENTATION SWAGGER ENRICHIE OBLIGATOIRE**

```typescript
// ✅ TEMPLATE OBLIGATOIRE - Documentation complète avec exemples
@ApiOperation({
  summary: '🔍 Search {Resource}s with Advanced Filters',
  description: `
    **Recherche avancée paginée** des {resource}s avec système de filtrage complet.

    ## 🎯 Fonctionnalités

    ### 📊 **Filtres disponibles**
    - **Recherche textuelle** : Nom, description, tags
    - **Filtres métier** : Statut, catégorie, prix
    - **Tri multi-critères** : Tous champs avec asc/desc
    - **Pagination** : Page/limit avec métadonnées complètes

    ### 💰 **Exemple pricing complexe**
    \`\`\`json
    {
      "pricingConfig": {
        "type": "VARIABLE",
        "basePrice": { "amount": 80.00, "currency": "EUR" },
        "variablePricing": {
          "factors": [
            {
              "name": "Durée",
              "options": [
                { "label": "30 min", "priceModifier": 0 },
                { "label": "60 min", "priceModifier": 40 }
              ]
            }
          ]
        }
      }
    }
    \`\`\`

    ### 📋 **Règles métier**
    - ✅ **Permissions** : Scoped selon rôle utilisateur
    - ✅ **Validation** : Tous paramètres validés côté serveur
    - ✅ **Performance** : Pagination obligatoire, cache Redis

    ### 🔐 **Sécurité**
    - **JWT** : Token Bearer obligatoire
    - **RBAC** : Permissions granulaires par ressource
    - **Rate limiting** : 100 req/min par utilisateur

    ## 🎯 **Guide d'intégration Frontend**

    ### React/Vue.js Example
    \`\`\`typescript
    const searchServices = async (filters: ServiceFilters) => {
      const response = await api.post('/api/v1/services/list', {
        ...filters,
        page: 1,
        limit: 20
      });

      return {
        services: response.data.data,
        pagination: response.data.meta
      };
    };
    \`\`\`
  `,
})
```

#### **4️⃣ CHECKLIST OBLIGATOIRE APRÈS CHAQUE PRÉSENTATION**

- [ ] **Routes** : Aucun double préfixage /v1/v1/
- [ ] **Tags** : @ApiTags avec icônes sur tous les controllers
- [ ] **Operations** : @ApiOperation avec description complète et exemples
- [ ] **Responses** : Tous codes HTTP documentés avec exemples JSON
- [ ] **DTOs** : Validation et Swagger schemas complets
- [ ] **Config** : Swagger config central avec guide intégration
- [ ] **Documentation** : Fichier markdown complet par fonctionnalité
- [ ] **Frontend** : Exemples TypeScript/React/Vue.js
- [ ] **Tests** : Validation Swagger UI accessible et complète
- [ ] **Push** : Code testé et documentation à jour

#### **5️⃣ CONFIGURATION SWAGGER CENTRALE ENRICHIE**

```typescript
// ✅ OBLIGATOIRE - Configuration Swagger avec guide intégration complet
const config = new DocumentBuilder()
  .setTitle('🎯 Appointment System API')
  .setDescription(`
    ## 🚀 **API Complète pour Système de Rendez-vous**

    ### 📋 **Fonctionnalités Principales**

    - **🏢 Gestion d'entreprises** : Secteurs, profils, configuration
    - **👨‍💼 Personnel** : Staff, disponibilités, compétences
    - **💼 Services** : Pricing flexible, packages, prérequis
    - **📅 Rendez-vous** : Réservation, notifications, historique
    - **👥 Utilisateurs** : Authentification, rôles, permissions

    ### 🔐 **Authentification**

    Toutes les APIs nécessitent un **JWT Bearer Token** :

    \`\`\`bash
    curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
         -X POST http://localhost:3000/api/v1/services/list
    \`\`\`

    ### 📊 **Standards de Réponse**

    #### ✅ **Succès**
    \`\`\`json
    {
      "success": true,
      "data": { /* Données métier */ },
      "meta": { /* Métadonnées pagination */ }
    }
    \`\`\`

    #### ❌ **Erreur**
    \`\`\`json
    {
      "success": false,
      "error": {
        "code": "BUSINESS_ERROR_CODE",
        "message": "Message utilisateur localisé",
        "field": "champEnErreur"
      }
    }
    \`\`\`

    ### 🎯 **Guides d'Intégration**

    - **React/Vue.js** : Exemples TypeScript fournis
    - **Pagination** : Système uniforme avec métadonnées
    - **Filtrage** : POST /list pour requêtes complexes
    - **Pricing** : Système flexible pour tous cas d'usage

    ### 📞 **Support**

    - **Documentation** : Exemples complets dans chaque endpoint
    - **Types TypeScript** : Interfaces générées automatiquement
    - **Postman Collection** : Import direct depuis Swagger JSON
  `)
  .setVersion('2.0')
  .addBearerAuth()
  .addTag('💼 Services', 'Gestion des services et tarification flexible')
  .addTag('👨‍💼 Staff Management', 'Personnel et disponibilités')
  .addTag('📅 Appointments', 'Système de rendez-vous complet')
  .addTag('🏢 Business Management', 'Entreprises et secteurs d\'activité')
  .addTag('👥 User Management', 'Utilisateurs et authentification')
  .addTag('❤️ Health Checks', 'Monitoring et santé système');
```

#### **🚫 INTERDICTIONS - Documentation Swagger**

- ❌ **JAMAIS** de controller sans @ApiTags
- ❌ **JAMAIS** d'endpoint sans @ApiOperation détaillée
- ❌ **JAMAIS** de double préfixage de routes
- ❌ **JAMAIS** d'exemples JSON incomplets ou faux
- ❌ **JAMAIS** oublier les guides d'intégration frontend

**Cette règle garantit des APIs professionnelles, documentées et facilement intégrables !**

### 🧪 **TESTS D'INTÉGRATION API STANDARDISÉS**

#### **📋 Pattern de Tests Obligatoire pour Chaque Ressource**

```typescript
// ✅ OBLIGATOIRE - Structure de tests d'intégration pour chaque ressource
describe('{Resource}Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // Setup application et authentification
  });

  describe('POST /api/v1/{resources}/list', () => {
    it('should return paginated list with default parameters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        meta: {
          currentPage: 1,
          totalPages: expect.any(Number),
          totalItems: expect.any(Number),
          itemsPerPage: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: false,
        },
      });
    });

    it('should apply search filters correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          search: 'test search term',
          isActive: true,
          page: 1,
          limit: 5,
        })
        .expect(200);

      expect(response.body.meta.itemsPerPage).toBe(5);
      // Vérifier que les résultats correspondent au filtre
    });

    it('should enforce pagination limits', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ limit: 150 }) // > 100
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/{resources}/list')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/v1/{resources}/:id', () => {
    it('should return resource by ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: 'valid-uuid',
          // Autres propriétés attendues
        },
      });
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/{resources}/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: '{RESOURCE}_NOT_FOUND',
          message: expect.any(String),
        },
      });
    });
  });

  describe('POST /api/v1/{resources}', () => {
    it('should create resource with valid data', async () => {
      const createDto = {
        // Données valides pour création
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          ...createDto,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/{resources}')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Données manquantes
        .expect(400);

      expect(response.body.error.code).toBe('{RESOURCE}_INVALID_DATA');
    });
  });

  describe('PUT /api/v1/{resources}/:id', () => {
    it('should update resource with valid data', async () => {
      const updateDto = {
        // Données de mise à jour
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toMatchObject(updateDto);
    });
  });

  describe('DELETE /api/v1/{resources}/:id', () => {
    it('should delete resource successfully', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Vérifier que la ressource est supprimée
      await request(app.getHttpServer())
        .get('/api/v1/{resources}/valid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

#### **🎯 Données de Test Standardisées**

```typescript
// ✅ OBLIGATOIRE - Factory de données de test pour chaque ressource
export class {Resource}TestDataFactory {
  static createValid{Resource}Data(): Create{Resource}Dto {
    return {
      // Données valides minimales
    };
  }

  static createInvalid{Resource}Data(): Partial<Create{Resource}Dto> {
    return {
      // Données invalides pour tests de validation
    };
  }

  static createUpdate{Resource}Data(): Update{Resource}Dto {
    return {
      // Données de mise à jour
    };
  }

  static createList{Resource}Filters(): List{Resource}sDto {
    return {
      search: 'test',
      isActive: true,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
  }
}
```

#### **📊 Métriques de Couverture Obligatoires**

```typescript
// ✅ OBLIGATOIRE - Checklist de couverture des tests API
const API_TEST_COVERAGE_CHECKLIST = {
  // Endpoints CRUD complets
  'POST /list': ['success', 'pagination', 'filters', 'auth', 'permissions'],
  'GET /:id': ['success', 'not_found', 'auth', 'permissions'],
  'POST /': ['success', 'validation', 'auth', 'permissions', 'duplicates'],
  'PUT /:id': ['success', 'validation', 'not_found', 'auth', 'permissions'],
  'DELETE /:id': ['success', 'not_found', 'auth', 'permissions', 'constraints'],

  // Cas d'erreur obligatoires
  error_handling: ['400', '401', '403', '404', '409', '422', '500'],

  // Validations métier
  business_rules: ['required_fields', 'format_validation', 'constraints'],

  // Sécurité
  security: ['authentication', 'authorization', 'input_sanitization'],
} as const;
```

#### **🚫 INTERDICTIONS - Tests API**

- ❌ **JAMAIS** tester sans données de test isolées
- ❌ **JAMAIS** ignorer les tests de permissions/sécurité
- ❌ **JAMAIS** oublier les tests de validation des limites
- ❌ **JAMAIS** tester sans cleanup des données
- ❌ **JAMAIS** utiliser des données de production dans les tests

**Cette standardisation garantit une couverture de tests complète et cohérente pour toutes les APIs !**

### ❌ **STRICTEMENT INTERDIT dans Domain/Application**

```typescript
// ❌ JAMAIS importer des dépendances de framework dans Domain/Application
import { Injectable, Inject } from '@nestjs/common';        // INTERDIT
import { Repository } from 'typeorm';                       // INTERDIT
import { Request, Response } from 'express';                // INTERDIT
import { GraphQLResolveInfo } from 'graphql';              // INTERDIT
import { JwtService } from '@nestjs/jwt';                   // INTERDIT
import { ConfigService } from '@nestjs/config';            // INTERDIT

// ❌ JAMAIS utiliser des décorateurs de framework dans Domain/Application
@Injectable()  // INTERDIT dans Domain/Application
@Entity()      // INTERDIT dans Domain/Application
@Column()      // INTERDIT dans Domain/Application
```

### ✅ **CORRECT : TypeScript Pur dans Domain/Application**

```typescript
// ✅ Couche Domain - Logique métier pure
export class User {
  private constructor(
    private readonly id: string,
    private readonly email: Email,
    private readonly name: string,
  ) {}

  static create(email: Email, name: string): User {
    // Validation métier pure - aucune dépendance framework
    if (!name || name.trim().length < 2) {
      throw new DomainError('User name must be at least 2 characters');
    }
    return new User(generateId(), email, name);
  }
}

// ✅ Couche Application - Orchestration des cas d'usage
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,  // Interface uniquement
    private readonly logger: ILogger,                  // Interface uniquement
    private readonly eventBus: IEventBus,             // Interface uniquement
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Logique d'orchestration pure - aucune dépendance framework
    const email = Email.create(request.email);
    const user = User.create(email, request.name);

    const savedUser = await this.userRepository.save(user);
    await this.eventBus.publish(new UserCreatedEvent(savedUser));

    return CreateUserResponse.fromUser(savedUser);
  }
}
```

### 🏗️ **Architecture d'Injection de Dépendances Appropriée**

L'injection de dépendances spécifique aux frameworks ne doit avoir lieu que dans les couches **Infrastructure** et **Presentation** :

```typescript
// ✅ Couche Infrastructure - Implémentations framework
@Injectable()  // OK ici - Couche Infrastructure
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)  // OK ici - Couche Infrastructure
    private readonly repository: Repository<UserEntity>,
  ) {}
}

// ✅ Couche Presentation - Contrôleurs avec intégration framework
@Controller('users')  // OK ici - Couche Presentation
export class UserController {
  constructor(
    @Inject(TOKENS.CREATE_USER_USE_CASE)  // OK ici - Couche Presentation
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}
}

// ✅ Couche Infrastructure - Configuration des modules
@Module({  // OK ici - Couche Infrastructure
  providers: [
    {
      provide: TOKENS.CREATE_USER_USE_CASE,
      useFactory: (userRepo, logger, eventBus) =>
        new CreateUserUseCase(userRepo, logger, eventBus),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.EVENT_BUS],
    },
  ],
})
export class ApplicationModule {}
```

### 📋 **Matrice de Responsabilités par Couche**

| Couche | Usage Framework | Injection Dépendances | Décorateurs | Bibliothèques Externes |
|-------|----------------|----------------------|------------|------------------------|
| **Domain** | ❌ JAMAIS | ❌ JAMAIS | ❌ JAMAIS | ❌ Seulement si pur (lodash, date-fns) |
| **Application** | ❌ JAMAIS | ❌ JAMAIS | ❌ JAMAIS | ❌ Seulement si pur (lodash, date-fns) |
| **Infrastructure** | ✅ OUI | ✅ OUI | ✅ OUI | ✅ OUI |
| **Presentation** | ✅ OUI | ✅ OUI | ✅ OUI | ✅ OUI |

### 🚨 **Détection des Violations**

Pour détecter les violations, vérifiez régulièrement :

```bash
# Vérifier les imports NestJS dans Domain/Application
grep -r "@nestjs" src/domain/ src/application/

# Vérifier les décorateurs de framework dans Domain/Application
grep -r "@Injectable\|@Entity\|@Column\|@Repository" src/domain/ src/application/

# Vérifier les imports ORM dans Domain/Application
grep -r "typeorm\|mongoose\|prisma" src/domain/ src/application/
```

**Tout résultat de ces commandes indique une violation de Clean Architecture qui doit être corrigée immédiatement !**

## 🔗 **Husky & Application des Commits Sémantiques**

### 🎯 **Hooks de Pré-commit avec Husky**

Husky applique automatiquement la qualité du code et les standards de commit :

```json
// package.json - Configuration Husky
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint --edit $1"
  },
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### 🔧 **Configuration des Hooks Husky**

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Exécution des vérifications de pré-commit..."

# Exécuter lint-staged pour le formatage et le linting du code
npx lint-staged

# Lancer les tests pour s'assurer que rien n'est cassé
npm test

echo "✅ Vérifications de pré-commit réussies !"
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Validation du message de commit..."
npx --no -- commitlint --edit $1
echo "✅ Message de commit valide !"
```

### 📋 **Workflow de Commit**

1. **Modifications du Code** : Faire vos changements
2. **Formatage Automatique** : Husky exécute ESLint + Prettier sur les fichiers stagés
3. **Validation des Tests** : Tous les tests doivent passer
4. **Validation du Message de Commit** : Doit suivre le format de commit conventionnel
5. **Succès du Commit** : Seulement si toutes les vérifications passent

### 🚫 **Actions Bloquées**

Husky empêchera les commits si :
- Des erreurs ESLint existent
- Les tests échouent
- Le message de commit ne suit pas la convention
- Le code n'est pas correctement formaté

Cela garantit **100% de qualité du code** et **un historique de commits cohérent** !

## 🚨 **RÈGLE MÉTIER CRITIQUE : PRISE DE RENDEZ-VOUS PUBLIQUE UNIQUEMENT**

### 🎯 **NOUVELLE RÈGLE IMPLÉMENTÉE**

**⚠️ RÈGLE BUSINESS CRITIQUE** : Seuls les services avec `allowOnlineBooking: true` peuvent être réservés directement par les clients.

#### **🔧 Implémentation Technique**

```typescript
// ✅ OBLIGATOIRE - Validation dans tous les use cases de réservation
if (!service.isBookable()) {
  this.logger.error('Service does not allow online booking', {
    serviceId,
    allowOnlineBooking: false,
  });
  throw new ServiceNotBookableOnlineError(serviceId);
}
```

#### **📋 Entité Service - Méthodes Critiques**

```typescript
// ✅ Méthodes à utiliser pour validation
service.isActive()    // Service doit être actif
service.isBookable()  // Service doit autoriser prise de rendez-vous en ligne
service.canBeBookedBy(clientAge) // Validation des restrictions d'âge
```

#### **🚨 Exception Standardisée**

```typescript
export class ServiceNotBookableOnlineError extends AppointmentException {
  constructor(serviceId: string) {
    super(
      `Service ${serviceId} does not allow online booking`,
      'SERVICE_NOT_BOOKABLE_ONLINE',
      { serviceId },
    );
  }
}
```

#### **✅ Cahier des Charges Mis à Jour**

Cette règle est maintenant documentée dans `CAHIER_DES_CHARGES_V2.md` section **Système de Rendez-vous**.

## 🚨 **RÈGLE CRITIQUE : JAMAIS COMMITER AVEC DES ERREURS ESLINT**

### ❌ **INTERDICTION ABSOLUE**

**Il est STRICTEMENT INTERDIT de commiter du code avec des erreurs ESLint ou des tests qui échouent.**

Cette règle est **NON-NÉGOCIABLE** pour maintenir :
- **Qualité du code** constante
- **Stabilité** du projet
- **Maintenabilité** à long terme
- **Cohérence** de l'équipe

### 🔧 **Workflow de Commit OBLIGATOIRE**

#### **1️⃣ Format + Reorganize Imports**
```bash
# Formatter le code avec Prettier
npm run format

# Réorganiser automatiquement les imports TypeScript
npx tsc --organizeImports src/**/*.ts
# OU utiliser l'action VS Code "Organize Imports" (Shift+Alt+O)
```

#### **2️⃣ Lint avec Correction Automatique**
```bash
# Lancer ESLint avec correction automatique
npm run lint -- --fix

# Vérifier qu'il n'y a AUCUNE erreur restante
npm run lint
```

#### **3️⃣ Vérification des Tests**
```bash
# S'assurer que TOUS les tests passent
npm test

# Vérification spécifique des tests unitaires
npm run test:unit

# Optionnel : Vérifier la coverage
npm run test:cov
```

#### **4️⃣ Commit Sémantique**
```bash
# Commit avec message sémantique conforme
git add .
git commit -m "🎉 feat(scope): description claire et concise"
```

### ⚡ **Commandes Rapides Pré-Commit**

```bash
# Script complet de pré-commit (recommandé)
npm run format && npm run lint -- --fix && npm test && git add .

# Vérification finale avant commit
npm run lint && npm test
```

### 🎯 **Organiser les Imports TypeScript**

#### **Automatique avec VS Code**
- **Raccourci** : `Shift + Alt + O`
- **Command Palette** : `> TypeScript: Organize Imports`
- **Au sauvegarde** : Configurer `"editor.codeActionsOnSave": {"source.organizeImports": true}`

#### **Via Terminal**
```bash
# Organiser les imports pour tous les fichiers TypeScript
find src -name "*.ts" -exec npx tsc --noEmit --organizeImports {} \;

# Ou utiliser un plugin ESLint
npm run lint -- --fix-type suggestion
```

### 📋 **Checklist Pré-Commit OBLIGATOIRE**

- [ ] ✅ **Format** : Code formaté avec Prettier
- [ ] ✅ **Imports** : Imports réorganisés automatiquement
- [ ] ✅ **Lint** : Aucune erreur ESLint (0 errors, warnings acceptables)
- [ ] ✅ **Tests** : Tous les tests passent (0 failed)
- [ ] ✅ **Build** : Compilation TypeScript réussie
- [ ] ✅ **Message** : Commit sémantique conforme

### 🚨 **Sanctions pour Non-Respect**

Le non-respect de ces règles entraîne :
- **Rejet automatique** du commit par Husky
- **Blocage de la CI/CD**
- **Demande de correction immédiate**
- **Review obligatoire** pour violations répétées

### 💡 **Configuration IDE Recommandée**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript"],
  "typescript.preferences.organizeImports": true
}
```

**Cette règle garantit un code de qualité professionnelle et une collaboration d'équipe fluide !**

## 🗄️ **RÈGLE CRITIQUE : MIGRATIONS TYPEORM ET SCHÉMAS**

### 🎯 **RÈGLE OBLIGATOIRE : RÉCUPÉRATION DU SCHÉMA DEPUIS LES VARIABLES D'ENVIRONNEMENT**

**⚠️ RÈGLE NON-NÉGOCIABLE** : Dans toutes les migrations TypeORM, le nom du schéma DOIT être récupéré depuis les variables d'environnement pour garantir la portabilité entre environnements (development, staging, production).

#### **✅ PATTERN OBLIGATOIRE POUR MIGRATIONS TYPEORM**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlexiblePricingToServices{Timestamp} implements MigrationInterface {
  name = 'AddFlexiblePricingToServices{Timestamp}';

  // 🎯 OBLIGATOIRE : Récupérer le schéma depuis l'environnement
  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT : Utiliser le schéma dynamique
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "pricing_config" jsonb DEFAULT '{"type":"FIXED","visibility":"PUBLIC","basePrice":{"amount":0,"currency":"EUR"},"rules":[]}'::jsonb
    `);

    // ✅ CORRECT : Index avec schéma dynamique
    await queryRunner.query(`
      CREATE INDEX "IDX_services_pricing_type"
      ON "${schema}"."services" USING GIN (("pricing_config"->>'type'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT : Rollback avec schéma dynamique
    await queryRunner.query(`DROP INDEX IF EXISTS "${schema}"."IDX_services_pricing_type"`);
    await queryRunner.query(`ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "pricing_config"`);
  }
}
```

#### **❌ ANTI-PATTERNS STRICTEMENT INTERDITS**

```typescript
// ❌ INTERDIT : Schéma hardcodé
await queryRunner.query(`ALTER TABLE "public"."services" ADD COLUMN...`);

// ❌ INTERDIT : Pas de gestion d'environnement
await queryRunner.query(`ALTER TABLE services ADD COLUMN...`); // Pas de schéma du tout

// ❌ INTERDIT : Schéma non configurable
const schema = 'public'; // Valeur fixe
```

#### **🔧 PATTERNS AVANCÉS OBLIGATOIRES**

```typescript
// ✅ EXCELLENT : Gestion complète avec validation
export class ExampleMigration implements MigrationInterface {
  private getSchemaName(): string {
    const schema = process.env.DB_SCHEMA || 'public';

    // Validation du nom de schéma (sécurité)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid schema name: ${schema}`);
    }

    return schema;
  }

  private async schemaExists(queryRunner: QueryRunner, schemaName: string): Promise<boolean> {
    const result = await queryRunner.query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.schemata
        WHERE schema_name = $1
      ) as exists
    `, [schemaName]);

    return result[0]?.exists || false;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // Vérifier que le schéma existe
    const exists = await this.schemaExists(queryRunner, schema);
    if (!exists) {
      throw new Error(`Schema "${schema}" does not exist`);
    }

    // Migration avec schéma validé
    await queryRunner.query(`
      ALTER TABLE "${schema}"."table_name"
      ADD COLUMN "new_column" VARCHAR(255)
    `);
  }
}
```

#### **📋 VARIABLES D'ENVIRONNEMENT REQUISES**

```bash
# .env files obligatoires
DB_SCHEMA=public                    # Development
DB_SCHEMA=appointment_system_dev    # Development avec schéma dédié
DB_SCHEMA=appointment_system_staging # Staging
DB_SCHEMA=appointment_system_prod   # Production
```

#### **🚨 DÉTECTION DES VIOLATIONS**

```bash
# Vérifier les migrations avec schémas hardcodés
grep -r '"public"' src/infrastructure/database/sql/postgresql/migrations/
# RÉSULTAT ATTENDU : Aucun résultat (0 ligne)

# Vérifier l'utilisation des variables d'environnement
grep -r "process.env.DB_SCHEMA" src/infrastructure/database/sql/postgresql/migrations/
# RÉSULTAT ATTENDU : Toutes les migrations utilisent cette variable

# Vérifier les requêtes sans schéma
grep -r "ALTER TABLE [^\"']" src/infrastructure/database/sql/postgresql/migrations/
# RÉSULTAT ATTENDU : Aucune requête sans guillemets et schéma
```

#### **✅ CHECKLIST MIGRATION TYPEORM OBLIGATOIRE**

- [ ] ✅ **Méthode `getSchemaName()`** présente dans chaque migration
- [ ] ✅ **Variable `DB_SCHEMA`** utilisée dans toutes les requêtes
- [ ] ✅ **Validation du nom de schéma** pour la sécurité
- [ ] ✅ **Schémas quoted** dans toutes les requêtes SQL (`"${schema}"`)
- [ ] ✅ **Méthode `up()` et `down()`** utilisent le schéma dynamique
- [ ] ✅ **Index et contraintes** créés avec le bon schéma
- [ ] ✅ **Tests de migration** sur différents schémas
- [ ] ✅ **Documentation** des variables d'environnement requises

#### **🎯 AVANTAGES DE CETTE APPROCHE**

1. **Portabilité** : Même migration fonctionne sur tous les environnements
2. **Sécurité** : Isolation des données par schéma
3. **Flexibilité** : Support de déploiements multi-tenants
4. **Maintenance** : Pas de duplication de code selon l'environnement
5. **CI/CD** : Automatisation complète sans intervention manuelle

### 🚨 **SANCTIONS POUR NON-RESPECT**

Le non-respect de cette règle entraîne :
- **Blocage de la migration** en environnement de production
- **Erreurs de déploiement** et corruption potentielle de données
- **Review obligatoire** et refactoring immédiat
- **Formation supplémentaire** sur les bonnes pratiques PostgreSQL

**Cette règle est CRITIQUE pour la stabilité et la sécurité de la base de données !**
`````

## 🚨 **ERREURS COURANTES NestJS - INJECTION DE DÉPENDANCES**

### 🎯 **ERREUR CRITIQUE : UnknownDependenciesException**

**❌ ERREUR FRÉQUENTE** : Après création de nouveaux Use Cases, l'application ne démarre plus avec :

```
[Nest] ERROR [Bootstrap] UnknownDependenciesException [Error]:
Nest can't resolve dependencies of the AppointmentController
(GetAvailableSlotsUseCase, BookAppointmentUseCase, ?, GetAppointmentByIdUseCase, UpdateAppointmentUseCase, CancelAppointmentUseCase).
Please make sure that the argument "ListAppointmentsUseCase" at index [2] is available in the PresentationModule context.
```

#### **🔍 DIAGNOSTIC RAPIDE**

1. **Identifier le Use Case manquant** : Dans l'erreur ci-dessus, c'est `ListAppointmentsUseCase`
2. **Vérifier le constructeur du Controller** : Le Use Case est injecté mais pas enregistré
3. **Vérifier le PresentationModule** : Le provider manque dans la configuration

#### **✅ SOLUTION OBLIGATOIRE**

**Étape 1 : Vérifier les imports dans PresentationModule**

```typescript
// ❌ MANQUANT - Import du Use Case
import { ListAppointmentsUseCase } from '../../application/use-cases/appointments/list-appointments.use-case';
import { GetAppointmentByIdUseCase } from '../../application/use-cases/appointments/get-appointment-by-id.use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointments/update-appointment.use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointments/cancel-appointment.use-case';
```

**Étape 2 : Ajouter les providers dans PresentationModule**

```typescript
// ✅ CORRECT - Providers obligatoires pour nouveaux Use Cases
{
  provide: TOKENS.LIST_APPOINTMENTS_USE_CASE,
  useFactory: (appointmentRepository: AppointmentRepository) =>
    new ListAppointmentsUseCase(appointmentRepository),
  inject: [TOKENS.APPOINTMENT_REPOSITORY],
},
{
  provide: TOKENS.GET_APPOINTMENT_BY_ID_USE_CASE,
  useFactory: (appointmentRepository: AppointmentRepository) =>
    new GetAppointmentByIdUseCase(appointmentRepository),
  inject: [TOKENS.APPOINTMENT_REPOSITORY],
},
{
  provide: TOKENS.UPDATE_APPOINTMENT_USE_CASE,
  useFactory: (appointmentRepository: AppointmentRepository) =>
    new UpdateAppointmentUseCase(appointmentRepository),
  inject: [TOKENS.APPOINTMENT_REPOSITORY],
},
{
  provide: TOKENS.CANCEL_APPOINTMENT_USE_CASE,
  useFactory: (appointmentRepository: AppointmentRepository) =>
    new CancelAppointmentUseCase(appointmentRepository),
  inject: [TOKENS.APPOINTMENT_REPOSITORY],
},
```

#### **📋 PATTERN STANDARDISÉ POUR NOUVEAUX USE CASES**

**Workflow obligatoire à CHAQUE création de Use Case :**

1. **Créer le Use Case** dans `/application/use-cases/{domain}/`
2. **Ajouter le token** dans `injection-tokens.ts`
3. **Importer le Use Case** dans `PresentationModule`
4. **Ajouter le provider** avec `useFactory` et `inject`
5. **Injecter dans le Controller** avec `@Inject(TOKENS.XXX_USE_CASE)`
6. **Tester le démarrage** : `npm run start:dev`

#### **🚫 ERREURS À ÉVITER**

- ❌ **Oublier d'ajouter le provider** après création du Use Case
- ❌ **Token manquant** dans injection-tokens.ts
- ❌ **Import manquant** du Use Case dans le module
- ❌ **Mauvaise configuration** du useFactory/inject
- ❌ **Typo dans le nom** du token ou du Use Case

#### **✅ CHECKLIST OBLIGATOIRE**

- [ ] ✅ **Use Case créé** dans le bon dossier
- [ ] ✅ **Token ajouté** dans injection-tokens.ts
- [ ] ✅ **Import ajouté** dans PresentationModule
- [ ] ✅ **Provider configuré** avec useFactory
- [ ] ✅ **Injection dans Controller** avec @Inject
- [ ] ✅ **Application démarre** sans erreur
- [ ] ✅ **Tests passent** après ajout

\*_Cette documentation évitera 90% des erreurs d'injection de dépendances lors de l'ajout de nouveaux Use Cases run lint src/presentation/controllers/ 2>&1 | grep -E .controller.ts | head -10_

## 🎯 **RÈGLES IMPORTS OBLIGATOIRES - ALIAS TYPESCRIPT**

### 🚨 **RÈGLE CRITIQUE NON-NÉGOCIABLE : UTILISER EXCLUSIVEMENT LES ALIAS D'IMPORT**

**⚠️ INTERDICTION ABSOLUE** : Utiliser des chemins relatifs dans les imports. TOUJOURS utiliser les alias TypeScript configurés dans `tsconfig.json`.

#### **✅ ALIAS CONFIGURÉS OBLIGATOIRES**

```typescript
// ✅ OBLIGATOIRE - Utiliser TOUJOURS les alias définis
import { User } from '@domain/entities/user.entity';
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { TypeOrmUserRepository } from '@infrastructure/database/sql/postgresql/repositories/typeorm-user.repository';
import { UserController } from '@presentation/controllers/user.controller';
import { Logger } from '@application/ports/logger.port';
import { validateId } from '@shared/utils/validation.utils';

// ❌ STRICTEMENT INTERDIT - Chemins relatifs
import { User } from '../../../domain/entities/user.entity';
import { CreateUserUseCase } from '../../application/use-cases/users/create-user.use-case';
import { TypeOrmUserRepository } from './repositories/typeorm-user.repository';
import { Logger } from '../ports/logger.port';
import { validateId } from '../../../../shared/utils/validation.utils';
```

#### **📋 MAPPING D'ALIAS COMPLET**

```typescript
// Configuration tsconfig.json - RÉFÉRENCE
"paths": {
  "@domain/*": ["src/domain/*"],
  "@application/*": ["src/application/*"],
  "@infrastructure/*": ["src/infrastructure/*"],
  "@presentation/*": ["src/presentation/*"],
  "@shared/*": ["src/shared/*"]
}
```

#### **🎯 EXEMPLES CONCRETS PAR COUCHE**

```typescript
// 🏛️ DOMAIN LAYER
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.value-object';
import { IUserRepository } from '@domain/repositories/user.repository';
import { UserValidationError } from '@domain/exceptions/user.exceptions';
import { UserService } from '@domain/services/user.service';

// 🏗️ APPLICATION LAYER
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IAuditService } from '@application/ports/audit.port';
import { UserCacheService } from '@application/services/user-cache.service';

// 🔧 INFRASTRUCTURE LAYER
import { TypeOrmUserRepository } from '@infrastructure/database/sql/postgresql/repositories/typeorm-user.repository';
import { UserOrmEntity } from '@infrastructure/database/sql/postgresql/entities/user-orm.entity';
import { UserOrmMapper } from '@infrastructure/mappers/user-orm.mapper';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RedisService } from '@infrastructure/cache/redis.service';

// 🎨 PRESENTATION LAYER
import { UserController } from '@presentation/controllers/user.controller';
import { CreateUserDto } from '@presentation/dtos/users/create-user.dto';
import { UserMapper } from '@presentation/mappers/user.mapper';
import { JwtAuthGuard } from '@presentation/security/auth.guard';
import { GetUser } from '@presentation/security/decorators/get-user.decorator';

// 🔗 SHARED LAYER
import { UserRole } from '@shared/enums/user-role.enum';
import { generateId } from '@shared/utils/id.utils';
import { validateEmail } from '@shared/utils/validation.utils';
import { BusinessConstants } from '@shared/constants/business.constants';
import { ApiResponse } from '@shared/types/api.types';
```

#### **🚫 VIOLATIONS STRICTEMENT INTERDITES**

- ❌ **JAMAIS** de `../../../domain/entities/user.entity`
- ❌ **JAMAIS** de `../../application/use-cases/users/create-user.use-case`
- ❌ **JAMAIS** de `./repositories/typeorm-user.repository`
- ❌ **JAMAIS** de chemins relatifs dans AUCUN import
- ❌ **JAMAIS** mélanger alias et chemins relatifs dans le même fichier

#### **✅ AVANTAGES DES ALIAS**

1. **🧹 Lisibilité** : Code plus propre et compréhensible
2. **🔧 Maintenabilité** : Refactoring facilité
3. **🚀 Performance** : Résolution d'imports optimisée
4. **📁 Organisation** : Structure claire du projet
5. **🧪 Testabilité** : Mocking et stubbing simplifiés
6. **👥 Collaboration** : Standards équipe respectés

#### **🔍 DÉTECTION DES VIOLATIONS**

```bash
# Vérifier les imports relatifs interdits
grep -r "\.\./\.\./\.\." src/
# RÉSULTAT ATTENDU : Aucun résultat (0 ligne)

# Vérifier les imports relatifs courts interdits
grep -r "import.*\.\./" src/
# RÉSULTAT ATTENDU : Aucun résultat (0 ligne)

# Vérifier l'utilisation correcte des alias
grep -r "import.*@domain\|@application\|@infrastructure\|@presentation\|@shared" src/ | head -10
# RÉSULTAT ATTENDU : Nombreux imports avec alias
```

#### **📋 CHECKLIST OBLIGATOIRE AVANT COMMIT**

- [ ] ✅ **Tous les imports utilisent les alias** `@domain/*`, `@application/*`, etc.
- [ ] ✅ **Aucun chemin relatif** `../` dans les imports
- [ ] ✅ **Tests passent** avec les nouveaux imports
- [ ] ✅ **Build compile** sans erreur de résolution de modules
- [ ] ✅ **ESLint/TypeScript** ne signalent aucune erreur d'import
- [ ] ✅ **IDE reconnaît** correctement tous les imports
- [ ] ✅ **Auto-complete** fonctionne avec les alias
- [ ] ✅ **Refactoring safe** : renommage préservé

#### **🛠️ CONFIGURATION IDE RECOMMANDÉE**

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.suggest.includeAutomaticOptionalChainCompletions": true
}
```

#### **🚨 SANCTIONS POUR NON-RESPECT**

Le non-respect de cette règle entraîne :

- **Rejet automatique** du commit par Husky
- **Blocage de la CI/CD**
- **Review obligatoire** et refactoring immédiat
- **Formation supplémentaire** sur les bonnes pratiques TypeScript

**Cette règle garantit un code professionnel, maintenable et respectueux des standards TypeScript !**

## 🗄️ **RÈGLE CRITIQUE : MIGRATIONS TYPEORM ET DONNÉES EXISTANTES**

### 🎯 **RÈGLE FONDAMENTALE NON-NÉGOCIABLE : PRÉSERVER LES DONNÉES EXISTANTES**

**⚠️ RÈGLE CRITIQUE** : Toute migration TypeORM DOIT impérativement tenir compte des données déjà présentes en base de données. Cette règle est **NON-NÉGOCIABLE** pour éviter la corruption de données et les pannes en production.

#### **📋 PRINCIPE FONDAMENTAL : SAFETY-FIRST MIGRATIONS**

**TOUJOURS se demander avant chaque migration :**

1. **Y a-t-il déjà des données** dans cette table ?
2. **Comment préserver** l'intégrité des données existantes ?
3. **Les contraintes ajoutées** sont-elles compatibles avec les données actuelles ?
4. **Les colonnes supprimées** contiennent-elles des données critiques ?

#### **✅ PATTERNS OBLIGATOIRES SELON LE TYPE DE MIGRATION**

##### **🆕 AJOUT DE COLONNE - Gestion des Valeurs par Défaut**

```typescript
// ✅ OBLIGATOIRE - Colonne nullable ou avec valeur par défaut
export class AddPricingConfigToServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Vérifier l'existence avant ajout
    const columnExists = await queryRunner.hasColumn(
      `${schema}.services`,
      'pricing_config',
    );

    if (!columnExists) {
      // ✅ CORRECT - Colonne avec DEFAULT pour données existantes
      await queryRunner.query(`
        ALTER TABLE "${schema}"."services"
        ADD COLUMN "pricing_config" jsonb 
        DEFAULT '{"type":"FIXED","basePrice":{"amount":0,"currency":"EUR"}}'::jsonb
      `);

      // ✅ CORRECT - Mettre à jour les données existantes si nécessaire
      await queryRunner.query(`
        UPDATE "${schema}"."services"
        SET "pricing_config" = '{"type":"FIXED","basePrice":{"amount":50,"currency":"EUR"}}'::jsonb
        WHERE "pricing_config" IS NULL AND "is_active" = true
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ CORRECT - Vérifier avant suppression
    const columnExists = await queryRunner.hasColumn(
      `${schema}.services`,
      'pricing_config',
    );

    if (columnExists) {
      // ⚠️ ATTENTION - Sauvegarder les données critiques avant suppression
      await queryRunner.query(`
        -- Optionnel : Sauvegarder les données dans une table temporaire
        CREATE TABLE IF NOT EXISTS "${schema}"."services_pricing_backup" AS
        SELECT id, pricing_config FROM "${schema}"."services" 
        WHERE pricing_config IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "pricing_config"
      `);
    }
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

##### **🔧 MODIFICATION DE COLONNE - Gestion des Types et Contraintes**

```typescript
// ✅ OBLIGATOIRE - Transformation sécurisée des données
export class UpdateStatusEnumInServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Vérifier les données existantes
    const existingData = await queryRunner.query(`
      SELECT DISTINCT status FROM "${schema}"."services"
    `);

    console.log('Statuts existants avant migration:', existingData);

    // ✅ ÉTAPE 2 - Ajouter une colonne temporaire avec nouveau type
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "status_new" VARCHAR(20)
    `);

    // ✅ ÉTAPE 3 - Migrer les données avec mapping approprié
    await queryRunner.query(`
      UPDATE "${schema}"."services"
      SET "status_new" = CASE
        WHEN status = 'active' THEN 'ACTIVE'
        WHEN status = 'inactive' THEN 'INACTIVE'
        WHEN status = 'draft' THEN 'DRAFT'
        ELSE 'DRAFT' -- Valeur par défaut pour données inconnues
      END
    `);

    // ✅ ÉTAPE 4 - Supprimer ancienne colonne et renommer
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" DROP COLUMN "status"
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" 
      RENAME COLUMN "status_new" TO "status"
    `);

    // ✅ ÉTAPE 5 - Ajouter contraintes après transformation
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ALTER COLUMN "status" SET NOT NULL
    `);
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

##### **🗑️ SUPPRESSION DE COLONNE - Sauvegarde Obligatoire**

```typescript
// ✅ OBLIGATOIRE - Sauvegarde avant suppression
export class RemoveDeprecatedColumnsFromServices implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Vérifier s'il y a des données dans la colonne
    const dataCount = await queryRunner.query(`
      SELECT COUNT(*) as count FROM "${schema}"."services" 
      WHERE "deprecated_field" IS NOT NULL
    `);

    if (dataCount[0]?.count > 0) {
      // ✅ ÉTAPE 2 - Créer table de sauvegarde
      await queryRunner.query(`
        CREATE TABLE "${schema}"."services_deprecated_backup" AS
        SELECT id, deprecated_field, created_at
        FROM "${schema}"."services"
        WHERE deprecated_field IS NOT NULL
      `);

      console.log(
        `Sauvegarde de ${dataCount[0].count} enregistrements dans services_deprecated_backup`,
      );
    }

    // ✅ ÉTAPE 3 - Supprimer la colonne
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services" DROP COLUMN IF EXISTS "deprecated_field"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = this.getSchemaName();

    // ✅ ÉTAPE 1 - Recréer la colonne
    await queryRunner.query(`
      ALTER TABLE "${schema}"."services"
      ADD COLUMN "deprecated_field" VARCHAR(255)
    `);

    // ✅ ÉTAPE 2 - Restaurer les données depuis la sauvegarde
    const backupExists = await queryRunner.hasTable(
      `${schema}.services_deprecated_backup`,
    );

    if (backupExists) {
      await queryRunner.query(`
        UPDATE "${schema}"."services" 
        SET "deprecated_field" = backup."deprecated_field"
        FROM "${schema}"."services_deprecated_backup" backup
        WHERE "${schema}"."services".id = backup.id
      `);
    }
  }

  private getSchemaName(): string {
    return process.env.DB_SCHEMA || 'public';
  }
}
```

#### **🚨 WORKFLOW OBLIGATOIRE AVANT CHAQUE MIGRATION**

##### **1️⃣ AUDIT DES DONNÉES EXISTANTES (OBLIGATOIRE)**

```bash
# ✅ OBLIGATOIRE - Se connecter à la base et analyser les données
docker compose exec postgres-dev psql -U postgres -d appointment_system

-- Vérifier la structure actuelle
\dt+ schema_name.*

-- Analyser les données dans la table concernée
SELECT COUNT(*), column_name FROM table_name GROUP BY column_name;
SELECT DISTINCT column_name FROM table_name;
SELECT * FROM table_name LIMIT 10;
```

##### **2️⃣ PLAN DE MIGRATION SÉCURISÉ**

```typescript
// ✅ OBLIGATOIRE - Documenter le plan dans la migration
export class ExampleMigration implements MigrationInterface {
  name = 'ExampleMigration';

  /**
   * PLAN DE MIGRATION SÉCURISÉ
   *
   * 🎯 OBJECTIF : [Décrire l'objectif de la migration]
   *
   * 📊 DONNÉES EXISTANTES :
   * - Table "services" contient 150 enregistrements
   * - Colonne "status" : 120 'active', 25 'inactive', 5 'draft'
   * - Aucune valeur NULL dans "status"
   *
   * 🛡️ MESURES DE SÉCURITÉ :
   * - Vérification existence colonne avant modification
   * - Sauvegarde données critiques dans table temporaire
   * - Transformation progressive avec mapping explicite
   * - Rollback complet possible via méthode down()
   *
   * ⚠️ RISQUES IDENTIFIÉS :
   * - Perte de données si mapping incorrect
   * - Contraintes NOT NULL sur données existantes
   * - Temps d'exécution sur tables volumineuses
   *
   * ✅ TESTS EFFECTUÉS :
   * - Migration testée sur copie de base de développement
   * - Rollback vérifié et fonctionnel
   * - Performances acceptables (<5 secondes)
   */
}
```

##### **3️⃣ TESTS OBLIGATOIRES EN DÉVELOPPEMENT**

```bash
# ✅ WORKFLOW OBLIGATOIRE - Tester la migration
# 1. Sauvegarder la base actuelle
docker compose exec postgres-dev pg_dump -U postgres appointment_system > backup_pre_migration.sql

# 2. Appliquer la migration
docker compose exec app npm run migration:run

# 3. Vérifier les données après migration
docker compose exec postgres-dev psql -U postgres -d appointment_system -c "SELECT COUNT(*) FROM services;"

# 4. Tester le rollback
docker compose exec app npm run migration:revert

# 5. Vérifier que les données sont restaurées
docker compose exec postgres-dev psql -U postgres -d appointment_system -c "SELECT COUNT(*) FROM services;"

# 6. Re-appliquer si le test de rollback réussit
docker compose exec app npm run migration:run
```

#### **❌ INTERDICTIONS ABSOLUES - MIGRATIONS DESTRUCTRICES**

- ❌ **JAMAIS** `DROP COLUMN` sans sauvegarde des données
- ❌ **JAMAIS** `ALTER COLUMN ... NOT NULL` sans vérifier les données existantes
- ❌ **JAMAIS** `DROP TABLE` sans export complet des données
- ❌ **JAMAIS** de migration sans plan de rollback testé
- ❌ **JAMAIS** de transformation de type destructrice
- ❌ **JAMAIS** de migration sans vérification préalable des données
- ❌ **JAMAIS** ignorer les warnings sur les contraintes

#### **🎯 CHECKLIST OBLIGATOIRE POUR CHAQUE MIGRATION**

- [ ] ✅ **Analyse des données existantes** effectuée
- [ ] ✅ **Plan de migration** documenté dans le fichier
- [ ] ✅ **Vérifications d'existence** avant modifications
- [ ] ✅ **Valeurs par défaut** appropriées pour nouvelles colonnes
- [ ] ✅ **Sauvegarde automatique** des données critiques
- [ ] ✅ **Transformation progressive** pour modifications de type
- [ ] ✅ **Méthode down()** complète et testée
- [ ] ✅ **Tests de migration/rollback** en développement
- [ ] ✅ **Performance acceptable** sur données volumineuses
- [ ] ✅ **Documentation des risques** identifiés et mitigés

#### **📊 EXEMPLES CONCRETS PAR CAS D'USAGE**

##### **Cas 1 : Ajout de colonne obligatoire sur table peuplée**

```sql
-- ❌ INTERDIT - Causera des erreurs sur données existantes
ALTER TABLE services ADD COLUMN required_field VARCHAR(50) NOT NULL;

-- ✅ CORRECT - Progression en 3 étapes
-- Étape 1 : Ajouter colonne nullable avec défaut
ALTER TABLE services ADD COLUMN required_field VARCHAR(50) DEFAULT 'DEFAULT_VALUE';

-- Étape 2 : Mettre à jour les données existantes
UPDATE services SET required_field = 'APPROPRIATE_VALUE' WHERE required_field IS NULL;

-- Étape 3 : Ajouter contrainte NOT NULL
ALTER TABLE services ALTER COLUMN required_field SET NOT NULL;
```

##### **Cas 2 : Changement de type avec données existantes**

```sql
-- ❌ INTERDIT - Perte de données garantie
ALTER TABLE services ALTER COLUMN price TYPE INTEGER;

-- ✅ CORRECT - Colonne temporaire et migration
ALTER TABLE services ADD COLUMN price_new INTEGER;
UPDATE services SET price_new = CAST(price AS INTEGER) WHERE price ~ '^[0-9]+$';
UPDATE services SET price_new = 0 WHERE price_new IS NULL; -- Défaut sécurisé
ALTER TABLE services DROP COLUMN price;
ALTER TABLE services RENAME COLUMN price_new TO price;
```

#### **🚨 SANCTIONS POUR NON-RESPECT**

Le non-respect de cette règle entraîne :

- **Blocage immédiat** de la migration en production
- **Corruption potentielle** des données critiques
- **Rollback d'urgence** et investigation complète
- **Review obligatoire** de toutes les migrations futures
- **Formation supplémentaire** sur les bonnes pratiques

**Cette règle est CRITIQUE pour la sécurité et l'intégrité des données !**
