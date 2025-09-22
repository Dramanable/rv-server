/**
 * 🔍 BUSINESS SEO PROFILE DTOs
 * ✅ Validation et documentation Swagger
 * ✅ Types pour optimisation SEO et référencement
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

// === SCHEMA.ORG ADDRESS DTO ===
export class SchemaOrgAddressDto {
  @ApiProperty({
    description: 'Schema.org type',
    example: 'PostalAddress',
    default: 'PostalAddress',
  })
  '@type'!: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Rue de la Paix',
  })
  @IsString()
  streetAddress!: string;

  @ApiProperty({
    description: 'City/Locality',
    example: 'Paris',
  })
  @IsString()
  addressLocality!: string;

  @ApiProperty({
    description: 'Postal code',
    example: '75001',
  })
  @IsString()
  postalCode!: string;

  @ApiProperty({
    description: 'Country',
    example: 'France',
  })
  @IsString()
  addressCountry!: string;
}

// === SCHEMA.ORG GEO DTO ===
export class SchemaOrgGeoDto {
  @ApiProperty({
    description: 'Schema.org type',
    example: 'GeoCoordinates',
    default: 'GeoCoordinates',
  })
  '@type'!: string;

  @ApiProperty({
    description: 'Latitude',
    example: 48.8566,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({
    description: 'Longitude',
    example: 2.3522,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}

// === SCHEMA.ORG RATING DTO ===
export class SchemaOrgRatingDto {
  @ApiProperty({
    description: 'Schema.org type',
    example: 'AggregateRating',
    default: 'AggregateRating',
  })
  '@type'!: string;

  @ApiProperty({
    description: 'Rating value',
    example: 4.5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingValue!: number;

  @ApiProperty({
    description: 'Number of reviews',
    example: 127,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  reviewCount!: number;
}

// === SCHEMA.ORG BUSINESS DTO ===
export class SchemaOrgBusinessDto {
  @ApiProperty({
    description: 'Schema.org context',
    example: 'https://schema.org',
    default: 'https://schema.org',
  })
  '@context'!: string;

  @ApiProperty({
    description: 'Schema.org type',
    example: 'LocalBusiness',
    default: 'LocalBusiness',
  })
  '@type'!: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Cabinet Médical Centre Ville',
  })
  @IsString()
  @Length(3, 100)
  name!: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Cabinet médical spécialisé en médecine générale et pédiatrie',
  })
  @IsString()
  @Length(50, 500)
  description!: string;

  @ApiPropertyOptional({
    description: 'Business website URL',
    example: 'https://www.cabinet-exemple.fr',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    description: 'Business phone number',
    example: '+33123456789',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Business email',
    example: 'contact@cabinet-exemple.fr',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Business address',
    type: SchemaOrgAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SchemaOrgAddressDto)
  address?: SchemaOrgAddressDto;

  @ApiPropertyOptional({
    description: 'Geographic coordinates',
    type: SchemaOrgGeoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SchemaOrgGeoDto)
  geo?: SchemaOrgGeoDto;

  @ApiPropertyOptional({
    description: 'Opening hours',
    example: ['Mo-Fr 09:00-17:00', 'Sa 09:00-12:00'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  openingHours?: string[];

  @ApiPropertyOptional({
    description: 'Business images',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  image?: string[];

  @ApiPropertyOptional({
    description: 'Price range',
    example: '€€',
  })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({
    description: 'Aggregate rating',
    type: SchemaOrgRatingDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SchemaOrgRatingDto)
  aggregateRating?: SchemaOrgRatingDto;
}

// === SEO METRICS DTO ===
export class SeoMetricsDto {
  @ApiProperty({
    description: 'Meta title length',
    example: 48,
  })
  readonly metaTitleLength!: number;

  @ApiProperty({
    description: 'Meta description length',
    example: 142,
  })
  readonly metaDescriptionLength!: number;

  @ApiProperty({
    description: 'Keyword density percentage',
    example: 2.3,
  })
  readonly keywordDensity!: number;

  @ApiProperty({
    description: 'Number of images with alt text',
    example: 12,
  })
  readonly imageAltTexts!: number;

  @ApiProperty({
    description: 'Whether structured data is valid',
    example: true,
  })
  readonly structuredDataValid!: boolean;

  @ApiProperty({
    description: 'Last optimization date',
    example: '2024-01-15T10:30:00Z',
  })
  readonly lastOptimized!: Date;
}

// === CREATE SEO PROFILE DTO ===
export class CreateBusinessSeoProfileDto {
  @ApiProperty({
    description: 'Meta title (30-60 characters)',
    example: 'Cabinet Médical Centre Ville - Médecin à Paris',
    minLength: 30,
    maxLength: 60,
  })
  @IsString()
  @Length(30, 60, {
    message: 'Meta title must be between 30 and 60 characters',
  })
  readonly metaTitle!: string;

  @ApiProperty({
    description: 'Meta description (120-160 characters)',
    example:
      'Cabinet médical spécialisé en médecine générale et pédiatrie. Consultation sur rendez-vous au cœur de Paris. Équipe médicale expérimentée.',
    minLength: 120,
    maxLength: 160,
  })
  @IsString()
  @Length(120, 160, {
    message: 'Meta description must be between 120 and 160 characters',
  })
  readonly metaDescription!: string;

  @ApiProperty({
    description: 'SEO keywords (3-10 keywords)',
    example: [
      'médecin paris',
      'cabinet médical',
      'consultation médicale',
      'pédiatre',
    ],
    minItems: 3,
    maxItems: 10,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @Length(2, 50, {
    each: true,
    message: 'Each keyword must be between 2 and 50 characters',
  })
  readonly keywords!: string[];

  @ApiPropertyOptional({
    description: 'Canonical URL',
    example: 'https://www.cabinet-exemple.fr',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Canonical URL must be valid' })
  readonly canonicalUrl?: string;

  @ApiPropertyOptional({
    description: 'Open Graph title',
    example: 'Cabinet Médical Centre Ville - Votre santé, notre priorité',
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  readonly openGraphTitle?: string;

  @ApiPropertyOptional({
    description: 'Open Graph description',
    example:
      'Prenez rendez-vous avec nos médecins spécialisés. Cabinet moderne au cœur de Paris.',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  readonly openGraphDescription?: string;

  @ApiPropertyOptional({
    description: 'Open Graph image URL',
    example: 'https://www.cabinet-exemple.fr/images/og-image.jpg',
  })
  @IsOptional()
  @IsUrl()
  readonly openGraphImage?: string;

  @ApiProperty({
    description: 'Structured data (Schema.org)',
    type: SchemaOrgBusinessDto,
  })
  @ValidateNested()
  @Type(() => SchemaOrgBusinessDto)
  readonly structuredData!: SchemaOrgBusinessDto;

  @ApiPropertyOptional({
    description: 'Custom meta tags',
    example: {
      'twitter:card': 'summary_large_image',
      'twitter:site': '@cabinet_exemple',
      author: 'Cabinet Médical Centre Ville',
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  readonly customTags?: Record<string, string>;
}

// === UPDATE SEO PROFILE DTO ===
export class UpdateBusinessSeoProfileDto {
  @ApiPropertyOptional({
    description: 'Meta title (30-60 characters)',
    example: 'Cabinet Médical Centre Ville - Médecin à Paris 75001',
    minLength: 30,
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  @Length(30, 60)
  readonly metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Meta description (120-160 characters)',
    example:
      'Cabinet médical spécialisé en médecine générale et pédiatrie. Consultation sur rendez-vous. Équipe médicale expérimentée à Paris.',
    minLength: 120,
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @Length(120, 160)
  readonly metaDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO keywords (3-10 keywords)',
    example: [
      'médecin paris 1er',
      'cabinet médical louvre',
      'consultation médicale',
    ],
    minItems: 3,
    maxItems: 10,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 50, { each: true })
  readonly keywords?: string[];

  @ApiPropertyOptional({
    description: 'Canonical URL',
    example: 'https://www.cabinet-exemple.fr/paris-1er',
  })
  @IsOptional()
  @IsUrl()
  readonly canonicalUrl?: string;

  @ApiPropertyOptional({
    description: 'Structured data updates',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  readonly structuredDataUpdates?: Record<string, any>;
}

// === BUSINESS SEO PROFILE DTO ===
export class BusinessSeoProfileDto {
  @ApiProperty({
    description: 'Meta title',
    example: 'Cabinet Médical Centre Ville - Médecin à Paris',
  })
  readonly metaTitle!: string;

  @ApiProperty({
    description: 'Meta description',
    example: 'Cabinet médical spécialisé en médecine générale et pédiatrie...',
  })
  readonly metaDescription!: string;

  @ApiProperty({
    description: 'SEO keywords',
    example: ['médecin paris', 'cabinet médical', 'consultation médicale'],
    type: [String],
  })
  readonly keywords!: string[];

  @ApiPropertyOptional({
    description: 'Canonical URL',
    example: 'https://www.cabinet-exemple.fr',
  })
  readonly canonicalUrl?: string;

  @ApiProperty({
    description: 'Generated meta tags',
    example: {
      title: 'Cabinet Médical Centre Ville - Médecin à Paris',
      description: 'Cabinet médical spécialisé...',
      keywords: 'médecin paris, cabinet médical',
    },
    type: 'object',
    additionalProperties: true,
  })
  readonly metaTags!: Record<string, string>;

  @ApiProperty({
    description: 'Structured data (JSON-LD)',
    type: SchemaOrgBusinessDto,
  })
  readonly structuredData!: SchemaOrgBusinessDto;

  @ApiProperty({
    description: 'SEO metrics and analysis',
    type: SeoMetricsDto,
  })
  readonly metrics!: SeoMetricsDto;

  @ApiProperty({
    description: 'SEO optimization suggestions',
    example: [
      'Add more relevant keywords for local search',
      'Consider adding Open Graph image for better social sharing',
    ],
    type: [String],
  })
  readonly optimizationSuggestions!: string[];

  @ApiProperty({
    description: 'Last optimization date',
    example: '2024-01-15T10:30:00Z',
  })
  readonly lastOptimized!: Date;
}

// === SEO PROFILE RESPONSE DTO ===
export class BusinessSeoProfileResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'SEO profile data',
    type: BusinessSeoProfileDto,
  })
  readonly data!: BusinessSeoProfileDto;

  @ApiProperty({
    description: 'Response message',
    example: 'SEO profile retrieved successfully',
  })
  readonly message!: string;
}

// === GENERATE SITEMAP RESPONSE DTO ===
export class GenerateSitemapResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Generated sitemap XML',
    example: '<?xml version="1.0" encoding="UTF-8"?>...',
  })
  readonly data!: {
    readonly sitemapXml: string;
    readonly entries: Array<{
      readonly url: string;
      readonly lastmod: string;
      readonly changefreq: string;
      readonly priority: string;
    }>;
  };

  @ApiProperty({
    description: 'Response message',
    example: 'Sitemap generated successfully',
  })
  readonly message!: string;
}

// === UPDATE BUSINESS SEO DTO ===
export class UpdateBusinessSeoDto {
  @ApiPropertyOptional({
    description: 'Meta title for SEO',
    example: 'Best Hair Salon in Paris | Expert Stylists',
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  readonly metaTitle?: string;

  @ApiPropertyOptional({
    description: 'Meta description for SEO',
    example:
      'Professional hair styling and treatments by expert stylists in the heart of Paris.',
    maxLength: 160,
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  readonly metaDescription?: string;

  @ApiPropertyOptional({
    description: 'SEO keywords',
    example: ['hair salon', 'paris', 'styling', 'treatments'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly keywords?: string[];

  @ApiPropertyOptional({
    description: 'Canonical URL',
    example: 'https://example.com/salon',
  })
  @IsOptional()
  @IsUrl()
  readonly canonicalUrl?: string;
}

// === UPDATE BUSINESS SEO RESPONSE DTO ===
export class UpdateBusinessSeoResponseDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Updated business ID',
    example: 'business_123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'SEO score after update',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  readonly seoScore!: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Business SEO updated successfully',
  })
  readonly message!: string;
}
