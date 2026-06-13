import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { User, UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'));
  }

  async googleLogin(idToken: string): Promise<string> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

      const { sub: googleId, email, name } = payload;

      const userPayload = {
        googleId,
        email,
        name,
        createdAt: new Date().toISOString().split('T')[0],
      };

      const user = await this.userModel.findOneAndUpdate(
        { googleId },
        { $setOnInsert: userPayload },
        { upsert: true, new: true },
      );

      const token: string = this.jwtService.sign({
        sub: user._id,
        email: user.email,
      });
      return token;
    } catch (error) {
      console.error({ error, message: 'Google login failed' });
      throw new UnauthorizedException('Google login failed');
    }
  }
}
