# 🎯 Professional Roles APIs - Swagger Documentation

## 📋 Overview

Documentation complète des APIs de gestion des rôles professionnels avec système de catégories flexibles pour l'MVP.

## 🏗️ Architecture Implementation Status

### ✅ **Professional Roles - 100% Complete TDD Workflow**

- **Domain** : ✅ ProfessionalRole Entity + Value Objects + Repository Interface + Exceptions
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List) with TDD tests
- **Infrastructure** : ✅ ProfessionalRoleOrmEntity + TypeOrmProfessionalRoleRepository + Mappers + Migration
- **Presentation** : ✅ ProfessionalRoleController + All DTOs with flexible category validation + Swagger documentation

## 🎯 Professional Role APIs

### **POST /api/v1/professional-roles/list**

**Description** : Recherche avancée paginée des rôles professionnels
**Security** : Requires JWT authentication + MANAGE_PROFESSIONAL_ROLES permission
**MVP Features** : Catégories flexibles (string), support de tri et filtrage avancé

**Request Body** :

```json
{
  "page": 1,
  "limit": 20,
  "sortBy": "name",
  "sortOrder": "asc",
  "search": "specialist",
  "category": "SERVICE_PROVIDER",
  "isActive": true,
  "canLead": false
}
```

**Response** :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-professional-role-1",
      "code": "SPECIALIST",
      "name": "Specialist",
      "displayName": "Spécialiste",
      "category": "SERVICE_PROVIDER",
      "description": "Professionnel spécialisé dans un domaine particulier",
      "canLead": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **GET /api/v1/professional-roles/:id**

**Description** : Récupérer un rôle professionnel par ID
**Security** : Requires JWT authentication + READ_PROFESSIONAL_ROLES permission

**Response** :

```json
{
  "success": true,
  "data": {
    "id": "uuid-professional-role-1",
    "code": "SPECIALIST",
    "name": "Specialist",
    "displayName": "Spécialiste",
    "category": "SERVICE_PROVIDER",
    "description": "Professionnel spécialisé dans un domaine particulier",
    "canLead": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### **POST /api/v1/professional-roles**

**Description** : Créer un nouveau rôle professionnel
**Security** : Requires JWT authentication + MANAGE_PROFESSIONAL_ROLES permission
**MVP Features** : Catégorie flexible (2-50 caractères), validation côté serveur

**Request Body** :

```json
{
  "code": "CONSULTANT",
  "name": "Consultant",
  "displayName": "Consultant Spécialisé",
  "category": "CONSULTANT",
  "description": "Consultant externe spécialisé dans le domaine",
  "canLead": false
}
```

**Response** :

```json
{
  "success": true,
  "data": {
    "id": "uuid-professional-role-new",
    "code": "CONSULTANT",
    "name": "Consultant",
    "displayName": "Consultant Spécialisé",
    "category": "CONSULTANT",
    "description": "Consultant externe spécialisé dans le domaine",
    "canLead": false,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### **PUT /api/v1/professional-roles/:id**

**Description** : Mettre à jour un rôle professionnel existant
**Security** : Requires JWT authentication + MANAGE_PROFESSIONAL_ROLES permission

**Request Body** :

```json
{
  "name": "Senior Consultant",
  "displayName": "Consultant Senior",
  "description": "Consultant senior avec plus de 5 ans d'expérience",
  "canLead": true
}
```

**Response** :

```json
{
  "success": true,
  "data": {
    "id": "uuid-professional-role-updated",
    "code": "CONSULTANT",
    "name": "Senior Consultant",
    "displayName": "Consultant Senior",
    "category": "CONSULTANT",
    "description": "Consultant senior avec plus de 5 ans d'expérience",
    "canLead": true,
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

### **DELETE /api/v1/professional-roles/:id**

**Description** : Supprimer un rôle professionnel (soft delete)
**Security** : Requires JWT authentication + MANAGE_PROFESSIONAL_ROLES permission

**Response** :

```json
{
  "success": true,
  "message": "Professional role deleted successfully"
}
```

## 🚨 Error Responses

### **400 - Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "PROFESSIONAL_ROLE_INVALID_DATA",
    "message": "Invalid professional role data provided",
    "field": "category",
    "details": "Category must be between 2 and 50 characters",
    "timestamp": "2024-01-15T10:00:00Z",
    "path": "/api/v1/professional-roles",
    "correlationId": "req_123456789"
  }
}
```

### **401 - Unauthorized**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "JWT token is required",
    "timestamp": "2024-01-15T10:00:00Z",
    "path": "/api/v1/professional-roles",
    "correlationId": "req_123456789"
  }
}
```

### **403 - Forbidden**

```json
{
  "success": false,
  "error": {
    "code": "PROFESSIONAL_ROLE_PERMISSION_DENIED",
    "message": "You don't have permission to manage professional roles",
    "timestamp": "2024-01-15T10:00:00Z",
    "path": "/api/v1/professional-roles",
    "correlationId": "req_123456789"
  }
}
```

### **404 - Not Found**

```json
{
  "success": false,
  "error": {
    "code": "PROFESSIONAL_ROLE_NOT_FOUND",
    "message": "Professional role not found",
    "timestamp": "2024-01-15T10:00:00Z",
    "path": "/api/v1/professional-roles/invalid-id",
    "correlationId": "req_123456789"
  }
}
```

### **409 - Conflict**

```json
{
  "success": false,
  "error": {
    "code": "PROFESSIONAL_ROLE_CODE_ALREADY_EXISTS",
    "message": "A professional role with this code already exists",
    "field": "code",
    "timestamp": "2024-01-15T10:00:00Z",
    "path": "/api/v1/professional-roles",
    "correlationId": "req_123456789"
  }
}
```

## 🔐 Authentication & Authorization

### **JWT Bearer Token Required**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -X POST http://localhost:3000/api/v1/professional-roles/list
```

### **Required Permissions**

- **READ_PROFESSIONAL_ROLES** : Pour GET /professional-roles/:id et POST /professional-roles/list
- **MANAGE_PROFESSIONAL_ROLES** : Pour POST, PUT, DELETE operations

### **Permission Scoping**

- **BUSINESS_ADMIN** : Peut gérer tous les rôles de son business
- **PLATFORM_ADMIN** : Peut gérer tous les rôles de la plateforme
- **PRACTITIONER** : Lecture seule de ses propres rôles assignés

## 📊 Validation Rules

### **Create Professional Role**

- **code** : Requis, 2-20 caractères, unique, converti en majuscules
- **name** : Requis, 2-100 caractères, espaces trimés
- **displayName** : Requis, 2-100 caractères
- **category** : Requis, 2-50 caractères (MVP : flexible string)
- **description** : Requis, 10-500 caractères
- **canLead** : Optionnel, booléen, false par défaut

### **Update Professional Role**

- **name** : Optionnel, 2-100 caractères si fourni
- **displayName** : Optionnel, 2-100 caractères si fourni
- **description** : Optionnel, 10-500 caractères si fourni
- **canLead** : Optionnel, booléen si fourni
- **Note** : Le code et la catégorie ne peuvent pas être modifiés après création

### **List Professional Roles**

- **page** : Optionnel, >= 1, défaut 1
- **limit** : Optionnel, 1-100, défaut 20
- **sortBy** : Optionnel, ['name', 'code', 'category', 'createdAt'], défaut 'name'
- **sortOrder** : Optionnel, ['asc', 'desc'], défaut 'asc'

## 🎯 Business Rules

### **MVP Flexibility Rules**

1. **Catégories Neutres** : Pas de spécialisation médicale, rôles génériques
2. **Catégories Flexibles** : Accepte tout string de 2-50 caractères
3. **Extension Future** : Architecture prête pour spécialisations métier

### **Code Uniqueness**

- Le code doit être unique dans toute la plateforme
- Validation case-insensitive (DOCTOR = doctor)
- Normalisation automatique en majuscules

### **Hierarchy & Leadership**

- `canLead: true` indique un rôle de leadership
- Les rôles de leadership peuvent superviser d'autres rôles
- Un business doit avoir au moins un rôle avec `canLead: true`

### **Status Management**

- Nouveaux rôles créés avec `isActive: true`
- Soft delete : `isActive: false` au lieu de suppression
- Rôles inactifs non disponibles pour nouvelles assignations

## 📈 Performance & Scalability

### **Pagination Optimisée**

- Pagination par offset/limit avec métadonnées complètes
- Index sur code, name, category, isActive
- Recherche full-text sur name et description

### **Caching Strategy**

- Cache Redis pour les rôles fréquemment consultés
- TTL 15 minutes pour les listes paginées
- Invalidation automatique lors des modifications

### **Database Indexes**

```sql
-- Migration-generated indexes for optimal performance
CREATE INDEX idx_professional_roles_code ON professional_roles(code);
CREATE INDEX idx_professional_roles_category ON professional_roles(category);
CREATE INDEX idx_professional_roles_active ON professional_roles(is_active);
CREATE INDEX idx_professional_roles_can_lead ON professional_roles(can_lead);
```

## 🔧 Swagger Integration

### **Swagger UI URLs**

- **Local Development** : http://localhost:3000/api/docs
- **API Documentation** : http://localhost:3000/api/docs-json
- **OpenAPI Spec** : http://localhost:3000/api/docs-yaml

### **Swagger Features**

- **Try It Out** : Tester directement les APIs
- **Authentication** : Support JWT Bearer dans l'interface
- **Request/Response Examples** : Exemples complets pour chaque endpoint
- **Schema Validation** : Validation en temps réel des requêtes

### **Integration Frontend**

```typescript
// React/Vue.js Example avec TypeScript
interface ProfessionalRoleFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  canLead?: boolean;
}

const searchProfessionalRoles = async (filters: ProfessionalRoleFilters) => {
  const response = await api.post('/api/v1/professional-roles/list', {
    ...filters,
    page: filters.page || 1,
    limit: filters.limit || 20,
  });

  return {
    roles: response.data.data,
    pagination: response.data.meta,
  };
};

// Create Professional Role
const createProfessionalRole = async (roleData: CreateProfessionalRoleDto) => {
  const response = await api.post('/api/v1/professional-roles', roleData);
  return response.data.data;
};
```

## 🎯 MVP Implementation Notes

### **Neutral Categories**

L'MVP utilise des catégories neutres et flexibles :

- **PRIMARY** : Rôles principaux de prestation
- **SUPPORT** : Rôles de support et assistance
- **MANAGEMENT** : Rôles de gestion et supervision
- **CONSULTANT** : Rôles de conseil externe
- **CUSTOM** : Catégories personnalisées par business

### **Future Extensions**

Architecture prête pour :

- Spécialisations métier (médical, juridique, etc.)
- Templates de rôles par secteur d'activité
- Hiérarchies complexes de rôles
- Certifications et compétences requises
- Permissions granulaires par rôle

### **Business Configuration**

Le business peut définir :

- Ses propres catégories de rôles
- Les hiérarchies de supervision
- Les permissions par rôle
- Les certifications requises
- Les templates de création rapide
