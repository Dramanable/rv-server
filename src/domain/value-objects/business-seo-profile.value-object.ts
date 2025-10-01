/**
 * 🔍 BUSINESS SEO PROFILE VALUE OBJECT
 * ✅ Clean Architecture compliant
 * ✅ SEO optimization for business visibility
 */

import {
  RequiredValueError,
  ValueOutOfRangeError,
} from "@domain/exceptions/value-object.exceptions";

export interface SchemaOrgBusiness {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url?: string;
  telephone?: string;
  email?: string;
  address?: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    "@type": string;
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  image?: string[];
  priceRange?: string;
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
  };
}

export interface SeoMetrics {
  metaTitleLength: number;
  metaDescriptionLength: number;
  keywordDensity: number;
  imageAltTexts: number;
  structuredDataValid: boolean;
  lastOptimized: Date;
}

export class BusinessSeoProfile {
  constructor(
    private readonly _metaTitle: string,
    private readonly _metaDescription: string,
    private readonly _keywords: string[],
    private readonly _canonicalUrl: string | undefined,
    private readonly _openGraphTitle: string | undefined,
    private readonly _openGraphDescription: string | undefined,
    private readonly _openGraphImage: string | undefined,
    private readonly _structuredData: SchemaOrgBusiness,
    private readonly _customTags: Record<string, string>,
    private readonly _lastOptimized: Date,
  ) {
    this.validateMetaTitle();
    this.validateMetaDescription();
    this.validateKeywords();
    this.validateStructuredData();
  }

  static create(data: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
    openGraphTitle?: string;
    openGraphDescription?: string;
    openGraphImage?: string;
    structuredData: SchemaOrgBusiness;
    customTags?: Record<string, string>;
  }): BusinessSeoProfile {
    return new BusinessSeoProfile(
      data.metaTitle,
      data.metaDescription,
      data.keywords,
      data.canonicalUrl,
      data.openGraphTitle,
      data.openGraphDescription,
      data.openGraphImage,
      data.structuredData,
      data.customTags || {},
      new Date(),
    );
  }

  // Getters
  get metaTitle(): string {
    return this._metaTitle;
  }

  get metaDescription(): string {
    return this._metaDescription;
  }

  get keywords(): string[] {
    return [...this._keywords];
  }

  get canonicalUrl(): string | undefined {
    return this._canonicalUrl;
  }

  get openGraphTitle(): string | undefined {
    return this._openGraphTitle;
  }

  get openGraphDescription(): string | undefined {
    return this._openGraphDescription;
  }

  get openGraphImage(): string | undefined {
    return this._openGraphImage;
  }

  get structuredData(): SchemaOrgBusiness {
    return { ...this._structuredData };
  }

  get customTags(): Record<string, string> {
    return { ...this._customTags };
  }

  get lastOptimized(): Date {
    return this._lastOptimized;
  }

  // SEO Generation methods
  generateMetaTags(): Record<string, string> {
    const tags: Record<string, string> = {
      title: this._metaTitle,
      description: this._metaDescription,
      keywords: this._keywords.join(", "),
    };

    if (this._canonicalUrl) {
      tags["canonical"] = this._canonicalUrl;
    }

    // Open Graph tags
    if (this._openGraphTitle) {
      tags["og:title"] = this._openGraphTitle;
    }
    if (this._openGraphDescription) {
      tags["og:description"] = this._openGraphDescription;
    }
    if (this._openGraphImage) {
      tags["og:image"] = this._openGraphImage;
    }

    // Custom tags
    Object.entries(this._customTags).forEach(([key, value]) => {
      tags[key] = value;
    });

    return tags;
  }

  generateStructuredDataJson(): string {
    return JSON.stringify(this._structuredData, null, 2);
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Sitemap: ${this._canonicalUrl}/sitemap.xml

# Business-specific crawling rules
Crawl-delay: 1
Allow: /services
Allow: /gallery
Allow: /contact
Allow: /about`;
  }

  generateSitemapEntry(): {
    url: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  } {
    return {
      url: this._canonicalUrl || "",
      lastmod: this._lastOptimized.toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "1.0",
    };
  }

  // SEO Optimization methods
  optimizeForLocalSearch(
    cityName: string,
    businessType: string,
  ): BusinessSeoProfile {
    const optimizedTitle = `${this._metaTitle} - ${businessType} à ${cityName}`;
    const optimizedDescription = `${this._metaDescription} Situé à ${cityName}.`;

    const localKeywords = [
      ...this._keywords,
      cityName.toLowerCase(),
      `${businessType.toLowerCase()} ${cityName.toLowerCase()}`,
      `meilleur ${businessType.toLowerCase()} ${cityName.toLowerCase()}`,
    ];

    return BusinessSeoProfile.create({
      metaTitle: optimizedTitle.substring(0, 60), // SEO title limit
      metaDescription: optimizedDescription.substring(0, 160), // SEO description limit
      keywords: Array.from(new Set(localKeywords)), // Remove duplicates
      canonicalUrl: this._canonicalUrl,
      openGraphTitle: this._openGraphTitle,
      openGraphDescription: this._openGraphDescription,
      openGraphImage: this._openGraphImage,
      structuredData: this._structuredData,
      customTags: this._customTags,
    });
  }

  addKeywords(newKeywords: string[]): BusinessSeoProfile {
    const allKeywords = [...this._keywords, ...newKeywords];
    const uniqueKeywords = Array.from(
      new Set(allKeywords.map((k) => k.toLowerCase())),
    );

    if (uniqueKeywords.length > 10) {
      throw new ValueOutOfRangeError(
        "keywords.length",
        uniqueKeywords.length,
        1,
        10,
      );
    }

    return BusinessSeoProfile.create({
      metaTitle: this._metaTitle,
      metaDescription: this._metaDescription,
      keywords: uniqueKeywords,
      canonicalUrl: this._canonicalUrl,
      openGraphTitle: this._openGraphTitle,
      openGraphDescription: this._openGraphDescription,
      openGraphImage: this._openGraphImage,
      structuredData: this._structuredData,
      customTags: this._customTags,
    });
  }

  updateStructuredData(
    updatedData: Partial<SchemaOrgBusiness>,
  ): BusinessSeoProfile {
    const newStructuredData = { ...this._structuredData, ...updatedData };

    return BusinessSeoProfile.create({
      metaTitle: this._metaTitle,
      metaDescription: this._metaDescription,
      keywords: this._keywords,
      canonicalUrl: this._canonicalUrl,
      openGraphTitle: this._openGraphTitle,
      openGraphDescription: this._openGraphDescription,
      openGraphImage: this._openGraphImage,
      structuredData: newStructuredData,
      customTags: this._customTags,
    });
  }

  // Analysis methods
  analyzeMetrics(): SeoMetrics {
    return {
      metaTitleLength: this._metaTitle.length,
      metaDescriptionLength: this._metaDescription.length,
      keywordDensity: this.calculateKeywordDensity(),
      imageAltTexts: 0, // Would need images context
      structuredDataValid: this.validateStructuredDataSilent(),
      lastOptimized: this._lastOptimized,
    };
  }

  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this._metaTitle.length < 30) {
      suggestions.push(
        "Meta title too short - consider adding location or business type",
      );
    }
    if (this._metaTitle.length > 60) {
      suggestions.push("Meta title too long - shorten to under 60 characters");
    }
    if (this._metaDescription.length < 120) {
      suggestions.push(
        "Meta description too short - expand to 120-160 characters",
      );
    }
    if (this._metaDescription.length > 160) {
      suggestions.push(
        "Meta description too long - shorten to under 160 characters",
      );
    }
    if (this._keywords.length < 3) {
      suggestions.push("Add more relevant keywords (3-10 recommended)");
    }
    if (this._keywords.length > 10) {
      suggestions.push("Too many keywords - focus on 3-10 most relevant ones");
    }
    if (!this._canonicalUrl) {
      suggestions.push("Add canonical URL to prevent duplicate content issues");
    }
    if (!this._openGraphImage) {
      suggestions.push("Add Open Graph image for better social media sharing");
    }

    return suggestions;
  }

  private calculateKeywordDensity(): number {
    const content = `${this._metaTitle} ${this._metaDescription}`.toLowerCase();
    const words = content.split(/\s+/);
    const keywordMatches = this._keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword.toLowerCase(), "g");
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    return words.length > 0 ? (keywordMatches / words.length) * 100 : 0;
  }

  // Validation methods
  private validateMetaTitle(): void {
    if (!this._metaTitle || this._metaTitle.trim().length === 0) {
      throw new RequiredValueError("metaTitle");
    }
    if (this._metaTitle.length > 60) {
      throw new ValueOutOfRangeError(
        "metaTitle.length",
        this._metaTitle.length,
        1,
        60,
      );
    }
  }

  private validateMetaDescription(): void {
    if (!this._metaDescription || this._metaDescription.trim().length === 0) {
      throw new RequiredValueError("metaDescription");
    }
    if (this._metaDescription.length > 160) {
      throw new ValueOutOfRangeError(
        "metaDescription.length",
        this._metaDescription.length,
        1,
        160,
      );
    }
  }

  private validateKeywords(): void {
    if (this._keywords.length === 0) {
      throw new RequiredValueError("keywords");
    }
    if (this._keywords.length > 10) {
      throw new ValueOutOfRangeError(
        "keywords.length",
        this._keywords.length,
        1,
        10,
      );
    }

    this._keywords.forEach((keyword) => {
      if (!keyword || keyword.trim().length === 0) {
        throw new RequiredValueError("keyword");
      }
      if (keyword.length > 50) {
        throw new ValueOutOfRangeError("keyword.length", keyword.length, 1, 50);
      }
    });
  }

  private validateStructuredData(): void {
    if (!this._structuredData["@context"] || !this._structuredData["@type"]) {
      throw new RequiredValueError("structuredData.@context/@type");
    }
    if (!this._structuredData.name || !this._structuredData.description) {
      throw new RequiredValueError("structuredData.name/description");
    }
  }

  private validateStructuredDataSilent(): boolean {
    try {
      this.validateStructuredData();
      return true;
    } catch {
      return false;
    }
  }

  // Equality
  equals(other: BusinessSeoProfile): boolean {
    return (
      this._metaTitle === other._metaTitle &&
      this._metaDescription === other._metaDescription &&
      JSON.stringify(this._keywords.sort()) ===
        JSON.stringify(other._keywords.sort()) &&
      this._canonicalUrl === other._canonicalUrl
    );
  }

  toString(): string {
    return `BusinessSeoProfile(${this._metaTitle})`;
  }
}
