import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { GetUser } from '../security/decorators/get-user.decorator';
import { User } from '../../domain/entities/user.entity';

import {
  CreateBusinessGalleryDto,
  CreateBusinessGalleryResponseDto,
  UpdateBusinessGalleryDto,
  UpdateBusinessGalleryResponseDto,
  BusinessGalleryDto,
  DeleteBusinessGalleryResponseDto,
} from '../dtos/business-gallery.dto';

import { CreateBusinessGalleryUseCase } from '../../application/use-cases/business/create-business-gallery.use-case';
import { GetBusinessGalleryUseCase } from '../../application/use-cases/business/get-business-gallery.use-case';
import { AddImageToBusinessGalleryUseCase } from '../../application/use-cases/business/add-image-to-business-gallery.use-case';

@ApiTags('🖼️ Business Gallery')
@Controller('business-galleries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BusinessGalleryController {
  constructor(
    private readonly createBusinessGalleryUseCase: CreateBusinessGalleryUseCase,
    private readonly getBusinessGalleryUseCase: GetBusinessGalleryUseCase,
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
    // TODO: Implémenter le use case de création de galerie
    throw new Error('Not implemented yet');
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
    // TODO: Implémenter le use case de récupération des galeries
    throw new Error('Not implemented yet');
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
    // TODO: Implémenter le use case de récupération d'une galerie
    throw new Error('Not implemented yet');
  }

  @Put(':galleryId')
  @ApiOperation({
    summary: '✏️ Update Gallery',
    description: `
    Mettre à jour les informations d'une galerie.

    ## 🎯 Modifications possibles

    ### 📝 **Métadonnées**
    - **Nom** : Renommer la galerie
    - **Description** : Modifier description détaillée
    - **Ordre d'affichage** : Réorganiser les galeries
    - **Statut** : Activer/désactiver temporairement

    ### ⚙️ **Configuration**
    - **Limite d'images** : Ajuster maxImages
    - **Formats autorisés** : Modifier types de fichiers
    - **Taille vignettes** : Personnaliser dimensions

    ### 🔒 **Règles métier**
    - **Galerie principale** : Une seule par business
    - **Validation** : Cohérence des paramètres
    - **Permissions** : Propriétaire uniquement
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
    description: '🚫 Permissions insuffisantes',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❌ Galerie introuvable',
  })
  async updateGallery(
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @Body() dto: UpdateBusinessGalleryDto,
    @GetUser() user: User,
  ): Promise<UpdateBusinessGalleryResponseDto> {
    // TODO: Implémenter le use case de mise à jour de galerie
    throw new Error('Not implemented yet');
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
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @GetUser() user: User,
  ): Promise<DeleteBusinessGalleryResponseDto> {
    // TODO: Implémenter le use case de suppression de galerie
    throw new Error('Not implemented yet');
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
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @GetUser() user: User,
    // TODO: Ajouter @UploadedFile() pour la gestion du fichier multipart
  ): Promise<any> {
    // TODO: Implémenter l'upload d'image vers une galerie
    throw new Error('Not implemented yet');
  }
}
