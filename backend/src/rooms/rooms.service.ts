import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from './room.schema';
import { User, UserDocument } from '../users/user.schema';
import { ROOM_MESSAGES } from '../common/constants/messages';
import {
  ROOM_CODE_CHARS,
  ROOM_CODE_LENGTH,
  ROOM_CODE_PREFIX,
  MONGO_DUPLICATE_KEY_ERROR,
  MAX_RETRIES,
} from './constants/room.contant';
import { MongoServerError } from 'mongodb';

@Injectable()
class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private generateRoomCode(): string {
    const chars: string = ROOM_CODE_CHARS;

    const randomPart: string = Array.from(
      { length: ROOM_CODE_LENGTH },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    const roomCode: string = `${ROOM_CODE_PREFIX}-${randomPart}`;
    return roomCode;
  }

  async createRoom(userId: string): Promise<RoomDocument> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const roomCode: string = this.generateRoomCode();
        const room: RoomDocument = await this.roomModel.create({
          roomCode,
          members: [userId],
          createdBy: userId,
        });
        await this.userModel.findByIdAndUpdate(userId, {
          $push: { rooms: room._id },
        });
        return room;
      } catch (error) {
        if (error instanceof MongoServerError && error.code === MONGO_DUPLICATE_KEY_ERROR) continue;
        throw new InternalServerErrorException('Failed to create room');
      }
    }
    throw new InternalServerErrorException('Failed to generate unique room code');
  }

  async joinRoom(userId: string, roomCode: string): Promise<RoomDocument> {
    try {
      const room: RoomDocument | null = await this.roomModel.findOne({
        roomCode,
      });
      if (!room) throw new NotFoundException(ROOM_MESSAGES.NOT_FOUND);

      const memberExists: boolean = room.members.some((id) => id.equals(userId));
      const isRoomFull: boolean = room.members.length >= 2;
      if (memberExists) throw new BadRequestException(ROOM_MESSAGES.ALREADY_MEMBER);
      if (isRoomFull) throw new BadRequestException(ROOM_MESSAGES.FULL);

      room.members.push(new Types.ObjectId(userId));
      await room.save();
      await this.userModel.findByIdAndUpdate(userId, {
        $push: { rooms: room._id },
      });
      return room;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to join room');
    }
  }
}

export default RoomsService;
