import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

export class GoogleLoginDto {
  idToken: string;
}

export class GoogleLoginResponseDto {
  message: string;
}

export class VerifyTokenResponseDto {
  message: string;
  user: JwtPayload;
}
