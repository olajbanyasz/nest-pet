import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true, minlength: 3, trim: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  userId: Types.ObjectId;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
