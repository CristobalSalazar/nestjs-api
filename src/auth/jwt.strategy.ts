import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKey: 'secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const cookie = req.cookies.access_token;
    const header = req.headers.authorization;
    if (!header || !cookie) throw new UnauthorizedException();
    const [bearer, token] = req.headers.authorization.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || token !== cookie)
      throw new UnauthorizedException();
    return payload;
  }
}
