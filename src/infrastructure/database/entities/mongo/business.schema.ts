/**
 * 🏢 Business Schema MongoDB - Mongoose + Clean Architecture
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'businesses', timestamps: true })
export class Business extends Document {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ 
    required: true,
    enum: [
      'MEDICAL', 'BEAUTY', 'FITNESS', 'EDUCATION', 'LEGAL',
      'CONSULTING', 'AUTOMOTIVE', 'HOME_SERVICES', 'OTHER'
    ]
  })
  sector!: string;

  @Prop({ 
    required: true,
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
    }
  })
  address!: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop({ 
    required: false,
    type: {
      email: { type: String, required: false },
      phone: { type: String, required: false },
      website: { type: String, required: false },
    }
  })
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;

  // Index géospatial pour les recherches de proximité
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  })
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export type BusinessDocument = Business & Document;
export const BusinessSchema = SchemaFactory.createForClass(Business);

// Index pour les recherches
BusinessSchema.index({ name: 'text', 'address.city': 'text' });
BusinessSchema.index({ sector: 1 });
BusinessSchema.index({ 'address.city': 1 });
BusinessSchema.index({ isActive: 1 });
