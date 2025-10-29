import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/common/auth.decorator';
import { LoginRequestLdapDto } from 'src/models/user.model';
import { Response } from 'express';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login/ldap')
  async loginUserLdap(@Body() body: LoginRequestLdapDto, @Res() res: Response) {
    const response = await this.userService.loginUser(body);

    if ('statusCode' in response) {
      // berarti ini ErrorResponse
      console.error('Login gagal:', response.message);
      return res.status(response.statusCode).json(response);
    } else {
      // berarti ini LoginResponseDto
      const hasTokens = response.refresh_token && response.access_token;
      if (hasTokens) {
        res.cookie('refresh_token', response.refresh_token, { httpOnly: true });
        res.cookie('access_token', response.access_token, { httpOnly: true });
      }
      return res.status(200).json(response);
    }
  }
}
