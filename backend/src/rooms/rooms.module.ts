import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsController } from './rooms.controller';
import RoomsService from './rooms.service';
import { Room, RoomSchema } from './room.schema';
import { User, UserSchema } from '../users/user.schema';
import { JwtAuthModule } from '../common/jwt-auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtAuthModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
