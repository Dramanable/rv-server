# 🖼️ Business Gallery APIs - Documentation Swagger Complète

## 📋 Overview

La **Business Gallery API** fournit un système complet de gestion d'images pour les entreprises avec :

- **🔐 Upload sécurisé AWS S3** avec URLs signées
- **🖼️ Génération automatique de variants** (thumbnail, medium, large)
- **📊 Gestion avancée des galeries** avec métadonnées complètes
- **🛡️ Validation stricte** des formats et tailles
- **⚡ Performance optimisée** avec cache et CDN ready

## 🏗️ Architecture Implementation Status

### ✅ **Business Gallery - 100% Complete**

- **Domain** : ✅ BusinessImage + BusinessGallery Value Objects + Repository Interface
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, Upload, AddImage)
- **Infrastructure** : ✅ BusinessImageOrmEntity + BusinessGalleryOrmEntity + TypeOrmRepository + Mappers + Migrations + AWS S3 Service
- **Presentation** : ✅ BusinessGalleryController + All DTOs with complete Swagger documentation

---

## 🎯 Business Gallery APIs

### **POST /api/v1/business-galleries/:businessId/create**

**Description** : Créer une nouvelle galerie pour une entreprise avec configuration avancée
**Security** : Requires JWT authentication (BUSINESS_OWNER/BUSINESS_ADMIN)
**Parameters** :

- `businessId` (path) : UUID de l'entreprise

**Request Body** :

```json
{
  "name": "Portfolio Principal",
  "description": "Notre collection de réalisations et projets récents",
  "displayOrder": 1,
  "isPrimary": true,
  "galleryConfig": {
    "maxImages": 50,
    "allowedFormats": ["JPEG", "PNG", "WEBP"],
    "thumbnailSize": { "width": 200, "height": 200 }
  }
}
```

**Response 201** :

```json
{
  "success": true,
  "data": {
    "images": [],
    "count": 0,
    "statistics": {
      "total": 0,
      "public": 0,
      "private": 0,
      "byCategory": {},
      "optimized": 0,
      "totalSize": 0
    }
  },
  "message": "Gallery created successfully"
}
```

### **GET /api/v1/business-galleries/:businessId/galleries**

**Description** : Récupérer toutes les galeries d'une entreprise avec métadonnées
**Security** : Requires JWT authentication
**Parameters** :

- `businessId` (path) : UUID de l'entreprise

**Response 200** :

```json
[
  {
    "images": [
      {
        "id": "img_123e4567-e89b-12d3-a456-426614174000",
        "url": "https://s3.amazonaws.com/business-images/original/image.jpg",
        "alt": "Logo de l'entreprise",
        "caption": "Notre nouveau logo 2024",
        "category": "LOGO",
        "metadata": {
          "size": 1048576,
          "format": "JPEG",
          "dimensions": { "width": 1920, "height": 1080 },
          "uploadedAt": "2024-01-15T10:30:00Z"
        },
        "isPublic": true,
        "order": 0
      }
    ],
    "count": 8,
    "statistics": {
      "total": 8,
      "public": 6,
      "private": 2,
      "byCategory": {
        "LOGO": 1,
        "COVER": 1,
        "GALLERY": 6
      },
      "optimized": 8,
      "totalSize": 15728640
    }
  }
]
```

### **GET /api/v1/business-galleries/:galleryId**

**Description** : Récupérer une galerie spécifique avec toutes ses images
**Security** : Requires JWT authentication
**Parameters** :

- `galleryId` (path) : UUID de la galerie

**Response 200** :

```json
{
  "images": [
    {
      "id": "img_123e4567-e89b-12d3-a456-426614174000",
      "url": "https://s3.amazonaws.com/business-images/original/image.jpg",
      "alt": "Salle d'attente moderne",
      "caption": "Notre espace rénové pour votre confort",
      "category": "INTERIOR",
      "metadata": {
        "size": 2048576,
        "format": "JPEG",
        "dimensions": { "width": 1920, "height": 1080 },
        "uploadedAt": "2024-01-15T10:30:00Z"
      },
      "isPublic": true,
      "order": 1
    }
  ],
  "count": 8,
  "statistics": {
    "total": 8,
    "public": 6,
    "private": 2,
    "byCategory": {
      "INTERIOR": 3,
      "EXTERIOR": 2,
      "STAFF": 2,
      "GALLERY": 1
    },
    "optimized": 8,
    "totalSize": 15728640
  }
}
```

### **PUT /api/v1/business-galleries/:galleryId**

**Description** : Mettre à jour les informations d'une galerie existante
**Security** : Requires JWT authentication (BUSINESS_OWNER/BUSINESS_ADMIN)
**Parameters** :

- `galleryId` (path) : UUID de la galerie

**Request Body** :

```json
{
  "name": "Portfolio Mis à Jour",
  "description": "Collection mise à jour de nos réalisations",
  "displayOrder": 2,
  "isPrimary": false,
  "isActive": true,
  "galleryConfig": {
    "maxImages": 100,
    "allowedFormats": ["JPEG", "PNG", "WEBP", "GIF"],
    "thumbnailSize": { "width": 300, "height": 300 }
  }
}
```

**Response 200** :

```json
{
  "success": true,
  "data": {
    "images": [],
    "count": 0,
    "statistics": {
      "total": 0,
      "public": 0,
      "private": 0,
      "byCategory": {},
      "optimized": 0,
      "totalSize": 0
    }
  },
  "message": "Gallery updated successfully"
}
```

### **DELETE /api/v1/business-galleries/:galleryId**

**Description** : Supprimer une galerie et gérer les images associées
**Security** : Requires JWT authentication (BUSINESS_OWNER only)
**Parameters** :

- `galleryId` (path) : UUID de la galerie

**Response 200** :

```json
{
  "success": true,
  "message": "Gallery deleted successfully",
  "deletedId": "gallery_123e4567-e89b-12d3-a456-426614174000"
}
```

### **POST /api/v1/business-galleries/:galleryId/images/upload**

**Description** : Upload d'image avec traitement AWS S3 complet et génération de variants
**Security** : Requires JWT authentication (BUSINESS_OWNER/BUSINESS_ADMIN)
**Content-Type** : `multipart/form-data`
**Parameters** :

- `galleryId` (path) : UUID de la galerie destination

**Request Body (multipart/form-data)** :

```
image: [Binary file data] (JPEG, PNG, WEBP - max 10MB)
alt: "Photo de notre nouveau local" (optionnel)
caption: "Notre espace de réception rénové en 2024" (optionnel)
category: "GALLERY" (optionnel: GALLERY, COVER, PROFILE, LOGO)
isPublic: true (optionnel: boolean)
```

**Response 201** :

```json
{
  "success": true,
  "data": {
    "imageId": "987fcdeb-51a2-43d7-8f6e-123456789abc",
    "originalUrl": "https://s3.amazonaws.com/business-images/original/image.jpg",
    "variants": {
      "thumbnail": "https://s3.amazonaws.com/business-images/thumb_200x200.jpg",
      "medium": "https://s3.amazonaws.com/business-images/medium_800x600.jpg",
      "large": "https://s3.amazonaws.com/business-images/large_1200x900.jpg"
    },
    "signedUrls": {
      "view": "https://s3.amazonaws.com/business-images/signed-url?expires=900",
      "download": "https://s3.amazonaws.com/business-images/download?expires=3600"
    },
    "metadata": {
      "size": 2048576,
      "width": 1920,
      "height": 1080,
      "format": "JPEG",
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    "galleryInfo": {
      "totalImages": 12,
      "displayOrder": 13,
      "category": "GALLERY"
    }
  },
  "message": "Image uploaded successfully to gallery. Processing gallery image with variants generation."
}
```

---

## 🚨 Error Responses

### **400 Bad Request - Invalid File**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "Only JPEG, PNG, and WEBP formats are allowed",
    "details": {
      "allowedFormats": ["JPEG", "PNG", "WEBP"],
      "receivedFormat": "GIF",
      "maxSize": "10MB"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/business-galleries/uuid/images/upload"
  }
}
```

### **401 Unauthorized**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "JWT authentication required",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/business-galleries"
  }
}
```

### **403 Forbidden**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "BUSINESS_OWNER or BUSINESS_ADMIN role required",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/business-galleries/uuid/create"
  }
}
```

### **404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "GALLERY_NOT_FOUND",
    "message": "Gallery not found",
    "details": "No gallery found with ID: uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/business-galleries/uuid"
  }
}
```

### **422 Unprocessable Entity - Limit Exceeded**

```json
{
  "success": false,
  "error": {
    "code": "GALLERY_LIMIT_EXCEEDED",
    "message": "Maximum 50 images per gallery allowed",
    "details": {
      "currentCount": 50,
      "maxAllowed": 50,
      "upgradeRequired": true
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/v1/business-galleries/uuid/images/upload"
  }
}
```

---

## 🔐 Authentication & Authorization

### **JWT Bearer Token**

Toutes les APIs nécessitent un token JWT valide :

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -X GET http://localhost:3000/api/v1/business-galleries/uuid/galleries
```

### **Permissions Required**

- **Gallery CRUD** : `BUSINESS_OWNER` ou `BUSINESS_ADMIN`
- **Image Upload** : `BUSINESS_OWNER` ou `BUSINESS_ADMIN`
- **Gallery View** : Tous les utilisateurs authentifiés

---

## 📊 Validation Rules

### **Image File Validation**

- **Formats supportés** : JPEG, PNG, WEBP uniquement
- **Taille maximum** : 10MB par image
- **Dimensions recommandées** : 1920x1080 maximum pour performance
- **Alt text** : 10-200 caractères (obligatoire pour accessibilité)
- **Caption** : 0-300 caractères (optionnel)

### **Gallery Configuration**

- **Nom** : 2-100 caractères (obligatoire)
- **Description** : 0-500 caractères (optionnel)
- **Max images** : 1-100 par galerie (configurable admin)
- **Display order** : Entier positif (tri des galeries)

### **Business Rules**

- **Galerie principale** : Une seule par business autorisée
- **Suppression sécurisée** : Confirmation requise si images présentes
- **Réassignation images** : Automatique vers galerie principale lors suppression
- **Cache invalidation** : Automatique lors modifications

---

## 📈 Performance & Scalability

### **AWS S3 Integration**

- **Bucket privé** : `business-images-{environment}`
- **URLs signées** : Accès temporaire sécurisé (15 min par défaut)
- **Variants automatiques** : Thumbnail (200x200), Medium (800x600), Large (1200x900)
- **CDN Ready** : Structure optimisée pour CloudFront

### **Cache Strategy**

- **Gallery metadata** : Cache Redis 15 minutes
- **Image URLs** : Cache navigateur 24h avec ETags
- **S3 signed URLs** : Cache local 10 minutes

### **Database Optimization**

- **Index composite** : (business_id, display_order) pour tri rapide
- **Index catégorie** : Filtrage rapide par type d'image
- **Pagination** : Limit 50 images par requête maximum

---

## 🔧 Swagger Integration

### **Swagger UI Access**

- **Development** : http://localhost:3000/api/docs
- **Staging** : https://staging-api.yourdomain.com/api/docs
- **Production** : https://api.yourdomain.com/api/docs

### **Try It Out Features**

- **File upload** : Interface drag & drop directe
- **Authentication** : Bouton "Authorize" pour JWT
- **Response examples** : Exemples complets pour chaque endpoint
- **Schema validation** : Validation en temps réel des requêtes

### **Integration Examples**

#### **React/Vue.js Upload**

```typescript
const uploadImageToGallery = async (
  galleryId: string,
  file: File,
  metadata: ImageMetadata,
) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('alt', metadata.alt || file.name);
  formData.append('caption', metadata.caption || '');
  formData.append('category', metadata.category || 'GALLERY');
  formData.append('isPublic', metadata.isPublic ? 'true' : 'false');

  const response = await api.post(
    `/api/v1/business-galleries/${galleryId}/images/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progress) => {
        const percentage = Math.round((progress.loaded * 100) / progress.total);
        updateUploadProgress(percentage);
      },
    },
  );

  return {
    image: response.data.data,
    variants: response.data.data.variants,
    signedUrls: response.data.data.signedUrls,
  };
};
```

#### **Gallery Management**

```typescript
const createGallery = async (businessId: string, galleryData: GalleryData) => {
  const response = await api.post(
    `/api/v1/business-galleries/${businessId}/create`,
    {
      name: galleryData.name,
      description: galleryData.description,
      displayOrder: galleryData.displayOrder,
      isPrimary: galleryData.isPrimary,
      galleryConfig: {
        maxImages: 50,
        allowedFormats: ['JPEG', 'PNG', 'WEBP'],
        thumbnailSize: { width: 200, height: 200 },
      },
    },
  );

  return response.data.data;
};
```

---

## 🎯 Frontend Development Guide

### **Image Display with Variants**

```javascript
// Affichage responsive avec variants
const ImageComponent = ({ image }) => (
  <picture>
    <source media="(max-width: 480px)" srcSet={image.variants.thumbnail} />
    <source media="(max-width: 1024px)" srcSet={image.variants.medium} />
    <img src={image.variants.large} alt={image.alt} loading="lazy" />
  </picture>
);
```

### **Error Handling**

```javascript
const handleUploadError = (error) => {
  switch (error.code) {
    case 'INVALID_FILE_FORMAT':
      showError('Format non supporté. Utilisez JPEG, PNG ou WEBP.');
      break;
    case 'GALLERY_LIMIT_EXCEEDED':
      showError(`Limite de ${error.details.maxAllowed} images atteinte.`);
      break;
    case 'INSUFFICIENT_PERMISSIONS':
      showError('Permissions insuffisantes pour cette opération.');
      break;
    default:
      showError("Erreur lors de l'upload. Veuillez réessayer.");
  }
};
```

---

## 📞 Support & Resources

- **API Documentation** : Exemples complets dans chaque endpoint
- **TypeScript Types** : Interfaces générées automatiquement depuis DTOs
- **Postman Collection** : Import direct depuis Swagger JSON
- **Rate Limiting** : 100 requêtes/minute par utilisateur
- **Support** : dev-support@yourdomain.com

---

**Business Gallery API v3.0 - Production Ready avec AWS S3, validation stricte, et performance optimisée**

## 🎯 **Business Gallery APIs**

### **POST /business-galleries/:businessId/create**

**Description** : Créer une nouvelle galerie pour un business
**Security** : Requires JWT authentication (BUSINESS_OWNER or ADMIN)

**Request Body** :

```json
{
  "name": "Portfolio Principal",
  "description": "Notre collection de réalisations et projets récents",
  "displayOrder": 1,
  "isPrimary": true,
  "galleryConfig": {
    "maxImages": 50,
    "allowedFormats": ["JPEG", "PNG", "WEBP"],
    "thumbnailSize": {
      "width": 200,
      "height": 200
    }
  }
}
```

**Response 201** :

```json
{
  "success": true,
  "data": {
    "images": [],
    "count": 0,
    "statistics": {
      "total": 0,
      "public": 0,
      "private": 0,
      "byCategory": {},
      "optimized": 0,
      "totalSize": 0
    }
  },
  "message": "Gallery created successfully"
}
```

### **GET /business-galleries/:businessId/galleries**

**Description** : Récupérer toutes les galeries d'un business
**Security** : Requires JWT authentication

**Response 200** :

```json
{
  "success": true,
  "data": [
    {
      "id": "gallery_123e4567-e89b-12d3-a456-426614174000",
      "name": "Portfolio Principal",
      "description": "Notre collection de réalisations...",
      "displayOrder": 1,
      "isPrimary": true,
      "isActive": true,
      "imageCount": 8,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:45:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "businessId": "business_123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### **GET /business-galleries/:galleryId**

**Description** : Récupérer une galerie avec toutes ses images
**Security** : Requires JWT authentication

**Response 200** :

```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "img_123e4567-e89b-12d3-a456-426614174000",
        "url": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/image1.jpg",
        "alt": "Vue d'ensemble de notre nouveau showroom moderne",
        "caption": "Showroom rénové en 2024 avec nouvelles collections",
        "category": "INTERIOR",
        "metadata": {
          "size": 2048576,
          "format": "jpg",
          "dimensions": {
            "width": 1920,
            "height": 1080
          },
          "uploadedAt": "2024-01-15T10:30:00Z"
        },
        "isPublic": true,
        "order": 1
      }
    ],
    "count": 8,
    "statistics": {
      "total": 8,
      "public": 6,
      "private": 2,
      "byCategory": {
        "LOGO": 1,
        "COVER": 1,
        "INTERIOR": 3,
        "GALLERY": 3
      },
      "optimized": 8,
      "totalSize": 15728640
    }
  },
  "meta": {
    "galleryId": "gallery_123e4567-e89b-12d3-a456-426614174000",
    "businessId": "business_123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### **PUT /business-galleries/:galleryId**

**Description** : Mettre à jour une galerie existante
**Security** : Requires JWT authentication (BUSINESS_OWNER or ADMIN)

**Request Body** :

```json
{
  "name": "Portfolio Mis à Jour",
  "description": "Collection mise à jour de nos réalisations avec nouveaux projets 2024",
  "displayOrder": 2,
  "isPrimary": false,
  "isActive": true,
  "galleryConfig": {
    "maxImages": 100,
    "allowedFormats": ["JPEG", "PNG", "WEBP", "GIF"],
    "thumbnailSize": {
      "width": 300,
      "height": 300
    }
  }
}
```

**Response 200** :

```json
{
  "success": true,
  "data": {
    "images": [
      // Array of updated images...
    ],
    "count": 12,
    "statistics": {
      "total": 12,
      "public": 10,
      "private": 2,
      "byCategory": {
        "LOGO": 1,
        "COVER": 2,
        "INTERIOR": 4,
        "GALLERY": 5
      },
      "optimized": 12,
      "totalSize": 25728640
    }
  },
  "message": "Gallery updated successfully"
}
```

### **DELETE /business-galleries/:galleryId**

**Description** : Supprimer une galerie et toutes ses images
**Security** : Requires JWT authentication (BUSINESS_OWNER or ADMIN)

**Response 200** :

```json
{
  "success": true,
  "message": "Gallery deleted successfully",
  "deletedId": "gallery_123e4567-e89b-12d3-a456-426614174000"
}
```

### **POST /business-galleries/:galleryId/images/upload**

**Description** : Upload d'image avec génération automatique de variants
**Security** : Requires JWT authentication (BUSINESS_OWNER or ADMIN)
**Content-Type** : `multipart/form-data`

**Form Data** :

```
image: [File] (required) - Image file (JPEG, PNG, WEBP)
category: string (optional) - Image category (LOGO, COVER, INTERIOR, etc.)
alt: string (required) - Alt text for accessibility
caption: string (optional) - Image caption
isPublic: boolean (optional, default: true) - Public visibility
order: number (optional) - Display order
```

**Response 201** :

```json
{
  "success": true,
  "data": {
    "imageId": "img_987fcdeb-51a2-43d7-8f6e-123456789abc",
    "originalUrl": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/original_image.jpg",
    "variants": {
      "thumbnail": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/thumb_200x200_image.jpg",
      "medium": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/medium_800x600_image.jpg",
      "large": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/large_1200x900_image.jpg"
    },
    "signedUrls": {
      "view": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
      "download": "https://business-images-prod.s3.eu-west-1.amazonaws.com/business123/gallery/image.jpg?response-content-disposition=attachment&X-Amz-Algorithm=..."
    },
    "metadata": {
      "size": 2048576,
      "width": 1920,
      "height": 1080,
      "format": "JPEG",
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    "galleryInfo": {
      "totalImages": 13,
      "displayOrder": 14,
      "category": "GALLERY"
    }
  },
  "message": "Image uploaded successfully with 3 variants generated"
}
```

## 🚨 **Error Responses**

### **400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_GALLERY_INVALID_DATA",
    "message": "Données de galerie invalides",
    "field": "name",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/business-galleries/123/create",
    "correlationId": "req_123456789"
  }
}
```

### **401 Unauthorized**

```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Token JWT requis pour accéder à cette ressource",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/business-galleries/123/create",
    "correlationId": "req_123456789"
  }
}
```

### **403 Forbidden**

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_GALLERY_PERMISSION_DENIED",
    "message": "Permissions insuffisantes pour gérer les galeries de ce business",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/business-galleries/123/create",
    "correlationId": "req_123456789"
  }
}
```

### **404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_GALLERY_NOT_FOUND",
    "message": "Galerie business introuvable",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/business-galleries/999",
    "correlationId": "req_123456789"
  }
}
```

### **409 Conflict**

```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_GALLERY_QUOTA_EXCEEDED",
    "message": "Quota maximum de galeries atteint pour ce business (limite: 5)",
    "details": {
      "currentCount": 5,
      "maxAllowed": 5
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/business-galleries/123/create",
    "correlationId": "req_123456789"
  }
}
```

### **413 Payload Too Large**

```json
{
  "success": false,
  "error": {
    "code": "IMAGE_FILE_TOO_LARGE",
    "message": "Fichier image trop volumineux (limite: 5MB)",
    "details": {
      "fileSize": 7340032,
      "maxAllowed": 5242880
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/business-galleries/gallery123/images/upload",
    "correlationId": "req_123456789"
  }
}
```

## 🔐 **Authentication & Authorization**

### **JWT Bearer Token**

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Required Permissions**

- **CREATE/UPDATE/DELETE Gallery** : `BUSINESS_OWNER` or `ADMIN`
- **READ Gallery** : `BUSINESS_OWNER`, `BUSINESS_ADMIN`, `STAFF`, or `ADMIN`
- **UPLOAD Images** : `BUSINESS_OWNER`, `BUSINESS_ADMIN`, or `ADMIN`

### **Scoping Rules**

- Users can only access galleries from their own business (except ADMIN)
- ADMIN can access all business galleries across the platform

## 📊 **Validation Rules**

### **Gallery Creation**

- `name`: 2-100 characters, required
- `description`: 0-500 characters, optional
- `displayOrder`: >= 0, default 0
- `galleryConfig.maxImages`: 1-100, default 20
- `galleryConfig.allowedFormats`: Must be subset of ["JPEG", "PNG", "WEBP", "GIF"]

### **Image Upload**

- **File Size**: Max 5MB
- **Formats**: JPEG, PNG, WEBP
- **Dimensions**: Max 4000x4000 pixels
- **Alt Text**: 10-200 characters, required
- **Caption**: 0-300 characters, optional

## 🎯 **Business Rules**

### **Gallery Limits**

- Max 5 galleries per business (configurable)
- Max 100 images per gallery (configurable)
- Only 1 primary gallery allowed per business

### **Image Processing**

- Automatic variants generation (thumbnail, medium, large)
- EXIF data removal for privacy
- Format optimization (WebP when supported)
- Compression for web optimization

### **AWS S3 Integration**

- Signed URLs with configurable expiration (1h prod, 24h dev)
- Organized storage: `{businessId}/{category}/{filename}`
- Automatic metadata extraction and storage

## 📈 **Performance & Scalability**

### **Caching Strategy**

- Gallery metadata cached in Redis (1h TTL)
- Image URLs cached with CDN headers
- Pagination for large image collections

### **CDN Integration**

- CloudFront distribution for fast global delivery
- Automatic edge caching for image variants
- Optimized headers for browser caching

### **Rate Limiting**

- Image upload: 10 uploads/minute per business
- Gallery operations: 100 requests/minute per user
- Global API: 1000 requests/minute per JWT token

## 🔧 **Swagger Integration**

### **OpenAPI Specification**

- Available at: `http://localhost:3000/api/docs`
- JSON Schema: `http://localhost:3000/api/docs-json`
- Interactive testing interface with authentication

### **Code Generation**

- TypeScript interfaces auto-generated from schemas
- Client SDKs available for React, Vue.js, Angular
- Postman collection export available

## 🎯 **Frontend Integration Examples**

### **React/TypeScript Example**

```typescript
// Upload image to gallery
const uploadImage = async (galleryId: string, imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('alt', 'Description of image');
  formData.append('category', 'GALLERY');
  formData.append('isPublic', 'true');

  const response = await fetch(
    `/api/business-galleries/${galleryId}/images/upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    },
  );

  const result = await response.json();

  if (result.success) {
    console.log('Image uploaded:', result.data.imageId);
    console.log('Variants available:', result.data.variants);
  }
};

// Get gallery with images
const getGallery = async (galleryId: string) => {
  const response = await fetch(`/api/business-galleries/${galleryId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  const gallery = await response.json();
  return gallery.data; // { images: [...], count: 8, statistics: {...} }
};
```

### **Vue.js Example**

```vue
<template>
  <div class="gallery-uploader">
    <input
      type="file"
      @change="handleFileSelect"
      accept="image/jpeg,image/png,image/webp"
      multiple
    />
    <button @click="uploadImages" :disabled="uploading">
      {{ uploading ? 'Uploading...' : 'Upload Images' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedFiles = ref([]);
const uploading = ref(false);

const handleFileSelect = (event) => {
  selectedFiles.value = Array.from(event.target.files);
};

const uploadImages = async () => {
  uploading.value = true;

  for (const file of selectedFiles.value) {
    await uploadSingleImage(file);
  }

  uploading.value = false;
};

const uploadSingleImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('alt', `Image ${file.name}`);
  formData.append('category', 'GALLERY');

  const response = await $fetch(
    `/api/business-galleries/${galleryId}/images/upload`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  if (response.success) {
    // Handle successful upload
    console.log('Uploaded:', response.data.variants);
  }
};
</script>
```

---

## 🏆 **API Quality & Standards**

### **Enterprise-Grade Features**

- ✅ **Comprehensive validation** with detailed error messages
- ✅ **Security-first** approach with JWT + RBAC
- ✅ **Scalable architecture** with caching and CDN
- ✅ **Performance optimized** with variants and compression
- ✅ **Developer-friendly** with complete Swagger documentation
- ✅ **Production-ready** with monitoring and rate limiting

### **Compliance & Best Practices**

- ✅ **RESTful design** following HTTP standards
- ✅ **Consistent error handling** across all endpoints
- ✅ **GDPR compliant** with data minimization and privacy
- ✅ **Accessibility support** with mandatory alt text
- ✅ **SEO optimized** with proper metadata and URLs

**🚀 Ready for production deployment and frontend integration!**
