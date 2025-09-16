import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CalendarType } from '../../../../shared/enums/calendar-type.enum';
import { CalendarStatus } from '../../../../shared/enums/calendar-status.enum';
import { CalendarVisibility } from '../../../../shared/enums/calendar-visibility.enum';

export type CalendarDocument = CalendarMongo & Document;

@Schema({ 
  collection: 'calendars',
  timestamps: true,
  versionKey: false
})
export class CalendarMongo {
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
    enum: Object.values(CalendarType),
    required: true 
  })
  calendarType: CalendarType;

  @Prop({ 
    type: String,
    enum: Object.values(CalendarStatus),
    default: CalendarStatus.ACTIVE
  })
  status: CalendarStatus;

  @Prop({ 
    type: String,
    enum: Object.values(CalendarVisibility),
    default: CalendarVisibility.PRIVATE
  })
  visibility: CalendarVisibility;

  // Associated Address (can be different from business main address)
  @Prop({
    type: {
      street: String,
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      latitude: Number,
      longitude: Number,
      name: String,
      subdivision: String
    },
    required: true,
    _id: false
  })
  associatedAddress: {
    street?: string;
    city: string;
    postalCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    subdivision?: string;
  };

  // Calendar Configuration
  @Prop({
    type: {
      timeZone: { type: String, default: 'UTC' },
      workingHours: [{
        dayOfWeek: { type: Number, min: 0, max: 6 },
        startTime: String,
        endTime: String,
        isWorkingDay: { type: Boolean, default: true }
      }],
      bufferTime: { type: Number, min: 0, default: 0 },
      maxAdvanceBookingDays: { type: Number, min: 1, default: 90 },
      minAdvanceBookingHours: { type: Number, min: 0, default: 0 }
    },
    _id: false
  })
  configuration?: {
    timeZone: string;
    workingHours?: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isWorkingDay: boolean;
    }>;
    bufferTime: number;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
  };

  // Access Control
  @Prop({ type: [Types.ObjectId], ref: 'StaffMongo' })
  authorizedStaff?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'ServiceMongo' })
  availableServices?: Types.ObjectId[];

  // Styling & Display
  @Prop({ maxlength: 7 })
  color?: string;

  @Prop({
    type: {
      showWeekends: { type: Boolean, default: true },
      defaultView: { type: String, default: 'month' },
      slotDuration: { type: Number, default: 30 }
    },
    _id: false
  })
  displaySettings?: {
    showWeekends: boolean;
    defaultView: string;
    slotDuration: number;
  };

  // Integration Settings
  @Prop({
    type: {
      syncEnabled: { type: Boolean, default: false },
      externalCalendarId: String,
      syncDirection: { type: String, enum: ['IMPORT', 'EXPORT', 'BIDIRECTIONAL'] },
      lastSyncDate: Date
    },
    _id: false
  })
  integrationSettings?: {
    syncEnabled: boolean;
    externalCalendarId?: string;
    syncDirection?: 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL';
    lastSyncDate?: Date;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CalendarSchema = SchemaFactory.createForClass(CalendarMongo);

// Indexes pour performance
CalendarSchema.index({ businessId: 1 });
CalendarSchema.index({ calendarType: 1 });
CalendarSchema.index({ status: 1 });
CalendarSchema.index({ visibility: 1 });
CalendarSchema.index({ businessId: 1, status: 1 });
CalendarSchema.index({ authorizedStaff: 1 });
CalendarSchema.index({ 'associatedAddress.city': 1 });
CalendarSchema.index({ 'associatedAddress.postalCode': 1 });

// Pre-save hook pour mettre à jour updatedAt
CalendarSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
