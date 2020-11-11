import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          secret: config.get('APP_KEY'),
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
