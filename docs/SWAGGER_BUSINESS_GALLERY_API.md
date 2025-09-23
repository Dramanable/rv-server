# 🖼️ **BUSINESS GALLERY APIS - SWAGGER DOCUMENTATION**

## 📋 **Overview**

Complete API documentation for Business Gallery management system with AWS S3 integration, image variants, and SEO optimization.

## 🏗️ **Architecture Implementation Status**

### ✅ **Business Gallery System - 100% Complete**

- **Domain** : ✅ BusinessImage + BusinessGallery Value Objects + ImageCategory enum
- **Application** : ✅ All CRUD Use Cases (Create, Get, Update, Delete, Add Image, Upload)
- **Infrastructure** : ✅ ORM Entities + AWS S3 Service + Mappers + Migrations
- **Presentation** : ✅ BusinessGalleryController + All DTOs with Swagger documentation

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
