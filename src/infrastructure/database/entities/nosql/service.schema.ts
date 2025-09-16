import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ServiceStatus } from '../../../../shared/enums/service-status.enum';
import { ServiceType } from '../../../../shared/enums/service-type.enum';
import { PricingType } from '../../../../shared/enums/pricing-type.enum';

export type ServiceDocument = ServiceMongo & Document;

@Schema({ 
  collection: 'services',
  timestamps: true,
  versionKey: false
})
export class ServiceMongo {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusinessMongo', required: true })
  businessId: Types.ObjectId;

  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ maxlength: 1000 })
  description?: string;

  @Prop({ 
    type: String,
    enum: Object.values(ServiceType),
    required: true 
  })
  serviceType: ServiceType;

  @Prop({ 
    type: String,
    enum: Object.values(ServiceStatus),
    default: ServiceStatus.ACTIVE
  })
  status: ServiceStatus;

  // Duration & Pricing
  @Prop({ required: true, min: 1 })
  durationMinutes: number;

  @Prop({ 
    type: String,
    enum: Object.values(PricingType),
    required: true 
  })
  pricingType: PricingType;

  @Prop({ type: Number, min: 0 })
  basePrice?: number;

  @Prop({ type: Number, min: 0 })
  hourlyRate?: number;

  @Prop({ type: String, maxlength: 3 })
  currency?: string;

  // Booking Settings
  @Prop({ type: Number, min: 0, default: 0 })
  bufferTimeBefore?: number;

  @Prop({ type: Number, min: 0, default: 0 })
  bufferTimeAfter?: number;

  @Prop({ type: Number, min: 1, default: 1 })
  maxParticipants?: number;

  @Prop({ type: Boolean, default: true })
  allowOnlineBooking?: boolean;

  @Prop({ type: Boolean, default: false })
  requireApproval?: boolean;

  // Advanced Settings
  @Prop({
    type: {
      isRecurring: { type: Boolean, default: false },
      recurringPattern: String,
      customFields: [{
        name: String,
        type: String,
        required: { type: Boolean, default: false },
        options: [String]
      }]
    },
    _id: false
  })
  advancedSettings?: {
    isRecurring: boolean;
    recurringPattern?: string;
    customFields?: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  };

  // Files & Media
  @Prop({
    type: {
      imageUrls: [String],
      documentUrls: [String],
      videoUrls: [String]
    },
    _id: false
  })
  files?: {
    imageUrls?: string[];
    documentUrls?: string[];
    videoUrls?: string[];
  };

  // Categories & Tags
  @Prop({ type: [String] })
  categories?: string[];

  @Prop({ type: [String] })
  tags?: string[];

  // Staff Assignment
  @Prop({ type: [Types.ObjectId], ref: 'StaffMongo' })
  assignedStaff?: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(ServiceMongo);

// Indexes pour performance
ServiceSchema.index({ businessId: 1 });
ServiceSchema.index({ serviceType: 1 });
ServiceSchema.index({ status: 1 });
ServiceSchema.index({ businessId: 1, status: 1 });
ServiceSchema.index({ assignedStaff: 1 });
ServiceSchema.index({ categories: 1 });
ServiceSchema.index({ tags: 1 });

// Pre-save hook pour mettre à jour updatedAt
ServiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
