/**
 * 🖼️ BUSINESS GALLERY ORM ENTITY
 * ✅ TypeORM entity pour galerie images business
 * ✅ Organisation et ordre d'affichage
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BusinessImageOrmEntity } from "./business-image-orm.entity";
import { BusinessOrmEntity } from "./business-orm.entity";

@Entity("business_galleries")
@Index("IDX_business_galleries_business_id", ["businessId"])
@Index("IDX_business_galleries_display_order", ["displayOrder"])
export class BusinessGalleryOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "business_id", type: "uuid" })
  businessId!: string;

  @Column({
    name: "name",
    type: "varchar",
    length: 100,
    default: "Main Gallery",
  })
  name!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "display_order", type: "integer", default: 0 })
  displayOrder!: number;

  @Column({ name: "is_primary", type: "boolean", default: true })
  isPrimary!: boolean;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  // Configuration galerie
  @Column({
    name: "gallery_config",
    type: "jsonb",
    default:
      '{"maxImages":50,"allowedFormats":["JPEG","PNG","WEBP"],"thumbnailSize":{"width":200,"height":200}}',
  })
  galleryConfig!: {
    maxImages: number;
    allowedFormats: string[];
    thumbnailSize: {
      width: number;
      height: number;
    };
    layout?: "grid" | "masonry" | "carousel";
    autoPlay?: boolean;
  };

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => BusinessOrmEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "business_id" })
  business!: BusinessOrmEntity;

  @OneToMany(() => BusinessImageOrmEntity, (image) => image.gallery, {
    cascade: true,
  })
  images!: BusinessImageOrmEntity[];
}
