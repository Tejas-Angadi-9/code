import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import RoomsService from './rooms.service';
import JwtGuard from '../common/guards/jwt.guard';
import CurrentUser from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RoomDocument } from './room.schema';
import { CreateRoomResponseDto, MessageResponseDto, JoinRoomDto } from './dto/rooms.dto';
import { ROOM_MESSAGES } from '../common/constants/messages';
import { ROUTES } from '../common/constants/routes';

@Controller(ROUTES.ROOMS.BASE)
@UseGuards(JwtGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(@CurrentUser() user: JwtPayload): Promise<CreateRoomResponseDto> {
    const room: RoomDocument = await this.roomsService.createRoom(user.sub);
    const createRoomResponse: CreateRoomResponseDto = {
      message: ROOM_MESSAGES.CREATED,
      roomCode: room.roomCode,
    };
    return createRoomResponse;
  }

  @Post(ROUTES.ROOMS.JOIN)
  async joinRoom(
    @CurrentUser() user: JwtPayload,
    @Body() body: JoinRoomDto,
  ): Promise<MessageResponseDto> {
    await this.roomsService.joinRoom(user.sub, body.roomCode);
    const joinRoomResponse: MessageResponseDto = {
      message: ROOM_MESSAGES.JOINED,
    };
    return joinRoomResponse;
  }
}
