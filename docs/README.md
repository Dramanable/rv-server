# � Complete API Documentation Hub

Welcome to the **Appointment Management System API** documentation - your one-stop resource for integrating with our enterprise-grade backend.

## 🚀 Quick Access

### 📖 Main Documentation Files

- **[🎯 API Documentation Hub](API_DOCUMENTATION_HUB.md)** - Complete overview and navigation
- **[📋 Complete API Reference](API_COMPLETE_DOCUMENTATION.md)** - Full endpoint documentation
- **[🎨 Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)** - React, Vue, Angular examples
- **[🧪 Testing Guide](API_TESTING_GUIDE.md)** - cURL, Postman, testing workflows
- **[📝 TypeScript Types](TYPESCRIPT_TYPES.md)** - Complete type definitions

### 🏛️ Architecture Documentation

- **[🎯 Clean Architecture](CLEAN_ARCHITECTURE_DEPENDENCIES.md)** - Domain-driven design
- **[🗄️ Database Architecture](DATABASE_ARCHITECTURE.md)** - Schema and relationships
- **[� Migration Guide](MIGRATIONS.md)** - Database version control

## 🌐 Live Documentation

### Interactive Swagger UI

```
🌐 API Documentation: http://localhost:3000/api/docs
📊 JSON Schema: http://localhost:3000/api/docs-json
💾 Download Collection: curl http://localhost:3000/api/docs-json > collection.json
```

### Scripts Available

```bash
# Generate Swagger JSON documentation
npm run swagger:generate

# Validate generated documentation
npm run swagger:validate
```

## 📁 Fichiers Générés

- **`swagger.json`** - Documentation OpenAPI 3.0 complète en format JSON
- **`swagger-stats.json`** - Statistiques de génération (nombre d'endpoints, schémas, etc.)

## 📊 Contenu de la Documentation

### 🔐 Endpoints d'Authentification

- `POST /api/v1/auth/login` - Connexion utilisateur (définit les cookies HttpOnly)
- `POST /api/v1/auth/refresh` - Renouvellement automatique des tokens
- `POST /api/v1/auth/logout` - Déconnexion (efface les cookies)

### 👥 Endpoints de Gestion Utilisateurs

- `GET /api/v1/users` - Recherche et liste des utilisateurs
- `POST /api/v1/users` - Création d'un nouvel utilisateur
- `GET /api/v1/users/{id}` - Récupération d'un utilisateur par ID
- `PUT /api/v1/users/{id}` - Mise à jour d'un utilisateur
- `DELETE /api/v1/users/{id}` - Suppression d'un utilisateur

### 🏥 Endpoints de Santé

- `GET /health` - Vérification de l'état de l'application

## 🔧 Sécurité

La documentation inclut deux méthodes d'authentification :

1. **Cookie Authentication** (`Cookie-auth`) - **RECOMMANDÉ**
   - Cookies HttpOnly sécurisés
   - Gestion automatique des tokens
   - Protection CSRF intégrée
   - Sécurité renforcée contre les attaques XSS

2. **JWT Bearer Token** (`JWT-auth`) - **Support Legacy**
   - Format : `Bearer <token>`
   - Principalement pour compatibilité

3. **API Key** (`api-key`)
   - Header : `X-API-Key`
   - Utilisé pour l'authentification service-à-service

### 🍪 **Authentification par Cookies (Recommandée)**

Cette API utilise des **cookies HttpOnly** pour l'authentification au lieu des headers Authorization traditionnels.

**Avantages :**

- 🔒 **Sécurité renforcée** : Les tokens ne sont pas accessibles via JavaScript
- 🚀 **Gestion automatique** : Pas de gestion manuelle des tokens côté client
- 🛡️ **Protection CSRF** : Intégration avec les mécanismes de protection CSRF
- ⚡ **Simplicité** : Login/logout transparents pour le client

## 📋 Schémas de Données

### UserResponse

Représentation d'un utilisateur dans les réponses API.

### CreateUserRequest

Données requises pour créer un nouvel utilisateur.

### UpdateUserRequest

Données optionnelles pour mettre à jour un utilisateur existant.

## 🎯 Extensions Personnalisées

Le document OpenAPI inclut des extensions personnalisées :

- `x-api-version` - Version de l'API
- `x-build-time` - Timestamp de génération
- `x-architecture` - Architecture utilisée (Clean Architecture + NestJS)
- `x-features` - Liste des fonctionnalités principales

## 📝 Utilisation

### Avec Swagger UI

1. Démarrer l'application : `npm run start:dev`
2. Accéder à la documentation interactive : `http://localhost:3000/api/docs`

### Avec des Outils Externes

Le fichier `swagger.json` peut être utilisé avec :

- **Postman** - Import de collection
- **Insomnia** - Import de workspace
- **Swagger Editor** - Édition en ligne
- **Swagger Codegen** - Génération de clients SDK

### Exemples d'Utilisation

```bash
# Importer dans Postman
curl -o postman-collection.json http://localhost:3000/api/docs-json

# Utiliser avec swagger-codegen
swagger-codegen generate -i docs/swagger.json -l typescript-angular -o ./generated-client

# Valider avec swagger-parser
npx @apidevtools/swagger-parser validate docs/swagger.json
```

## 🔄 Automatisation

### CI/CD Integration

Ajoutez ces étapes à votre pipeline CI/CD :

```yaml
- name: Generate API Documentation
  run: npm run swagger:generate

- name: Validate API Documentation
  run: npm run swagger:validate

- name: Upload Documentation Artifacts
  uses: actions/upload-artifact@v3
  with:
    name: api-documentation
    path: docs/
```

### Pre-commit Hook

Pour générer automatiquement la documentation avant chaque commit :

```bash
# .husky/pre-commit
npm run swagger:generate
git add docs/
```

## 📈 Statistiques de Génération

Le fichier `swagger-stats.json` contient :

- **totalPaths** - Nombre de chemins d'API
- **totalOperations** - Nombre total d'opérations HTTP
- **totalSchemas** - Nombre de schémas de données
- **totalTags** - Nombre de tags organisationnels
- **generatedAt** - Timestamp de génération
- **fileSize** - Taille du fichier JSON généré

## 🚀 API Features Documentées

- 🔐 **JWT Authentication** - Authentification sécurisée
- 🛡️ **Role-Based Access Control** - Contrôle d'accès par rôles
- 🔑 **Password Security** - Gestion sécurisée des mots de passe
- 📊 **Audit Trail** - Traçabilité des actions
- 🌍 **Internationalization** - Support multi-langue
- 🎯 **Type Safety** - Sécurité des types TypeScript
- 🧪 **TDD Coverage** - Couverture de tests complète

---

_Documentation générée automatiquement par le script `generate-swagger-simple.ts`_
