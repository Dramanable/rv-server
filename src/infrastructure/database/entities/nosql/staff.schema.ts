import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { StaffRole } from '../../../../shared/enums/staff-role.enum';
import { StaffStatus } from '../../../../shared/enums/staff-status.enum';

export type StaffDocument = StaffMongo & Document;

@Schema({ 
  collection: 'staff',
  timestamps: true,
  versionKey: false
})
export class StaffMongo {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BusinessMongo', required: true })
  businessId: Types.ObjectId;

  @Prop({ required: true, maxlength: 100 })
  firstName: string;

  @Prop({ required: true, maxlength: 100 })
  lastName: string;

  @Prop({ required: true, maxlength: 255, unique: true })
  email: string;

  @Prop({ maxlength: 20 })
  phone?: string;

  @Prop({ 
    type: String,
    enum: Object.values(StaffRole),
    required: true 
  })
  role: StaffRole;

  @Prop({ 
    type: String,
    enum: Object.values(StaffStatus),
    default: StaffStatus.ACTIVE
  })
  status: StaffStatus;

  // Professional Information
  @Prop({ maxlength: 255 })
  jobTitle?: string;

  @Prop({ maxlength: 1000 })
  bio?: string;

  @Prop({ maxlength: 500 })
  specialties?: string;

  @Prop({ type: [String] })
  certifications?: string[];

  @Prop({ type: Number, min: 0 })
  yearsOfExperience?: number;

  // Contact & Files
  @Prop({
    type: {
      profilePhotoUrl: String,
      resumeUrl: String,
      certificationUrls: [String]
    },
    _id: false
  })
  files?: {
    profilePhotoUrl?: string;
    resumeUrl?: string;
    certificationUrls?: string[];
  };

  // Work Schedule
  @Prop({
    type: [{
      dayOfWeek: { type: Number, min: 0, max: 6 },
      startTime: String,
      endTime: String,
      isWorkingDay: { type: Boolean, default: true }
    }],
    _id: false
  })
  workSchedule?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorkingDay: boolean;
  }>;

  // Service Assignments
  @Prop({ type: [Types.ObjectId], ref: 'ServiceMongo' })
  assignedServices?: Types.ObjectId[];

  // Permissions & Settings
  @Prop({
    type: {
      canManageBookings: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageServices: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false }
    },
    _id: false
  })
  permissions?: {
    canManageBookings: boolean;
    canViewReports: boolean;
    canManageServices: boolean;
    canManageStaff: boolean;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const StaffSchema = SchemaFactory.createForClass(StaffMongo);

// Indexes pour performance
StaffSchema.index({ businessId: 1 });
StaffSchema.index({ email: 1 });
StaffSchema.index({ role: 1 });
StaffSchema.index({ status: 1 });
StaffSchema.index({ businessId: 1, role: 1 });

// Pre-save hook pour mettre à jour updatedAt
StaffSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
