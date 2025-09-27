/**
 * 🔍 UPDATE BUSINESS SEO PROFILE USE CASE
 * ✅ Clean Architecture - Application Layer
 * ✅ Business rules for SEO optimization
 */

import { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import {
  BusinessSeoProfile,
  SchemaOrgBusiness,
} from '../../../domain/value-objects/business-seo-profile.value-object';
import { BusinessNotFoundError } from '../../exceptions/business.exceptions';

export interface UpdateBusinessSeoProfileRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly seoData: {
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly keywords: string[];
    readonly canonicalUrl?: string;
    readonly openGraphTitle?: string;
    readonly openGraphDescription?: string;
    readonly openGraphImage?: string;
    readonly structuredData: SchemaOrgBusiness;
    readonly customTags?: Record<string, string>;
  };
  readonly autoOptimizeForLocal?: boolean;
}

export interface UpdateBusinessSeoProfileResponse {
  readonly seoProfile: BusinessSeoProfile;
  readonly metrics: {
    readonly metaTitleLength: number;
    readonly metaDescriptionLength: number;
    readonly keywordDensity: number;
    readonly structuredDataValid: boolean;
  };
  readonly optimizationSuggestions: string[];
  readonly message: string;
}

export class UpdateBusinessSeoProfileUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    request: UpdateBusinessSeoProfileRequest,
  ): Promise<UpdateBusinessSeoProfileResponse> {
    // 1. Récupération du business
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new BusinessNotFoundError(request.businessId);
    }

    // 2. Validation des permissions
    // TODO: Vérifier que l'utilisateur peut modifier ce business
    // if (!business.canBeModifiedBy(request.requestingUserId)) {
    //   throw new BusinessPermissionError(request.requestingUserId, request.businessId);
    // }

    // 3. Création du profil SEO
    let seoProfile = BusinessSeoProfile.create({
      metaTitle: request.seoData.metaTitle,
      metaDescription: request.seoData.metaDescription,
      keywords: request.seoData.keywords,
      canonicalUrl: request.seoData.canonicalUrl,
      openGraphTitle: request.seoData.openGraphTitle,
      openGraphDescription: request.seoData.openGraphDescription,
      openGraphImage: request.seoData.openGraphImage,
      structuredData: request.seoData.structuredData,
      customTags: request.seoData.customTags,
    });

    // 4. Optimisation automatique pour la recherche locale
    if (request.autoOptimizeForLocal) {
      const cityName = business.address.getCity();
      const businessType = business.sector?.name || 'Service';

      seoProfile = seoProfile.optimizeForLocalSearch(cityName, businessType);
    }

    // 5. Mise à jour du business avec le nouveau profil SEO
    const updatedBusiness = business.updateSeoProfile(seoProfile);

    // 6. Sauvegarde
    await this.businessRepository.save(updatedBusiness);

    // 7. Analyse des métriques et suggestions
    const metrics = seoProfile.analyzeMetrics();
    const suggestions = seoProfile.getOptimizationSuggestions();

    return {
      seoProfile,
      metrics: {
        metaTitleLength: metrics.metaTitleLength,
        metaDescriptionLength: metrics.metaDescriptionLength,
        keywordDensity: metrics.keywordDensity,
        structuredDataValid: metrics.structuredDataValid,
      },
      optimizationSuggestions: suggestions,
      message: `Profil SEO mis à jour avec succès. ${suggestions.length} suggestions d'optimisation disponibles.`,
    };
  }
}

/**
 * 🤖 GENERATE BASIC SEO PROFILE USE CASE
 * ✅ Génération automatique d'un profil SEO de base
 */
export class GenerateBasicSeoProfileUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    businessId: string,
    requestingUserId: string,
  ): Promise<UpdateBusinessSeoProfileResponse> {
    // 1. Récupération du business
    const businessIdVO = BusinessId.create(businessId);
    const business = await this.businessRepository.findById(businessIdVO);
    if (!business) {
      throw new BusinessNotFoundError(businessId);
    }

    // 2. Génération automatique du profil SEO de base
    const basicSeoProfile = business.generateBasicSeoProfile();

    // 3. Mise à jour du business
    const updatedBusiness = business.updateSeoProfile(basicSeoProfile);

    // 4. Sauvegarde
    await this.businessRepository.save(updatedBusiness);

    // 5. Analyse et suggestions
    const metrics = basicSeoProfile.analyzeMetrics();
    const suggestions = basicSeoProfile.getOptimizationSuggestions();

    return {
      seoProfile: basicSeoProfile,
      metrics: {
        metaTitleLength: metrics.metaTitleLength,
        metaDescriptionLength: metrics.metaDescriptionLength,
        keywordDensity: metrics.keywordDensity,
        structuredDataValid: metrics.structuredDataValid,
      },
      optimizationSuggestions: suggestions,
      message: `Profil SEO de base généré automatiquement. Vous pouvez maintenant le personnaliser selon vos besoins.`,
    };
  }
}

/**
 * 🗺️ GENERATE SITEMAP USE CASE
 * ✅ Génération de sitemap XML pour le référencement
 */
export interface GenerateSitemapRequest {
  readonly businessId: string;
  readonly baseUrl: string;
  readonly includeImages?: boolean;
  readonly includeServices?: boolean;
}

export interface GenerateSitemapResponse {
  readonly sitemapXml: string;
  readonly entries: Array<{
    readonly url: string;
    readonly lastmod: string;
    readonly changefreq: string;
    readonly priority: string;
  }>;
  readonly imageCount: number;
  readonly message: string;
}

export class GenerateSitemapUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    request: GenerateSitemapRequest,
  ): Promise<GenerateSitemapResponse> {
    // 1. Récupération du business
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new BusinessNotFoundError(request.businessId);
    }

    // 2. Génération des entrées du sitemap
    const entries: Array<{
      url: string;
      lastmod: string;
      changefreq: string;
      priority: string;
    }> = [];

    // Page principale du business
    if (business.seoProfile) {
      entries.push(business.seoProfile.generateSitemapEntry());
    } else {
      entries.push({
        url: request.baseUrl,
        lastmod: business.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '1.0',
      });
    }

    // Pages des services
    if (request.includeServices) {
      // TODO: Intégrer avec les services du business
      entries.push({
        url: `${request.baseUrl}/services`,
        lastmod: business.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.8',
      });
    }

    // Pages de galerie
    if (request.includeImages && business.gallery.count > 0) {
      entries.push({
        url: `${request.baseUrl}/gallery`,
        lastmod: business.updatedAt.toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.6',
      });
    }

    // 3. Génération du XML
    const sitemapXml = this.generateSitemapXml(
      entries,
      business.gallery.generateImageSitemap(),
    );

    return {
      sitemapXml,
      entries,
      imageCount: business.gallery.count,
      message: `Sitemap généré avec succès. ${entries.length} pages, ${business.gallery.count} images.`,
    };
  }

  private generateSitemapXml(
    entries: Array<{
      url: string;
      lastmod: string;
      changefreq: string;
      priority: string;
    }>,
    imageEntries: Array<{ url: string; caption?: string; title: string }>,
  ): string {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    entries.forEach((entry) => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${entry.url}</loc>\n`;
      sitemap += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${entry.priority}</priority>\n`;

      // Ajouter les images pour la page principale
      if (entry.priority === '1.0') {
        imageEntries.forEach((image) => {
          sitemap += '    <image:image>\n';
          sitemap += `      <image:loc>${image.url}</image:loc>\n`;
          sitemap += `      <image:title>${image.title}</image:title>\n`;
          if (image.caption) {
            sitemap += `      <image:caption>${image.caption}</image:caption>\n`;
          }
          sitemap += '    </image:image>\n';
        });
      }

      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
  }
}
