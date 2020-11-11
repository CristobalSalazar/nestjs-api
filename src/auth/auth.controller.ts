import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Response() res) {
    const { refresh_token, access_token } = await this.authService.login(
      req.user,
    );
    const cookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: true,
    };
    res.cookie('rt', refresh_token, cookieOpts);
    res.cookie('at', access_token, cookieOpts);
    res.json({ access_token, refresh_token });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('refresh')
  async refresh(@Request() request) {
    const cookie = request.cookies['rt'];
    if (!cookie) {
      throw new BadRequestException();
    } else {
      return cookie;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getUser(@Request() req) {
    return req.user;
  }
}
