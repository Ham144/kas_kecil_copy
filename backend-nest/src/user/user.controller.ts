import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  Res,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginRequestLdapDto, LoginResponseDto } from 'src/models/user.model';
import { Response, Request } from 'express';
import { refreshTokenOption, accessTokenOption } from './tokenCookieOptions';
import { ErrorResponse } from 'src/models/error.model';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/login/ldap')
  async loginUserLdap(
    @Body() body: LoginRequestLdapDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const response: LoginResponseDto | ErrorResponse =
      await this.userService.loginUser(body, req);

    if (response instanceof ErrorResponse) {
      // berarti ini ErrorResponse
      console.error('Login gagal:', response.message);
      return res.status(response.statusCode).json(response);
    } else {
      const hasTokens = response.refresh_token && response.access_token;

      if (hasTokens) {
        res.cookie('refresh_token', response.refresh_token, refreshTokenOption);
        res.cookie('access_token', response.access_token, accessTokenOption);
      } else {
        console.log('NO TOKENS TO SET - tokens are missing!');
      }

      // Hapus token dari response body
      const { refresh_token, access_token, ...responseWithoutTokens } =
        response;

      return res.status(200).json(responseWithoutTokens);
    }
  }

  @Post('/refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req?.cookies['refresh_token'];

    console.log(refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }
    const { access_token, refresh_token: new_refresh_token } =
      await this.userService.refreshToken(refreshToken);

    res.cookie('refresh_token', new_refresh_token, refreshTokenOption);
    res.cookie('access_token', access_token, accessTokenOption);

    return {
      message: 'Refresh token updated',
    };
  }

  @Get('/get-user-info')
  async getUserInfo(@Req() req: Request) {
    return this.userService.getUserInfo(req);
  }

  @Get('/list')
  async getAllAccount(
    @Query('page', ParseIntPipe) page: number,
    @Query('searchKey') searchKey: string,
  ) {
    return this.userService.getAllAccount(page, searchKey);
  }

  @Patch('/update')
  async updateAccount(@Body() body: LoginResponseDto) {
    return this.userService.updateAccount(body);
  }

  @Delete('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const access_token = req?.cookies['access_token'];
    await this.userService.logout(access_token, req);
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(200).json({ message: 'Logout success' });
  }
}
