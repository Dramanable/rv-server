# 🎯 Services APIs - Swagger Documentation avec Pricing Flexible

## 📋 Overview

Le système de Services supporte maintenant un **pricing flexible** avec 5 types différents et une visibilité paramétrable. Cette API permet de gérer des services gratuits, à prix fixe, variables, cachés ou sur demande.

## 🏗️ Architecture Implementation Status

### ✅ **Services - 100% Complete avec Pricing Flexible**

- **Domain** : ✅ Service Entity + PricingConfig Value Object + Repository Interface
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, List) avec support PricingConfig
- **Infrastructure** : ✅ ServiceOrmEntity + TypeOrmServiceRepository + Mappers + Migration avec schéma dynamique
- **Presentation** : ✅ ServiceController + All DTOs with Flexible Pricing + Swagger documentation

## 🎯 Services APIs

### **POST /api/v1/services/list**

**Description** : Recherche avancée paginée des services avec tous les types de pricing
**Security** : Requires JWT authentication
**Request Body** :

```json
{
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": "desc",
  "search": "massage",
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "Wellness",
  "isActive": true,
  "minDuration": 30,
  "maxDuration": 120,
  "minPrice": 25.0,
  "maxPrice": 200.0
}
```

**Response** :

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Deep Tissue Massage",
      "description": "Therapeutic massage focusing on deeper layers of muscle",
      "category": "Wellness",
      "duration": 60,
      "price": {
        "amount": 75.5,
        "currency": "EUR"
      },
      "pricingConfig": {
        "type": "FIXED",
        "visibility": "PUBLIC",
        "basePrice": {
          "amount": "7550",
          "currency": "EUR"
        },
        "rules": [],
        "description": null
      },
      "packages": [
        {
          "name": "Forfait découverte",
          "description": "3 séances à tarif préférentiel",
          "sessionsIncluded": "3",
          "packagePrice": {
            "amount": "20000",
            "currency": "EUR"
          },
          "validityDays": "30"
        }
      ],
      "businessId": "550e8400-e29b-41d4-a716-446655440000",
      "isActive": true,
      "settings": {
        "isOnlineBookingEnabled": true,
        "requiresApproval": false,
        "maxAdvanceBookingDays": 30,
        "minAdvanceBookingHours": 2,
        "bufferTimeBefore": 15,
        "bufferTimeAfter": 15,
        "isGroupBookingAllowed": false,
        "maxGroupSize": null
      },
      "requirements": {
        "preparation": "Please arrive 10 minutes early",
        "materials": ["Comfortable clothing"],
        "restrictions": ["No pregnancy", "No heart conditions"],
        "cancellationPolicy": "24 hours notice required"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
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

### **GET /api/v1/services/:id**

**Description** : Récupérer un service par ID avec sa configuration pricing complète
**Response** : Service complet avec pricingConfig et packages

### **POST /api/v1/services**

**Description** : Créer un nouveau service avec pricing flexible
**Request Body** :

```json
{
  "businessId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Consultation gratuite",
  "description": "Première consultation d'évaluation gratuite",
  "category": "Consultation",
  "duration": 30,
  "pricingConfig": {
    "type": "FREE",
    "visibility": "PUBLIC"
  },
  "packages": [],
  "settings": {
    "isOnlineBookingEnabled": true,
    "requiresApproval": false,
    "maxAdvanceBookingDays": 14,
    "minAdvanceBookingHours": 4
  },
  "isActive": true
}
```

### **Exemples de PricingConfig par Type**

#### **1. Service Gratuit (FREE)**

```json
{
  "pricingConfig": {
    "type": "FREE",
    "visibility": "PUBLIC"
  }
}
```

#### **2. Service à Prix Fixe (FIXED)**

```json
{
  "pricingConfig": {
    "type": "FIXED",
    "visibility": "PUBLIC",
    "basePrice": {
      "amount": "7550", // 75.50 EUR en centimes
      "currency": "EUR"
    }
  }
}
```

#### **3. Service à Prix Variable (VARIABLE)**

```json
{
  "pricingConfig": {
    "type": "VARIABLE",
    "visibility": "PUBLIC",
    "basePrice": {
      "amount": "5000", // Prix de base 50.00 EUR
      "currency": "EUR"
    },
    "rules": [
      {
        "type": "DURATION_MULTIPLIER",
        "config": {
          "multiplier": 1.5,
          "threshold": 90
        },
        "description": "Prix majoré pour séances > 90 min"
      }
    ]
  }
}
```

#### **4. Service Prix Caché (HIDDEN)**

```json
{
  "pricingConfig": {
    "type": "HIDDEN",
    "visibility": "PRIVATE",
    "basePrice": {
      "amount": "250000", // 2500.00 EUR
      "currency": "EUR"
    },
    "description": "Prix disponible sur demande au staff"
  }
}
```

#### **5. Service Sur Demande (ON_DEMAND)**

```json
{
  "pricingConfig": {
    "type": "ON_DEMAND",
    "visibility": "PUBLIC",
    "description": "Prix établi selon durée et complexité de l'intervention"
  }
}
```

### **PUT /api/v1/services/:id**

**Description** : Mettre à jour un service avec nouveau pricing
**Request Body** : Tous les champs optionnels, supports modification du pricingConfig

### **DELETE /api/v1/services/:id**

**Description** : Supprimer un service (soft delete)
**Response** :

```json
{
  "success": true,
  "message": "Service deleted successfully",
  "serviceId": "550e8400-e29b-41d4-a716-446655440001"
}
```

## 🚨 Error Responses

### **Format d'Erreur Standardisé**

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "Service not found",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/services/invalid-id",
    "correlationId": "req_123456789"
  }
}
```

### **Codes d'Erreur Spécifiques**

- `SERVICE_NOT_FOUND` (404) : Service introuvable
- `SERVICE_INVALID_DATA` (400) : Données de service invalides
- `SERVICE_DUPLICATE_NAME` (409) : Nom déjà utilisé dans l'entreprise
- `SERVICE_PERMISSION_DENIED` (403) : Permissions insuffisantes
- `SERVICE_CANNOT_DELETE_REFERENCED` (422) : Service avec rendez-vous actifs
- `SERVICE_PRICING_CONFIG_INVALID` (400) : Configuration pricing invalide

## 🔐 Authentication & Authorization

### **JWT Bearer Token Required**

Tous les endpoints nécessitent un token JWT valide dans le header :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Permissions par Rôle**

- **PLATFORM_ADMIN** : Tous les services de toutes les entreprises
- **BUSINESS_OWNER** : Services de ses entreprises uniquement
- **BUSINESS_ADMIN** : Services de son entreprise uniquement
- **LOCATION_MANAGER** : Services de sa location uniquement
- **PRACTITIONER** : Services qu'il propose uniquement (lecture)

## 📊 Validation Rules

### **Service Name**

- Longueur : 2-100 caractères
- Unique par entreprise
- Caractères autorisés : lettres, chiffres, espaces, tirets

### **PricingConfig Validation**

- **FREE** : Aucun basePrice requis
- **FIXED** : basePrice obligatoire
- **VARIABLE** : basePrice + rules obligatoires
- **HIDDEN** : basePrice obligatoire, visibility PRIVATE/HIDDEN recommandée
- **ON_DEMAND** : description recommandée

### **Duration**

- Minimum : 15 minutes
- Maximum : 480 minutes (8 heures)
- Multiple de 15 minutes recommandé

### **Price/BasePrice**

- Minimum : 0 (gratuit autorisé)
- Maximum : 999,999.99
- Devise : EUR, USD, GBP, CAD supportées

## 🎯 Business Rules

### **Pricing Flexibility**

1. **Services FREE** : `pricing` = null, `pricingConfig.type` = FREE
2. **Services FIXED** : Prix standard avec `basePrice` défini
3. **Services VARIABLE** : Prix calculé avec règles dynamiques
4. **Services HIDDEN** : Prix existe mais non affiché publiquement
5. **Services ON_DEMAND** : Prix établi au cas par cas

### **Visibilité Pricing**

- **PUBLIC** : Visible pour tous les utilisateurs
- **AUTHENTICATED** : Visible pour utilisateurs connectés uniquement
- **PRIVATE** : Visible pour staff/admin uniquement
- **HIDDEN** : Jamais affiché dans l'interface

### **Service Packages**

- Forfaits avec nombre de séances incluses
- Prix package généralement inférieur au prix unitaire
- Validité en jours configurable
- Compatible avec tous types de pricing

## 📈 Performance & Scalability

### **Pagination**

- Page par défaut : 1
- Limite par défaut : 10 services
- Limite maximum : 100 services par requête
- Métadonnées complètes dans chaque réponse

### **Filtrage Avancé**

- Recherche textuelle sur nom et description
- Filtres par entreprise, catégorie, statut
- Filtres par durée (min/max)
- Filtres par prix (min/max) - basé sur basePrice
- Tri par tous les champs principaux

### **Cache et Performance**

- Résultats de recherche cachés 5 minutes
- Index DB sur : businessId, category, isActive, pricingConfig.type
- Pagination optimisée avec count() séparé

## 🔧 Swagger Integration

### **Documentation Interactive**

- **Swagger UI** : `http://localhost:3000/api/docs`
- **OpenAPI JSON** : `http://localhost:3000/api/docs-json`
- **Exemples complets** pour tous les types de pricing
- **Validation en temps réel** des schemas de request/response

### **Try It Out**

1. Obtenir un token JWT via `/api/v1/auth/login`
2. Cliquer "Authorize" dans Swagger UI
3. Saisir : `Bearer {your-jwt-token}`
4. Tester tous les endpoints avec exemples pré-remplis

---

## 🎉 **Nouveautés Pricing Flexible - Septembre 2025**

### ✨ **Fonctionnalités Ajoutées**

- **5 types de pricing** : FREE, FIXED, VARIABLE, HIDDEN, ON_DEMAND
- **4 niveaux de visibilité** : PUBLIC, AUTHENTICATED, PRIVATE, HIDDEN
- **Support packages/forfaits** avec sessions incluses et validité
- **Règles de pricing dynamiques** pour calculs complexes
- **Migration automatique** des données existantes
- **Backward compatibility** avec l'ancien système de prix

### 🔄 **Migration des Données**

- Tous les services existants migrés vers `pricingConfig.type = "FIXED"`
- Ancien champ `price` conservé pour compatibilité
- Nouveaux services utilisent exclusivement `pricingConfig`
- Migration transparente sans interruption de service

Cette documentation complète permet aux développeurs frontend d'intégrer facilement le nouveau système de pricing flexible tout en maintenant la compatibilité avec l'existant.
