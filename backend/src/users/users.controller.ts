import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import JwtGuard from '../common/guards/jwt.guard';
import CurrentUser from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserDocument } from './user.schema';
import { UpdateNameDto, UpdateLeetcodeDto, MessageResponseDto } from './dto/users.dto';
import { USER_MESSAGES } from '../common/constants/messages';
import { ROUTES } from '../common/constants/routes';

@Controller(ROUTES.USERS.BASE)
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(ROUTES.USERS.PROFILE)
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserDocument> {
    const userProfile: UserDocument = await this.usersService.getProfile(user.sub);
    return userProfile;
  }

  @Put(ROUTES.USERS.PROFILE_NAME)
  async updateName(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateNameDto,
  ): Promise<MessageResponseDto> {
    await this.usersService.updateName(user.sub, body.name);
    const updateNameResponse: MessageResponseDto = {
      message: USER_MESSAGES.PROFILE_UPDATED,
    };
    return updateNameResponse;
  }

  @Put(ROUTES.USERS.PROFILE_LEETCODE)
  async updateLeetcode(
    @CurrentUser() user: JwtPayload,
    @Body() body: UpdateLeetcodeDto,
  ): Promise<MessageResponseDto> {
    await this.usersService.updateLeetcode(user.sub, body.leetcodeUsername);
    const updateLeetcodeResponse: MessageResponseDto = {
      message: USER_MESSAGES.PROFILE_UPDATED,
    };
    return updateLeetcodeResponse;
  }
}
