import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterRequest } from './request/register.request';
import { UserResponse } from './response/user.response';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserRequest } from './request/update-user.request';
import { createReadStream } from 'fs';
import { join } from 'path';
import * as process from 'process';

@Injectable()
export class UserService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async register(request: RegisterRequest): Promise<UserResponse> {
    const createdUser = new this.userModel({
      _id: uuidv4(),
      name: request.name,
      email: request.email,
      password: await hash(request.password, 10),
      age: request.age,
    });
    const user = await createdUser.save();
    return this.toResponse(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email: email });
  }

  async me(req): Promise<UserResponse> {
    const user = await this.findByEmail(req.user.email);
    return this.toResponse(user);
  }

  async update(user: any, request: UpdateUserRequest): Promise<UserResponse> {
    const userToUpdate = await this.findByEmail(user.email);
    userToUpdate.age = request.age;
    await this.userModel.updateOne({ _id: userToUpdate._id }, userToUpdate);
    return this.toResponse(userToUpdate);
  }

  async upload(user: any, file: any): Promise<UserResponse> {
    const userToUpdate = await this.findByEmail(user.email);
    userToUpdate.avatar = file.path;
    await this.userModel.updateOne({ _id: userToUpdate._id }, userToUpdate);
    return this.toResponse(userToUpdate);
  }

  async avatar(id: string): Promise<StreamableFile> {
    const user = await this.findById(id);
    if (user === undefined) {
      throw new BadRequestException('id invalid');
    }
    if (user.avatar === undefined) {
      throw new BadRequestException('avatar not found');
    }
    const file = createReadStream(join(process.cwd(), user.avatar));
    return new StreamableFile(file);
  }

  async deleteAvatar(user: any): Promise<void> {
    const userToUpdate = await this.findByEmail(user.email);
    userToUpdate.avatar = null;
    await this.userModel.updateOne({ _id: userToUpdate._id }, userToUpdate);
  }

  async deleteUser(user) {
    await this.userModel.findByIdAndDelete(user.userId);
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      avatar: user.avatar ?? undefined,
    };
  }

  private async findById(id: string): Promise<User | undefined> {
    return this.userModel.findOne({ _id: id });
  }
}
