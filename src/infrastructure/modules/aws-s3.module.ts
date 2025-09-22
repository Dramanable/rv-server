/**
 * 🌩️ AWS S3 SERVICE PROVIDER
 * ✅ Intégration NestJS avec AWS S3
 * ✅ Gestion du cycle de vie et configuration
 */

import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AwsS3Config } from '../config/aws-s3.config';
import { AwsS3ImageService } from '../services/aws-s3-image.service';
import { TOKENS } from '../../shared/constants/injection-tokens';

const awsS3ConfigProvider: Provider = {
  provide: TOKENS.AWS_S3_CONFIG,
  useFactory: (configService: ConfigService) => {
    return new AwsS3Config(configService);
  },
  inject: [ConfigService],
};

const awsS3ImageServiceProvider: Provider = {
  provide: TOKENS.AWS_S3_IMAGE_SERVICE,
  useFactory: (s3Config: AwsS3Config) => {
    const s3Client = s3Config.createS3Client();
    return new AwsS3ImageService(
      s3Client,
      s3Config.bucketName,
      s3Config.region,
    );
  },
  inject: [TOKENS.AWS_S3_CONFIG],
};

@Module({
  imports: [ConfigModule],
  providers: [awsS3ConfigProvider, awsS3ImageServiceProvider],
  exports: [TOKENS.AWS_S3_CONFIG, TOKENS.AWS_S3_IMAGE_SERVICE],
})
export class AwsS3Module {}
