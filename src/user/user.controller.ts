import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterRequest } from './request/register.request';
import { UserResponse } from './response/user.response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  @Post('register')
  async register(@Body() request: RegisterRequest): Promise<UserResponse> {
    return this.service.register(request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req): Promise<UserResponse> {
    return this.service.me(req);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async update(@Req() req): Promise<UserResponse> {
    return await this.service.update(req.user, req.body);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('me/avatar')
  async upload(@Req() req): Promise<UserResponse> {
    return await this.service.upload(req.user, req.file);
  }

  @Get(':id/avatar')
  async avatar(
    @Param() params,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename: avatar.png',
    });
    return await this.service.avatar(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/avatar')
  @HttpCode(204)
  async deleteAvatar(@Req() req): Promise<void> {
    await this.service.deleteAvatar(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @HttpCode(204)
  async deleteUser(@Req() req): Promise<void> {
    await this.service.deleteUser(req.user);
  }
}
