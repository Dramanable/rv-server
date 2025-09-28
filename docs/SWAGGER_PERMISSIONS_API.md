# 🔐 Permissions APIs - Documentation Swagger Complète

## 📋 Overview

Documentation complète des APIs de gestion des permissions du système d'appointment avec filtrage avancé, pagination, et sécurité.

## 🏗️ Architecture Implementation Status

### ✅ **Permissions - 100% Complete**

- **Domain** : ✅ Permission Entity + Value Objects + Repository Interface + Exceptions
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List)
- **Infrastructure** : ✅ PermissionOrmEntity + TypeOrmPermissionRepository + Mappers + Migration
- **Presentation** : ✅ PermissionController + All DTOs with Swagger documentation

## 🎯 Permissions APIs

### **POST /api/v1/permissions/list**

**Description** : 🔍 Recherche avancée paginée des permissions avec système de filtrage complet

**Security** : Requires JWT authentication + MANAGE_PERMISSIONS permission

**Request Body** :

```json
{
  "page": 1,
  "limit": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "search": "MANAGE",
  "filters": {
    "category": "BUSINESS",
    "isActive": true,
    "isSystemPermission": false
  }
}
```

**Response 200** :

```json
{
  "success": true,
  "data": [
    {
      "id": "perm-uuid-123",
      "name": "MANAGE_BUSINESS",
      "displayName": "Gérer les entreprises",
      "description": "Permet de créer, modifier et supprimer les entreprises",
      "category": "BUSINESS",
      "isSystemPermission": false,
      "isActive": true,
      "createdAt": "2023-12-01T10:00:00.000Z",
      "updatedAt": "2023-12-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **GET /api/v1/permissions/:id**

**Description** : 📄 Récupérer une permission par son ID

**Parameters** :

- `id` (path, required) : UUID de la permission

**Security** : Requires JWT authentication + READ_PERMISSIONS permission

**Response 200** :

```json
{
  "id": "perm-uuid-123",
  "name": "MANAGE_APPOINTMENTS",
  "displayName": "Gérer les rendez-vous",
  "description": "Permet de créer, modifier et annuler les rendez-vous",
  "category": "APPOINTMENTS",
  "isSystemPermission": false,
  "isActive": true,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

**Response 404** :

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_NOT_FOUND",
    "message": "Permission not found"
  }
}
```

### **POST /api/v1/permissions**

**Description** : ➕ Créer une nouvelle permission

**Security** : Requires JWT authentication + MANAGE_PERMISSIONS permission

**Request Body** :

```json
{
  "name": "MANAGE_SERVICES",
  "displayName": "Gérer les services",
  "description": "Permet de créer, modifier et supprimer les services offerts",
  "category": "SERVICES",
  "isSystemPermission": false
}
```

**Response 201** :

```json
{
  "success": true,
  "data": {
    "id": "perm-uuid-new",
    "name": "MANAGE_SERVICES",
    "displayName": "Gérer les services",
    "description": "Permet de créer, modifier et supprimer les services offerts",
    "category": "SERVICES",
    "isSystemPermission": false,
    "isActive": true,
    "createdAt": "2023-12-01T14:30:00.000Z",
    "updatedAt": "2023-12-01T14:30:00.000Z"
  }
}
```

**Response 409** :

```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_ALREADY_EXISTS",
    "message": "A permission with this name already exists"
  }
}
```

### **PUT /api/v1/permissions/:id**

**Description** : ✏️ Mettre à jour une permission existante

**Parameters** :

- `id` (path, required) : UUID de la permission

**Security** : Requires JWT authentication + MANAGE_PERMISSIONS permission

**Request Body** :

```json
{
  "displayName": "Gérer tous les services",
  "description": "Permet de créer, modifier, supprimer et configurer tous les services"
}
```

**Response 200** :

```json
{
  "success": true,
  "data": {
    "id": "perm-uuid-123",
    "name": "MANAGE_SERVICES",
    "displayName": "Gérer tous les services",
    "description": "Permet de créer, modifier, supprimer et configurer tous les services",
    "category": "SERVICES",
    "isSystemPermission": false,
    "isActive": true,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T14:45:00.000Z"
  }
}
```

### **DELETE /api/v1/permissions/:id**

**Description** : 🗑️ Supprimer une permission (si non système)

**Parameters** :

- `id` (path, required) : UUID de la permission

**Security** : Requires JWT authentication + MANAGE_PERMISSIONS permission

**Response 200** :

```json
{
  "success": true,
  "message": "Permission deleted successfully"
}
```

**Response 400** - Permission système :

```json
{
  "success": false,
  "error": {
    "code": "SYSTEM_PERMISSION_MODIFICATION_ERROR",
    "message": "Cannot delete system permission"
  }
}
```

## 🚨 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Localized error message",
    "details": "Technical details (dev mode only)",
    "field": "fieldName",
    "timestamp": "2023-12-01T10:00:00.000Z",
    "path": "/api/v1/permissions",
    "correlationId": "req-uuid-123"
  }
}
```

### Error Codes

- `PERMISSION_NOT_FOUND` (404) : Permission non trouvée
- `PERMISSION_ALREADY_EXISTS` (409) : Permission avec ce nom existe déjà
- `SYSTEM_PERMISSION_MODIFICATION_ERROR` (400) : Tentative de modification d'une permission système
- `INVALID_PERMISSION_DATA` (400) : Données de permission invalides
- `INSUFFICIENT_PERMISSIONS` (403) : Permissions insuffisantes
- `AUTHENTICATION_REQUIRED` (401) : Authentification requise

## 🔐 Authentication & Authorization

### JWT Requirements

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Required Permissions

- **List Permissions** : `READ_PERMISSIONS` ou `MANAGE_PERMISSIONS`
- **Get Permission** : `READ_PERMISSIONS` ou `MANAGE_PERMISSIONS`
- **Create Permission** : `MANAGE_PERMISSIONS`
- **Update Permission** : `MANAGE_PERMISSIONS`
- **Delete Permission** : `MANAGE_PERMISSIONS`

## 📊 Validation Rules

### CreatePermissionDto

- `name` : 3-100 caractères, unique, format UPPER_SNAKE_CASE
- `displayName` : 3-200 caractères
- `description` : 10-1000 caractères
- `category` : Enum ['BUSINESS', 'STAFF', 'SERVICES', 'APPOINTMENTS', 'USERS', 'SYSTEM']
- `isSystemPermission` : Boolean, optionnel (défaut: false)

### UpdatePermissionDto

- `displayName` : Optionnel, 3-200 caractères
- `description` : Optionnel, 10-1000 caractères
- Note : `name` et `isSystemPermission` non modifiables

### ListPermissionsDto

- `page` : Optionnel, min 1, défaut 1
- `limit` : Optionnel, 1-100, défaut 10
- `sortBy` : Optionnel, ['name', 'displayName', 'category', 'createdAt']
- `sortOrder` : Optionnel, ['asc', 'desc'], défaut 'asc'
- `search` : Optionnel, recherche dans name/displayName/description
- `filters.category` : Optionnel, filtrage par catégorie
- `filters.isActive` : Optionnel, filtrage par statut
- `filters.isSystemPermission` : Optionnel, filtrage par type

## 🎯 Business Rules

### Permission Creation

- Le nom doit être unique dans le système
- Les noms suivent la convention UPPER_SNAKE_CASE
- Les permissions système ne peuvent être créées que par le système
- Toutes les permissions sont actives par défaut

### Permission Update

- Seuls displayName et description peuvent être modifiés
- Les permissions système ne peuvent pas être modifiées via API
- Les modifications sont auditées avec traçabilité

### Permission Deletion

- Les permissions système ne peuvent pas être supprimées
- La suppression vérifie qu'aucun rôle n'utilise la permission
- La suppression est définitive (pas de soft delete)

### System Permissions

Permissions pré-créées lors de la migration :

- `MANAGE_SYSTEM` - Gestion système complète
- `MANAGE_BUSINESS` - Gestion des entreprises
- `MANAGE_USERS` - Gestion des utilisateurs
- `MANAGE_PERMISSIONS` - Gestion des permissions
- `READ_PERMISSIONS` - Lecture des permissions

## 📈 Performance & Scalability

### Pagination

- Limite maximum : 100 éléments par page
- Page par défaut : 1
- Métadonnées complètes dans chaque réponse

### Caching

- Cache Redis pour les permissions système (TTL : 1h)
- Cache des listes fréquemment accédées
- Invalidation automatique lors des modifications

### Database Indexing

- Index unique sur `name`
- Index composé sur `category + isActive`
- Index GIN sur colonnes de recherche textuelle

## 🔧 Swagger Integration

### Base URL

```
http://localhost:3000/api/docs
```

### Swagger Tags

- **🔐 Permissions Management** : Gestion complète des permissions

### Authorization

Configuré avec `@ApiBearerAuth()` pour tous les endpoints

### Try It Out

Tous les endpoints sont testables directement depuis l'interface Swagger avec authentification JWT.

## 📱 Frontend Integration Examples

### React/TypeScript

```typescript
// Types générés automatiquement
interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: PermissionCategory;
  isSystemPermission: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook personnalisé
const usePermissions = () => {
  const listPermissions = async (filters: ListPermissionsDto) => {
    const response = await api.post('/api/v1/permissions/list', filters);
    return response.data;
  };

  const createPermission = async (data: CreatePermissionDto) => {
    const response = await api.post('/api/v1/permissions', data);
    return response.data;
  };

  return { listPermissions, createPermission };
};
```

### Vue.js/Composition API

```typescript
import { ref, reactive } from 'vue';

export const usePermissionStore = () => {
  const permissions = ref<Permission[]>([]);
  const loading = ref(false);

  const filters = reactive({
    page: 1,
    limit: 20,
    search: '',
    category: null,
  });

  const fetchPermissions = async () => {
    loading.value = true;
    try {
      const response = await $api.permissions.list(filters);
      permissions.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    permissions,
    loading,
    filters,
    fetchPermissions,
  };
};
```

## 🧪 Testing

### Test Categories

- **Unit Tests** : Entité Permission + Use Cases
- **Integration Tests** : Repository + Database
- **E2E Tests** : Controller + Full workflow
- **Security Tests** : Authentication + Authorization

### Postman Collection

Collection complète disponible via export Swagger JSON :

```
GET /api/docs-json
```

---

**Documentation générée automatiquement le 2023-12-01**
**Version API : 2.0**
**Support : Exemples complets et intégration frontend inclus**
