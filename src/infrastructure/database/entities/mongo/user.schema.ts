/**
 * 👤 User Schema MongoDB - Mongoose + Clean Architecture
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ unique: true, sparse: true }) // sparse pour permettre null/undefined
  username?: string;

  @Prop({ required: true })
  hashedPassword!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ 
    required: true,
    enum: [
      'PLATFORM_ADMIN', 'BUSINESS_OWNER', 'BUSINESS_ADMIN', 'LOCATION_MANAGER',
      'DEPARTMENT_HEAD', 'SENIOR_PRACTITIONER', 'PRACTITIONER', 'JUNIOR_PRACTITIONER',
      'RECEPTIONIST', 'ASSISTANT', 'SCHEDULER', 'CORPORATE_CLIENT', 'VIP_CLIENT',
      'REGULAR_CLIENT', 'GUEST_CLIENT'
    ]
  })
  role!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isVerified!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
