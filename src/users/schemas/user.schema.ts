import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ required: false, type: String })
  name?: string;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Boolean, default: false })
  inactive: boolean;

  @Prop({ type: Date })
  inactiveAt?: Date;

  @Prop({ type: String })
  inactiveReason?: string;

  @Prop({ type: Date })
  reactivatedAt?: Date;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: String })
  deletedReason?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
