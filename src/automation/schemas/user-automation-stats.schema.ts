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
}

export const UserAutomationStatsSchema =
  SchemaFactory.createForClass(UserAutomationStats);
