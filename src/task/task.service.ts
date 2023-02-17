import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schemas';
import { CreatedTaskRequest } from './request/created-task.request';
import { UserService } from '../user/user.service';
import { TaskResponse } from './response/task.response';
import { v4 as uuidv4 } from 'uuid';
import { UpdateTaskRequest } from './request/update-task.request';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('task') private readonly taskModel: Model<Task>,
    private readonly userService: UserService,
  ) {}

  async addTask(me: any, request: CreatedTaskRequest): Promise<TaskResponse> {
    const user = await this.userService.findByEmail(me.email);
    const createdTask = new this.taskModel({
      _id: uuidv4(),
      description: request.description,
      completed: false,
      userId: user._id,
    });
    const task = await createdTask.save();
    return this.toResponse(task);
  }

  async getTasks(me: any): Promise<TaskResponse[]> {
    const user = await this.userService.findByEmail(me.email);
    const tasks = await this.taskModel.find({ userId: user._id });
    if (tasks.length === 0) {
      return [];
    }
    return tasks.map((task) => this.toResponse(task));
  }

  async byId(me: any, id: string): Promise<TaskResponse> {
    const user = await this.userService.findByEmail(me.email);
    const task = await this.taskModel.findOne({ _id: id, userId: user._id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.toResponse(task);
  }

  async getTasksByCompleted(
    me: any,
    completed: boolean,
  ): Promise<TaskResponse[]> {
    const user = await this.userService.findByEmail(me.email);
    const tasks = await this.taskModel.find({
      userId: user._id,
      completed: completed,
    });
    if (tasks.length === 0) {
      return [];
    }
    return tasks.map((task) => this.toResponse(task));
  }

  async getPaginateTask(
    me: any,
    skip: number,
    limit: number,
  ): Promise<TaskResponse[]> {
    const user = await this.userService.findByEmail(me.email);
    const tasks = await this.taskModel
      .find({ userId: user._id })
      .skip(skip)
      .limit(limit);
    if (tasks.length === 0) {
      return [];
    }
    return tasks.map((task) => this.toResponse(task));
  }

  async updateTask(
    me: any,
    id: string,
    request: UpdateTaskRequest,
  ): Promise<TaskResponse> {
    const user = await this.userService.findByEmail(me.email);
    const taskToUpdate = await this.taskModel.findOne({
      _id: id,
      userId: user._id,
    });
    if (request.description) {
      taskToUpdate.description = request.description;
    }
    if (request.completed !== undefined) {
      taskToUpdate.completed = request.completed;
    }
    await this.taskModel.updateOne({ _id: id }, taskToUpdate);
    return this.toResponse(taskToUpdate);
  }

  async deleteTask(me: any, id: string): Promise<void> {
    const user = await this.userService.findByEmail(me.email);
    await this.taskModel.deleteOne({ _id: id, userId: user._id });
  }

  private toResponse(task: Task): TaskResponse {
    return {
      id: task._id,
      description: task.description,
      completed: task.completed,
    };
  }
}
