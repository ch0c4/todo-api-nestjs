import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from './schemas/task.schemas';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'task', schema: TaskSchema }]),
    UserModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
