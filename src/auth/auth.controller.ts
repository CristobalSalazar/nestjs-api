import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Response as ExpressResponse } from 'express';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDto } from './dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('password-reset')
  async createPasswordReset(@Body() passwordResetDto: PasswordResetDto) {
    await this.authService.createPasswordReset(passwordResetDto);
    return { ok: 1 };
  }

  @Put('password-reset/:uuid')
  async passwordReset(
    @Body('password') newPassword: string,
    @Param('uuid') uuid: string,
  ) {
    return await this.authService.passwordReset(uuid, newPassword);
  }

  @Get('verify-email/:uuid')
  async verifyEmail(@Param('uuid') uuid: string) {
    const user = await this.authService.verifyEmail(uuid);
    return { ok: user.emailVerified };
  }

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  async login(@Request() req, @Response() res) {
    const { refresh_token, access_token } = await this.authService.login(
      req.user,
    );
    this.sendAuthTokens(res, refresh_token, access_token);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('refresh')
  async refresh(@Request() req, @Response() res) {
    const {
      access_token,
      refresh_token,
    } = await this.authService.refreshTokens(
      req.user,
      req.cookies.access_token,
    );
    this.sendAuthTokens(res, refresh_token, access_token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('token')
  async getUser(@Request() req) {
    return req.user;
  }

  private getCookieSettings() {
    return this.configService.get<string>('NODE_ENV') === 'production'
      ? {
          httpOnly: true,
          secure: true,
          sameSite: true,
        }
      : {
          httpOnly: true,
        };
  }

  private sendAuthTokens(
    res: ExpressResponse,
    refresh_token: string,
    access_token: string,
  ) {
    const settings = this.getCookieSettings();
    res.cookie('refresh_token', refresh_token, settings);
    res.cookie('access_token', access_token, settings);
    // Should be stored in memory on client side not in local or session storage
    res.json({ access_token });
  }
}
