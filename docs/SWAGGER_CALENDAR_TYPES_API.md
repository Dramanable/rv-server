# 🎯 Calendar Types APIs - Swagger Documentation

## 📋 Overview

Système de gestion des types de calendriers pour l'application de rendez-vous. Cette API permet de créer, configurer et gérer différents types de calendriers selon les besoins métier des professionnels.

## 🏗️ Architecture Implementation Status

### ✅ **CalendarType - 100% Complete**

- **Domain** : ✅ CalendarType Entity + Value Objects + Repository Interface
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List)
- **Infrastructure** : ✅ CalendarTypeOrmEntity + TypeOrmCalendarTypeRepository + Mappers + Migration
- **Presentation** : ✅ CalendarTypesController + All DTOs with Swagger documentation

## 🎯 Calendar Types APIs

### **POST /api/v1/calendar-types/list**

**Description** : Recherche avancée paginée des types de calendriers
**Security** : Requires JWT authentication
**Request Body** :

```json
{
  "page": 1,
  "limit": 10,
  "sortBy": "name",
  "sortOrder": "asc",
  "search": "consultation",
  "isActive": true
}
```

**Response** :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-calendar-type-1",
      "businessId": "uuid-business-1",
      "name": "Consultations Médicales",
      "description": "Calendrier pour les consultations médicales standard",
      "color": "#4CAF50",
      "isActive": true,
      "settings": {
        "defaultDuration": 30,
        "allowOverlap": false,
        "requireConfirmation": true,
        "maxAdvanceBooking": 30,
        "bufferTime": 15,
        "customFields": []
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### **GET /api/v1/calendar-types/:id**

**Description** : Récupérer un type de calendrier par son ID
**Security** : Requires JWT authentication
**Response** :

```json
{
  "success": true,
  "data": {
    "id": "uuid-calendar-type-1",
    "businessId": "uuid-business-1",
    "name": "Consultations Médicales",
    "description": "Calendrier pour les consultations médicales standard",
    "color": "#4CAF50",
    "isActive": true,
    "settings": {
      "defaultDuration": 30,
      "allowOverlap": false,
      "requireConfirmation": true,
      "maxAdvanceBooking": 30,
      "bufferTime": 15,
      "customFields": [
        {
          "name": "Motif consultation",
          "type": "text",
          "required": true
        }
      ]
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### **POST /api/v1/calendar-types**

**Description** : Créer un nouveau type de calendrier
**Security** : Requires JWT authentication
**Request Body** :

```json
{
  "name": "Consultations Spécialisées",
  "description": "Calendrier pour les consultations spécialisées avec préparation",
  "color": "#2196F3",
  "settings": {
    "defaultDuration": 60,
    "allowOverlap": false,
    "requireConfirmation": true,
    "maxAdvanceBooking": 60,
    "bufferTime": 30,
    "customFields": [
      {
        "name": "Type de consultation",
        "type": "select",
        "options": ["Première visite", "Suivi", "Urgence"],
        "required": true
      }
    ]
  }
}
```

**Response** :

```json
{
  "success": true,
  "data": {
    "id": "uuid-new-calendar-type",
    "businessId": "uuid-business-1",
    "name": "Consultations Spécialisées",
    "description": "Calendrier pour les consultations spécialisées avec préparation",
    "color": "#2196F3",
    "isActive": true,
    "settings": {
      "defaultDuration": 60,
      "allowOverlap": false,
      "requireConfirmation": true,
      "maxAdvanceBooking": 60,
      "bufferTime": 30,
      "customFields": [
        {
          "name": "Type de consultation",
          "type": "select",
          "options": ["Première visite", "Suivi", "Urgence"],
          "required": true
        }
      ]
    },
    "createdAt": "2024-09-24T22:15:00Z",
    "updatedAt": "2024-09-24T22:15:00Z"
  }
}
```

### **PUT /api/v1/calendar-types/:id**

**Description** : Mettre à jour un type de calendrier existant
**Security** : Requires JWT authentication
**Request Body** :

```json
{
  "name": "Consultations Médicales Modifiées",
  "description": "Description mise à jour",
  "color": "#FF9800",
  "isActive": false,
  "settings": {
    "defaultDuration": 45,
    "allowOverlap": true,
    "requireConfirmation": false,
    "maxAdvanceBooking": 45,
    "bufferTime": 10,
    "customFields": []
  }
}
```

### **DELETE /api/v1/calendar-types/:id**

**Description** : Supprimer un type de calendrier
**Security** : Requires JWT authentication
**Response** :

```json
{
  "success": true,
  "message": "Calendar type deleted successfully"
}
```

## 🚨 Error Responses

### **400 - Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_TYPE_INVALID_DATA",
    "message": "Données invalides",
    "field": "name"
  }
}
```

### **401 - Unauthorized**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentification requise"
  }
}
```

### **403 - Forbidden**

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_TYPE_PERMISSION_DENIED",
    "message": "Permissions insuffisantes"
  }
}
```

### **404 - Not Found**

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_TYPE_NOT_FOUND",
    "message": "Type de calendrier introuvable"
  }
}
```

### **409 - Conflict**

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_TYPE_DUPLICATE_NAME",
    "message": "Un type de calendrier avec ce nom existe déjà"
  }
}
```

## 🔐 Authentication & Authorization

### **JWT Token**

Toutes les APIs nécessitent un token JWT valide :

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Permissions**

- **CREATE_CALENDAR_TYPE** : Créer de nouveaux types
- **READ_CALENDAR_TYPE** : Consulter les types existants
- **UPDATE_CALENDAR_TYPE** : Modifier les types existants
- **DELETE_CALENDAR_TYPE** : Supprimer des types

### **Business Scoping**

Les utilisateurs ne peuvent accéder qu'aux types de calendriers de leur entreprise (businessId).

## 📊 Validation Rules

### **Name**

- **Type** : String
- **Length** : 2-100 characters
- **Required** : Yes
- **Unique** : Per business

### **Description**

- **Type** : String
- **Length** : 0-500 characters
- **Required** : No

### **Color**

- **Type** : String
- **Format** : Hex color (#RRGGBB)
- **Required** : Yes
- **Default** : #4CAF50

### **Settings**

- **defaultDuration** : Number (1-480 minutes)
- **allowOverlap** : Boolean
- **requireConfirmation** : Boolean
- **maxAdvanceBooking** : Number (1-365 days)
- **bufferTime** : Number (0-120 minutes)
- **customFields** : Array of field definitions

## 🎯 Business Rules

### **Active Status**

- Seuls les types de calendriers actifs peuvent être utilisés pour créer des rendez-vous
- La désactivation n'affecte pas les rendez-vous existants

### **Settings Configuration**

- La durée par défaut doit être cohérente avec les créneaux de disponibilité
- Le temps de battement (bufferTime) s'applique entre chaque rendez-vous
- Les champs personnalisés permettent de collecter des informations spécifiques

### **Color Management**

- Chaque type a une couleur unique pour l'affichage calendaire
- Les couleurs doivent respecter les standards d'accessibilité

## 📈 Performance & Scalability

### **Pagination**

- Limite maximum : 100 éléments par page
- Pagination par défaut : 10 éléments
- Index sur businessId + name pour performance

### **Caching**

- Cache Redis des types actifs par business (TTL: 1h)
- Invalidation automatique lors des modifications

### **Database Optimization**

- Index composé : (business_id, is_active, name)
- Contrainte unique : (business_id, name)

## 🔧 Swagger Integration

### **Swagger UI**

- **URL** : http://localhost:3000/api/docs
- **Tag** : 📅 Calendar Types
- **Authentication** : JWT Bearer token required

### **OpenAPI Schema**

- Tous les DTOs sont documentés avec des exemples
- Validation automatique via class-validator
- Réponses d'erreur standardisées

### **Testing**

Utilisez Swagger UI pour tester directement les endpoints :

1. Obtenez un token JWT via POST /auth/login
2. Cliquez sur "Authorize" et saisissez : `Bearer YOUR_TOKEN`
3. Testez les endpoints Calendar Types

## 🎯 Frontend Integration Examples

### **React/TypeScript**

```typescript
interface CalendarType {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  settings: CalendarTypeSettings;
  createdAt: string;
  updatedAt: string;
}

interface CalendarTypeSettings {
  defaultDuration: number;
  allowOverlap: boolean;
  requireConfirmation: boolean;
  maxAdvanceBooking: number;
  bufferTime: number;
  customFields: CustomField[];
}

// List Calendar Types
const listCalendarTypes = async (filters: any) => {
  const response = await fetch('/api/v1/calendar-types/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(filters),
  });
  return response.json();
};

// Create Calendar Type
const createCalendarType = async (data: CreateCalendarTypeDto) => {
  const response = await fetch('/api/v1/calendar-types', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### **Vue.js/Composition API**

```typescript
import { ref, computed } from 'vue';

export function useCalendarTypes() {
  const calendarTypes = ref<CalendarType[]>([]);
  const loading = ref(false);

  const activeCalendarTypes = computed(() =>
    calendarTypes.value.filter((type) => type.isActive),
  );

  const fetchCalendarTypes = async (filters = {}) => {
    loading.value = true;
    try {
      const response = await api.post('/api/v1/calendar-types/list', filters);
      calendarTypes.value = response.data.data;
    } finally {
      loading.value = false;
    }
  };

  return {
    calendarTypes,
    activeCalendarTypes,
    loading,
    fetchCalendarTypes,
  };
}
```

## ✅ Validation Checklist

- [ ] ✅ **Swagger UI accessible** : http://localhost:3000/api/docs
- [ ] ✅ **Tag Calendar Types visible** dans l'interface Swagger
- [ ] ✅ **Tous les endpoints documentés** avec exemples complets
- [ ] ✅ **Authentification JWT** configurée et fonctionnelle
- [ ] ✅ **Validation des données** avec messages d'erreur clairs
- [ ] ✅ **Tests d'intégration** passants pour tous les endpoints
- [ ] ✅ **Performance optimisée** avec pagination et cache

Cette documentation complète garantit une intégration frontend facilite et une expérience développeur optimale !
