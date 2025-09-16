import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BusinessType } from '../../../../shared/enums/business-type.enum';
import { BusinessStatus } from '../../../../shared/enums/business-status.enum';

export type BusinessDocument = BusinessMongo & Document;

@Schema({ 
  collection: 'businesses',
  timestamps: true,
  versionKey: false
})
export class BusinessMongo {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ maxlength: 1000 })
  description?: string;

  @Prop({ 
    type: String,
    enum: Object.values(BusinessType),
    required: true 
  })
  businessType: BusinessType;

  @Prop({ 
    type: String,
    enum: Object.values(BusinessStatus),
    default: BusinessStatus.ACTIVE
  })
  status: BusinessStatus;

  @Prop({ maxlength: 100 })
  registrationNumber?: string;

  @Prop({ maxlength: 50 })
  vatNumber?: string;

  @Prop({ maxlength: 255 })
  website?: string;

  @Prop({ maxlength: 20 })
  phone?: string;

  @Prop({ maxlength: 255 })
  email?: string;

  // Embedded Address
  @Prop({
    type: {
      street: { type: String, maxlength: 255 },
      city: { type: String, required: true, maxlength: 100 },
      postalCode: { type: String, required: true, maxlength: 20 },
      country: { type: String, required: true, maxlength: 100 },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    _id: false
  })
  address: {
    street?: string;
    city: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  // File Storage
  @Prop({
    type: {
      logoUrl: String,
      bannerUrl: String,
      documentsUrls: [String]
    },
    _id: false
  })
  files?: {
    logoUrl?: string;
    bannerUrl?: string;
    documentsUrls?: string[];
  };

  // Business Hours
  @Prop({
    type: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      openTime: String,
      closeTime: String,
      isClosed: { type: Boolean, default: false }
    }],
    _id: false
  })
  businessHours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;

  // Settings
  @Prop({
    type: {
      allowOnlineBooking: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      cancellationPolicy: String,
      timeZone: { type: String, default: 'UTC' }
    },
    _id: false
  })
  settings?: {
    allowOnlineBooking: boolean;
    requireApproval: boolean;
    cancellationPolicy?: string;
    timeZone: string;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BusinessSchema = SchemaFactory.createForClass(BusinessMongo);

// Indexes pour performance
BusinessSchema.index({ name: 1 });
BusinessSchema.index({ businessType: 1 });
BusinessSchema.index({ status: 1 });
BusinessSchema.index({ 'address.city': 1 });
BusinessSchema.index({ 'address.postalCode': 1 });

// Pre-save hook pour mettre à jour updatedAt
BusinessSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
