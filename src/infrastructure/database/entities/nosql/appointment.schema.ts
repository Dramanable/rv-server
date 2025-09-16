import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AppointmentStatus } from '../../../../shared/enums/appointment-status.enum';
import { AppointmentType } from '../../../../shared/enums/appointment-type.enum';

export type AppointmentDocument = AppointmentMongo & Document;

@Schema({ 
  collection: 'appointments',
  timestamps: true,
  versionKey: false
})
export class AppointmentMongo {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusinessMongo', required: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CalendarMongo', required: true })
  calendarId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ServiceMongo', required: true })
  serviceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StaffMongo' })
  assignedStaffId?: Types.ObjectId;

  // Appointment Details
  @Prop({ required: true, maxlength: 255 })
  title: string;

  @Prop({ maxlength: 1000 })
  description?: string;

  @Prop({ 
    type: String,
    enum: Object.values(AppointmentType),
    required: true 
  })
  appointmentType: AppointmentType;

  @Prop({ 
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.SCHEDULED
  })
  status: AppointmentStatus;

  // Scheduling
  @Prop({ required: true })
  startDateTime: Date;

  @Prop({ required: true })
  endDateTime: Date;

  @Prop({ type: String, maxlength: 50 })
  timeZone?: string;

  @Prop({ type: Boolean, default: false })
  isAllDay?: boolean;

  // Client Information
  @Prop({
    type: {
      firstName: { type: String, required: true, maxlength: 100 },
      lastName: { type: String, required: true, maxlength: 100 },
      email: { type: String, required: true, maxlength: 255 },
      phone: { type: String, maxlength: 20 },
      notes: { type: String, maxlength: 1000 }
    },
    required: true,
    _id: false
  })
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    notes?: string;
  };

  // Pricing & Payment
  @Prop({
    type: {
      totalAmount: { type: Number, min: 0 },
      currency: { type: String, maxlength: 3 },
      paymentStatus: { 
        type: String, 
        enum: ['PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'CANCELLED'],
        default: 'PENDING'
      },
      paymentMethod: String,
      discount: { type: Number, min: 0, default: 0 }
    },
    _id: false
  })
  pricing?: {
    totalAmount: number;
    currency: string;
    paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'CANCELLED';
    paymentMethod?: string;
    discount: number;
  };

  // Recurrence (for recurring appointments)
  @Prop({
    type: {
      isRecurring: { type: Boolean, default: false },
      recurrenceRule: String,
      recurrenceEndDate: Date,
      parentAppointmentId: { type: Types.ObjectId, ref: 'AppointmentMongo' },
      recurringInstanceId: String
    },
    _id: false
  })
  recurrence?: {
    isRecurring: boolean;
    recurrenceRule?: string;
    recurrenceEndDate?: Date;
    parentAppointmentId?: Types.ObjectId;
    recurringInstanceId?: string;
  };

  // Notifications & Reminders
  @Prop({
    type: {
      reminderSent: { type: Boolean, default: false },
      reminderSentAt: Date,
      confirmationSent: { type: Boolean, default: false },
      confirmationSentAt: Date,
      followUpSent: { type: Boolean, default: false },
      followUpSentAt: Date
    },
    _id: false
  })
  notifications?: {
    reminderSent: boolean;
    reminderSentAt?: Date;
    confirmationSent: boolean;
    confirmationSentAt?: Date;
    followUpSent: boolean;
    followUpSentAt?: Date;
  };

  // Custom Fields & Metadata
  @Prop({
    type: Map,
    of: String
  })
  customFields?: Map<string, string>;

  @Prop({
    type: {
      source: String,
      userAgent: String,
      ipAddress: String,
      referrer: String
    },
    _id: false
  })
  metadata?: {
    source?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };

  // Cancellation & Modification
  @Prop({
    type: {
      cancelledAt: Date,
      cancelledBy: String,
      cancellationReason: String,
      lastModifiedAt: Date,
      modificationHistory: [{
        modifiedAt: Date,
        modifiedBy: String,
        changes: Map
      }]
    },
    _id: false
  })
  changeHistory?: {
    cancelledAt?: Date;
    cancelledBy?: string;
    cancellationReason?: string;
    lastModifiedAt?: Date;
    modificationHistory?: Array<{
      modifiedAt: Date;
      modifiedBy: string;
      changes: Map<string, any>;
    }>;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(AppointmentMongo);

// Indexes pour performance
AppointmentSchema.index({ businessId: 1 });
AppointmentSchema.index({ calendarId: 1 });
AppointmentSchema.index({ serviceId: 1 });
AppointmentSchema.index({ assignedStaffId: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentType: 1 });
AppointmentSchema.index({ startDateTime: 1 });
AppointmentSchema.index({ endDateTime: 1 });
AppointmentSchema.index({ businessId: 1, startDateTime: 1 });
AppointmentSchema.index({ calendarId: 1, startDateTime: 1 });
AppointmentSchema.index({ 'clientInfo.email': 1 });
AppointmentSchema.index({ 'pricing.paymentStatus': 1 });

// Indexes composés pour les requêtes fréquentes
AppointmentSchema.index({ 
  businessId: 1, 
  status: 1, 
  startDateTime: 1 
});

AppointmentSchema.index({ 
  assignedStaffId: 1, 
  startDateTime: 1, 
  endDateTime: 1 
});

// Pre-save hook pour mettre à jour updatedAt
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
