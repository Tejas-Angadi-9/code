import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { get } from 'lodash';
import { AUTH_MESSAGES } from '../constants/messages';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const token: string | undefined = get(request, 'cookies.token');

    if (!token) {
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
    }

    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGES.UNAUTHORIZED);
    }
  }
}

export default JwtGuard;
