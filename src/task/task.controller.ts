import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TaskResponse } from './response/task.response';

@Controller('tasks')
export class TaskController {
  constructor(private service: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post('task')
  async addTask(@Req() req): Promise<TaskResponse> {
    return await this.service.addTask(req.user, req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('task')
  async getAllTasks(@Req() req): Promise<TaskResponse[]> {
    if (req.query['completed'] !== undefined) {
      return await this.service.getTasksByCompleted(
        req.user,
        req.query['completed'],
      );
    }

    if (req.query['skip'] || req.query['limit']) {
      const skip = req.query['skip'] ?? 0;
      const limit = req.query['limit'] ?? 10;
      return await this.service.getPaginateTask(req.user, skip, limit);
    }

    return await this.service.getTasks(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('task/:id')
  async byId(@Req() req): Promise<TaskResponse> {
    return await this.service.byId(req.user, req.params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('task/:id')
  async updateTask(@Req() req): Promise<TaskResponse> {
    return await this.service.updateTask(req.user, req.params.id, req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('task/:id')
  @HttpCode(204)
  async deleteTask(@Req() req): Promise<void> {
    await this.service.deleteTask(req.user, req.params.id);
  }
}
