/**
 * 📅 Calendar Schema MongoDB - Mongoose + Clean Architecture
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'calendars', timestamps: true })
export class Calendar extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  businessId!: string;

  @Prop({ required: false })
  ownerId?: string;

  @Prop({ 
    required: true,
    enum: ['PERSONAL', 'BUSINESS', 'SHARED', 'PUBLIC'],
    default: 'PERSONAL'
  })
  type!: string;

  @Prop({ default: '#007BFF' })
  color!: string;

  @Prop({ required: false })
  timezone?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop({ type: Object, required: false })
  settings?: any;
}

export type CalendarDocument = Calendar & Document;
export const CalendarSchema = SchemaFactory.createForClass(Calendar);

// Index pour les recherches
CalendarSchema.index({ businessId: 1 });
CalendarSchema.index({ ownerId: 1 });
CalendarSchema.index({ type: 1 });
CalendarSchema.index({ isActive: 1 });
