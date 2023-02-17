import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop()
  _id: string;

  @Prop()
  description: string;

  @Prop()
  completed: boolean;

  @Prop()
  userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
