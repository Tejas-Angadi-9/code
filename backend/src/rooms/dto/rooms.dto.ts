export class MessageResponseDto {
  message: string;
}

export class CreateRoomResponseDto extends MessageResponseDto {
  roomCode: string;
}

export class JoinRoomDto {
  roomCode: string;
}
