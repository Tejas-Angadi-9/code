import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import JwtGuard from '../common/guards/jwt.guard';
import CurrentUser from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AUTH_MESSAGES } from '../common/constants/messages';
import { ROUTES } from '../common/constants/routes';
import { GoogleLoginDto, GoogleLoginResponseDto, VerifyTokenResponseDto } from './dto/auth.dto';
import { AUTH_TOKEN, THIRTY_DAYS_MS } from './constants/auth.constant';
import { PRODUCTION } from 'src/common/constants/env.constant';

@Controller(ROUTES.AUTH.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ROUTES.AUTH.GOOGLE)
  async googleLogin(
    @Body() body: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleLoginResponseDto> {
    const token: string = await this.authService.googleLogin(body.idToken);
    res.cookie(AUTH_TOKEN, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === PRODUCTION,
      sameSite: 'lax',
      maxAge: THIRTY_DAYS_MS,
    });
    const googleLoginResponse = { message: AUTH_MESSAGES.LOGIN_SUCCESS };
    return googleLoginResponse;
  }

  @Post(ROUTES.AUTH.LOGOUT)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie(AUTH_TOKEN);
    const logoutResponse = { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
    return logoutResponse;
  }

  @Get(ROUTES.AUTH.VERIFY)
  @UseGuards(JwtGuard)
  verifyToken(@CurrentUser() user: JwtPayload): VerifyTokenResponseDto {
    const verifyTokenResponse = { message: AUTH_MESSAGES.TOKEN_VALID, user };
    return verifyTokenResponse;
  }
}
