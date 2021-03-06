import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Request,
  Response,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Response as ExpressResponse } from 'express';
import { PasswordResetDto } from './dto/password-reset.dto';
import { RateLimit, RateLimiterInterceptor } from 'nestjs-rate-limiter';
import { VerifiedEmailGuard } from 'src/verified-email.guard';

@UseInterceptors(RateLimiterInterceptor)
@Controller('auth')
export class AuthController {
  private logger: Logger;
  constructor(private readonly authService: AuthService) {
    this.logger = new Logger('auth_controller');
  }

  @RateLimit({ points: 1, duration: 3 })
  @Post('password-reset')
  async createPasswordReset(@Body() dto: PasswordResetDto) {
    return await this.authService.requestPasswordReset(dto);
  }

  @RateLimit({ points: 1, duration: 3 })
  @Put('password-reset/:uuid')
  async passwordReset(
    @Body('password') newPassword: string,
    @Param('uuid') uuid: string,
  ) {
    return await this.authService.resetPassword(uuid, newPassword);
  }

  @RateLimit({ points: 1, duration: 3 })
  @Get('verify-email/:uuid')
  async verifyEmail(@Param('uuid') uuid: string) {
    return await this.authService.verifyEmail(uuid);
  }

  @RateLimit({ points: 1, duration: 3 })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'), VerifiedEmailGuard)
  @HttpCode(200)
  @Post('login')
  async login(@Request() req, @Response() res) {
    const { refresh_token, access_token } = await this.authService.login(
      req.user,
    );
    this.sendAuthTokens(res, refresh_token, access_token);
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

  private sendAuthTokens(
    res: ExpressResponse,
    refresh_token: string,
    access_token: string,
  ) {
    const settings = this.authService.getCookieSettings();
    res.cookie('refresh_token', refresh_token, settings);
    res.cookie('access_token', access_token, settings);
    // Should be stored in memory on client side not in local or session storage
    res.json({ access_token });
  }
}
