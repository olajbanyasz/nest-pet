import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true, minlength: 3, trim: true })
  title: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: false })
  deleted: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
