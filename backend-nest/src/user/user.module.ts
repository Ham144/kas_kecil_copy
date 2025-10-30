import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RedisService],
})
export class UserModule {}
