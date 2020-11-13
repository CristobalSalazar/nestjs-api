import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserDocument } from './users/entities/user.entity';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;
    if (!user.emailVerified)
      throw new UnauthorizedException('Email is not verified');
    return user.emailVerified;
  }
}
