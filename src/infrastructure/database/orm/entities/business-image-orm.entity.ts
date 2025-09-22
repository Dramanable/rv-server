/**
 * 🖼️ BUSINESS IMAGE ORM ENTITY
 * ✅ TypeORM entity pour images business AWS S3
 * ✅ Support variants et métadonnées
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BusinessOrmEntity } from '../../sql/postgresql/entities/business-orm.entity';

export enum ImageCategoryOrm {
  PROFILE = 'PROFILE',
  GALLERY = 'GALLERY',
  COVER = 'COVER',
}

export enum ImageFormatOrm {
  JPEG = 'JPEG',
  PNG = 'PNG',
  WEBP = 'WEBP',
}

@Entity('business_images')
@Index('IDX_business_images_business_id', ['businessId'])
@Index('IDX_business_images_category', ['category'])
@Index('IDX_business_images_created_at', ['createdAt'])
export class BusinessImageOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'business_id' })
  businessId!: string;

  @Column({ name: 's3_key' })
  s3Key!: string;

  @Column({ name: 'original_filename' })
  originalFilename!: string;

  @Column({
    name: 'category',
    type: 'enum',
    enum: ImageCategoryOrm,
    default: ImageCategoryOrm.GALLERY,
  })
  category!: ImageCategoryOrm;

  @Column({
    name: 'format',
    type: 'enum',
    enum: ImageFormatOrm,
  })
  format!: ImageFormatOrm;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize!: number;

  @Column({ name: 'width', type: 'integer', nullable: true })
  width?: number;

  @Column({ name: 'height', type: 'integer', nullable: true })
  height?: number;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // JSON pour stocker les variants (thumbnail, medium, large)
  @Column({
    name: 'variants',
    type: 'jsonb',
    nullable: true,
    default: '{}',
  })
  variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };

  // Métadonnées S3
  @Column({
    name: 's3_metadata',
    type: 'jsonb',
    nullable: true,
    default: '{}',
  })
  s3Metadata?: {
    etag?: string;
    contentType?: string;
    lastModified?: Date;
    signedUrlExpiry?: Date;
  };

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => BusinessOrmEntity, (business) => business.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business!: BusinessOrmEntity;
}
