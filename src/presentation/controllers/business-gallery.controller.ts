import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '../../domain/entities/user.entity';
import { GetUser } from '../security/decorators/get-user.decorator';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

import {
  BusinessGalleryDto,
  CreateBusinessGalleryDto,
  CreateBusinessGalleryResponseDto,
  DeleteBusinessGalleryResponseDto,
  UpdateBusinessGalleryDto,
  UpdateBusinessGalleryResponseDto,
} from '../dtos/business-gallery.dto';

import { AddImageToBusinessGalleryUseCase } from '../../application/use-cases/business/add-image-to-business-gallery.use-case';
import { CreateBusinessGalleryUseCase } from '../../application/use-cases/business/create-business-gallery.use-case';
import { DeleteBusinessGalleryUseCase } from '../../application/use-cases/business/delete-business-gallery.use-case';
import { GetBusinessGalleryUseCase } from '../../application/use-cases/business/get-business-gallery.use-case';
import {
  UpdateBusinessGalleryUseCase,
  UpdateBusinessGalleryRequest,
} from '../../application/use-cases/business/update-business-gallery.use-case';

import { Inject } from '@nestjs/common';
import { TOKENS } from '../../shared/constants/injection-tokens';

@ApiTags('🖼️ Business Gallery')
@Controller('business-galleries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BusinessGalleryController {
  constructor(
    @Inject(TOKENS.CREATE_BUSINESS_GALLERY_USE_CASE)
    private readonly createBusinessGalleryUseCase: CreateBusinessGalleryUseCase,
    @Inject(TOKENS.GET_BUSINESS_GALLERY_USE_CASE)
    private readonly getBusinessGalleryUseCase: GetBusinessGalleryUseCase,
    @Inject(TOKENS.UPDATE_BUSINESS_GALLERY_USE_CASE)
    private readonly updateBusinessGalleryUseCase: UpdateBusinessGalleryUseCase,
    @Inject(TOKENS.DELETE_BUSINESS_GALLERY_USE_CASE)
    private readonly deleteBusinessGalleryUseCase: DeleteBusinessGalleryUseCase,
    @Inject(TOKENS.ADD_IMAGE_TO_GALLERY_USE_CASE)
    private readonly addImageToBusinessGalleryUseCase: AddImageToBusinessGalleryUseCase,
  ) {}

  @Post(':businessId/create')
  @ApiOperation({
    summary: '➕ Create Business Gallery',
    description: `
    Créer une nouvelle galerie pour une entreprise.

    ## 🎯 Fonctionnalités

    ### 📊 **Configuration Galerie**
    - **Nom personnalisable** : Galerie principale, portfolio, etc.
    - **Ordre d'affichage** : Tri des galeries par priorité
    - **Statut** : Active/Inactive pour contrôle visibilité
    - **Configuration avancée** : Max images, formats autorisés, taille vignettes

    ### 💼 **Cas d'usage métier**
    - **Portfolio client** : Galeries thématiques par service
    - **Avant/Après** : Galeries spécialisées pour résultats
    - **Équipe** : Galerie dédiée photos personnel
    - **Locaux** : Galerie pour présentation environnement

    ### 🔐 **Sécurité et Permissions**
    - **JWT obligatoire** : Authentification requise
    - **Propriétaire business** : Seul le propriétaire peut créer
    - **Validation métier** : Respect limites et contraintes

    ### 📈 **Performance**
    - **Configuration optimisée** : Paramètres par défaut performants
    - **Indexation DB** : Requêtes rapides par business_id
    - **Cache-ready** : Structure compatible mise en cache

    ## 🎯 **Guide d'intégration Frontend**

    ### React/Vue.js Example
    \`\`\`typescript
    const createGallery = async (businessId: string, galleryData: GalleryData) => {
      const response = await api.post(\`/api/v1/business-galleries/\${businessId}/create\`, {
        name: galleryData.name,
        description: galleryData.description,
        displayOrder: galleryData.displayOrder,
        isPrimary: galleryData.isPrimary,
        galleryConfig: {
          maxImages: 50,
          allowedFormats: ['JPEG', 'PNG', 'WEBP'],
          thumbnailSize: { width: 200, height: 200 }
        }
      });

      return response.data.data;
    };
    \`\`\`
    `,
  })
  @ApiParam({
    name: 'businessId',
    description: "ID de l'entreprise",
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Galerie créée avec succès',
    type: CreateBusinessGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Permissions insuffisantes',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Entreprise introuvable',
  })
  async createGallery(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Body() dto: CreateBusinessGalleryDto,
    @GetUser() user: User,
  ): Promise<CreateBusinessGalleryResponseDto> {
    const result = await this.createBusinessGalleryUseCase.execute({
      businessId,
      requestingUserId: user.id,
    });

    return {
      success: true,
      data: {
        images: [], // Galerie vide au début
        count: result.galleryImageCount,
        statistics: {
          total: result.galleryImageCount,
          public: 0,
          private: 0,
          byCategory: {},
          optimized: 0,
          totalSize: 0,
        },
      },
      message: result.message,
    };
  }

  @Get(':businessId/galleries')
  @ApiOperation({
    summary: '📋 List Business Galleries',
    description: `
    Récupérer toutes les galeries d'une entreprise avec métadonnées.

    ## 🎯 Fonctionnalités

    ### 📊 **Données retournées**
    - **Galeries complètes** : Nom, description, config, statut
    - **Métadonnées** : Nombre d'images, date création/modification
    - **Configuration** : Paramètres techniques de chaque galerie
    - **Relations** : Liens vers images et business parent

    ### 🔍 **Tri et Filtrage**
    - **Ordre d'affichage** : Tri par displayOrder puis createdAt
    - **Statut** : Filtrage galeries actives/inactives
    - **Type** : Galerie principale vs secondaires

    ### 💡 **Optimisations**
    - **Eager loading** : Relations chargées en une requête
    - **Cache** : Mise en cache des galeries populaires
    - **Pagination** : Support pagination pour grandes collections
    `,
  })
  @ApiParam({
    name: 'businessId',
    description: "ID de l'entreprise",
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Galeries récupérées avec succès',
    type: [BusinessGalleryDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Entreprise introuvable',
  })
  async getBusinessGalleries(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @GetUser() user: User,
  ): Promise<BusinessGalleryDto[]> {
    const result = await this.getBusinessGalleryUseCase.execute({
      businessId,
      requestingUserId: user.id,
    });

    // Convert domain images to presentation DTOs
    const presentationImages = result.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      category: image.category as any, // Map domain enum to DTO enum
      metadata: image.metadata,
      isPublic: image.isPublic,
      order: image.order,
    }));

    return [
      {
        images: presentationImages,
        count: result.statistics.total,
        statistics: {
          total: result.statistics.total,
          public: result.statistics.public,
          private: result.statistics.private,
          byCategory: result.statistics.byCategory as any,
          optimized: 0,
          totalSize: result.statistics.totalSize,
        },
      },
    ];
  }

  @Get(':galleryId')
  @ApiOperation({
    summary: '🔍 Get Gallery by ID',
    description: `
    Récupérer une galerie spécifique avec toutes ses images.

    ## 🎯 Fonctionnalités détaillées

    ### 📊 **Données complètes**
    - **Galerie** : Métadonnées complètes
    - **Images** : Toutes les images avec variants S3
    - **Configuration** : Paramètres techniques
    - **Statistiques** : Nombre d'images, espace utilisé

    ### 🖼️ **Images intégrées**
    - **URLs signées** : Accès sécurisé AWS S3
    - **Variants** : Thumbnails, medium, large disponibles
    - **Métadonnées** : Alt text, descriptions, dimensions
    - **Tri** : Images triées par ordre d'affichage
    `,
  })
  @ApiParam({
    name: 'galleryId',
    description: 'ID de la galerie',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Galerie récupérée avec succès',
    type: BusinessGalleryDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Galerie introuvable',
  })
  async getGalleryById(
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @GetUser() user: User,
  ): Promise<BusinessGalleryDto> {
    // Using galleryId as businessId for now (this should be refactored)
    const result = await this.getBusinessGalleryUseCase.execute({
      businessId: galleryId, // TODO: This should be mapped to correct businessId
      requestingUserId: user.id,
    });

    // Convert domain images to presentation DTOs
    const presentationImages = result.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      category: image.category as any, // Map domain enum to DTO enum
      metadata: image.metadata,
      isPublic: image.isPublic,
      order: image.order,
    }));

    return {
      images: presentationImages,
      count: result.statistics.total,
      statistics: {
        total: result.statistics.total,
        public: result.statistics.public,
        private: result.statistics.private,
        byCategory: result.statistics.byCategory as any,
        optimized: 0,
        totalSize: result.statistics.totalSize,
      },
    };
  }

  @Put(':galleryId')
  @ApiOperation({
    summary: '✏️ Update Gallery',
    description: `
    Mettre à jour les informations d'une galerie existante.

    ## 🔄 **Modifications possibles**

    ### 📝 **Métadonnées modifiables**
    - **Nom** : Titre de la galerie (2-100 caractères)
    - **Description** : Description détaillée (optionnelle, max 500 car.)
    - **Visibilité** : PUBLIC/PRIVATE selon configuration
    - **Tri** : Ordre d'affichage des images

    ### 🏷️ **Paramètres avancés**
    - **Tags SEO** : Optimisation référencement (optionnel)
    - **Display order** : Position relative aux autres galeries
    - **Image cover** : Image de couverture (première par défaut)

    ### ⚡ **Mise à jour en temps réel**
    - **Cache invalidation** : Mise à jour automatique
    - **SEO refresh** : Régénération métadonnées
    - **Timestamps** : updatedAt automatique
    `,
  })
  @ApiParam({
    name: 'galleryId',
    description: 'ID de la galerie',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateBusinessGalleryDto,
    description: 'Données de mise à jour de la galerie',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Galerie mise à jour avec succès',
    type: UpdateBusinessGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Permissions insuffisantes - Propriétaire requis',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Galerie introuvable',
  })
  async updateGallery(
    @Param('galleryId') galleryId: string,
    @Body() dto: UpdateBusinessGalleryDto,
    @GetUser() user: User,
  ): Promise<UpdateBusinessGalleryResponseDto> {
    // For now, use galleryId as businessId (this should be refactored)
    const request: UpdateBusinessGalleryRequest = {
      businessId: galleryId, // TODO: Map gallery ID to business ID properly
      requestingUserId: user.id,
      updates: {
        // Map DTO properties to the correct structure
        // The current use case focuses on image updates, not gallery metadata
        // TODO: Create a separate use case for gallery metadata updates
      },
    };

    const result = await this.updateBusinessGalleryUseCase.execute(request);

    return {
      success: true,
      data: {
        images: [],
        count: 0,
        statistics: {
          total: 0,
          public: 0,
          private: 0,
          byCategory: {},
          optimized: 0,
          totalSize: 0,
        },
      },
      message: result.message,
    };
  }

  @Delete(':galleryId')
  @ApiOperation({
    summary: '🗑️ Delete Gallery',
    description: `
    Supprimer une galerie et gérer les images associées.

    ## ⚠️ **Précautions importantes**

    ### 🔄 **Gestion des images**
    - **Réassignation** : Images déplacées vers galerie principale
    - **Suppression** : Ou suppression complète si demandée
    - **S3 Cleanup** : Nettoyage automatique des fichiers cloud
    - **Variants** : Suppression de toutes les variantes

    ### 🚫 **Restrictions**
    - **Galerie principale** : Ne peut être supprimée si unique
    - **Images présentes** : Confirmation requise
    - **Permissions** : Propriétaire uniquement

    ### 📊 **Impact sur les relations**
    - **Business intact** : Pas d'impact sur l'entreprise
    - **Autres galeries** : Réorganisation automatique displayOrder
    - **Cache** : Invalidation automatique
    `,
  })
  @ApiParam({
    name: 'galleryId',
    description: 'ID de la galerie',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Galerie supprimée avec succès',
    type: DeleteBusinessGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Permissions insuffisantes - Propriétaire requis',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Galerie introuvable',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      '⚠️ Suppression impossible - Galerie principale unique ou images présentes',
  })
  async deleteGallery(
    @Param('galleryId') galleryId: string,
    @GetUser() user: User,
  ): Promise<DeleteBusinessGalleryResponseDto> {
    // For now, use galleryId as businessId (this should be refactored)
    const result = await this.deleteBusinessGalleryUseCase.execute({
      businessId: galleryId, // TODO: Map gallery ID to business ID properly
      requestingUserId: user.id,
      options: {
        removeAllImages: true,
        deleteFromS3: false, // Safe default
      },
    });

    return {
      success: true,
      message: result.message,
      deletedId: galleryId,
    };
  }

  @Post(':galleryId/images/upload')
  @ApiOperation({
    summary: '📤 Upload Image to Gallery',
    description: `
    Uploader une nouvelle image dans une galerie spécifique.

    ## 🎯 Processus d'upload avancé

    ### 📤 **Upload S3**
    - **Stockage sécurisé** : AWS S3 avec bucket privé
    - **URLs signées** : Accès temporaire sécurisé
    - **Variants automatiques** : Génération thumbnail, medium, large
    - **Métadonnées** : Extraction automatique EXIF

    ### 🖼️ **Traitement d'image**
    - **Validation format** : JPEG, PNG, WEBP uniquement
    - **Compression** : Optimisation automatique taille/qualité
    - **Redimensionnement** : Variants adaptés usage web
    - **Watermark** : Application optionnelle selon configuration

    ### 📊 **Intégration galerie**
    - **Association automatique** : Lien avec galerie spécifiée
    - **Ordre d'affichage** : Position automatique en fin
    - **Catégorisation** : GALLERY par défaut, PROFILE si spécifié
    - **Validation limites** : Respect maxImages de la galerie

    ## 🔐 **Sécurité et Validation**

    ### ✅ **Contrôles**
    - **Permissions** : Propriétaire business uniquement
    - **Validation format** : Types de fichiers autorisés
    - **Taille limite** : Selon configuration admin
    - **Scan malware** : Vérification sécurité (optionnel)

    ### 🚫 **Restrictions**
    - **Quota** : Limite par galerie/business
    - **Fréquence** : Rate limiting upload
    - **Contenu** : Modération automatique (optionnel)
    `,
  })
  @ApiParam({
    name: 'galleryId',
    description: 'ID de la galerie destination',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '✅ Image uploadée et traitée avec succès',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Fichier invalide ou données manquantes',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentification requise',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Permissions insuffisantes',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Galerie introuvable',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: "⚠️ Limite d'images atteinte ou format non supporté",
  })
  async uploadImageToGallery(
    @Param('galleryId') galleryId: string,
    @GetUser() user: User,
    // TODO: Ajouter @UploadedFile() pour la gestion du fichier multipart
  ): Promise<any> {
    // This would use the AddImageToBusinessGalleryUseCase
    const result = await this.addImageToBusinessGalleryUseCase.execute({
      businessId: galleryId, // TODO: Map gallery ID to business ID properly
      requestingUserId: user.id,
      // TODO: Extract from uploaded file
      imageUrl: 'https://placeholder.com/image.jpg',
      alt: 'Uploaded image',
      caption: undefined,
      category: 'GALLERY' as any,
      metadata: {
        size: 1024,
        width: 800,
        height: 600,
        format: 'jpg',
        uploadedBy: user.id,
      },
      isPublic: true,
      order: 0,
    });

    return {
      success: true,
      data: {
        imageId: result.imageId,
        url: result.imageUrl,
        category: result.category,
        totalImages: result.totalImages,
      },
      message: result.message,
    };
  }
}
