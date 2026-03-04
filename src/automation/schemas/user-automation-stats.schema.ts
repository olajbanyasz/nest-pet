import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserAutomationStatsDocument = HydratedDocument<UserAutomationStats>;

@Schema({ timestamps: true })
export class UserAutomationStats {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    unique: true,
  })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  completedTodoEvents: number;

  @Prop({ type: Date, default: null })
  lastCompletedTodoAt: Date | null;

  @Prop({ default: 0 })
  currentStreakDays: number;

  @Prop({ default: 0 })
  bestStreakDays: number;

  @Prop({ type: String, default: null })
  lastCompletionDay: string | null;
}

export const UserAutomationStatsSchema =
  SchemaFactory.createForClass(UserAutomationStats);
