/**
 * 🌩️ AWS S3 CONFIGURATION
 * ✅ Configuration centralisée pour images business
 * ✅ Support multi-environnements (dev, staging, prod)
 * ✅ Sécurité et performance optimisées
 */

import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export interface AwsS3ConfigOptions {
  readonly region: string;
  readonly bucketName: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly endpoint?: string; // Pour LocalStack en dev
  readonly forcePathStyle?: boolean; // Pour LocalStack
}

export class AwsS3Config {
  private readonly _region: string;
  private readonly _bucketName: string;
  private readonly _accessKeyId: string;
  private readonly _secretAccessKey: string;
  private readonly _endpoint?: string;
  private readonly _forcePathStyle: boolean;

  constructor(private readonly configService: ConfigService) {
    // Récupération depuis variables d'environnement
    this._region = this.configService.get<string>('AWS_S3_REGION', 'eu-west-1');
    this._bucketName =
      this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
      this.getDefaultBucketName();
    this._accessKeyId =
      this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
    this._secretAccessKey =
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';

    // Configuration pour développement local (LocalStack)
    this._endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    this._forcePathStyle = this.configService.get<boolean>(
      'AWS_S3_FORCE_PATH_STYLE',
      false,
    );

    this.validateConfiguration();
  }

  private getDefaultBucketName(): string {
    const env = this.configService.get<string>('NODE_ENV', 'development');
    return `business-images-${env}`;
  }

  private validateConfiguration(): void {
    const requiredFields = [
      { key: 'AWS_S3_REGION', value: this._region },
      { key: 'AWS_S3_BUCKET_NAME', value: this._bucketName },
    ];

    // En production, les clés AWS sont obligatoires
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      requiredFields.push(
        { key: 'AWS_ACCESS_KEY_ID', value: this._accessKeyId },
        { key: 'AWS_SECRET_ACCESS_KEY', value: this._secretAccessKey },
      );
    }

    for (const field of requiredFields) {
      if (!field.value) {
        throw new Error(`Missing required AWS S3 configuration: ${field.key}`);
      }
    }
  }

  // Getters
  get region(): string {
    return this._region;
  }

  get bucketName(): string {
    return this._bucketName;
  }

  get accessKeyId(): string {
    return this._accessKeyId;
  }

  get secretAccessKey(): string {
    return this._secretAccessKey;
  }

  get endpoint(): string | undefined {
    return this._endpoint;
  }

  get forcePathStyle(): boolean {
    return this._forcePathStyle;
  }

  // Factory pour S3Client
  createS3Client(): S3Client {
    const clientConfig: any = {
      region: this._region,
    };

    // Configuration des credentials si disponibles
    if (this._accessKeyId && this._secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: this._accessKeyId,
        secretAccessKey: this._secretAccessKey,
      };
    }

    // Configuration pour développement local (LocalStack)
    if (this._endpoint) {
      clientConfig.endpoint = this._endpoint;
      clientConfig.forcePathStyle = this._forcePathStyle;
    }

    return new S3Client(clientConfig);
  }

  // URLs et chemins
  getPublicUrl(s3Key: string): string {
    if (this._endpoint) {
      // LocalStack ou endpoint personnalisé
      return `${this._endpoint}/${this._bucketName}/${s3Key}`;
    }

    // AWS S3 standard
    return `https://${this._bucketName}.s3.${this._region}.amazonaws.com/${s3Key}`;
  }

  generateS3Key(
    businessId: string,
    category: string,
    fileName: string,
  ): string {
    // Sanitization du nom de fichier
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '');

    return `${businessId}/${category.toLowerCase()}/${sanitizedFileName}`;
  }

  // Configuration pour différents environnements
  isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  // Paramètres de signature URL
  getSignedUrlExpiration(): number {
    // Plus long en développement pour faciliter les tests
    return this.isDevelopment() ? 3600 * 24 : 3600; // 24h dev, 1h prod
  }

  // Configuration CORS pour uploads directs
  getCorsConfiguration(): any {
    return {
      CORSRules: [
        {
          AllowedOrigins: this.getAllowedOrigins(),
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
          AllowedHeaders: ['*'],
          MaxAgeSeconds: 3600,
        },
      ],
    };
  }

  private getAllowedOrigins(): string[] {
    const origins = this.configService.get<string>('CORS_ORIGINS', '');

    if (this.isDevelopment()) {
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        ...origins.split(','),
      ];
    }

    return origins.split(',').filter((origin) => origin.trim());
  }

  // Logging configuration (sans exposer les secrets)
  toLogSafeObject(): Record<string, any> {
    return {
      region: this._region,
      bucketName: this._bucketName,
      endpoint: this._endpoint,
      forcePathStyle: this._forcePathStyle,
      hasCredentials: !!(this._accessKeyId && this._secretAccessKey),
      environment: this.configService.get<string>('NODE_ENV'),
    };
  }
}
